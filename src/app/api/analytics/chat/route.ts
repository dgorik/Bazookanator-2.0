import { NextResponse } from 'next/server'
import {
  bazookanatorSalesGraph,
  type ConversationMessage,
} from '@/src/lib/langgraph/bazookanatorGraph'

type SanitizedMessage = Pick<ConversationMessage, 'sender' | 'content'>

function extractConversation(raw: unknown, fallbackQuestion?: string) {
  const parsed =
    Array.isArray(raw) &&
    raw
      .map((item) => {
        const sender =
          item &&
          typeof item === 'object' &&
          'sender' in item &&
          (item as { sender?: unknown }).sender
        const content =
          item &&
          typeof item === 'object' &&
          'content' in item &&
          (item as { content?: unknown }).content

        if (
          (sender === 'user' || sender === 'bot') &&
          typeof content === 'string'
        ) {
          return { sender, content: content.trim() } satisfies SanitizedMessage
        }
        return null
      })
      .filter(Boolean)

  if (parsed && parsed.length > 0) return parsed as SanitizedMessage[]

  if (fallbackQuestion?.trim()) {
    return [{ sender: 'user', content: fallbackQuestion.trim() }] as const
  }

  return []
}

const buildRowsSummary = (
  rows: Record<string, unknown>[],
  sql?: string,
): string => {
  if (!rows || rows.length === 0) {
    return 'No results found for that query.'
  }

  const count = rows.length
  const first = rows[0]
  const preview = Object.entries(first)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')

  const base = `Found ${count} row${count === 1 ? '' : 's'}. Sample -> ${preview}`
  return sql ? `${base} | SQL: ${sql}` : base
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const conversation = extractConversation(body?.conversation, body?.question)
    const analystMode =
      typeof body?.analystMode === 'boolean'
        ? body.analystMode
        : Boolean(body?.forceSql)
    const mutableConversation: ConversationMessage[] = conversation.map(
      (msg) => ({
        sender: msg.sender,
        content: msg.content,
      }),
    )

    if (!conversation.length) {
      return NextResponse.json(
        { error: 'Missing question from the request.' },
        { status: 400 },
      )
    }

    const hasPerplexityKey = Boolean(process.env.PERPLEXITY_API_KEY)
    if (!hasPerplexityKey) {
      return NextResponse.json(
        {
          error:
            'Missing PERPLEXITY_API_KEY. Add it to the environment to enable chat responses.',
        },
        { status: 500 },
      )
    }

    const graphState = await bazookanatorSalesGraph.invoke({
      messages: mutableConversation,
      forceSql: analystMode,
    })

    if (graphState.queryError) {
      return NextResponse.json(
        { error: graphState.queryError },
        { status: 400 },
      )
    }

    const latestBotMessage = [...graphState.messages]
      .reverse()
      .find((msg) => msg.sender === 'bot')
    const summary =
      latestBotMessage?.content ||
      buildRowsSummary(graphState.queryResults, graphState.generatedSQL)

    return NextResponse.json({
      summary,
      sql: graphState.generatedSQL,
      rows: graphState.queryResults,
    })
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Unexpected error while processing the request.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
