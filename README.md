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
- Docker (for local Supabase)
- Supabase CLI (`npm install -g supabase`)

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

### 3. Start Local Supabase

Local development uses Supabase running in Docker:

```bash
# Start Supabase (requires Docker)
pnpm supabase:start

# Apply migrations and seed data
pnpm supabase:db:reset

# Generate TypeScript types
pnpm supabase:types
```

After starting, Supabase will output the local URLs and keys. Use these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase-start-output>
```

Local Supabase services:

- **Studio**: http://localhost:54323 (database admin UI)
- **API**: http://localhost:54321
- **Inbucket**: http://localhost:54324 (email testing - view magic links here!)
- **DB**: postgresql://postgres:postgres@localhost:54322/postgres

### 4. Set up the first admin user

After starting local Supabase:

1. Start the dev server: `pnpm dev`
2. Go to http://localhost:3000/signin
3. Enter your email and check Inbucket (http://localhost:54324) for the magic link
4. Click the magic link to sign in
5. Open Supabase Studio (http://localhost:54323)
6. Go to Table Editor → profiles
7. Find your user row and change `role` from `user` to `admin`

Alternatively, use SQL:

```sql
-- Replace with your actual user ID from auth.users table
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<your-user-id>';
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Submission & Moderation Workflow

### For Users

1. **Sign in** via `/signin` using email magic link
2. **Submit** a new MCP server via `/submit`
   - Fill in required fields: slug, name, description, transport, auth
   - Optionally add URLs, tags, and capabilities
3. **Track** your submissions at `/my/submissions`
   - View status: pending, approved, or rejected
   - See admin review notes

### For Admins

1. Access `/admin/submissions` (requires admin role)
2. Review pending submissions:
   - Click to expand and see full details
   - **Approve**: Publishes the server to `/servers`
   - **Reject**: Must provide a reason (visible to submitter)
3. Previously reviewed submissions are shown for reference

### Security Model

- **RLS (Row Level Security)**: All data access is controlled at the database level
- **Admin verification**: Server-side checks in addition to RLS (defense in depth)
- **No service role in browser**: All admin actions use authenticated user context
- **Magic link auth**: No password storage, emails verified automatically

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
│   ├── auth/callback/     # Magic link auth callback
│   ├── signin/            # Sign in page
│   ├── submit/            # Submit new server form
│   ├── my/submissions/    # User's submission list
│   ├── admin/submissions/ # Admin moderation page
│   ├── servers/           # Browse MCP servers
│   │   ├── page.tsx       # Server list with filters
│   │   └── [slug]/        # Server detail page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── header.tsx         # Site header with auth state
│   ├── footer.tsx         # Site footer
│   └── auth-buttons.tsx   # Auth-aware navigation
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
├── middleware.ts          # Auth session refresh
└── .github/workflows/     # GitHub Actions CI
```

## Database Schema

### Tables

**mcp_servers** - Published MCP servers

- `id`, `slug`, `name`, `description`, `homepage_url`, `repo_url`, `docs_url`
- `tags`, `transport`, `auth`, `capabilities`, `verified`
- `created_at`, `updated_at`

**profiles** - User profiles with roles

- `id` (references auth.users)
- `role` ('user' or 'admin')
- `created_at`

**mcp_server_submissions** - User submissions pending review

- `id`, `submitted_by`, `status`, `submitted_payload`
- `review_notes`, `reviewed_at`, `reviewed_by`
- `created_at`

### RLS Policies

- **mcp_servers**: Public read, admin-only insert
- **profiles**: Users read/update own, admins read all
- **submissions**: Users CRUD own, admins read/update all

## Environment Variables

| Variable                        | Required | Description                                   |
| ------------------------------- | -------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Your Supabase project URL                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous/public key                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | No\*     | Service role key (server-only, for bootstrap) |
| `ADMIN_BOOTSTRAP_TOKEN`         | No\*     | One-time bootstrap auth token                 |
| `ADMIN_BOOTSTRAP_EMAIL`         | No\*     | Email of first admin to bootstrap             |

\*Required only for initial admin bootstrap. Can be removed after bootstrap completes.

**Important**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in these variables.

## Database & Migrations

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

### Migration Immutability Rule

**IMPORTANT**: Once a migration has been committed to git or applied to any environment (local, staging, production), it must NEVER be modified. This is critical for database consistency.

If you need to change something in an applied migration:

1. **DO NOT** edit the existing migration file
2. **DO** create a new migration that makes the necessary changes
3. The new migration should be additive (ALTER, CREATE OR REPLACE, etc.)

Example - fixing a function:

```bash
# Wrong: Editing 20260101_create_function.sql after it was applied

# Correct: Create a new migration
supabase migration new fix_function_xyz
# Then add ALTER/CREATE OR REPLACE statements in the new file
```

This ensures:

- All environments can replay migrations consistently
- `supabase db reset` works from scratch
- No drift between local, staging, and production databases

## Connecting to Production Supabase

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Get your credentials

1. Go to **Project Settings** → **API**
2. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Push migrations

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 4. Set first admin (production)

Use the one-time bootstrap endpoint (recommended):

```bash
# 1. Set environment variables in Vercel:
#    - SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard → Settings → API)
#    - ADMIN_BOOTSTRAP_TOKEN (generate a random string)
#    - ADMIN_BOOTSTRAP_EMAIL (your email address)

# 2. Sign up first by visiting /signin and clicking the magic link

# 3. Call the bootstrap endpoint
curl -X POST https://your-app.vercel.app/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: YOUR_ADMIN_BOOTSTRAP_TOKEN" \
  -d '{"email": "your-email@example.com"}'

# Expected response: {"success":true,"message":"Admin bootstrap completed","userId":"..."}
```

The bootstrap endpoint is:

- **One-time**: Self-disables after first successful use
- **Secure**: Requires matching token AND email
- **Rate-limited**: Prevents brute force attacks
- **Audited**: Logs the action to audit_log table

Alternative (manual SQL):

```sql
-- In Supabase SQL Editor
-- First, find your user ID after signing in
SELECT id, email FROM auth.users;

-- Then update their profile
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<your-user-id>';
```

## Deployment on Vercel

### Automatic Deployments

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Vercel

Add these in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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

### Validate Everything Locally

```bash
# Full local validation workflow
pnpm supabase:start
pnpm supabase:db:reset
pnpm supabase:types
pnpm dev &
pnpm test
pnpm test:e2e
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
