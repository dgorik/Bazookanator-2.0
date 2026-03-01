import { perplexityClient } from '../client/perplexity_ai'
import { buildSQLPrompt } from './promptBuilder'
import { cleanedSQL } from './data_clean/sqlUtils'

export async function generateSQL(userQuestion: string) {
  const prompt = buildSQLPrompt(userQuestion)

  const response = await perplexityClient.responses.create({
    model: 'openai/gpt-5-mini',
    input: prompt,
  })

  if (response.status !== 'completed') {
    throw new Error('Failed to create SQL prompt with the language model.')
  }

  return cleanedSQL(response.output_text ?? '')
}
