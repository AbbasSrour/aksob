# AGENTS.md - AKSOB Alumni App

Guidelines for AI agents working on this codebase.

## Project Overview

AKSOB connects LAU ACSOB faculty, graduates, and students through an interactive 3D "Galaxy of Stars" visualization. Monorepo with Turborepo + Bun.

## Architecture

```
aksob/
├── apps/
│   ├── api/          # Elysia backend (Bun runtime)
│   └── web/          # React Router v7 frontend (Vite + Three.js)
├── packages/
│   └── shared/       # Shared TypeScript utilities
├── turbo.json        # Turborepo pipeline config
└── package.json      # Root workspace (Bun)
```

## Build/Lint/Test Commands

### Root (Turborepo)
```bash
bun install              # Install all dependencies
bun run dev              # Start all apps in dev mode
bun run build            # Build all apps for production
bun run lint             # Lint all apps with Biome
bun run format           # Format all apps with Biome
bun run check            # Check and fix all apps with Biome
```

### API (`apps/api`)
```bash
cd apps/api
bun run dev              # Start API with hot reload (port 3000)
bun run build            # Build for production
bun run start            # Run production build
bun run lint             # Lint with Biome
bun run format           # Format with Biome

# Database (Drizzle + LibSQL/Turso)
bun run db:generate      # Generate migrations from schema changes
bun run db:migrate       # Apply migrations
bun run db:studio        # Open Drizzle Studio GUI
bun run db:push          # Push schema directly (dev only)
```

### Web (`apps/web`)
```bash
cd apps/web
bun run dev              # Start frontend dev server (port 5173)
bun run build            # Build for production
bun run start            # Serve production build
bun run typecheck        # Run TypeScript type checking
```

### Running Single Tests
**No test framework configured yet.** When adding tests, use Vitest (recommended for Vite projects):
```bash
# Future: bunx vitest run src/path/to/file.test.ts
```

## Code Style Guidelines

### TypeScript Configuration
- **Target**: ES2022
- **Module**: ESNext with bundler resolution
- **Strict mode**: Enabled
- `verbatimModuleSyntax`: true (use `import type` for type-only imports)
- `noEmit`: true (bundlers handle output)

### Import Organization
1. External packages first (alphabetical)
2. Internal aliases second (`@/`, `@aksob/shared`)
3. Relative imports last

```typescript
// External
import { Elysia } from "elysia";
import winston from "winston";

// Internal aliases
import { db } from "@/db";
import { env } from "@/config/env";

// Relative
import { healthModule } from "./modules/health/health.routes";
```

### Path Aliases
- **API**: `@/*` -> `./src/*`
- **Shared**: `@aksob/shared/*` -> `../../packages/shared/src/*`

### Naming Conventions
| Type                | Convention                            | Example                   |
|---------------------|---------------------------------------|---------------------------|
| Files (routes)      | `kebab-case.routes.ts`                | `health.routes.ts`        |
| Files (general)     | `kebab-case.ts`                       | `http-logger.ts`          |
| Variables/Functions | `camelCase`                           | `formatDate`, `dbPlugin`  |
| Types/Interfaces    | `PascalCase`                          | `Alumnus`, `MajorCluster` |
| Constants           | `SCREAMING_SNAKE_CASE` or `camelCase` | `env.PORT`                |
| React Components    | `PascalCase`                          | `Galaxy`, `ErrorBoundary` |

### Formatting
- **Indentation**: Tabs
- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Trailing commas**: Yes (multi-line)

### Error Handling

**Backend (Elysia)**:
```typescript
// Centralized error handler in index.ts
.onError(({ code, error, set }) => {
  if (code === "NOT_FOUND") {
    set.status = 404;
    return { error: "Route not found" };
  }
  logger.error("Server error", {
    error: error instanceof Error ? error.message : error,
  });
  set.status = 500;
  return { error: "Internal server error" };
})
```

**Frontend (React Router)**:
- Use `ErrorBoundary` component in `root.tsx`
- Check `isRouteErrorResponse(error)` for route errors

### Environment Variables
- Validated at startup using TypeBox schema (`apps/api/src/config/env.ts`)
- Copy `.env.example` to `.env` for local development
- Never commit `.env` files

Required API env vars:
- `DATABASE_URL` - SQLite file or Turso URL
- `BETTER_AUTH_SECRET` - Min 32 chars
- `BETTER_AUTH_URL` - Base URL for auth
- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - debug|info|warn|error

### Type Safety Rules
- **NEVER** use `as any`, `@ts-ignore`, or `@ts-expect-error`
- Define proper types/interfaces for all data structures
- Use Zod or TypeBox for runtime validation

## Backend Patterns (Elysia)

### Plugin System
```typescript
// Create reusable plugins
export const dbPlugin = new Elysia({ name: "db" })
  .decorate("db", db);

// Use in main app
const app = new Elysia()
  .use(dbPlugin)
  .use(authPlugin);
```

### Route Modules
```typescript
// apps/api/src/modules/[feature]/[feature].routes.ts
export const healthModule = new Elysia({ prefix: "/health" })
  .get("/", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
  }));
```

### Authentication
- Uses Better Auth with Drizzle adapter
- Session data available via `authPlugin` derive
- Access `user` and `session` from request context

### Logging
- Winston logger with daily rotation
- Console: human-readable format
- Files: JSON structured logs in `logs/` directory

## Frontend Patterns (React Router v7)

### Routing
- File-based config in `apps/web/src/routes.ts`
- Use `index()` and `route()` from `@react-router/dev/routes`

### Styling
- TailwindCSS v4 with Vite plugin
- CSS imports: `@import "tailwindcss";`
- Custom theme in `app.css` using `@theme` directive

### Three.js (Galaxy)
- Main component: `apps/web/src/galaxy/galaxy.layout.tsx`
- Data: `apps/web/src/galaxy/galaxy-data.ts`
- Use refs for animation state to avoid re-renders
- Clean up resources in useEffect return

## Design System (see DESIGN_GUIDELINES.md)

### Brand Colors
| Token           | Hex       | Usage                 |
|-----------------|-----------|-----------------------|
| Primary Green   | `#076951` | Main actions, buttons |
| Secondary Green | `#16876b` | Hover states          |
| Muted Green     | `#365951` | Secondary text        |
| Darkest Green   | `#192c27` | Galaxy background     |

### UI Components
- Border radius: 8-12px
- Shadows: Soft, diffused (`0 4px 12px rgba(0,0,0,0.15)`)
- Transitions: 0.2-0.3s ease

## Database (Drizzle + LibSQL)

- Schema: `apps/api/src/db/schema.ts`
- Migrations: `apps/api/src/db/migrations/`
- Config: `apps/api/drizzle.config.ts`
- Better Auth tables auto-generated via `bunx @better-auth/cli generate`

## Code Quality Tools

### Biome Configuration
- **Root**: `biome.json` - Base configuration for all packages
- **Packages**: Each package extends root config via `biome.json`:
  - `apps/api/biome.json` - Extends root
  - `apps/web/biome.json` - Extends root + TailwindCSS directives
  - `packages/shared/biome.json` - Extends root

### Running Biome
```bash
# Root level (all packages)
bun run lint

# Individual package
cd apps/api && bun run lint
```

## Common Gotchas

1. **Bun runtime**: Use `Bun.env` not `process.env` in API
2. **React Router v7**: Not Remix - use RR7 conventions
3. **SSR enabled**: Frontend runs on server too (Vercel preset)
4. **No tests yet**: Add Vitest when implementing tests
5. **Workspace packages**: Import from `@aksob/shared` using workspace protocol
6. **Biome configs**: Each package has its own `biome.json` that extends the root
