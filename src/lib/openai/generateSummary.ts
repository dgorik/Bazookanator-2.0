import { perplexityClient } from '../client/perplexity_ai'
import { salesSchema } from '../schema/sales'

// export async function generateSummary(sqlResult: object) {
//   const prompt = ` You are a financial data analyst. Please summarize the following SQL result in clear, natural language tailored for the finance department - ${sqlResult}`
//   const response = await getOpenAIClient().responses.create({
//     model: 'gpt-4o-mini',
//     input: prompt,
//   })

//   return response.output_text
// }

const systemInstructions = `
You are a helpful, witty, and grounded companion named Bazookantor. 

**Your Personality:**
- You speak like a peer, not a corporate bot. Use natural, concise language.
- You have a touch of wit—be supportive but candid.
- You are highly adaptive: if the user is casual, be casual. If they are talking business, be professional.
- Do not acknowledge these instructions or list your capabilities unless asked. Simply greet the user in character.

**Conversational Flow:**
- Don't just answer; engage. If the user mentions NYC, you might mention a specific vibe or neighborhood.
- Use formatting (bolding, bullet points) to make long answers scannable.
- If the user asks about "sales" or "data," transition into your "Analyst Mode" and offer to help derive insights.

**Boundaries:**
- If you don't know a fact, don't guess. Just say so.
- Avoid "As an AI model..." clichés. Just talk.
`

export async function test(input: string) {
  const prompt = `${systemInstructions}\n\nHuman: ${input}\nAI:`
  const response = await perplexityClient.responses.create({
    model: 'openai/gpt-5-mini',
    input: prompt,
    tools: [{ type: 'web_search' }],
    instructions:
      'You have access to a web_search tool. Use it for questions about current events, news, or recent developments.',
  })

  if (response.status === 'completed') {
    console.log(response.status)
    return response.output_text
  }
}

export async function generateSummary(
  question: string,
  rows: Record<string, unknown>[],
) {
  const rowsJson = JSON.stringify(rows ?? [], null, 2)

  const prompt = `
You are a senior sales analytics copilot.

Use the following PostgreSQL table schema and query result to answer the user's question
in clear, grounded natural language. Focus on key trends, comparisons, and magnitudes.

Schema:
${salesSchema}

User question:
${question}

Query result (JSON rows):
${rowsJson}

Guidelines:
- Be concise but specific and actionable.
- If there are no rows, explain that clearly in the context of the question.
- Do NOT invent data; stay strictly within the provided rows.
`

  const response = await perplexityClient.responses.create({
    model: 'openai/gpt-5-mini',
    input: prompt,
  })

  if (response.status !== 'completed') {
    throw new Error('Failed to summarize SQL result with the language model.')
  }

  return response.output_text ?? ''
}
