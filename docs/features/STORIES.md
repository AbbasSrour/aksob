# Stories Feature Plan

## Overview

Members post success stories. Admins approve before stories appear publicly.
Author sees their own stories (all statuses). Rich text editor (TipTap) for content.

---

## 1. Database

### Table: `story`

| Column         | Type                     | Notes                                           |
|----------------|--------------------------|-------------------------------------------------|
| `id`           | `text` PK                | UUID                                            |
| `title`        | `text` NOT NULL          |                                                 |
| `description`  | `text` NOT NULL          | Short teaser for list cards                     |
| `content`      | `text` NOT NULL          | TipTap HTML                                     |
| `category`     | `text` NOT NULL          | Enum (see below)                                |
| `story_date`   | `integer`                | Nullable. When the success event happened       |
| `status`       | `text` NOT NULL          | `pending` (default) \| `approved` \| `rejected` |
| `author_id`    | `text` NOT NULL FK       | References `user.id`, ON DELETE CASCADE         |
| `reviewed_by`  | `text` FK                | References `user.id`, null until reviewed       |
| `review_notes` | `text`                   | Admin feedback (used on rejection)              |
| `reviewed_at`  | `integer` (timestamp_ms) | Null until reviewed                             |
| `created_at`   | `integer` (timestamp_ms) | Auto-set, NOT NULL                              |
| `updated_at`   | `integer` (timestamp_ms) | Auto-set on update, NOT NULL                    |

### Categories

```
career_advancement
entrepreneurship
industry_recognition
social_impact
academic_achievement
innovation
leadership
community_service
other
```

### Indexes

- `story_author_id_idx` on `author_id`
- `story_status_idx` on `status`
- `story_category_idx` on `category`
- `story_created_at_idx` on `created_at`

### File

- **Schema:** `apps/api/src/modules/stories/db/story.db.ts`
- **Migration:** `apps/api/src/db/migrations/0002_rainy_invisible_woman.sql`

---

## 2. API Routes

### Single list route

All story listing uses **one route** with query params. Visibility depends on `authorId`, `status`, and the authenticated user's role.

```
GET /stories?category=&page=&limit=&authorId=&status=&search=
Auth: auth: "optional"
```

**`status`** is only honored when non-approved stories are visible to the viewer (own stories, or admin). Otherwise silently ignored — only `approved` returned.

**`authorId`** narrows to a specific user. Never blends with own stories.

**`search`** filters by story title and author name (LIKE, case-insensitive). Admin-only in the list page search bar; also usable via API.

| Viewer         | authorId | status   | Returns                                     |
|----------------|----------|----------|---------------------------------------------|
| Anonymous      | —        | —        | All approved                                |
| Anonymous      | any      | —        | Approved for that user                      |
| Regular user   | —        | —        | All approved + own (any status)             |
| Regular user   | —        | pending  | Own pending only                            |
| Regular user   | —        | rejected | Own rejected only                           |
| Regular user   | —        | approved | All approved + own approved                 |
| Regular user   | other    | —        | Approved for that user only                 |
| Regular user   | own      | —        | Own (any status)                            |
| Regular user   | own      | pending  | Own pending only                            |
| Regular user   | own      | rejected | Own rejected only                           |
| Regular user   | own      | approved | Own approved only                           |
| Admin          | —        | —        | Everything                                  |
| Admin          | —        | pending  | All pending                                 |
| Admin          | —        | rejected | All rejected                                |
| Admin          | —        | approved | All approved                                |
| Admin          | any      | —        | All for that user (any status)              |
| Admin          | any      | pending  | Pending for that user                       |
| Admin          | any      | rejected | Rejected for that user                      |
| Admin          | any      | approved | Approved for that user                      |

### Single story

```
GET /stories/:id
Auth: auth: "optional"
```

Visibility: approved = public, admin = all, author = all statuses. Others get 404 for non-approved.

| Viewer             | Story Status | Result |
| ------------------ | ------------ | ------ |
| Anonymous          | approved     | ✅     |
| Anonymous          | pending      | 404    |
| Anonymous          | rejected     | 404    |
| User (not author)  | approved     | ✅     |
| User (not author)  | pending      | 404    |
| User (not author)  | rejected     | 404    |
| User (is author)   | any          | ✅     |
| Admin (any)        | any          | ✅     |

### Author CRUD (authenticated)

| Method   | Path           | Description                                                                                                                                                                                                                                                                                                                         |
|----------|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `POST`   | `/stories`     | Create story. Sets `status: pending` (user) or `status: approved` (admin). Body: `{ title, description, content, category, storyDate?, authorId? }`. `authorId` is admin-only — assigns story to a specific member. Admin-created stories are auto-approved (`reviewed_by` = admin.id, `reviewed_at` = now, `review_notes` = null). |
| `PUT`    | `/stories/:id` | Full update (author or admin). User updates reset status to `pending`. Admin updates preserve existing status and review data. Body: `{ title, description, content, category, story_date? }`                                                                                                                                                                                                               |
| `DELETE` | `/stories/:id` | Delete story (author or admin)                                                                                                                                                                                                                                                                                                      |

### Admin actions

| Method | Path                    | Description                                                                                                            |
|--------|-------------------------|------------------------------------------------------------------------------------------------------------------------|
| `POST` | `/stories/:id/approve` | Approve story. Sets `status: approved`, `reviewed_by`, `reviewed_at`. Clears `review_notes`. Works on pending or rejected stories. |
| `POST` | `/stories/:id/reject`  | Reject story. Body: `{ review_notes: string }`. Sets `status: rejected`, `reviewed_by`, `reviewed_at`, `review_notes`. |

### Auth macros

Authentication and authorization use Elysia macros from `authContext`:

| Flag                | Effect                                                        |
|---------------------|---------------------------------------------------------------|
| `auth: "optional"`  | `user = User \| null` in context, no 401                         |
| `auth: true`        | `user = User` in context, 401 if not logged in                  |
| `role: "admin"`     | 403 if `user.role !== "admin"`. Builds on auth (no duplicate fetch) |
| `role: ["a","b"]`   | 403 if `user.role` not in array                                  |

Macros resolve sequentially — `role` uses `user` already resolved by `auth`, so `getSession` is only called once.

### File

- `apps/api/src/modules/stories/stories.routes.ts`
- Registered in `apps/api/src/app.ts`

---

## 3. Response Shapes

### Story (full, with author)

```ts
{
  id: string;
  title: string;
  description: string;
  content: string;           // TipTap HTML
  category: StoryCategory;
  storyDate: string | null;  // ISO
  status: "pending" | "approved" | "rejected";
  author: {
    id: string;
    name: string;
    image: string | null;
    major: string;
  }
  ;
  reviewedBy: {
    id: string;
    name: string
  }
|
  null;
  reviewNotes: string | null;
  reviewedAt: string | null; // ISO
  createdAt: string;         // ISO
  updatedAt: string;         // ISO
}
```

### Create/Edit body

```ts
{
  title: string;
  description: string;
  content: string;
  category: StoryCategory;
  storyDate ? : string;        // ISO
  authorId ? : string;         // Admin-only: assign story to a specific member
}
```

**Admin auto-approve**: When a user with role `admin` creates a story, it is auto-approved:

- `status`: `approved` (instead of `pending`)
- `reviewedBy`: admin's user id
- `reviewedAt`: now
- `reviewNotes`: null

If `authorId` is provided (admin only), the author shown in the response is the assigned member, not the admin.

### Reject body

```ts
{
  reviewNotes: string
}
```

### List response

```ts
{
  status: "ok";
  data: Story[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  ;
}
```

---

## 4. Frontend (Admin Dashboard — `apps/client`)

The admin stories management is built in `apps/client` using TanStack Start + TanStack Query + TanStack Table, following the same pattern as the existing users module.

### Admin Stories List (`/admin/stories`)

| Role | File |
|------|------|
| Route definition | `apps/client/routes.ts` |
| Layout | `apps/client/app/stories/stories.layout.tsx` |
| List page | `apps/client/app/stories/pages/list.tsx` |
| Data table | `apps/client/app/stories/components/list/stories-data-table.tsx` |
| Column defs | `apps/client/app/stories/components/list/stories-data-table-columns.tsx` |
| Loading skeleton | `apps/client/app/stories/components/list/stories-list-skeleton.tsx` |
| API functions | `apps/client/app/stories/hooks/api/stories.functions.ts` |
| Query hooks | `apps/client/app/stories/hooks/api/stories.queries.ts` |
| Category filter | `apps/client/app/stories/utils/story-category-filter.ts` |
| Status filter | `apps/client/app/stories/utils/story-status-filter.ts` |
| API client | `apps/client/lib/api.ts` (Eden Treaty via `createApiClient` from SDK) |

### Features
- Table with title, author, category, status (badge), story date, actions
- Search by title + author name (via `search` query param)
- Faceted filters: category (9 options), status (pending/approved/rejected)
- Pagination (10/20/30/50 per page)
- Approve/reject actions on each row (with confirmation)
- Delete action
- Row click navigates to detail page (future)

### Public Pages (`apps/web` — future)

---

## 5. Frontend Routing

### Admin (TanStack Router, `apps/client/routes.ts`):

```ts
route("/stories", "stories/stories.layout.tsx", [
  index("stories/pages/list.tsx"),
]),
```

### Public (React Router v7, `apps/web` — future):

```ts
layout("stories/pages/layout.tsx", [
  route("stories", "stories/pages/list.tsx"),
  route("stories/create", "stories/pages/create.tsx"),
  route("stories/my", "stories/pages/my-stories.tsx"),
  route("stories/:id", "stories/pages/detail.tsx"),
  route("stories/:id/edit", "stories/pages/edit.tsx"),
]),
  route("admin/stories", "stories/pages/admin.tsx"),
```

- `layout.tsx` wraps story pages with consistent header/nav
- Admin page uses admin role check (derived from session)

---

## 6. SDK Types

Added to `packages/sdk/src/index.ts`:

```ts
export const STORY_CATEGORIES = [
  "career_advancement",
  "entrepreneurship",
  "industry_recognition",
  "social_impact",
  "academic_achievement",
  "innovation",
  "leadership",
  "community_service",
  "other",
] as const;

export type StoryCategory = (typeof STORY_CATEGORIES)[number];
export type StoryStatus = "pending" | "approved" | "rejected";

export interface Story {
  id: string;
  title: string;
  description: string;
  content: string;
  category: StoryCategory;
  storyDate: string | null;
  status: StoryStatus;
  author: { id: string; name: string; image: string | null; major: string };
  reviewedBy: { id: string; name: string } | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoryInput {
  title: string;
  description: string;
  content: string;
  category: StoryCategory;
  storyDate?: string;
}
```

---

## 7. Dependencies to Add

### Web (`apps/web/package.json`)

```json
{
  "@tiptap/extension-placeholder": "latest",
  "@tiptap/pm": "latest",
  "@tiptap/react": "latest",
  "@tiptap/starter-kit": "latest"
}
```

Install: `bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/pm`

---

## 8. Implementation Order

1. ✅ Database schema + migration
2. ✅ Auth macros (`authContext` — `auth: true`, `auth: "optional"`, `role`)
3. ✅ Error constants (`COMMON_ERRORS`, `USER_ERRORS`, `STORIES_ERRORS`)
4. ✅ Shared schemas (`paginatedListResponse`, `paginationMeta`)
5. ✅ `GET /stories` — unified list route (replaces 3 routes)
6. ✅ `GET /stories/:id` — single story
7. ✅ `POST /stories` — create (admin auto-approve)
8. ✅ Unit tests (89 tests)
9. ✅ `PUT /stories/:id` — update (author or admin)
10. ✅ `DELETE /stories/:id` — author or admin
11. ✅ `POST /stories/:id/approve` — admin approve
12. ✅ `POST /stories/:id/reject` — admin reject
13. ✅ Register routes in `app.ts`
14. ✅ Admin nav link ("Stories" in sidebar)
15. 🔜 Search param on GET /stories (title + author name LIKE)
16. 🔜 `apps/client/lib/api.ts` (Eden Treaty client)
17. 🔜 Admin stories list: functions, queries, table, columns, page
18. ⬜ SDK types
19. ⬜ Install TipTap dependencies
20. ⬜ TipTap editor component
21. ⬜ Story card + status badge components
22. ⬜ Create page
23. ⬜ Public list page
24. ⬜ Detail page
25. ⬜ Edit page
26. ⬜ Admin detail + approve/reject flow
27. ⬜ Navigation links (public side)
