# AKSOB Platform — Feature Documentation

This directory contains documentation for every feature in the AKSOB platform. Each doc is written for **non-technical users** — it explains what the feature does, who can do what, how it works, and provides step-by-step walkthroughs.

## Feature Docs

| # | Feature | What It Is |
|---|---|---|
| 01 | **[Events](./01-EVENTS.md)** | Create & manage gatherings — registration, waitlists, QR check-in |
| 02 | **[Stories](./02-STORIES.md)** | Share personal achievements & career stories |
| 03 | **[News](./03-NEWS.md)** | Official announcements & articles (admin only) |
| 04 | **[Connections](./04-CONNECTIONS.md)** | AI-powered matching — mentorship, career coaching & more |
| 05 | **[Messaging](./05-CHAT.md)** | 1-on-1 direct messages |
| 06 | **[Authentication](./06-AUTH.md)** | Sign up, login, password reset, email verification |
| 07 | **[Onboarding](./07-ONBOARDING.md)** | 6-step profile setup wizard for new users |
| 08 | **[Profile & Visibility](./08-PROFILE.md)** | Edit your info, education, experience, skills, and privacy |

## Key Concepts Across Features

### Dual Creation Paths

Many features behave differently depending on **who** creates the content:

| Feature | Regular User Creates | Admin Creates |
|---|---|---|
| **Events** | Starts as **Draft** — must submit for review | Starts as **Approved** — goes live immediately |
| **Stories** | Starts as **Pending** — must be approved | Starts as **Approved** — published immediately |
| **News** | Cannot create (admin only) | Starts as **Draft** — must publish separately |

### Where to Find Things

| Action | Regular Users (Public Website) | Admins (Admin Dashboard) |
|---|---|---|
| Register / Login | Top-right **Login** or **Join** button | Same |
| Complete onboarding | Auto-redirected after registration | N/A |
| Edit profile / privacy | **Profile → About tab** → edit any section | Same |
| Create an event | **Profile → Events tab** → Create Event | **Events** in sidebar → Create Event |
| Write a story | **Profile → Stories tab** → Create Story | **Stories** in sidebar → Create Story |
| Write news | Not available | **News** in sidebar → Create Article |
| Manage your events/stories | **Profile** → Events/Stories tabs | Respective sections in sidebar |
| Find connections | **Galaxy** → Find Connections button | Not available |
| Manage connections | **Profile → Connections tab** | Not available |
| Chat | **Navbar Chat icon**, or Galaxy → Start Conversation | Same as regular users |
| Approve/reject content | Not available | **Events/Stories** in sidebar → filter by pending → approve/reject |

### Editing Behavior: Status Reset

When a **regular user** edits content that was already approved, the content **resets** and needs re-approval:

| Feature | User Edits Draft | User Edits Rejected | User Edits Approved |
|---|---|---|---|
| **Events** | Stays draft | Resets to draft | Resets to draft (disappears from public) |
| **Stories** | N/A (no draft) | Resets to pending | Resets to pending (disappears from public) |
| **News** | N/A (admin only) | N/A | Stays published (no reset) |

When an **admin** edits, the status is **preserved** across all features.

### Feature Relationships

```
Registration ──> Onboarding (profile setup) ──> Galaxy (explore)

Galaxy ──────────────> Chat (Start Conversation)
    │
    └────────────────> Connections (Find Connections)
                            │
                            └────────> Chat (once connected)

Profile ────────────> Events (create/edit/manage)
    │
    ├────────────────> Stories (create/edit)
    │
    ├────────────────> Connections (manage requests)
    │
    └────────────────> Privacy (visibility, email, phone, connection types)

Admin Dashboard ────> Approve/reject Events & Stories
    │
    ├────────────────> Create/manage News
    │
    └────────────────> Manage users, programs, categories
```

- **Chat and Connections are independent**: You can chat without a connection, and have a connection without chatting.
- **Events and Stories are independent**: Separate creation flows, statuses, and review processes.
- **News is isolated**: Only admins touch it.
- **Onboarding feeds into everything**: Your education, skills, and visibility settings power the Galaxy, Connections, and your public profile.
