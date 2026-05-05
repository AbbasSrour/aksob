# Opportunities Feature Plan

> Last updated: Tue May 05 2026 — Implementation complete

## Goal

Add an Opportunities feature to the AKSOB platform — a review-workflow CRUD module for job/internship postings. Users and admins can submit opportunities; admins approve or reject them.

## Scope

| Layer | App | Changes |
|---|---|---|
| Database | `apps/api` | New `opportunity` table |
| API | `apps/api` | New `opportunities` module (7 routes) |
| Admin Panel | `apps/client` | New `/admin/opportunities` section (list, create, edit pages) |
| Public Web | `apps/web` | **Out of scope** for this phase |

## Key Decisions

1. **Auth-required for all routes** — no anonymous/public access. User must be logged in to see any opportunities.
2. **Review workflow** — like stories: users submit → `pending`; admins submit → auto-`approved`. Admins can approve/reject pending items.
3. **Submitter tracked via userId FK** (not explicit name/email fields). Links to the `user` table.
4. **Pattern**: Follow the `stories` module exactly — same file structure, auth logic, response shapes, and client-side patterns.
5. **No images** — opportunities don't have cover/thumbnail/content images, so the form is simpler than stories.

## API Design

### Routes (prefix: `/api/opportunities`)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/` | required | any | List opportunities (admin: all; user: approved + own) |
| `GET` | `/:id` | required | any | Get single opportunity (own or approved) |
| `POST` | `/` | required | any | Create (user→pending, admin→auto-approved) |
| `PUT` | `/:id` | required | any | Update (author or admin; user edit resets to pending) |
| `DELETE` | `/:id` | required | any | Delete (author or admin) |
| `POST` | `/:id/approve` | required | admin | Approve an opportunity |
| `POST` | `/:id/reject` | required | admin | Reject with review notes |

### Database Schema

```sql
CREATE TABLE opportunity (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type IN ('job', 'internship')),
  company       TEXT NOT NULL,
  contact_email TEXT,
  apply_url     TEXT,
  author_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by   TEXT REFERENCES user(id),
  review_notes  TEXT,
  reviewed_at   INTEGER,  -- timestamp_ms
  created_at    INTEGER NOT NULL DEFAULT (unixepoch('subsecond') * 1000),  -- timestamp_ms
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch('subsecond') * 1000),  -- timestamp_ms
);

CREATE INDEX opp_author_id_idx ON opportunity(author_id);
CREATE INDEX opp_status_idx ON opportunity(status);
CREATE INDEX opp_created_at_idx ON opportunity(created_at);
```

### Visibility Rules (GET list)

| Actor | Sees |
|---|---|
| Admin | All opportunities (filterable by status, authorId, type) |
| Regular user (no params) | Approved + own |
| Regular user (authorId=self) | Own (all statuses) |
| Regular user (status=approved) | Approved only |
| Regular user (status=pending/rejected) | Only own (for those statuses) |

## File Structure

### API (`apps/api/src/modules/opportunities/`)

```
opportunities/
├── opportunities.routes.ts           # 7 route handlers
├── constant/
│   ├── opportunities-errors.constant.ts
│   └── opportunity-types.constant.ts  # enum values
├── db/
│   └── opportunity.db.ts             # Drizzle schema + relations
├── schema/
│   ├── opportunities-create.schema.ts
│   ├── opportunities-update.schema.ts
│   ├── opportunities-params.schema.ts
│   ├── opportunities-reject.schema.ts
│   └── opportunities-response.schema.ts
└── utils/
    └── opportunities.mapper.ts
```

**Files to modify:**
- `apps/api/src/db/index.ts` — import + spread `opportunitySchema`
- `apps/api/src/app.ts` — import + `.use(opportunitiesModule)`

### Admin Client (`apps/client/app/opportunities/`)

```
opportunities/
├── layout.tsx
├── hooks/
│   ├── api/
│   │   ├── opportunities.functions.ts   # Eden Treaty calls + types
│   │   └── opportunities.queries.ts     # React Query hooks
│   └── opportunities-facets-value.tsx   # Facet counting
├── constants/
│   ├── opportunity-type-options.ts
│   └── opportunity-status-options.ts
├── utils/
│   ├── opportunity-type-filter.ts
│   └── opportunity-status-filter.ts
├── components/
│   ├── list/
│   │   ├── opportunities-data-table.tsx
│   │   ├── opportunities-data-table-columns.tsx
│   │   └── opportunities-list-skeleton.tsx
│   ├── form/
│   │   ├── opportunity-form.tsx
│   │   └── opportunity-form-schema.ts
│   └── loading/
│       └── opportunities-form-skeleton.tsx
└── pages/
    ├── list.tsx
    ├── create.tsx
    └── edit.tsx
```

**Files to modify:**
- `apps/client/routes.ts` — add `/admin/opportunities` route group
- `apps/client/constants/mutation-key-factory.ts` — add `opportunities` keys
- `apps/client/config/navigation.ts` — add Opportunities to the admin sidebar
- `apps/client/translations/en.json`, `apps/client/translations/ar.json` — add sidebar label translations

## Implementation Order

1. **API** — DB schema, constants, schemas, mapper, routes (core backend)
2. **API registration** — wire into `db/index.ts` and `app.ts`, generate + run migration
3. **Client functions + queries** — API client types, functions, React Query hooks
4. **Client constants + utils** — filter definitions, option lists
5. **Client pages** — list, create, edit with form and data table
6. **Client registration** — routes, mutation keys, verify build

## Open Questions

- None currently

## Status

- [x] API: DB schema + constants + schemas
- [x] API: Routes + mapper
- [x] API: Registration in db/index.ts, app.ts, migration
- [x] Client: API functions + queries
- [x] Client: Constants, utils, filter definitions
- [x] Client: List page + data table
- [x] Client: Create page + form
- [x] Client: Edit page + form
- [x] Client: Route registration + mutation keys
- [x] Client: Sidebar navigation + translations
