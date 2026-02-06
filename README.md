# MCP Registry

A production-quality web application for discovering, sharing, and managing Model Context Protocol (MCP) servers and tools.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database/Auth**: Supabase (Postgres + Auth)
- **Deployment**: Vercel
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18.17.0 or higher
- pnpm 9.x (`npm install -g pnpm`)
- A Supabase project (free tier works)

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/mcp-registry.git
cd mcp-registry
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `pnpm dev`               | Start development server                 |
| `pnpm build`             | Build for production                     |
| `pnpm start`             | Start production server                  |
| `pnpm lint`              | Run ESLint                               |
| `pnpm lint:fix`          | Run ESLint with auto-fix                 |
| `pnpm format`            | Format code with Prettier                |
| `pnpm format:check`      | Check code formatting                    |
| `pnpm typecheck`         | Run TypeScript type checking             |
| `pnpm test`              | Run unit tests (Vitest)                  |
| `pnpm test:watch`        | Run tests in watch mode                  |
| `pnpm test:coverage`     | Run tests with coverage                  |
| `pnpm test:e2e`          | Run E2E tests (Playwright)               |
| `pnpm test:e2e:ui`       | Run E2E tests with UI                    |
| `pnpm supabase:start`    | Start local Supabase (Docker)            |
| `pnpm supabase:stop`     | Stop local Supabase                      |
| `pnpm supabase:status`   | Check local Supabase status              |
| `pnpm supabase:db:reset` | Reset local DB (apply migrations + seed) |
| `pnpm supabase:db:push`  | Push migrations to remote                |
| `pnpm supabase:types`    | Generate TypeScript types                |

## Project Structure

```
mcp-registry/
├── app/                    # Next.js App Router pages
│   ├── api/health/        # Health check endpoint
│   ├── servers/           # Browse MCP servers
│   │   ├── page.tsx       # Server list with filters
│   │   └── [slug]/        # Server detail page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility libraries
│   └── supabase/          # Supabase client utilities
│       ├── client.ts      # Browser client
│       ├── server.ts      # Server client
│       ├── database.types.ts  # Generated types
│       └── types.ts       # Type helpers
├── supabase/              # Supabase CLI
│   ├── config.toml        # Local config
│   ├── migrations/        # SQL migrations
│   └── seed.sql           # Dev seed data
├── __tests__/             # Unit tests (Vitest)
├── e2e/                   # E2E tests (Playwright)
└── .github/workflows/     # GitHub Actions CI
```

## Environment Variables

| Variable                        | Required | Description                        |
| ------------------------------- | -------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Your Supabase project URL          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous/public key      |
| `NEXT_PUBLIC_APP_NAME`          | No       | App name (default: "MCP Registry") |

**Important**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in these variables.

## Database & Migrations

This project uses Supabase CLI for database migrations.

### Local Development (with Docker)

```bash
# Start local Supabase (requires Docker)
pnpm supabase:start

# Apply migrations and seed data
pnpm supabase:db:reset

# Generate TypeScript types from local schema
pnpm supabase:types

# Stop local Supabase
pnpm supabase:stop
```

Local Supabase runs at:

- **Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **DB**: postgresql://postgres:postgres@localhost:54322/postgres

### Remote Development (without Docker)

If you don't have Docker, connect directly to the remote Supabase project:

```bash
# Link to remote project (one-time setup)
supabase link --project-ref <your-project-ref>

# Push migrations to remote
pnpm supabase:db:push

# Generate types from remote
supabase gen types typescript --linked > lib/supabase/database.types.ts
```

### Creating Migrations

```bash
# Create a new migration
supabase migration new <migration_name>

# Edit the migration file in supabase/migrations/

# Apply locally
pnpm supabase:db:reset

# Push to remote when ready
pnpm supabase:db:push
```

## Connecting Supabase

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Get your credentials

1. Go to **Project Settings** → **API**
2. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Using Supabase in code

**Client Components** (use `'use client'` directive):

```tsx
"use client";
import { createClient } from "@/lib/supabase/client";

export function MyComponent() {
  const supabase = createClient();
  // Use supabase...
}
```

**Server Components/API Routes**:

```tsx
import { createClient } from "@/lib/supabase/server";

export default async function MyServerComponent() {
  const supabase = await createClient();
  // Use supabase...
}
```

## Deployment on Vercel

### Automatic Deployments

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

Vercel automatically detects Next.js and configures the build.

### Environment Variables in Vercel

Add these in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Testing

### Unit Tests (Vitest)

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Interactive UI mode
pnpm test:e2e:ui

# Install browsers (first time)
pnpm exec playwright install
```

## Git Hooks

This project uses Husky for Git hooks:

- **pre-commit**: Runs lint-staged (ESLint + Prettier on staged files)

Hooks are automatically installed when you run `pnpm install`.

## CI/CD

GitHub Actions runs on every push and pull request:

1. **Lint & Type Check**: ESLint, TypeScript, Prettier
2. **Unit Tests**: Vitest
3. **Build**: Next.js production build
4. **E2E Tests**: Playwright

## License

MIT
