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

## Future Events Ideas

Ideas to revisit after the core events feature ships:

- Event categories/tags with icons.
- Custom reminder times beyond the default 24h and 1h reminders.
- Speakers with bios, topics, and headshots on the event page.
- Volunteers and staff assigned to shifts or roles within an event.
- Sponsors recognized with logos and dedicated sections on the event page.
- Multi-ticket support — issue more than one ticket per attendee and revoke tickets after issue.
- Ticket scan history and check-in logs for organizers and admins.
- Multiple check-ins — support check-out and re-check-in for multi-day or multi-session events.
- Event photo gallery — organizers can upload and display event photos.
- Calendar integration — one-click exports for Google Calendar, Outlook, and iCal.
- Unlisted events — invite-only events hidden from public browsing but accessible by link.
- Event announcements — organizers can message all registered attendees.
- Attendance analytics — reports on registrations, check-ins, no-shows, and waitlist activity.
- Manual waitlist management — organizers can reorder or promote waitlisted attendees.
- Rejected event diff — when an organizer edits and resubmits a rejected event, show admins what changed compared to the previously rejected version.
- Recurring events — daily, weekly, or monthly event series with linked instances.
- Maps and directions — embedded location details for in-person and hybrid events.
- Post-event resources — slides, recordings, and downloadable materials shared after an event.
