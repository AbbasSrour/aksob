# Majors Feature

## Goal

Replace the hardcoded `AKSOB_MAJORS` array with a database-backed `major` table. Admins can add/remove majors without code changes. The signup flow fetches the live list for users to pick from.

## Data Model

| `major` table |                               |
| ----------- | ----------------------------- |
| `id`          | text PK                       |
| `name`        | text, unique                  |
| `description` | text                          |
| `credits`     | integer                       |
| `duration`    | real (years, e.g. `4.0`)      |
| `isActive`    | boolean, default `true`       |
| `createdAt`   | timestamp_ms, auto            |
| `updatedAt`   | timestamp_ms, auto on update  |

Seeded with the current 8 majors from `AKSOB_MAJORS` (initially only `name` populated, other fields filled later by admins).

## API (`/majors`)

| Method   | Path           | Access | Notes                          |
| -------- | -------------- | ------ | ------------------------------ |
| `GET`      | `/majors`        | Public | List active majors             |
| `GET`      | `/majors/:id`    | Public | Get by ID                      |
| `POST`     | `/majors`        | Admin  | Create                         |
| `PUT`      | `/majors/:id`    | Admin  | Update any field; toggle `isActive` to deactivate |
| `DELETE`   | —                | —      | Not allowed, deactivate instead  |

## Files

### Create
- `apps/api/src/modules/majors/db/major.db.ts` — Drizzle schema
- `apps/api/src/modules/majors/constant/majors-errors.constant.ts` — error constants
- `apps/api/src/modules/majors/majors.schema.ts` — TypeBox validation
- `apps/api/src/modules/majors/majors.routes.ts` — Elysia route module

### Modify
- `apps/api/src/db/index.ts` — import and spread major schema
- `apps/api/src/app.ts` — register `majorsModule`
- `packages/sdk/src/index.ts` — export `Major` type, update API client types

## Seed

- Run on first migration or dev setup
- Insert the 8 majors from `AKSOB_MAJORS` if table is empty

## Status

- [x] DB schema + barrel registration
- [x] Constants (errors)
- [x] TypeBox schemas
- [x] Route module (list, get, create, update)
- [x] Register in app.ts
- [x] SDK types (auto-inferred via treaty, AKSOB_MAJORS kept as seed)
- [ ] Seed script / migration
- [x] Verify (typecheck, build)

## Open Questions

- None yet
