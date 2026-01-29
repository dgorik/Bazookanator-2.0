import { NextResponse } from 'next/server'
import { test } from '@/src/lib/openai/generateSummary'

// import { createClient } from '@/src/lib/client/supabase/server'
// import { generateSQL } from '@/src/lib/openai/generateSQL'
// import { generateSummary } from '@/src/lib/openai/generateSummary'
// import { buildSQLPrompt } from '@/src/lib/openai/promptBuilder'

// const MAX_ROWS = 100
// const ALLOWED_TABLES = ['OP Database']

// const SELECT_ONLY_REGEX = /^\s*select\s/i
// const SEMICOLON_REGEX = /;/
// const LIMIT_REGEX = /\blimit\s+(\d+)\b/i
// const TABLE_REGEX = /\b(from|join)\s+([^\s,]+)/gi

// function normalizeTableName(rawTable: string) {
//   const withoutQuotes = rawTable.replace(/"/g, '').trim()
//   const parts = withoutQuotes.split('.')
//   return parts[parts.length - 1] ?? withoutQuotes
// }

// function extractTables(sql: string) {
//   const tables = new Set<string>()
//   for (const match of sql.matchAll(TABLE_REGEX)) {
//     const tableToken = match[2]
//     if (!tableToken) continue
//     tables.add(normalizeTableName(tableToken))
//   }
//   return Array.from(tables)
// }

// function hasOnlyAllowedTables(sql: string) {
//   const tables = extractTables(sql)
//   if (tables.length === 0) return true
//   return tables.every((table) => ALLOWED_TABLES.includes(table))
// }

// function enforceLimit(sql: string, maxRows: number) {
//   const limitMatch = sql.match(LIMIT_REGEX)
//   if (!limitMatch) {
//     return `${sql} LIMIT ${maxRows}`
//   }

//   const currentLimit = Number(limitMatch[1])
//   if (!Number.isNaN(currentLimit) && currentLimit > maxRows) {
//     return sql.replace(LIMIT_REGEX, `LIMIT ${maxRows}`)
//   }

//   return sql
// }

// function validateSQL(sql: string) {
//   if (!SELECT_ONLY_REGEX.test(sql)) {
//     return 'Only SELECT queries are allowed.'
//   }
//   if (SEMICOLON_REGEX.test(sql)) {
//     return 'Semicolons are not allowed in the SQL.'
//   }
//   if (!hasOnlyAllowedTables(sql)) {
//     return 'SQL references tables outside the allowlist.'
//   }
//   return null
// }

// export async function POST(request: Request) {
//   try {
//     const body = (await request.json()) as { question?: string }
//     const question = body?.question?.trim()

//     if (!question) {
//       return NextResponse.json(
//         { error: 'Missing question.' },
//         { status: 400 }
//       )
//     }

//     const prompt = buildSQLPrompt(question)
//     const generatedSQL = await generateSQL(prompt)
//     const validationError = validateSQL(generatedSQL)

//     if (validationError) {
//       return NextResponse.json({ error: validationError }, { status: 400 })
//     }

//     const safeSQL = enforceLimit(generatedSQL, MAX_ROWS)
//     const supabase = await createClient()
//     const { data, error } = await supabase.rpc('execute_sql_readonly', {
//       sql_query: safeSQL,
//     })

//     if (error) {
//       return NextResponse.json(
//         { error: 'Failed to execute query.' },
//         { status: 500 }
//       )
//     }

//     const rows = Array.isArray(data) ? data : []
//     const summary =
//       rows.length === 0
//         ? 'No results found for that query.'
//         : await generateSummary(rows)

//     return NextResponse.json({
//       sql: safeSQL,
//       summary,
//       rows,
//     })
//   } catch {
//     return NextResponse.json(
//       { error: 'Unexpected error while processing the request.' },
//       { status: 500 }
//     )
//   }
// }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: string }
    const res = await test(body?.question ?? '')
    return NextResponse.json({ summary: res })
  } catch {
    return NextResponse.json(
      { error: 'Unexpected error while processing the request.' },
      { status: 500 },
    )
  }
}
