# Research Programs Feature

## Goal

Add a "Research Programs" feature to AKSOB, replacing a WordPress-based system with a database-backed implementation. Both admins and authenticated users can create research programs. Submissions go through an approval workflow (pending → approved/rejected) before becoming publicly visible.

## Data Model

### `research` table

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | `crypto.randomUUID()` |
| `title` | text, not null | Research program title |
| `content` | text, not null | Rich text description (TipTap HTML) |
| `researchType` | text, not null | One of: `phd_position`, `postdoc`, `research_assistant`, `visiting_researcher`, `research_internship`, `collaboration`, `fellowship`, `other` |
| `institution` | text, not null | University, institute, company name |
| `department` | text | Department/faculty |
| `duration` | text | e.g. "6 months", "1-2 years" |
| `funding` | text | One of: `funded`, `partial`, `unfunded`, `negotiable` |
| `location` | text | City, country, or "Remote" |
| `startDate` | integer (timestamp_ms) | Expected start date |
| `deadline` | integer (timestamp_ms) | Application deadline |
| `educationLevel` | text | One of: `undergraduate`, `masters`, `phd`, `postdoc` |
| `fieldOfStudy` | text | e.g. "Computer Science" |
| `experienceRequired` | text | Free text (textarea) |
| `skillsRequired` | text | Free text (textarea) |
| `additionalRequirements` | text | Free text (textarea) |
| `status` | text, default `"pending"` | `pending`, `approved`, `rejected` |
| `rejectionReason` | text | Admin notes when rejecting |
| `authorId` | text FK → user.id | Creator of the research post |
| `reviewedBy` | text FK → user.id | Admin who approved/rejected |
| `reviewedAt` | integer (timestamp_ms) | When reviewed |
| `createdAt` | integer (timestamp_ms) | Auto |
| `updatedAt` | integer (timestamp_ms) | Auto on update |

**Indexes**: `research_type_idx` on `researchType`, `research_status_idx` on `status`, `research_author_idx` on `authorId`

## API (`/api/research`)

| Method | Path | Access | Notes |
|---|---|---|---|
| `GET` | `/api/research` | Public (optional auth) | List with pagination, search, filter by type/status. Anonymous sees approved. Authenticated users see their own + approved. Admins see all. |
| `GET` | `/api/research/:id` | Public (optional auth) | Single post with access control |
| `POST` | `/api/research` | Authenticated | Create (→ pending). Admin-created → auto-approved. |
| `PUT` | `/api/research/:id` | Authenticated | Update (author or admin). Non-admin edit resets → pending. |
| `DELETE` | `/api/research/:id` | Authenticated | Delete (author or admin) |
| `POST` | `/api/research/:id/approve` | Admin | Approve a pending/rejected post |
| `POST` | `/api/research/:id/reject` | Admin | Reject a post, requires `{ reason: string }` |

### Auth pattern
- Uses `authContext` macro (same as stories/majors)
- `{ auth: "optional" }` for public reads
- `{ auth: true }` for create
- `{ auth: true }` with author-or-admin check for update/delete
- `{ auth: true, role: "admin" }` for approve/reject

## Files

### Create (API)
- `apps/api/src/modules/research/db/research.db.ts` — Drizzle schema + relations
- `apps/api/src/modules/research/constant/research-errors.constant.ts` — error constants
- `apps/api/src/modules/research/constant/research-types.constant.ts` — enum value constants (researchType, funding, educationLevel, status options)
- `apps/api/src/modules/research/schema/research-create.schema.ts` — TypeBox create body
- `apps/api/src/modules/research/schema/research-update.schema.ts` — TypeBox update body
- `apps/api/src/modules/research/schema/research-params.schema.ts` — TypeBox params
- `apps/api/src/modules/research/schema/research-query.schema.ts` — TypeBox list query (pagination + filters)
- `apps/api/src/modules/research/schema/research-reject.schema.ts` — TypeBox reject body
- `apps/api/src/modules/research/schema/research-response.schema.ts` — TypeBox response shapes
- `apps/api/src/modules/research/utils/research.mapper.ts` — DTO mapper (`toResearchDto`)
- `apps/api/src/modules/research/research.routes.ts` — Elysia route module

### Modify (API)
- `apps/api/src/db/index.ts` — import and spread `research` schema
- `apps/api/src/app.ts` — register `researchModule`

### Create (Client)
- `apps/client/app/research/layout.tsx` — Layout (pass-through, like stories)
- `apps/client/app/research/pages/list.tsx` — Data table list page
- `apps/client/app/research/pages/create.tsx` — Create form page
- `apps/client/app/research/pages/$researchId-edit.tsx` — Edit form page
- `apps/client/app/research/components/form/research-form.tsx` — React form component
- `apps/client/app/research/components/form/research-form-schema.ts` — Zod schema
- `apps/client/app/research/components/form/research-form-default-values.ts` — Default form values
- `apps/client/app/research/components/list/research-data-table.tsx` — DataTable
- `apps/client/app/research/components/list/research-data-table-columns.tsx` — Column defs
- `apps/client/app/research/components/loading/research-list-skeleton.tsx`
- `apps/client/app/research/components/loading/create-research-skeleton.tsx`
- `apps/client/app/research/components/loading/edit-research-skeleton.tsx`
- `apps/client/app/research/hooks/api/research.queries.ts` — Query options + mutation hooks
- `apps/client/app/research/hooks/api/research.functions.ts` — Isomorphic server functions
- `apps/client/app/research/constants/research-type-options.ts` — Filter/label options
- `apps/client/app/research/constants/research-status-options.ts` — Filter/label options
- `apps/client/app/research/utils/research-type-filter.ts` — Type filter helper
- `apps/client/app/research/utils/research-status-filter.ts` — Status filter helper

### Modify (Client)
- `apps/client/routes.ts` — add `/admin/research` route tree
- `apps/client/app/api/research/$.ts` — API proxy route
- `apps/client/constants/mutation-key-factory.ts` — add `research` entity
- `apps/client/config/navigation.ts` — add research nav item

### Modify (SDK)
- `packages/sdk/src/index.ts` — type inference auto-updates via treaty (no manual changes needed after API is built)

### i18n keys
- Nav: `nav_research`
- Pages: research list/create/edit titles and labels
- Toast messages: create/update/delete/approve/reject success/error

## Visibility & Permissions

| Role | Can create | Can edit | Can delete | Can approve/reject | Sees in list |
|---|---|---|---|---|---|
| Anonymous | No | No | No | No | Approved only |
| Authenticated user | Yes | Own only | Own only | No | Own + approved |
| Admin | Yes (auto-approved) | All | All | Yes | All |

## Status Workflow

```
User creates → pending
Admin creates → approved (auto)
User edits own post → pending
Admin edits own post → stays approved
Admin approves → approved
Admin rejects → rejected (with reason)
```

## Future: Research Applications

Users will be able to apply for research programs. Admin can view applications on the research detail page. This requires:

- `research_application` table (applicantId, researchId, status, message, attachments, createdAt)
- API endpoints: `POST /api/research/:id/apply`, `GET /api/research/:id/applications` (admin)
- Client: apply button/form on research view, applications tab on research detail page

**Deferred** — implement core CRUD first.

## Decisions Made

1. **No cover image for now** — Text-only. Can add later like stories.
2. **No application link/email field** — Applications will be handled in-app (see Future section).
3. **No public listing yet** — Admin panel CRUD only. Public "job board" can be added later.
4. **No WordPress mirroring** — Design for AKSOB's patterns, not WordPress quirks.

## Status

- [x] DB schema + barrel registration
- [x] Constants (errors, enum values)
- [x] TypeBox schemas (create, update, params, query, reject, response)
- [x] DTO mapper
- [x] Route module (list, get, create, update, delete, approve, reject)
- [x] Register in app.ts
- [x] Client API proxy route
- [x] Client isomorphic functions
- [x] Client query hooks + mutations
- [x] Client form schema + form component
- [x] Client data table + columns
- [x] Client pages (list, create, edit)
- [x] Client layout
- [x] Client routes registration
- [x] Client navigation item
- [x] Client mutation key factory
- [x] i18n keys (en + ar)
- [x] Verify (typecheck, build - both pass)
- [x] DB migration (generated + applied)

## Verification Follow-up

Research-specific gaps found during standards/spec review:

- [x] Replace plain text `content` field with rich text editing, matching the agreed TipTap/stories pattern.
- [x] Expose the reject workflow in the client UI with a required reason.
- [x] Localize research option labels (type, funding, education) instead of hardcoded English.

Notes:

- `opportunity` migration/table changes are intentional concurrent work and should be left as-is.
- Existing unrelated lint errors outside research should not be fixed as part of this feature.
