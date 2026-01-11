# AKSOB - Turborepo with Bun, Elysia, Drizzle ORM & Better Auth

A modern monorepo setup with React Router frontend and Elysia backend.

## Structure

```
aksob/
├── apps/
│   ├── api/           # Elysia backend
│   │   ├── src/
│   │   │   ├── db/        # Drizzle schema & migrations
│   │   │   ├── auth/      # Better Auth configuration
│   │   │   ├── plugins/   # Elysia plugins (db, auth)
│   │   │   ├── routes/    # API routes
│   │   │   └── auth.ts   # Entry point
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── web/           # React Router frontend
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   └── shared/        # Shared utilities
│       ├── src/
│       └── package.json
│
├── package.json       # Root workspace
├── turbo.json         # Turborepo config
└── tsconfig.json      # Base TypeScript config
```

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Database

Copy the example env file and update the DATABASE_URL:

```bash
cp apps/api/.env.example apps/api/.env
```

Then generate the Better Auth schema and run migrations:

```bash
# Generate Better Auth schema (adds tables to schema.ts)
cd apps/api && bunx @better-auth/cli generate

# Generate Drizzle migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Optional: Open Drizzle Studio
bun run db:studio
```

### 3. Run Development Servers

```bash
# Run both API and Web in parallel
bun run dev

# Or run individually:
cd apps/api && bun run dev    # API on http://localhost:3000
cd apps/web && bun run dev    # Web on http://localhost:5173
```

## Available Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Run all dev servers in parallel |
| `bun run build` | Build all apps |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply database migrations |
| `bun run db:studio` | Open Drizzle Studio |

## Tech Stack

- **Runtime**: Bun
- **Backend**: Elysia + Drizzle ORM + Better Auth
- **Frontend**: React Router + Vite + TailwindCSS
- **Monorepo**: Turborepo

## Database Schema

- Your app tables go in `apps/api/src/db/schema.ts`
- Better Auth tables are **auto-generated** by running `bunx @better-auth/cli generate`
- Run `bun run db:generate` after modifying the schema to create migrations
