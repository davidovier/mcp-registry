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

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `pnpm dev`           | Start development server     |
| `pnpm build`         | Build for production         |
| `pnpm start`         | Start production server      |
| `pnpm lint`          | Run ESLint                   |
| `pnpm lint:fix`      | Run ESLint with auto-fix     |
| `pnpm format`        | Format code with Prettier    |
| `pnpm format:check`  | Check code formatting        |
| `pnpm typecheck`     | Run TypeScript type checking |
| `pnpm test`          | Run unit tests (Vitest)      |
| `pnpm test:watch`    | Run tests in watch mode      |
| `pnpm test:coverage` | Run tests with coverage      |
| `pnpm test:e2e`      | Run E2E tests (Playwright)   |
| `pnpm test:e2e:ui`   | Run E2E tests with UI        |

## Project Structure

```
mcp-registry/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── health/        # Health check endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── header.tsx         # Site header/navigation
│   └── footer.tsx         # Site footer
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase client utilities
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   └── types.ts       # Database types
│   └── env.ts             # Environment variable validation
├── __tests__/             # Unit tests (Vitest)
├── e2e/                   # E2E tests (Playwright)
├── .github/workflows/     # GitHub Actions CI
└── public/                # Static assets
```

## Environment Variables

| Variable                        | Required | Description                        |
| ------------------------------- | -------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Your Supabase project URL          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous/public key      |
| `NEXT_PUBLIC_APP_NAME`          | No       | App name (default: "MCP Registry") |

**Important**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in these variables.

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
