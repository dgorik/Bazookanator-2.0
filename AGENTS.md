# AGENTS.md

## Commands

- Dev: `npm run dev` (uses turbopack)
- Build: `npm run build`
- Lint: `npm run lint`
- Test all: `npm test` or `jest`
- Test watch: `npm run test:watch`
- Test single file: `jest <file-path>` (e.g., `jest __tests__/SignIn/Input.test.tsx`)

## Architecture

- **Framework**: Next.js 15.3 (App Router, React 19)
- **Database**: Supabase (client in `src/lib/client/supabase/`), Mongoose for MongoDB
- **Auth**: NextAuth.js + Passport.js (local strategy)
- **APIs**: Perplexity AI integration (`src/lib/client/openai.ts`, `src/lib/openai/`)
- **Structure**: `src/app/` (routes), `src/components/` (UI), `src/lib/` (utilities), `src/data/` (static data), `src/hooks/` (React hooks)

## Code Style

- **Imports**: Use `@/` alias for absolute imports (e.g., `@/src/components/...`)
- **Formatting**: Prettier with single quotes, no semicolons, 2 spaces, trailing commas
- **Types**: TypeScript strict mode enabled
- **UI**: Radix UI + Tailwind CSS + Tremor charts, use `clsx` or `cn()` for class merging
- **Components**: Functional components with named exports for pages, default exports often used
- **Client Components**: Mark with `'use client'` directive when using hooks/interactivity
