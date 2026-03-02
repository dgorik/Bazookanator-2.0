import { randomUUID } from 'crypto'
import { Annotation, GraphNode, StateGraph } from '@langchain/langgraph'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { generateSQL } from '@/src/lib/openai/generateSQL'
import { generateSummary, test } from '@/src/lib/openai/generateSummary'

const ALLOWED_TABLES = ['product_data']
const SELECT_ONLY_REGEX = /^\s*select\s/i
const SEMICOLON_REGEX = /;/
const TABLE_REGEX = /\b(from|join)\s+([^\s,]+)/gi
const DATA_KEYWORDS = [
  'sales',
  'cases',
  'revenue',
  'total',
  'sum',
  'avg',
  'average',
  'trend',
  'compare',
  'growth',
  'sql',
  'query',
  'database',
  'ytd',
  'qtr',
  'quarter',
  'volume',
]
const NON_DATA_GREETINGS = ['hi', 'hello', 'hey', 'thanks', 'thank you']

export interface ConversationMessage {
  id?: string
  sender: 'user' | 'bot'
  content: string
}

const appendMessages = (
  current: ConversationMessage[],
  update?: ConversationMessage | ConversationMessage[],
) => {
  if (!update) return current
  if (Array.isArray(update)) {
    return current.concat(update)
  }
  return current.concat(update)
}

export const salesGraphState = Annotation.Root({
  messages: Annotation<ConversationMessage[]>({
    reducer: appendMessages,
    default: () => [],
  }),
  forceSql: Annotation<boolean>({
    value: (_, update) => update,
    default: () => false,
  }),
  generatedSQL: Annotation<string>({
    value: (_, update) => update,
    default: () => '',
  }),
  queryResults: Annotation<Record<string, unknown>[]>({
    value: (_, update) => update,
    default: () => [],
  }),
  queryError: Annotation<string>({
    value: (_, update) => update,
    default: () => '',
  }),
})

export type SalesGraphState = typeof salesGraphState.State

const getLatestUserMessage = (messages: ConversationMessage[]) => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (message.sender === 'user') {
      return message.content
    }
  }
  return undefined
}

const shouldRouteToSql = (question?: string) => {
  if (!question) return false
  const normalized = question.toLowerCase().trim()

  // Short greetings or acknowledgements should not route to SQL.
  if (normalized.length < 4) return false
  if (NON_DATA_GREETINGS.some((greet) => normalized === greet)) return false

  // Require at least a few words to avoid routing terse inputs like "hi".
  const wordCount = normalized.split(/\s+/).length
  if (wordCount < 3) return false

  return DATA_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

const normalizeTableName = (rawTable: string) => {
  const withoutQuotes = rawTable.replace(/"/g, '').trim()
  const parts = withoutQuotes.split('.')
  return parts[parts.length - 1] ?? withoutQuotes
}

const extractTables = (sql: string) => {
  const tables = new Set<string>()
  for (const match of sql.matchAll(TABLE_REGEX)) {
    const tableToken = match[2]
    if (!tableToken) continue
    tables.add(normalizeTableName(tableToken))
  }
  return Array.from(tables)
}

const hasOnlyAllowedTables = (sql: string) => {
  const tables = extractTables(sql)
  if (tables.length === 0) return true
  return tables.every((table) => ALLOWED_TABLES.includes(table))
}

// Client-side limit enforcement removed; the RPC enforces a hard LIMIT.

const validateSQL = (sql: string) => {
  if (!SELECT_ONLY_REGEX.test(sql)) {
    return 'Only SELECT queries are allowed.'
  }
  if (SEMICOLON_REGEX.test(sql)) {
    return 'Semicolons are not allowed in the SQL.'
  }
  if (!hasOnlyAllowedTables(sql)) {
    return 'SQL references a table outside the allowlist.'
  }
  return null
}

const routerNode: GraphNode<typeof salesGraphState> = () => {
  return {
    generatedSQL: '',
    queryResults: [],
    queryError: '',
  }
}

const chatNode: GraphNode<typeof salesGraphState> = async (state) => {
  const latestQuestion = getLatestUserMessage(state.messages)
  if (!latestQuestion) {
    return {}
  }

  try {
    const reply =
      (await test(latestQuestion))?.trim() ??
      'I did not catch that. Can you rephrase?'

    return {
      messages: [
        {
          id: randomUUID(),
          sender: 'bot',
          content: reply,
        },
      ],
    }
  } catch (error) {
    console.error('Chat node error', error)
    return {
      messages: [
        {
          id: randomUUID(),
          sender: 'bot',
          content:
            'Something went wrong while generating a response. Please try again.',
        },
      ],
    }
  }
}

const generateSqlNode: GraphNode<typeof salesGraphState> = async (state) => {
  const latestQuestion = getLatestUserMessage(state.messages)
  if (!latestQuestion) {
    return { queryError: 'No question detected in the conversation.' }
  }

  try {
    const sql = await generateSQL(latestQuestion)
    if (!sql) {
      return { queryError: 'The model did not return SQL for that request.' }
    }

    return {
      generatedSQL: sql,
    }
  } catch (error) {
    console.error('Failed to generate SQL via LangGraph', error)
    return { queryError: 'Unable to generate SQL for that question.' }
  }
}

const executeSqlNode: GraphNode<typeof salesGraphState> = async (state) => {
  const sql = state.generatedSQL?.trim()
  if (!sql) {
    return { queryError: 'No SQL statement to execute.' }
  }

  const validationError = validateSQL(sql)
  if (validationError) {
    return { queryError: validationError }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return {
      queryError:
        'Supabase service credentials are missing. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    }
  }

  // Avoid double LIMIT enforcement; RPC already applies a hard limit.
  const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await supabase.rpc('execute_sql_readonly', {
    sql_query: sql,
  })

  if (error) {
    console.error('execute_sql_readonly error', error)
    return { queryError: 'Database execution failed.' }
  }

  return {
    queryResults: Array.isArray(data) ? data : [],
  }
}

const summarizeNode: GraphNode<typeof salesGraphState> = async (state) => {
  const latestQuestion = getLatestUserMessage(state.messages)
  const rows = state.queryResults ?? []

  if (!latestQuestion) {
    return {}
  }

  if (!rows.length) {
    return {
      messages: [
        {
          id: randomUUID(),
          sender: 'bot',
          content: 'No results found for that question in the sales data.',
        },
      ],
    }
  }

  try {
    const summary = (await generateSummary(latestQuestion, rows))?.trim()

    const content =
      summary && summary.length > 0
        ? summary
        : `I ran the query and found ${rows.length} row${
            rows.length === 1 ? '' : 's'
          }, but could not generate a detailed summary.`

    return {
      messages: [
        {
          id: randomUUID(),
          sender: 'bot',
          content,
        },
      ],
    }
  } catch (error) {
    console.error('Failed to summarize SQL results via LangGraph', error)
    const fallback =
      rows.length === 0
        ? 'No results found for that question in the sales data.'
        : `I ran the query and found ${rows.length} row${
            rows.length === 1 ? '' : 's'
          }, but could not generate a detailed summary.`

    return {
      messages: [
        {
          id: randomUUID(),
          sender: 'bot',
          content: fallback,
        },
      ],
    }
  }
}

export const bazookanatorSalesGraph = new StateGraph(salesGraphState)
  .addNode('router', routerNode)
  .addNode('chat', chatNode)
  .addNode('generate_sql', generateSqlNode)
  .addNode('execute_sql', executeSqlNode)
  .addNode('summarize', summarizeNode)
  .addEdge('__start__', 'router')
  .addConditionalEdges('router', (state) => {
    if (state.forceSql) {
      return 'generate_sql'
    }

    const latestQuestion = getLatestUserMessage(state.messages)
    return shouldRouteToSql(latestQuestion) ? 'generate_sql' : 'chat'
  })
  .addEdge('chat', '__end__')
  .addEdge('generate_sql', 'execute_sql')
  .addEdge('execute_sql', 'summarize')
  .addEdge('summarize', '__end__')
  .compile({
    name: 'bazookanator-sales',
  })
