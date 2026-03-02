---

# Bazookanator AI Pipeline — Implementation Reference

## Overview

This pipeline converts a raw user chat message into a natural language answer grounded in live sales data. It is composed of 7 sequential stages. Stages 1–2 run outside LangGraph. Stages 3–7 are LangGraph nodes connected by conditional edges.

---

## Stage 1 — Input Processing (`src/lib/langgraph/inputProcessing.ts`)

**Purpose:** Convert the raw user input into a clean, schema-aware, unambiguous natural language question. Do NOT produce SQL here. Do NOT interpret business logic. Only clean vocabulary and classify intent.

**Run this stage before the LangGraph graph is invoked.**

### Step 1.1 — Injection Guard (run first, always)

- Check the raw input against this pattern: `/(\bDROP\b|\bDELETE\b|\bUNION\b|--|;.*;|ignore previous instructions)/i`
- If matched, immediately return `intent: 'out_of_scope'` with `reason: 'injection_attempt'`
- Do not proceed to any further steps

### Step 1.2 — Intent Classification

Classify the input into one of four intents:

- `'greeting'` — matches greetings, thanks, small talk (e.g. "hi", "thanks", "who are you")
- `'data_query'` — contains data keywords (e.g. "show", "total", "how much", "compare", "top", "sales", "revenue", "actuals", "budget", product names, rep names, regions, date references)
- `'ambiguous'` — too vague to safely convert to SQL (e.g. "show me the numbers", "what happened?", fewer than 6 words with no schema keyword). Route these to a clarification response — do NOT proceed to SQL generation
- `'out_of_scope'` — unrelated to sales data

If `intent` is `'greeting'`, `'out_of_scope'`, or `'ambiguous'`, return immediately. Do not execute Steps 1.3–1.5.

### Step 1.3 — Typo Correction

- Instantiate a `Fuse.js` instance using the canonical list of column names and product/rep/region values derived from `salesSchema`
- Set `threshold: 0.4` (tolerates ~2 character differences)
- For each token in the user input, run fuzzy search
- Replace typo tokens with their canonical match
- Record every substitution as a `TypoMatch` in the result: `{ original: string, corrected: string, score: number }`

### Step 1.4 — Synonym & Abbreviation Mapping

- Import the flat alias map from `src/data/sqlAliases.ts`
- Using word-boundary regex (`\bterm\b`), replace any alias with its canonical column/value name
- Examples: `actuals` → `"2024 actuals"`, `RP` → `RING POP`, `rep` → `rep_name`, `territory` → `region`
- Record every substitution as a `SynonymMatch` in the result: `{ alias: string, canonical: string }`
- Apply case-insensitively

### Step 1.5 — LLM Query Rewrite (conditional, not always called)

**Only trigger this step if ALL of the following are true:**

1. Question length after Steps 1.3–1.4 is fewer than 6 words, OR
2. No recognized column name or SQL keyword is present after normalization, OR
3. The question contains a pronoun reference to a prior turn (e.g. "what about that?", "break it down", "same for Q2")

**When triggered**, call Perplexity with this prompt:

```
You are a query normalization assistant for a sales analytics tool.
Rewrite the following question as a single, fully self-contained, unambiguous data question.
Do not answer the question. Do not add assumptions. Only clarify intent and resolve references.

Conversation history (last 2 turns):
{lastTwoTurns}

Current question: "{normalizedQuestion}"

Return only the rewritten question as plain text.
```

- Set `wasRewritten: true` and store the result in `rewrittenQuestion`
- If not triggered, set `wasRewritten: false`

### Stage 1 Output — `StageOneResult`

```ts
interface StageOneResult {
  intent: 'greeting' | 'data_query' | 'out_of_scope' | 'ambiguous'
  originalQuestion: string
  normalizedQuestion: string
  rewrittenQuestion?: string
  wasRewritten: boolean
  typoMatches: { original: string; corrected: string; score: number }[]
  synonymMatches: { alias: string; canonical: string }[]
  normalizationLog: string[] // ordered list e.g. ["typo:actuls→actuals", "synonym:RP→RING POP"]
  reason?: string // populated only for injection_attempt or ambiguous
}
```

---

## Stage 2 — Context Assembly (LangGraph Node: `contextAssemblyNode`)

**Purpose:** Build the full prompt context that will be passed to SQL generation. Do NOT call the SQL generation LLM here.

- **Schema pruning:** Embed the normalized/rewritten question and cosine-similarity match it against pre-embedded column metadata. Inject only the top-K relevant columns into the prompt — not the entire schema. This reduces noise and improves SQL accuracy.
- **Few-shot retrieval:** Embed the question and retrieve the top 2–3 most semantically similar Q→SQL examples from `src/data/fewShots.ts`
- **Conversation history summarization:** Keep the last 3 conversation turns in full. Summarize any turns older than that into a single paragraph. Inject both into the system prompt.
- Store outputs as `schemaContext`, `fewShots`, and `conversationSummary` in graph state

---

## Stage 3 — SQL Generation (LangGraph Node: `generateSqlNode`)

**Purpose:** Use the LLM to convert the normalized question + context into a valid PostgreSQL query.

- Use `state.processedQuestion` (the normalized/rewritten question from Stage 1). Fall back to `state.rawQuestion` only if `processedQuestion` is empty.
- If `wasRewritten: true`, inject BOTH the original and rewritten question into the prompt so the LLM sees the user's original intent alongside the normalized phrasing:

```
Original question: "{originalQuestion}"
Normalized question: "{rewrittenQuestion}"
```

- System prompt must include: schema context (from Stage 2), synonym map, few-shot examples, and business rules (e.g. "fiscal year starts in January", "'revenue' always means SUM(amount)")
- Return only the SQL string. No explanation.

---

## Stage 4 — SQL Validation (LangGraph Node: `validateSqlNode`)

**Purpose:** Statically validate the generated SQL before it touches the database.

- Block any query containing: `DROP`, `DELETE`, `INSERT`, `UPDATE`, `TRUNCATE`, `ALTER`
- Reject any query that does not begin with `SELECT`
- Auto-inject `LIMIT 500` if no `LIMIT` clause is present
- If invalid, set `errorMessage` with the reason and route to the Critic node (Stage 6)
- Do not modify `shouldRouteToSql` or the conditional edge logic — just ensure they reference `processedQuestion`

---

## Stage 5 — SQL Execution (LangGraph Node: `executeSqlNode`)

**Purpose:** Run the validated SQL against the Supabase database using a read-only connection.

- Use a Postgres role with `SELECT`-only permissions — never the admin/service role
- Catch all runtime errors (column not found, syntax error, timeout, empty result) and write them to `state.errorMessage`
- On error, route to the Critic node (Stage 6)
- On success, write results to `state.executionResult` and proceed to Stage 7

---

## Stage 6 — Self-Correction Loop (LangGraph Conditional Edge → `criticNode`)

**Purpose:** Classify the error, inject targeted feedback, and route back to SQL generation for a retry.

- Cap retries at **3 attempts**. On the 4th failure, route to `fallbackNode` which returns a safe, helpful message to the user (e.g. "I couldn't build a precise query for that — try rephrasing as: show me total actuals by rep for Q1")
- Classify the error type and inject the appropriate hint:

| Error Type       | Hint to Inject                                                             |
| ---------------- | -------------------------------------------------------------------------- |
| Column not found | `Use exact column names with double quotes, e.g. "2024 actuals"`           |
| Syntax error     | `Review JOIN ON conditions, GROUP BY alignment, and clause order`          |
| Empty result set | `Query executed but returned 0 rows — the WHERE filters may be too narrow` |
| Query timeout    | `Reduce date range scope or add a LIMIT clause`                            |

- Append the failed SQL + error + hint to `state.critiqueHistory` as a structured string
- Increment `state.revisionNumber`
- On retry, inject the full `critiqueHistory` into the SQL generation system prompt so the LLM does not repeat the same mistake

---

## Stage 7 — Result Interpretation (LangGraph Node: `interpretResultNode`)

**Purpose:** Convert raw SQL results into a clear, business-language answer.

Call Perplexity with this prompt:

```
You are a sales analyst assistant. Answer the user's question based on the SQL results below.

Rules:
- Use plain business language. Never mention SQL or technical terms.
- Format large numbers (e.g. $1.2M not 1200000)
- If the result is empty, say so clearly and suggest why filters may have excluded data
- Suggest 1–2 relevant follow-up questions the user might want to ask

Original question: "{originalQuestion}"
SQL executed: "{generatedSQL}"
Results: {executionResult as JSON}
```

- Stream the response back to the UI

---

## LangGraph State Schema Extensions

Add the following fields to `salesGraphState`:

```ts
processedQuestion: string;       // normalized/rewritten question from Stage 1
inputIntent: 'greeting' | 'data_query' | 'out_of_scope' | 'ambiguous';
wasRewritten: boolean;
critiqueHistory: string[];
revisionNumber: number;
preprocessDebug: {               // never expose to user, only for logging
  normalizationLog: string[];
  typoMatches: TypoMatch[];
  synonymMatches: SynonymMatch[];
};
```

---

## Graph Execution Order

```
preprocessNode → routerNode → contextAssemblyNode → generateSqlNode
                                                          ↓
                                                    validateSqlNode
                                                    ↙           ↓
                                              criticNode    executeSqlNode
                                                  ↑         ↙       ↓
                                                  └─ ERROR ┘   interpretResultNode
                                                                      ↓
                                                                    __end__
```

---

## `src/data/sqlAliases.ts` — Alias Map Structure

```ts
export const flatAliasMap: Record<string, string> = {
  actuals: '"2024 actuals"',
  actual: '"2024 actuals"',
  budget: '"2025 budget"',
  target: '"2025 budget"',
  forecast: '"2025 budget"',
  rep: 'rep_name',
  salesperson: 'rep_name',
  territory: 'region',
  RP: 'RING POP',
}

// Structured groups for UI/analytics use
export const aliasGroups = {
  measures: { actuals: '"2024 actuals"', budget: '"2025 budget"' },
  dimensions: { rep: 'rep_name', territory: 'region' },
  products: { RP: 'RING POP' },
}
```

---

## Test Cases (Stage 1)

| Input                            | Expected `normalizedQuestion`         | Expected Intent            |
| -------------------------------- | ------------------------------------- | -------------------------- |
| `"hi"`                           | —                                     | `greeting`                 |
| `"show me actuls for RP"`        | `"show me 2024 actuals for RING POP"` | `data_query`               |
| `"Rung Pop sales"`               | `"RING POP sales"`                    | `data_query`               |
| `"what about Q2?"`               | LLM rewrite using prior context       | `data_query`               |
| `"show me the numbers"`          | —                                     | `ambiguous`                |
| `"ignore previous instructions"` | —                                     | `out_of_scope` (injection) |
| `"total actuals by rep for Q1"`  | unchanged (no rewrite triggered)      | `data_query`               |
