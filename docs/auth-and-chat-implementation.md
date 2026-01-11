# 🚀 AKSOB Platform Implementation Plan
## Register/Login + Internal Chat System

---

# Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Phase 0: Database Schema](#3-phase-0-database-schema)
4. [Phase 1: Authentication Backend](#4-phase-1-authentication-backend)
5. [Phase 2: Authentication Frontend](#5-phase-2-authentication-frontend)
6. [Phase 3: Chat Backend](#6-phase-3-chat-backend)
7. [Phase 4: Chat Frontend](#7-phase-4-chat-frontend)
8. [Phase 5: Integration & Polish](#8-phase-5-integration--polish)
9. [File Tree Summary](#9-file-tree-summary)
10. [Implementation Order](#10-implementation-order)

---

# 1. Executive Summary

## What We're Building
| Feature            | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| **Authentication**     | Email/password + Google OAuth, email verification, password reset |
| **User Profiles**      | Faculty/Student/Alumni types with extensible roles                |
| **Internal Chat**      | Real-time 1:1 and group messaging with WebSocket                  |
| **Galaxy Integration** | Click a "star" → view profile → start chat                        |

## Tech Stack (Confirmed)
| Layer             | Technology                           |
| ----------------- | ------------------------------------ |
| **Runtime**           | Bun                                  |
| **Backend Framework** | Elysia                               |
| **Authentication**    | Better Auth (already configured)     |
| **Database**          | Drizzle ORM + LibSQL/Turso           |
| **Real-time**         | Elysia WebSocket (native Bun)        |
| **Frontend**          | React Router v7 + TailwindCSS v4     |
| **File Storage**      | Cloudflare R2 or S3 (presigned URLs) |
| **Email**             | Resend                               |

---

# 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React Router v7)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Auth Pages  │  │   Galaxy     │  │  Chat UI     │  │   Profile    │ │
│  │  /auth/*     │  │   /          │  │  /chat/*     │  │   /profile   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                              │                                           │
│                    ┌─────────┴─────────┐                                │
│                    │  Auth Client      │  WebSocket Client              │
│                    │  (better-auth)    │  (native)                      │
│                    └─────────┬─────────┘                                │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │ HTTPS / WSS
┌──────────────────────────────┼──────────────────────────────────────────┐
│                              BACKEND (Elysia)                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         Middleware Layer                          │   │
│  │  • CORS • Request Logger • Auth Session Derive                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐ │
│  │  Auth Module   │  │  Chat Module   │  │  WebSocket Handler         │ │
│  │  /api/auth/*   │  │  /api/chat/*   │  │  /ws/chat                  │ │
│  │  (Better Auth) │  │  (REST)        │  │  (Real-time)               │ │
│  └────────────────┘  └────────────────┘  └────────────────────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Database Layer (Drizzle)                     │   │
│  │  user │ session │ account │ profile │ conversation │ message     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │  LibSQL  │    │  Resend  │    │ R2 / S3  │
        │ (Turso)  │    │  (Email) │    │ (Files)  │
        └──────────┘    └──────────┘    └──────────┘

---

# 3. Phase 0: Database Schema

## 3.1 File Location
```
apps/api/src/db/schema.ts
```

## 3.2 Complete Schema Definition

### 3.2.1 Better Auth Tables (Auto-generated)
Run `bunx @better-auth/cli generate` to create these:

| Table        | Purpose                                                    |
| ------------ | ---------------------------------------------------------- |
| `user`         | Core user identity (id, name, email, emailVerified, image) |
| `session`      | Active sessions (token, expiresAt, userId)                 |
| `account`      | OAuth accounts + password hashes (providerId, accessToken) |
| `verification` | Email/password reset tokens                                |

### 3.2.2 Extended User Profile Table

```typescript
// apps/api/src/db/schema.ts

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════
// USER PROFILE (extends Better Auth user)
// ═══════════════════════════════════════════════════════════════
export const userProfiles = sqliteTable("user_profiles", {
  id: text("id").primaryKey(), // Same as Better Auth user.id
  
  // User Type
  userType: text("user_type", { 
    enum: ["student", "alumni", "faculty"] 
  }).notNull().default("student"),
  
  // Academic Info
  major: text("major"),
  graduationYear: integer("graduation_year"),
  department: text("department"),
  
  // Professional Info (for alumni/faculty)
  currentPosition: text("current_position"),
  currentCompany: text("current_company"),
  linkedinUrl: text("linkedin_url"),
  
  // Galaxy Visualization
  isVisibleInGalaxy: integer("is_visible_in_galaxy", { mode: "boolean" })
    .notNull().default(true),
  galaxyCluster: text("galaxy_cluster"), // Major-based cluster assignment
  
  // Metadata
  bio: text("bio"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
});
```

### 3.2.3 Chat Tables

```typescript
// ═══════════════════════════════════════════════════════════════
// CONVERSATIONS
// ═══════════════════════════════════════════════════════════════
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Type: 'dm' for 1:1, 'group' for group chats
  type: text("type", { enum: ["dm", "group"] }).notNull().default("dm"),
  
  // Group chat metadata (null for DMs)
  title: text("title"),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  
  // Denormalized for quick inbox loading
  lastMessageId: text("last_message_id"),
  lastMessageAt: integer("last_message_at", { mode: "timestamp" }),
  lastMessagePreview: text("last_message_preview"), // Truncated text
  
  // Metadata
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
});

// ═══════════════════════════════════════════════════════════════
// CONVERSATION PARTICIPANTS
// ═══════════════════════════════════════════════════════════════
export const conversationParticipants = sqliteTable("conversation_participants", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  
  userId: text("user_id").notNull(), // References Better Auth user.id
  
  // Permissions
  role: text("role", { enum: ["owner", "admin", "member"] })
    .notNull().default("member"),
  
  // User-specific settings
  isMuted: integer("is_muted", { mode: "boolean" }).notNull().default(false),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  
  // Read tracking
  lastReadAt: integer("last_read_at", { mode: "timestamp" }),
  lastReadMessageId: text("last_read_message_id"),
  
  // Metadata
  joinedAt: integer("joined_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
  leftAt: integer("left_at", { mode: "timestamp" }), // null = still active
});

// ═══════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  
  senderId: text("sender_id").notNull(),
  
  // Content
  type: text("type", { 
    enum: ["text", "image", "file", "system"] 
  }).notNull().default("text"),
  
  content: text("content"), // Text content or system message
  
  // Reply threading
  replyToId: text("reply_to_id"),
  
  // Edit/Delete tracking
  isEdited: integer("is_edited", { mode: "boolean" }).notNull().default(false),
  isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  
  // Metadata
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
});

// ═══════════════════════════════════════════════════════════════
// MESSAGE ATTACHMENTS
// ═══════════════════════════════════════════════════════════════
export const messageAttachments = sqliteTable("message_attachments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  
  // File info
  type: text("type", { enum: ["image", "video", "document", "audio"] })
    .notNull(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  
  // Image/video dimensions
  width: integer("width"),
  height: integer("height"),
  thumbnailUrl: text("thumbnail_url"),
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
});

// ═══════════════════════════════════════════════════════════════
// MESSAGE REACTIONS
// ═══════════════════════════════════════════════════════════════
export const messageReactions = sqliteTable("message_reactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  
  userId: text("user_id").notNull(),
  emoji: text("emoji").notNull(), // "👍", "❤️", etc.
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
});

// ═══════════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════════
export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(
  conversationParticipants, 
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
  })
}
```

---

# 8. Phase 5: Integration & Polish

## 8.1 Galaxy Integration (Click Star → Chat)

### File: `apps/web/app/galaxy/galaxy.tsx` (additions)

```tsx
// Add to existing galaxy.tsx

import { useNavigate } from "react-router";
import { useSession } from "@/lib/auth-client";

// Inside Galaxy component, add navigation handler:
const navigate = useNavigate();
const { data: session } = useSession();

const handleStarClick = async (alumnus: Alumnus) => {
  if (!session?.user) {
    // Prompt to login
    navigate(`/auth/login?redirect=/profile/${alumnus.id}`);
    return;
  }

  // Show profile popup with "Message" button
  setSelectedStar(alumnus);
};

const handleStartChat = async (userId: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/chat/conversations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "dm",
          participantIds: [userId],
        }),
      }
    );
    
    const { conversationId } = await response.json();
    navigate(`/chat/${conversationId}`);
  } catch (error) {
    console.error("Failed to start chat:", error);
  }
};

// In the star popup JSX, add:
<button
  onClick={() => handleStartChat(selectedStar.id)}
  className="mt-4 w-full px-4 py-2 bg-aksob-primary text-white rounded-lg
             hover:bg-aksob-secondary transition-colors"
>
  <MessageCircle className="w-4 h-4 inline mr-2" />
  Send Message
</button>
```

## 8.2 Auth Guard Hook

### File: `apps/web/app/hooks/use-require-auth.ts`

```tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSession } from "@/lib/auth-client";

export function useRequireAuth() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isPending && !session?.user) {
      const redirect = encodeURIComponent(location.pathname);
      navigate(`/auth/login?redirect=${redirect}`);
    }
  }, [session, isPending, navigate, location]);

  return { session, isPending, isAuthenticated: !!session?.user };
}
```

## 8.3 Global Navigation Component

### File: `apps/web/app/components/navigation.tsx`

```tsx
import { Link, useLocation } from "react-router";
import { useSession, signOut } from "@/lib/auth-client";
import { Home, MessageCircle, User, LogOut, LogIn } from "lucide-react";
import { clsx } from "clsx";

export function Navigation() {
  const { data: session } = useSession();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-aksob-darkest/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/aksob-logo.svg" alt="AKSOB" className="h-8" />
          <span className="font-bold text-aksob-primary hidden sm:inline">
            AKSOB
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          <NavLink to="/" icon={Home} label="Galaxy" isActive={location.pathname === "/"} />
          
          {session?.user ? (
            <>
              <NavLink to="/chat" icon={MessageCircle} label="Messages" isActive={isActive("/chat")} />
              <NavLink to="/profile" icon={User} label="Profile" isActive={isActive("/profile")} />
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-2 px-4 py-2 bg-aksob-primary text-white rounded-lg hover:bg-aksob-secondary transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ 
  to, 
  icon: Icon, 
  label, 
  isActive 
}: { 
  to: string; 
  icon: any; 
  label: string; 
  isActive: boolean;
}) {
  return (
    <Link
      to={to}
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-aksob-primary/10 text-aksob-primary"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
```

## 8.4 Environment Variables (Frontend)

### File: `apps/web/.env.example`

```bash
# API URL
VITE_API_URL=http://localhost:3000

# WebSocket URL
VITE_WS_URL=ws://localhost:3000/ws/chat
```

---

# 9. File Tree Summary

## Complete New Files to Create

```
aksob/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── db/
│   │       │   └── schema.ts                    # ⭐ Database schema (all tables)
│   │       ├── lib/
│   │       │   ├── auth.ts                      # 🔄 Update existing
│   │       │   ├── email.ts                     # ⭐ Email service (Resend)
│   │       │   └── websocket.ts                 # ⭐ WebSocket state management
│   │       ├── modules/
│   │       │   ├── profile/
│   │       │   │   └── profile.routes.ts        # ⭐ Profile REST API
│   │       │   └── chat/
│   │       │       ├── chat.routes.ts           # ⭐ Chat REST API
│   │       │       ├── chat.ws.ts               # ⭐ WebSocket handler
│   │       │       └── chat.types.ts            # ⭐ TypeBox schemas
│   │       ├── config/
│   │       │   └── env.ts                       # 🔄 Add new env vars
│   │       └── index.ts                         # 🔄 Register new modules
│   │
│   └── web/
│       └── app/
│           ├── lib/
│           │   ├── auth-client.ts               # ⭐ Better Auth client
│           │   └── chat-client.ts               # ⭐ WebSocket client
│           ├── hooks/
│           │   ├── use-chat.ts                  # ⭐ Chat WebSocket hook
│           │   ├── use-conversations.ts         # ⭐ Fetch conversations
│           │   ├── use-messages.ts              # ⭐ Fetch messages
│           │   └── use-require-auth.ts          # ⭐ Auth guard
│           ├── components/
│           │   ├── ui/
│           │   │   ├── button.tsx               # ⭐ Button component
│           │   │   ├── input.tsx                # ⭐ Input component
│           │   │   ├── card.tsx                 # ⭐ Card component
│           │   │   ├── checkbox.tsx             # ⭐ Checkbox component
│           │   │   ├── divider.tsx              # ⭐ Divider component
│           │   │   └── loading-spinner.tsx      # ⭐ Loading spinner
│           │   ├── auth/
│           │   │   ├── auth-layout.tsx          # ⭐ Auth page layout
│           │   │   ├── social-button.tsx        # ⭐ Google sign-in
│           │   │   ├── password-input.tsx       # ⭐ Password w/ toggle
│           │   │   ├── password-strength.tsx    # ⭐ Strength indicator
│           │   │   └── user-type-select.tsx     # ⭐ Student/Alumni/Faculty
│           │   ├── chat/
│           │   │   ├── conversation-list.tsx    # ⭐ Inbox list
│           │   │   ├── conversation-item.tsx    # ⭐ List item
│           │   │   ├── message-list.tsx         # ⭐ Messages container
│           │   │   ├── message-bubble.tsx       # ⭐ Single message
│           │   │   ├── message-input.tsx        # ⭐ Compose area
│           │   │   ├── typing-indicator.tsx     # ⭐ Typing dots
│           │   │   ├── user-search.tsx          # ⭐ Search users
│           │   │   ├── new-chat-modal.tsx       # ⭐ New conversation
│           │   │   ├── chat-header.tsx          # ⭐ Conversation header
│           │   │   └── empty-state.tsx          # ⭐ Empty states
│           │   └── navigation.tsx               # ⭐ Global nav
│           ├── auth/
│           │   ├── login.tsx                    # ⭐ Login page
│           │   ├── register.tsx                 # ⭐ Register page
│           │   ├── forgot-password.tsx          # ⭐ Forgot password
│           │   ├── reset-password.tsx           # ⭐ Reset password
│           │   ├── verify-email.tsx             # ⭐ Verify email
│           │   └── verify-email-sent.tsx        # ⭐ Email sent confirm
│           ├── chat/
│           │   ├── chat-layout.tsx              # ⭐ Chat shell
│           │   ├── inbox.tsx                    # ⭐ Default (empty state)
│           │   └── conversation.tsx             # ⭐ Active chat
│           ├── profile/
│           │   ├── profile.tsx                  # ⭐ User's own profile
│           │   └── public-profile.tsx           # ⭐ View others
│           ├── routes.ts                        # 🔄 Update routes
│           └── root.tsx                         # 🔄 Add Navigation
│
├── packages/
│   └── shared/                                  # (no changes needed)
│
└── .env.example files updated
```

**Legend:**
- ⭐ = New file to create
- 🔄 = Existing file to update

---

# 10. Implementation Order

## Recommended Phased Approach

### 🚀 Phase 0: Foundation (Day 1)
| #   | Task                                                        | Priority |
| --- | ----------------------------------------------------------- | -------- |
| 1   | Generate Better Auth schema: `bunx @better-auth/cli generate` | P0       |
| 2   | Create `apps/api/src/db/schema.ts` with all tables            | P0       |
| 3   | Run `bun run db:generate && bun run db:migrate`               | P0       |
| 4   | Update `apps/api/src/config/env.ts` with new variables        | P0       |
| 5   | Install frontend deps: `clsx`, `lucide-react`, `date-fns`         | P0       |

### 🔐 Phase 1: Authentication Backend (Day 2)
| #   | Task                                                  | Priority |
| --- | ----------------------------------------------------- | -------- |
| 1   | Update `apps/api/src/lib/auth.ts` with full config      | P0       |
| 2   | Create `apps/api/src/lib/email.ts` (Resend integration) | P1       |
| 3   | Create `apps/api/src/modules/profile/profile.routes.ts` | P1       |
| 4   | Register profile module in `index.ts`                   | P1       |
| 5   | Test auth flows with Postman/Insomnia                 | P0       |

### 🎨 Phase 2: Authentication Frontend (Days 3-4)
| #   | Task                                             | Priority |
| --- | ------------------------------------------------ | -------- |
| 1   | Create UI components (`button`, `input`, `card`, etc.) | P0       |
| 2   | Create `apps/web/app/lib/auth-client.ts`           | P0       |
| 3   | Create `auth-layout.tsx` and auth components       | P0       |
| 4   | Build Login page                                 | P0       |
| 5   | Build Register page with user type selection     | P0       |
| 6   | Build Forgot/Reset Password pages                | P1       |
| 7   | Build Email Verification pages                   | P1       |
| 8   | Update `routes.ts` with all auth routes            | P0       |
| 9   | Add Navigation component                         | P1       |

### 💬 Phase 3: Chat Backend (Days 5-6)
| #   | Task                                            | Priority |
| --- | ----------------------------------------------- | -------- |
| 1   | Create `apps/api/src/lib/websocket.ts`            | P0       |
| 2   | Create `apps/api/src/modules/chat/chat.ws.ts`     | P0       |
| 3   | Create `apps/api/src/modules/chat/chat.routes.ts` | P0       |
| 4   | Create `apps/api/src/modules/chat/chat.types.ts`  | P1       |
| 5   | Register chat module and WebSocket in `index.ts`  | P0       |
| 6   | Test WebSocket connection with browser DevTools | P0       |
| 7   | Test REST endpoints (conversations, messages)   | P0       |
| 8   | Set up file upload presigned URLs (S3/R2)       | P2       |

### 🖥️ Phase 4: Chat Frontend (Days 7-9)
| #   | Task                                            | Priority |
| --- | ----------------------------------------------- | -------- |
| 1   | Create `apps/web/app/lib/chat-client.ts`          | P0       |
| 2   | Create `apps/web/app/hooks/use-chat.ts`           | P0       |
| 3   | Create chat UI components (list, bubble, input) | P0       |
| 4   | Build `chat-layout.tsx` (split view shell)        | P0       |
| 5   | Build `conversation-list.tsx` (inbox)             | P0       |
| 6   | Build `conversation.tsx` (active chat)            | P0       |
| 7   | Implement typing indicators                     | P1       |
| 8   | Implement file attachments UI                   | P2       |
| 9   | Build `new-chat-modal.tsx` (user search)          | P1       |
| 10  | Update `routes.ts` with chat routes               | P0       |

### 🔗 Phase 5: Integration & Polish (Days 10-11)
| #   | Task                                             | Priority |
| --- | ------------------------------------------------ | -------- |
| 1   | Add "Message" button to Galaxy star popup        | P0       |
| 2   | Implement Galaxy → Chat navigation flow          | P0       |
| 3   | Add auth guards to protected routes              | P0       |
| 4   | Add unread message badge to navigation           | P1       |
| 5   | Mobile responsive testing & fixes                | P1       |
| 6   | Add loading states and error handling everywhere | P1       |
| 7   | Accessibility audit (focus states, aria labels)  | P2       |
| 8   | Performance optimization (virtualized lists)     | P2       |
| 9   | End-to-end testing                               | P2       |

---

# 11. Testing Checklist

## Authentication Flows
- [ ] Email/password registration
- [ ] Email/password login
- [ ] Google OAuth login
- [ ] Email verification (if enabled)
- [ ] Forgot password → email sent
- [ ] Reset password with token
- [ ] Session persistence (remember me)
- [ ] Logout

## Chat Flows
- [ ] View conversation inbox
- [ ] Start new DM from user search
- [ ] Start new DM from Galaxy star
- [ ] Send text message
- [ ] Receive message in real-time
- [ ] Typing indicator shows/hides
- [ ] Mark messages as read
- [ ] Read receipts display
- [ ] Upload and send image
- [ ] Upload and send file
- [ ] Reply to message
- [ ] Load older messages (pagination)
- [ ] Create group chat
- [ ] Search conversations

## Edge Cases
- [ ] Handle WebSocket disconnect/reconnect
- [ ] Handle offline state gracefully
- [ ] Large message handling
- [ ] Rapid message sending
- [ ] Multiple browser tabs
- [ ] Mobile browser testing

---

# 12. Dependencies to Install

## Backend (`apps/api`)
```bash
cd apps/api
bun add resend                    # Email service
bun add @aws-sdk/client-s3        # File uploads (optional)
bun add @aws-sdk/s3-request-presigner  # Presigned URLs (optional)
```

## Frontend (`apps/web`)
```bash
cd apps/web
bun add clsx                      # Conditional classnames
bun add lucide-react              # Icons
bun add date-fns                  # Date formatting
bun add better-auth               # Auth client
```

---

# 13. Environment Variables Summary

## Backend (`apps/api/.env`)
```bash
# Existing
DATABASE_URL=file:./local.db
PORT=3000
LOG_LEVEL=debug

# Auth (existing)
BETTER_AUTH_SECRET=your-32-char-secret-here
BETTER_AUTH_URL=http://localhost:3000

# NEW: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NEW: Email
RESEND_API_KEY=re_xxxxxxxxxxxxx

# NEW: File Storage (optional)
S3_BUCKET=aksob-uploads
S3_REGION=auto
S3_ACCESS_KEY_ID=xxxxx
S3_SECRET_ACCESS_KEY=xxxxx
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
```

## Frontend (`apps/web/.env`)
```bash
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws/chat
```

---

# 14. Quick Reference: API Endpoints

## Authentication (via Better Auth)
| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/auth/sign-up/email`   | Register with email    |
| POST   | `/api/auth/sign-in/email`   | Login with email       |
| POST   | `/api/auth/sign-in/social`  | OAuth login            |
| POST   | `/api/auth/sign-out`        | Logout                 |
| POST   | `/api/auth/forget-password` | Request password reset |
| POST   | `/api/auth/reset-password`  | Reset with token       |
| GET    | `/api/auth/session`         | Get current session    |

## Profile
| Method | Endpoint         | Description        |
| ------ | ---------------- | ------------------ |
| GET    | `/profile/me`      | Get own profile    |
| PATCH  | `/profile/me`      | Update own profile |
| GET    | `/profile/:userId` | Get public profile |

## Chat (REST)
| Method | Endpoint                         | Description               |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/chat/conversations`              | List user's conversations |
| POST   | `/chat/conversations`              | Create DM or group        |
| GET    | `/chat/conversations/:id`          | Get conversation details  |
| GET    | `/chat/conversations/:id/messages` | Get messages (paginated)  |
| GET    | `/chat/users/search?q=`            | Search users for new chat |
| POST   | `/chat/upload/presigned-url`       | Get upload URL for files  |

## Chat (WebSocket)
| Event (Client→Server) | Payload                                 |
| --------------------- | --------------------------------------- |
| `message`               | `{ conversationId, content, replyToId? }` |
| `typing_start`          | `{ conversationId }`                      |
| `typing_stop`           | `{ conversationId }`                      |
| `mark_read`             | `{ conversationId }`                      |
| `subscribe`             | `{ conversationId }`                      |

| Event (Server→Client) | Payload                                        |
| --------------------- | ---------------------------------------------- |
| `connected`             | `{ userId, subscribedConversations }`            |
| `message`               | `{ id, conversationId, senderId, content, ... }` |
| `message_sent`          | `{ id, conversationId }`                         |
| `typing`                | `{ conversationId, userId, isTyping }`           |
| `read_receipt`          | `{ conversationId, userId, readAt }`             |

---

# 🎯 Summary

This plan provides a **comprehensive, Figma-level specification** for implementing:

1. **Full Authentication System**
   - Email/password with validation
   - Google OAuth integration
   - Email verification (optional)
   - Password reset flow
   - User types (Student/Alumni/Faculty)

2. **Real-time Internal Chat**
   - WebSocket-based messaging
   - 1:1 DMs and group chats
   - Typing indicators
   - Read receipts
   - File/image attachments
   - Message search

3. **Galaxy Integration**
   - Click star → view profile → start chat
   - Seamless navigation between features

**Estimated Timeline**: 10-11 days for full implementation

**Key Design Decisions**:
- Better Auth for authentication (already integrated)
- Elysia WebSocket for real-time (native Bun performance)
- Drizzle + LibSQL for persistence
- Resend for transactional emails
- S3/R2 for file storage
- "Academic Galaxy" glassmorphism design theme


export async function sendEmail({ to, subject, template, data }: SendEmailOptions) {
  const html = getEmailTemplate(template, data);
  
  try {
    await resend.emails.send({
      from: "AKSOB <noreply@aksob.lau.edu.lb>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    // Don't throw - email failures shouldn't break auth flow
  }
}

function getEmailTemplate(template: string, data: Record<string, string>): string {
  const templates: Record<string, string> = {
    "email-verification": `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #076951;">Welcome to AKSOB, ${data.name}!</h1>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${data.url}" 
           style="display: inline-block; background: #076951; color: white; 
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Verify Email
        </a>
        <p style="color: #666; margin-top: 24px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
    "password-reset": `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #076951;">Reset Your Password</h1>
        <p>Hi ${data.name}, we received a request to reset your password.</p>
        <a href="${data.url}" 
           style="display: inline-block; background: #076951; color: white; 
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Reset Password
        </a>
        <p style="color: #666; margin-top: 24px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  };
  
  return templates[template] || "";
}
```

## 4.3 Update Environment Variables

### File: `apps/api/.env.example`

```bash
# Database
DATABASE_URL=file:./local.db

# Better Auth
BETTER_AUTH_SECRET=your-secret-min-32-chars-here
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Server
PORT=3000
LOG_LEVEL=debug
```

## 4.4 Profile API Routes

### File: `apps/api/src/modules/profile/profile.routes.ts`

```

---

# 6. Phase 3: Chat Backend

## 6.1 Directory Structure

```
apps/api/src/
├── modules/
│   └── chat/
│       ├── chat.routes.ts       # REST API endpoints
│       ├── chat.service.ts      # Business logic
│       ├── chat.types.ts        # TypeBox schemas
│       └── chat.ws.ts           # WebSocket handler
├── lib/
│   └── websocket.ts             # WebSocket state management
```

## 6.2 WebSocket State Management

### File: `apps/api/src/lib/websocket.ts`

```typescript
// ═══════════════════════════════════════════════════════════════
// WEBSOCKET CONNECTION STATE
// ═══════════════════════════════════════════════════════════════

interface ConnectionData {
  userId: string;
  username: string;
  connectedAt: Date;
  subscriptions: Set<string>; // Conversation IDs
}

// Map of WebSocket ID → Connection Data
export const connections = new Map<string, ConnectionData>();

// Map of User ID → WebSocket IDs (for multi-device support)
export const userConnections = new Map<string, Set<string>>();

// Typing indicators: conversationId → Map<userId, expiresAt>
export const typingIndicators = new Map<string, Map<string, number>>();

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function addConnection(wsId: string, userId: string, username: string) {
  connections.set(wsId, {
    userId,
    username,
    connectedAt: new Date(),
    subscriptions: new Set(),
  });

  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId)!.add(wsId);
}

export function removeConnection(wsId: string) {
  const conn = connections.get(wsId);
  if (conn) {
    userConnections.get(conn.userId)?.delete(wsId);
    if (userConnections.get(conn.userId)?.size === 0) {
      userConnections.delete(conn.userId);
    }
    connections.delete(wsId);
  }
}

export function isUserOnline(userId: string): boolean {
  return userConnections.has(userId) && userConnections.get(userId)!.size > 0;
}

export function getOnlineUsers(userIds: string[]): string[] {
  return userIds.filter(isUserOnline);
}
```

## 6.3 Chat WebSocket Handler

### File: `apps/api/src/modules/chat/chat.ws.ts`

```typescript
import { Elysia, t } from "elysia";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { 
  messages, 
  conversations, 
  conversationParticipants,
  messageAttachments 
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { 
  connections, 
  addConnection, 
  removeConnection,
  typingIndicators 
} from "@/lib/websocket";

// ═══════════════════════════════════════════════════════════════
// MESSAGE SCHEMAS
// ═══════════════════════════════════════════════════════════════

const IncomingMessageSchema = t.Object({
  type: t.Union([
    t.Literal("message"),
    t.Literal("typing_start"),
    t.Literal("typing_stop"),
    t.Literal("mark_read"),
    t.Literal("subscribe"),
    t.Literal("unsubscribe"),
  ]),
  conversationId: t.String(),
  content: t.Optional(t.String()),
  replyToId: t.Optional(t.String()),
  attachments: t.Optional(t.Array(t.Object({
    type: t.String(),
    url: t.String(),
    filename: t.String(),
    mimeType: t.Optional(t.String()),
    sizeBytes: t.Optional(t.Number()),
  }))),
});

// ═══════════════════════════════════════════════════════════════
// WEBSOCKET HANDLER
// ═══════════════════════════════════════════════════════════════

export const chatWebSocket = new Elysia()
  .ws("/ws/chat", {
    // Validate incoming messages
    body: IncomingMessageSchema,

    // ─────────────────────────────────────────────────────────────
    // CONNECTION OPENED
    // ─────────────────────────────────────────────────────────────
    async open(ws) {
      // Authenticate via cookie/header
      const session = await auth.api.getSession({
        headers: ws.data.headers,
      });

      if (!session?.user) {
        ws.close(4001, "Unauthorized");
        return;
      }

      const wsId = crypto.randomUUID();
      ws.data.wsId = wsId;
      ws.data.userId = session.user.id;
      ws.data.username = session.user.name || "Anonymous";

      addConnection(wsId, session.user.id, session.user.name || "Anonymous");

      // Auto-subscribe to all user's conversations
      const participations = await db.query.conversationParticipants.findMany({
        where: and(
          eq(conversationParticipants.userId, session.user.id),
          eq(conversationParticipants.leftAt, null)
        ),
      });

      for (const p of participations) {
        ws.subscribe(p.conversationId);
        connections.get(wsId)?.subscriptions.add(p.conversationId);
      }

      // Notify user of successful connection
      ws.send(JSON.stringify({
        type: "connected",
        userId: session.user.id,
        subscribedConversations: participations.map(p => p.conversationId),
      }));
    },

    // ─────────────────────────────────────────────────────────────
    // MESSAGE RECEIVED
    // ─────────────────────────────────────────────────────────────
    async message(ws, data) {
      const userId = ws.data.userId;
      const username = ws.data.username;

      if (!userId) {
        ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
        return;
      }

      switch (data.type) {
        // ═══════════════════════════════════════════════════════
        // SEND MESSAGE
        // ═══════════════════════════════════════════════════════
        case "message": {
          if (!data.content?.trim() && !data.attachments?.length) {
            ws.send(JSON.stringify({ type: "error", message: "Empty message" }));
            return;
          }

          // Verify user is participant
          const participation = await db.query.conversationParticipants.findFirst({
            where: and(
              eq(conversationParticipants.conversationId, data.conversationId),
              eq(conversationParticipants.userId, userId),
              eq(conversationParticipants.leftAt, null)
            ),
          });

          if (!participation) {
            ws.send(JSON.stringify({ type: "error", message: "Not a participant" }));
            return;
          }

          // Insert message
          const [newMessage] = await db.insert(messages).values({
            conversationId: data.conversationId,
            senderId: userId,
            type: data.attachments?.length ? "file" : "text",
            content: data.content || null,
            replyToId: data.replyToId || null,
          }).returning();

          // Insert attachments if any
          if (data.attachments?.length) {
            await db.insert(messageAttachments).values(
              data.attachments.map(att => ({
                messageId: newMessage.id,
                type: att.type as "image" | "video" | "document" | "audio",
                url: att.url,
                filename: att.filename,
                mimeType: att.mimeType,
                sizeBytes: att.sizeBytes,
              }))
            );
          }

          // Update conversation's last message
          await db.update(conversations)
            .set({
              lastMessageId: newMessage.id,
              lastMessageAt: new Date(),
              lastMessagePreview: data.content?.slice(0, 100) || "[Attachment]",
              updatedAt: new Date(),
            })
            .where(eq(conversations.id, data.conversationId));

          // Broadcast to all participants
          const outgoingMessage = {
            type: "message",
            id: newMessage.id,
            conversationId: data.conversationId,
            senderId: userId,
            senderName: username,
            content: data.content,
            attachments: data.attachments,
            replyToId: data.replyToId,
            createdAt: newMessage.createdAt.toISOString(),
          };

          ws.publish(data.conversationId, JSON.stringify(outgoingMessage));
          
          // Also send to self (confirmation)
          ws.send(JSON.stringify({
            type: "message_sent",
            id: newMessage.id,
            conversationId: data.conversationId,
          }));

          break;
        }

        // ═══════════════════════════════════════════════════════
        // TYPING INDICATOR
        // ═══════════════════════════════════════════════════════
        case "typing_start": {
          const conversationId = data.conversationId;
          
          if (!typingIndicators.has(conversationId)) {
            typingIndicators.set(conversationId, new Map());
          }
          
          // Set expiry (3 seconds from now)
          typingIndicators.get(conversationId)!.set(userId, Date.now() + 3000);

          ws.publish(conversationId, JSON.stringify({
            type: "typing",
            conversationId,
            userId,
            username,
            isTyping: true,
          }));

          // Auto-expire after 3 seconds
          setTimeout(() => {
            const expires = typingIndicators.get(conversationId)?.get(userId);
            if (expires && expires <= Date.now()) {
              typingIndicators.get(conversationId)?.delete(userId);
              ws.publish(conversationId, JSON.stringify({
                type: "typing",
                conversationId,
                userId,
                isTyping: false,
              }));
            }
          }, 3000);

          break;
        }

        case "typing_stop": {
          typingIndicators.get(data.conversationId)?.delete(userId);
          
          ws.publish(data.conversationId, JSON.stringify({
            type: "typing",
            conversationId: data.conversationId,
            userId,
            isTyping: false,
          }));

          break;
        }

        // ═══════════════════════════════════════════════════════
        // MARK AS READ
        // ═══════════════════════════════════════════════════════
        case "mark_read": {
          await db.update(conversationParticipants)
            .set({ 
              lastReadAt: new Date(),
            })
            .where(and(
              eq(conversationParticipants.conversationId, data.conversationId),
              eq(conversationParticipants.userId, userId)
            ));

          // Notify other participants (for read receipts)
          ws.publish(data.conversationId, JSON.stringify({
            type: "read_receipt",
            conversationId: data.conversationId,
            userId,
            readAt: new Date().toISOString(),
          }));

          break;
        }

        // ═══════════════════════════════════════════════════════
        // SUBSCRIBE/UNSUBSCRIBE TO CONVERSATION
        // ═══════════════════════════════════════════════════════
        case "subscribe": {
          ws.subscribe(data.conversationId);
          connections.get(ws.data.wsId)?.subscriptions.add(data.conversationId);
          break;
        }

        case "unsubscribe": {
          ws.unsubscribe(data.conversationId);
          connections.get(ws.data.wsId)?.subscriptions.delete(data.conversationId);
          break;
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // CONNECTION CLOSED
    // ─────────────────────────────────────────────────────────────
    close(ws) {
      const wsId = ws.data.wsId;
      if (wsId) {
        removeConnection(wsId);
      }
    },
  });
```

## 6.4 Chat REST API Routes

### File: `apps/api/src/modules/chat/chat.routes.ts`

```typescript
import { Elysia, t } from "elysia";
import { authPlugin } from "@/plugins/auth";
import { db } from "@/db";
import { 
  conversations, 
  conversationParticipants, 
  messages,
  messageAttachments 
} from "@/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { isUserOnline } from "@/lib/websocket";

export const chatModule = new Elysia({ prefix: "/chat" })
  .use(authPlugin)

  // ═══════════════════════════════════════════════════════════════
  // GET CONVERSATIONS (Inbox)
  // ═══════════════════════════════════════════════════════════════
  .get("/conversations", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    // Get all conversations user participates in
    const participations = await db.query.conversationParticipants.findMany({
      where: and(
        eq(conversationParticipants.userId, user.id),
        eq(conversationParticipants.leftAt, null)
      ),
      with: {
        conversation: true,
      },
    });

    // Enrich with participant info and unread counts
    const enrichedConversations = await Promise.all(
      participations.map(async (p) => {
        // Get all participants
        const participants = await db.query.conversationParticipants.findMany({
          where: eq(conversationParticipants.conversationId, p.conversationId),
        });

        // Get other participant(s) info for display
        const otherParticipantIds = participants
          .filter(part => part.userId !== user.id)
          .map(part => part.userId);

        // Count unread messages
        const unreadCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(and(
            eq(messages.conversationId, p.conversationId),
            sql`${messages.createdAt} > ${p.lastReadAt || new Date(0)}`
          ));

        return {
          id: p.conversation.id,
          type: p.conversation.type,
          title: p.conversation.title,
          lastMessagePreview: p.conversation.lastMessagePreview,
          lastMessageAt: p.conversation.lastMessageAt,
          unreadCount: unreadCount[0]?.count || 0,
          isMuted: p.isMuted,
          isPinned: p.isPinned,
          otherParticipantIds,
          // For DMs, we'll need to fetch user info on frontend
        };
      })
    );

    // Sort: pinned first, then by last message time
    enrichedConversations.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0);
    });

    return { conversations: enrichedConversations };
  })

  // ═══════════════════════════════════════════════════════════════
  // GET SINGLE CONVERSATION
  // ═══════════════════════════════════════════════════════════════
  .get("/conversations/:id", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    // Verify participation
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, params.id),
        eq(conversationParticipants.userId, user.id),
        eq(conversationParticipants.leftAt, null)
      ),
    });

    if (!participation) {
      set.status = 403;
      return { error: "Not a participant" };
    }

    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, params.id),
      with: {
        participants: true,
      },
    });

    return { conversation };
  }, {
    params: t.Object({ id: t.String() }),
  })

  // ═══════════════════════════════════════════════════════════════
  // CREATE CONVERSATION (DM or Group)
  // ═══════════════════════════════════════════════════════════════
  .post("/conversations", async ({ user, body, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const { type, participantIds, title } = body;

    // For DMs, check if conversation already exists
    if (type === "dm" && participantIds.length === 1) {
      const otherId = participantIds[0];
      
      // Find existing DM between these two users
      const existingDM = await db.execute(sql`
        SELECT cp1.conversation_id 
        FROM conversation_participants cp1
        JOIN conversation_participants cp2 
          ON cp1.conversation_id = cp2.conversation_id
        JOIN conversations c 
          ON c.id = cp1.conversation_id
        WHERE cp1.user_id = ${user.id}
          AND cp2.user_id = ${otherId}
          AND c.type = 'dm'
          AND cp1.left_at IS NULL
          AND cp2.left_at IS NULL
        LIMIT 1
      `);

      if (existingDM.rows.length > 0) {
        return { 
          conversationId: existingDM.rows[0].conversation_id,
          isExisting: true,
        };
      }
    }

    // Create new conversation
    const [newConversation] = await db.insert(conversations).values({
      type,
      title: type === "group" ? title : null,
      createdBy: user.id,
    }).returning();

    // Add creator as participant (owner for groups)
    await db.insert(conversationParticipants).values({
      conversationId: newConversation.id,
      userId: user.id,
      role: type === "group" ? "owner" : "member",
    });

    // Add other participants
    for (const participantId of participantIds) {
      await db.insert(conversationParticipants).values({
        conversationId: newConversation.id,
        userId: participantId,
        role: "member",
      });
    }

    return { 
      conversationId: newConversation.id,
      isExisting: false,
    };
  }, {
    body: t.Object({
      type: t.Union([t.Literal("dm"), t.Literal("group")]),
      participantIds: t.Array(t.String()),
      title: t.Optional(t.String()),
    }),
  })

  // ═══════════════════════════════════════════════════════════════
  // GET MESSAGES (with pagination)
  // ═══════════════════════════════════════════════════════════════
  .get("/conversations/:id/messages", async ({ user, params, query, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    // Verify participation
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, params.id),
        eq(conversationParticipants.userId, user.id)
      ),
    });

    if (!participation) {
      set.status = 403;
      return { error: "Not a participant" };
    }

    const limit = query.limit || 50;
    const cursor = query.cursor; // Message ID for cursor-based pagination

    let messageQuery = db.query.messages.findMany({
      where: eq(messages.conversationId, params.id),
      orderBy: [desc(messages.createdAt)],
      limit: limit + 1, // Fetch one extra to check if there's more
      with: {
        attachments: true,
        reactions: true,
        replyTo: {
          columns: {
            id: true,
            content: true,
            senderId: true,
          },
        },
      },
    });

    const result = await messageQuery;

    const hasMore = result.length > limit;
    const messageList = hasMore ? result.slice(0, -1) : result;

    return {
      messages: messageList.reverse(), // Return in chronological order
      hasMore,
      nextCursor: hasMore ? messageList[0]?.id : null,
    };
  }, {
    params: t.Object({ id: t.String() }),
    query: t.Object({
      limit: t.Optional(t.Number()),
      cursor: t.Optional(t.String()),
    }),
  })

  // ═══════════════════════════════════════════════════════════════
  // SEARCH USERS (for starting new conversations)
  // ═══════════════════════════════════════════════════════════════
  .get("/users/search", async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const searchTerm = query.q;
    if (!searchTerm || searchTerm.length < 2) {
      return { users: [] };
    }

    // Search in Better Auth user table
    const users = await db.execute(sql`
      SELECT id, name, email, image
      FROM user
      WHERE (name LIKE ${'%' + searchTerm + '%'} OR email LIKE ${'%' + searchTerm + '%'})
        AND id != ${user.id}
      LIMIT 20
    `);

    // Add online status
    const enrichedUsers = users.rows.map((u: any) => ({
      ...u,
      isOnline: isUserOnline(u.id),
    }));

    return { users: enrichedUsers };
  }, {
    query: t.Object({
      q: t.String(),
    }),
  })

  // ═══════════════════════════════════════════════════════════════
  // FILE UPLOAD PRESIGNED URL
  // ═══════════════════════════════════════════════════════════════
  .post("/upload/presigned-url", async ({ user, body, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const { filename, contentType, sizeBytes } = body;

    // Validate file size (10MB limit)
    if (sizeBytes > 10 * 1024 * 1024) {
      set.status = 413;
      return { error: "File too large. Maximum size is 10MB." };
    }

    // Validate content type
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(contentType)) {
      set.status = 400;
      return { error: "File type not allowed" };
    }

    // Generate unique key
    const key = `chat/${user.id}/${Date.now()}-${filename}`;

    // TODO: Generate actual S3/R2 presigned URL
    // For now, return a placeholder
    return {
      uploadUrl: `https://storage.aksob.com/upload?key=${key}`,
      fileUrl: `https://cdn.aksob.com/${key}`,
      key,
    };
  }, {
    body: t.Object({
      filename: t.String(),
      contentType: t.String(),
      sizeBytes: t.Number(),
    }),
  });
```

## 6.5 Register Chat Module in Main App

### File: `apps/api/src/index.ts` (updated)

```typescript
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { dbPlugin } from "@/plugins/db";
import { authPlugin } from "@/plugins/auth";
import { requestLogger } from "@/middleware/http-logger";
import { healthModule } from "@/modules/health/health.routes";
import { profileModule } from "@/modules/profile/profile.routes";
import { chatModule } from "@/modules/chat/chat.routes";
import { chatWebSocket } from "@/modules/chat/chat.ws";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

const app = new Elysia()
  // ─────────────────────────────────────────────────────────────
  // GLOBAL MIDDLEWARE
  // ─────────────────────────────────────────────────────────────
  .use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }))
  .use(swagger({
    documentation: {
      info: {
        title: "AKSOB API",
        version: "1.0.0",
        description: "API for AKSOB Alumni Platform",
      },
    },
  }))
  .use(requestLogger)
  
  // ─────────────────────────────────────────────────────────────
  // PLUGINS
  // ─────────────────────────────────────────────────────────────
  .use(dbPlugin)
  .use(authPlugin)
  
  // ─────────────────────────────────────────────────────────────
  // REST API MODULES
  // ─────────────────────────────────────────────────────────────
  .use(healthModule)
  .use(profileModule)
  .use(chatModule)
  
  // ─────────────────────────────────────────────────────────────
  // WEBSOCKET
  // ─────────────────────────────────────────────────────────────
  .use(chatWebSocket)
  
  // ─────────────────────────────────────────────────────────────
  // ERROR HANDLING
  // ─────────────────────────────────────────────────────────────
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Route not found" };
    }
    
    logger.error("Server error", {
      code,
      error: error instanceof Error ? error.message : error,
    });
    
    set.status = 500;
    return { error: "Internal server error" };
  })
  
  // ─────────────────────────────────────────────────────────────
  // START SERVER
  // ─────────────────────────────────────────────────────────────
  .listen(env.PORT);

logger.info(`🦊 AKSOB API running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
```

---

# 7. Phase 4: Chat Frontend

## 7.1 Directory Structure

```
apps/web/app/
├── chat/
│   ├── chat-layout.tsx          # Main chat shell with sidebar
│   ├── inbox.tsx                # Conversation list (default view)
│   └── conversation.tsx         # Active chat view
├── components/
│   └── chat/
│       ├── conversation-list.tsx
│       ├── conversation-item.tsx
│       ├── message-list.tsx
│       ├── message-bubble.tsx
│       ├── message-input.tsx
│       ├── typing-indicator.tsx
│       ├── user-search.tsx
│       ├── new-chat-modal.tsx
│       ├── chat-header.tsx
│       └── empty-state.tsx
├── hooks/
│   ├── use-chat.ts              # WebSocket connection hook
│   ├── use-conversations.ts     # Fetch conversations
│   └── use-messages.ts          # Fetch/send messages
├── lib/
│   └── chat-client.ts           # WebSocket client
```

## 7.2 WebSocket Client

### File: `apps/web/app/lib/chat-client.ts`

```typescript
// ═══════════════════════════════════════════════════════════════
// CHAT WEBSOCKET CLIENT
// ═══════════════════════════════════════════════════════════════

type MessageHandler = (data: any) => void;

class ChatClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws/chat";
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("Chat connected");
      this.reconnectAttempts = 0;
      this.emit("connected", {});
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    };

    this.ws.onclose = () => {
      console.log("Chat disconnected");
      this.emit("disconnected", {});
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("Chat error:", error);
      this.emit("error", { error });
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MESSAGE METHODS
  // ─────────────────────────────────────────────────────────────

  sendMessage(conversationId: string, content: string, replyToId?: string) {
    this.send({
      type: "message",
      conversationId,
      content,
      replyToId,
    });
  }

  sendMessageWithAttachments(
    conversationId: string, 
    content: string | null,
    attachments: Array<{
      type: string;
      url: string;
      filename: string;
      mimeType?: string;
      sizeBytes?: number;
    }>
  ) {
    this.send({
      type: "message",
      conversationId,
      content,
      attachments,
    });
  }

  startTyping(conversationId: string) {
    this.send({ type: "typing_start", conversationId });
  }

  stopTyping(conversationId: string) {
    this.send({ type: "typing_stop", conversationId });
  }

  markAsRead(conversationId: string) {
    this.send({ type: "mark_read", conversationId });
  }

  subscribeToConversation(conversationId: string) {
    this.send({ type: "subscribe", conversationId });
  }

  // ─────────────────────────────────────────────────────────────
  // EVENT HANDLING
  // ─────────────────────────────────────────────────────────────

  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  off(event: string, handler: MessageHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  private emit(event: string, data: any) {
    this.handlers.get(event)?.forEach(handler => handler(data));
    // Also emit to wildcard handlers
    this.handlers.get("*")?.forEach(handler => handler({ event, ...data }));
  }
}

export const chatClient = new ChatClient();
```

## 7.3 Chat Hook

### File: `apps/web/app/hooks/use-chat.ts`

```typescript
import { useEffect, useState, useCallback, useRef } from "react";
import { chatClient } from "@/lib/chat-client";
import { useSession } from "@/lib/auth-client";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string | null;
  attachments?: Array<{
    type: string;
    url: string;
    filename: string;
  }>;
  replyToId?: string;
  createdAt: string;
}

interface TypingUser {
  userId: string;
  username: string;
}

export function useChat(conversationId: string | null) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  
  // Debounce typing indicator
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect on mount
  useEffect(() => {
    if (!session?.user) return;

    chatClient.connect();

    const unsubConnected = chatClient.on("connected", () => {
      setIsConnected(true);
    });

    const unsubDisconnected = chatClient.on("disconnected", () => {
      setIsConnected(false);
    });

    return () => {
      unsubConnected();
      unsubDisconnected();
      chatClient.disconnect();
    };
  }, [session?.user]);

  // Handle incoming messages for current conversation
  useEffect(() => {
    if (!conversationId) return;

    const unsubMessage = chatClient.on("message", (data: Message) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => [...prev, data]);
        
        // Auto mark as read if it's from someone else
        if (data.senderId !== session?.user?.id) {
          chatClient.markAsRead(conversationId);
        }
      }
    });

    const unsubTyping = chatClient.on("typing", (data) => {
      if (data.conversationId !== conversationId) return;
      if (data.userId === session?.user?.id) return; // Ignore self

      setTypingUsers(prev => {
        if (data.isTyping) {
          // Add user if not already typing
          if (!prev.find(u => u.userId === data.userId)) {
            return [...prev, { userId: data.userId, username: data.username }];
          }
          return prev;
        } else {
          // Remove user
          return prev.filter(u => u.userId !== data.userId);
        }
      });
    });

    // Mark as read when opening conversation
    chatClient.markAsRead(conversationId);

    return () => {
      unsubMessage();
      unsubTyping();
    };
  }, [conversationId, session?.user?.id]);

  // ─────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────

  const sendMessage = useCallback((content: string, replyToId?: string) => {
    if (!conversationId || !content.trim()) return;
    chatClient.sendMessage(conversationId, content, replyToId);
  }, [conversationId]);

  const sendMessageWithAttachments = useCallback((
    content: string | null,
    attachments: Array<{ type: string; url: string; filename: string }>
  ) => {
    if (!conversationId) return;
    chatClient.sendMessageWithAttachments(conversationId, content, attachments);
  }, [conversationId]);

  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    chatClient.startTyping(conversationId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      chatClient.stopTyping(conversationId);
    }, 2000);
  }, [conversationId]);

  return {
    isConnected,
    messages,
    setMessages, // For initial load from REST API
    typingUsers,
    sendMessage,
    sendMessageWithAttachments,
    handleTyping,
  };
}
```

## 7.4 Chat Layout (Shell)

### File: `apps/web/app/chat/chat-layout.tsx`

```tsx
import { Outlet, useNavigate } from "react-router";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { ConversationList } from "@/components/chat/conversation-list";
import { NewChatModal } from "@/components/chat/new-chat-modal";
import { MessageSquarePlus, Menu } from "lucide-react";

export default function ChatLayout() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate("/auth/login?redirect=/chat");
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aksob-darkest">
        <div className="animate-spin w-8 h-8 border-2 border-aksob-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-aksob-darkest">
      {/* Main Container */}
      <div className="flex h-screen overflow-hidden">
        
        {/* ─────────────────────────────────────────────────────────────
            SIDEBAR (Conversation List)
        ───────────────────────────────────────────────────────────── */}
        <aside 
          className={`
            ${isSidebarOpen ? "w-80" : "w-0"} 
            flex-shrink-0 
            bg-white dark:bg-aksob-darkest/50 
            border-r border-gray-200 dark:border-white/10
            transition-all duration-300
            flex flex-col
            overflow-hidden
          `}
        >
          {/* Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-white/10">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Messages
            </h1>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="New conversation"
            >
              <MessageSquarePlus className="w-5 h-5 text-aksob-primary" />
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList />
          </div>
        </aside>

        {/* ─────────────────────────────────────────────────────────────
            MAIN CONTENT (Conversation or Empty State)
        ───────────────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden absolute top-4 left-4 z-10 p-2 rounded-lg bg-white dark:bg-aksob-darkest shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Outlet renders either inbox.tsx or conversation.tsx */}
          <Outlet />
        </main>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
      />
    </div>
  );
}
```

## 7.5 Conversation List Component

### File: `apps/web/app/components/chat/conversation-list.tsx`

```tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ConversationItem } from "./conversation-item";
import { Search } from "lucide-react";

interface Conversation {
  id: string;
  type: "dm" | "group";
  title: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  otherParticipantIds: string[];
}

export function ConversationList() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchConversations() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/conversations`,
          { credentials: "include" }
        );
        const data = await response.json();
        setConversations(data.conversations);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const title = conv.title || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg 
                       bg-gray-100 dark:bg-white/5 
                       border border-transparent
                       focus:border-aksob-primary focus:ring-1 focus:ring-aksob-primary/50
                       text-sm transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Start a new chat to connect!</p>
          </div>
        ) : (
          filteredConversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === conversationId}
              onClick={() => navigate(`/chat/${conv.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

## 7.6 Message Bubble Component

### File: `apps/web/app/components/chat/message-bubble.tsx`

```tsx
import { clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, File, Image as ImageIcon } from "lucide-react";

interface Attachment {
  type: string;
  url: string;
  filename: string;
}

interface MessageBubbleProps {
  id: string;
  content: string | null;
  attachments?: Attachment[];
  senderId: string;
  senderName: string;
  createdAt: string;
  isOwn: boolean;
  isRead?: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

export function MessageBubble({
  content,
  attachments,
  senderName,
  createdAt,
  isOwn,
  isRead,
  replyTo,
}: MessageBubbleProps) {
  const time = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div
      className={clsx(
        "flex flex-col max-w-[70%] group",
        isOwn ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      {/* Sender name (for group chats, others' messages) */}
      {!isOwn && (
        <span className="text-xs text-gray-500 mb-1 ml-3">
          {senderName}
        </span>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div
          className={clsx(
            "text-xs px-3 py-1.5 rounded-t-xl border-l-2 mb-0.5",
            isOwn
              ? "bg-aksob-primary/20 border-aksob-secondary text-white/70"
              : "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/20"
          )}
        >
          <span className="font-medium">{replyTo.senderName}</span>
          <p className="truncate opacity-70">{replyTo.content}</p>
        </div>
      )}

      {/* Message bubble */}
      <div
        className={clsx(
          "px-4 py-2.5 rounded-2xl",
          isOwn
            ? "bg-aksob-primary text-white rounded-br-md"
            : "bg-white dark:bg-white/10 text-gray-900 dark:text-white rounded-bl-md shadow-sm"
        )}
      >
        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {attachments.map((att, i) => (
              <AttachmentPreview key={i} attachment={att} isOwn={isOwn} />
            ))}
          </div>
        )}

        {/* Text content */}
        {content && (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        )}
      </div>

      {/* Timestamp & Read status */}
      <div
        className={clsx(
          "flex items-center gap-1 mt-1 px-2",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
      >
        <span className="text-xs text-gray-400">{time}</span>
        {isOwn && (
          isRead ? (
            <CheckCheck className="w-3.5 h-3.5 text-aksob-primary" />
          ) : (
            <Check className="w-3.5 h-3.5 text-gray-400" />
          )
        )}
      </div>
    </div>
  );
}

function AttachmentPreview({ 
  attachment, 
  isOwn 
}: { 
  attachment: Attachment; 
  isOwn: boolean 
}) {
  const isImage = attachment.type === "image" || attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  if (isImage) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
        <img
          src={attachment.url}
          alt={attachment.filename}
          className="max-w-full rounded-lg max-h-60 object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "flex items-center gap-2 p-2 rounded-lg",
        isOwn ? "bg-white/20" : "bg-gray-100 dark:bg-white/5"
      )}
    >
      <File className="w-5 h-5" />
      <span className="text-sm truncate">{attachment.filename}</span>
    </a>
  );
}
```

## 7.7 Message Input Component

### File: `apps/web/app/components/chat/message-input.tsx`

```tsx
import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, Image, X, Smile } from "lucide-react";
import { clsx } from "clsx";

interface MessageInputProps {
  onSend: (content: string) => void;
  onSendWithAttachments: (
    content: string | null,
    attachments: Array<{ type: string; url: string; filename: string }>
  ) => void;
  onTyping: () => void;
  disabled?: boolean;
  replyTo?: { id: string; content: string; senderName: string } | null;
  onCancelReply?: () => void;
}

interface PendingAttachment {
  file: File;
  preview?: string;
  uploading: boolean;
  url?: string;
  error?: string;
}

export function MessageInput({
  onSend,
  onSendWithAttachments,
  onTyping,
  disabled,
  replyTo,
  onCancelReply,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasContent = message.trim().length > 0;
    const hasAttachments = attachments.some(a => a.url);
    
    if (!hasContent && !hasAttachments) return;

    if (hasAttachments) {
      const uploadedAttachments = attachments
        .filter(a => a.url)
        .map(a => ({
          type: a.file.type.startsWith("image/") ? "image" : "document",
          url: a.url!,
          filename: a.file.name,
        }));
      
      onSendWithAttachments(message.trim() || null, uploadedAttachments);
    } else {
      onSend(message.trim());
    }

    setMessage("");
    setAttachments([]);
    onCancelReply?.();
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping();

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file);
      }

      const pendingAttachment: PendingAttachment = {
        file,
        preview,
        uploading: true,
      };

      setAttachments(prev => [...prev, pendingAttachment]);

      // Upload file
      try {
        // 1. Get presigned URL
        const presignedRes = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/upload/presigned-url`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              sizeBytes: file.size,
            }),
          }
        );

        if (!presignedRes.ok) {
          throw new Error("Failed to get upload URL");
        }

        const { uploadUrl, fileUrl } = await presignedRes.json();

        // 2. Upload to S3/R2
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        // 3. Update attachment with URL
        setAttachments(prev =>
          prev.map(a =>
            a.file === file
              ? { ...a, uploading: false, url: fileUrl }
              : a
          )
        );
      } catch (error) {
        console.error("Upload failed:", error);
        setAttachments(prev =>
          prev.map(a =>
            a.file === file
              ? { ...a, uploading: false, error: "Upload failed" }
              : a
          )
        );
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const removed = prev[index];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-aksob-darkest/50">
      {/* Reply preview */}
      {replyTo && (
        <div className="px-4 pt-3 flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-white/5 rounded-lg border-l-2 border-aksob-primary">
            <p className="text-xs text-aksob-primary font-medium">
              Replying to {replyTo.senderName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {replyTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div key={i} className="relative group">
              {att.preview ? (
                <img
                  src={att.preview}
                  alt={att.file.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-lg">
                  <Paperclip className="w-6 h-6 text-gray-400" />
                </div>
              )}
              
              {/* Loading overlay */}
              {att.uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Error overlay */}
              {att.error && (
                <div className="absolute inset-0 bg-red-500/50 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-white">Error</span>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full 
                           opacity-0 group-hover:opacity-100 transition-opacity
                           flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 flex items-end gap-2">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2.5 pr-10 rounded-2xl resize-none
                       bg-gray-100 dark:bg-white/5
                       border border-transparent
                       focus:border-aksob-primary focus:ring-1 focus:ring-aksob-primary/50
                       disabled:opacity-50
                       max-h-[150px]"
          />
          
          {/* Emoji button (placeholder) */}
          <button
            type="button"
            className="absolute right-3 bottom-2.5 p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10"
          >
            <Smile className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || (!message.trim() && !attachments.some(a => a.url))}
          className="p-3 bg-aksob-primary text-white rounded-full
                     hover:bg-aksob-secondary hover:scale-105
                     active:scale-95
                     disabled:opacity-50 disabled:hover:scale-100
                     transition-all duration-200"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
```

## 7.8 Conversation Page

### File: `apps/web/app/chat/conversation.tsx`

```tsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useChat } from "@/hooks/use-chat";
import { useSession } from "@/lib/auth-client";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageInput } from "@/components/chat/message-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { EmptyState } from "@/components/chat/empty-state";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string | null;
  attachments?: Array<{ type: string; url: string; filename: string }>;
  replyToId?: string;
  replyTo?: { id: string; content: string; senderId: string };
  createdAt: string;
  isEdited: boolean;
}

export default function ConversationPage() {
  const { conversationId } = useParams();
  const { data: session } = useSession();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    messages,
    setMessages,
    typingUsers,
    sendMessage,
    sendMessageWithAttachments,
    handleTyping,
  } = useChat(conversationId || null);

  // Fetch conversation details and initial messages
  useEffect(() => {
    if (!conversationId) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch conversation
        const convRes = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/conversations/${conversationId}`,
          { credentials: "include" }
        );
        const convData = await convRes.json();
        setConversation(convData.conversation);

        // Fetch messages
        const msgRes = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/conversations/${conversationId}/messages`,
          { credentials: "include" }
        );
        const msgData = await msgRes.json();
        setMessages(msgData.messages);
      } catch (error) {
        console.error("Failed to fetch conversation:", error);
        navigate("/chat");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [conversationId, navigate, setMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (content: string) => {
    sendMessage(content, replyTo?.id);
    setReplyTo(null);
  };

  const handleSendWithAttachments = (
    content: string | null,
    attachments: Array<{ type: string; url: string; filename: string }>
  ) => {
    sendMessageWithAttachments(content, attachments);
    setReplyTo(null);
  };

  const handleReply = (message: Message) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      senderName: message.senderName || "User",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-aksob-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <EmptyState
        icon="message"
        title="Conversation not found"
        description="This conversation may have been deleted."
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        isConnected={isConnected}
      />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon="wave"
              title="Say hello! 👋"
              description="Start the conversation with a message."
            />
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                id={msg.id}
                content={msg.content}
                attachments={msg.attachments}
                senderId={msg.senderId}
                senderName={msg.senderName || "User"}
                createdAt={msg.createdAt}
                isOwn={msg.senderId === session?.user?.id}
                replyTo={msg.replyTo ? {
                  id: msg.replyTo.id,
                  content: msg.replyTo.content || "",
                  senderName: "User",
                } : undefined}
              />
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator users={typingUsers} />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onSendWithAttachments={handleSendWithAttachments}
        onTyping={handleTyping}
        disabled={!isConnected}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
```

## 7.9 Typing Indicator Component

### File: `apps/web/app/components/chat/typing-indicator.tsx`

```tsx
interface TypingIndicatorProps {
  users: Array<{ userId: string; username: string }>;
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const names = users.map(u => u.username);
  let text: string;

  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      {/* Animated dots */}
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-aksob-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-aksob-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-aksob-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span>{text}</span>
    </div>
  );
}
```

apps/web/app/
├── routes.ts                    # Route definitions
├── lib/
│   └── auth-client.ts           # Better Auth client
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── divider.tsx
│   │   └── loading-spinner.tsx
│   └── auth/
│       ├── auth-layout.tsx      # Shared auth page layout
│       ├── social-button.tsx    # Google sign-in button
│       ├── password-input.tsx   # Password with show/hide
│       └── user-type-select.tsx # Student/Alumni/Faculty picker
├── auth/
│   ├── login.tsx               # /auth/login
│   ├── register.tsx            # /auth/register
│   ├── forgot-password.tsx     # /auth/forgot-password
│   ├── reset-password.tsx      # /auth/reset-password?token=xxx
│   ├── verify-email.tsx        # /auth/verify-email?token=xxx
│   └── verify-email-sent.tsx   # /auth/verify-email-sent
```

## 5.2 Auth Client Setup

### File: `apps/web/app/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// Export hooks for easy use
export const { 
  useSession, 
  signIn, 
  signUp, 
  signOut,
  forgetPassword,
  resetPassword,
  verifyEmail,
} = authClient;
```

## 5.3 Routes Configuration

### File: `apps/web/app/routes.ts`

```typescript
import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Galaxy (home)
  index("galaxy/galaxy.tsx"),
  
  // Auth routes
  route("auth/login", "auth/login.tsx"),
  route("auth/register", "auth/register.tsx"),
  route("auth/forgot-password", "auth/forgot-password.tsx"),
  route("auth/reset-password", "auth/reset-password.tsx"),
  route("auth/verify-email", "auth/verify-email.tsx"),
  route("auth/verify-email-sent", "auth/verify-email-sent.tsx"),
  
  // Protected routes (chat, profile)
  route("chat", "chat/chat-layout.tsx", [
    index("chat/inbox.tsx"),
    route(":conversationId", "chat/conversation.tsx"),
  ]),
  route("profile", "profile/profile.tsx"),
  route("profile/:userId", "profile/public-profile.tsx"),
] satisfies RouteConfig;
```

## 5.4 UI Components

### File: `apps/web/app/components/ui/button.tsx`

```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    fullWidth = false,
    isLoading = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-lg
      transition-all duration-300 
      hover:shadow-lg hover:-translate-y-0.5 
      active:translate-y-0 active:shadow-md
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aksob-primary/50
    `;
    
    const variants = {
      primary: "bg-aksob-primary text-white hover:bg-aksob-secondary",
      secondary: "bg-white text-aksob-primary border border-aksob-primary hover:bg-aksob-primary/5",
      ghost: "bg-transparent text-aksob-primary hover:bg-aksob-primary/10",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };
    
    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" cy="12" r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
              />
            </svg>
            Loading...
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

### File: `apps/web/app/components/ui/input.tsx`

```tsx
import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
    
    return (
      <div className="space-y-1.5">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            `w-full px-4 py-2.5 rounded-lg border
            bg-gray-50 dark:bg-black/20 
            border-gray-200 dark:border-white/10
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-aksob-primary/50 focus:border-aksob-primary
            disabled:opacity-50 disabled:cursor-not-allowed`,
            error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
```

### File: `apps/web/app/components/ui/card.tsx`

```tsx
import { type HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: `
        bg-white dark:bg-aksob-darkest/90 
        border border-gray-200 dark:border-white/10
        shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]
      `,
      glass: `
        bg-white/95 dark:bg-aksob-darkest/90 
        backdrop-blur-md 
        border border-white/20 dark:border-white/10
        shadow-[0_4px_12px_rgba(0,0,0,0.15)]
      `,
    };
    
    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-xl",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
```

## 5.5 Auth Layout

### File: `apps/web/app/components/auth/auth-layout.tsx`

```tsx
import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Dimmed Galaxy Background */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-aksob-darkest to-black"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(7, 105, 81, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(22, 135, 107, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, rgba(54, 89, 81, 0.1) 0%, transparent 40%)
          `,
        }}
      />
      
      {/* Animated Stars (subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

## 5.6 Login Page

### File: `apps/web/app/auth/login.tsx`

```tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { SocialButton } from "@/components/auth/social-button";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    navigate("/");
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <AuthLayout>
      <Card variant="glass" className="p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/aksob-logo.svg" 
            alt="AKSOB" 
            className="h-12 w-auto"
          />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Reconnect with your galaxy.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Google Sign In */}
        <SocialButton 
          provider="google" 
          onClick={handleGoogleLogin}
          className="mb-6"
        />

        <Divider>Or continue with email</Divider>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mt-6">
          <Input
            label="Email"
            type="email"
            placeholder="name@lau.edu.lb"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Link 
              to="/auth/forgot-password"
              className="text-sm text-aksob-primary hover:text-aksob-secondary transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading}
            className="mt-6"
          >
            Sign In
          </Button>
        </form>

        {/* Register Link */}
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link 
            to="/auth/register"
            className="font-semibold text-aksob-primary hover:text-aksob-secondary transition-colors"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
```

## 5.7 Registration Page

### File: `apps/web/app/auth/register.tsx`

```tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { SocialButton } from "@/components/auth/social-button";
import { UserTypeSelect } from "@/components/auth/user-type-select";
import { PasswordStrength } from "@/components/auth/password-strength";
import { authClient } from "@/lib/auth-client";

type UserType = "student" | "alumni" | "faculty";

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // Form state
  const [userType, setUserType] = useState<UserType>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
      // Pass user type as additional field
      userType,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // Redirect to email verification page
    navigate("/auth/verify-email-sent");
  };

  const handleGoogleSignUp = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/profile?setup=true", // Redirect to profile setup
    });
  };

  return (
    <AuthLayout>
      <Card variant="glass" className="p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/aksob-logo.svg" alt="AKSOB" className="h-10 w-auto" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Join the Galaxy
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          Connect with AKSOB faculty, alumni, and students.
        </p>

        {/* User Type Selection */}
        <UserTypeSelect 
          value={userType} 
          onChange={setUserType}
          className="mb-6"
        />

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Google Sign Up */}
        <SocialButton 
          provider="google" 
          onClick={handleGoogleSignUp}
          label="Sign up with Google"
          className="mb-4"
        />

        <Divider>Or register with email</Divider>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4 mt-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            placeholder="name@lau.edu.lb"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            hint="Use your LAU email for automatic verification"
          />

          <div className="space-y-1.5">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            error={
              confirmPassword && password !== confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          />

          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading}
            className="mt-6"
          >
            Create Account
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link 
            to="/auth/login"
            className="font-semibold text-aksob-primary hover:text-aksob-secondary transition-colors"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
```

## 5.8 User Type Selector Component

### File: `apps/web/app/components/auth/user-type-select.tsx`

```tsx
import { clsx } from "clsx";
import { GraduationCap, Briefcase, BookOpen } from "lucide-react";

type UserType = "student" | "alumni" | "faculty";

interface UserTypeSelectProps {
  value: UserType;
  onChange: (value: UserType) => void;
  className?: string;
}

const userTypes = [
  { 
    id: "student" as const, 
    label: "Student", 
    icon: BookOpen,
    description: "Currently enrolled" 
  },
  { 
    id: "alumni" as const, 
    label: "Alumni", 
    icon: GraduationCap,
    description: "AKSOB graduate" 
  },
  { 
    id: "faculty" as const, 
    label: "Faculty", 
    icon: Briefcase,
    description: "Professor or staff" 
  },
];

export function UserTypeSelect({ value, onChange, className }: UserTypeSelectProps) {
  return (
    <div className={clsx("grid grid-cols-3 gap-3", className)}>
      {userTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.id;
        
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={clsx(
              `flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200`,
              isSelected
                ? "border-aksob-primary bg-aksob-primary/5 dark:bg-aksob-primary/10"
                : "border-gray-200 dark:border-white/10 hover:border-aksob-primary/50"
            )}
          >
            <Icon 
              className={clsx(
                "w-6 h-6 mb-2",
                isSelected 
                  ? "text-aksob-primary" 
                  : "text-gray-400"
              )} 
            />
            <span 
              className={clsx(
                "text-sm font-medium",
                isSelected 
                  ? "text-aksob-primary" 
                  : "text-gray-600 dark:text-gray-300"
              )}
            >
              {type.label}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">
              {type.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

## 5.9 Forgot Password & Reset Password Pages

### File: `apps/web/app/auth/forgot-password.tsx`

```tsx
import { useState } from "react";
import { Link } from "react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await authClient.forgetPassword({
      email,
      redirectTo: "/auth/reset-password",
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <Card variant="glass" className="p-8 text-center">
          <div className="w-16 h-16 bg-aksob-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-aksob-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            We've sent a password reset link to<br />
            <span className="font-medium text-gray-900 dark:text-white">{email}</span>
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Didn't receive the email? Check your spam folder or{" "}
            <button 
              onClick={() => setIsSuccess(false)}
              className="text-aksob-primary hover:underline"
            >
              try again
            </button>
          </p>

          <Link to="/auth/login">
            <Button variant="secondary" fullWidth>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card variant="glass" className="p-8">
        {/* Icon */}
        <div className="w-16 h-16 bg-aksob-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-aksob-primary" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Forgot Password?
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          No worries, we'll send you reset instructions.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="name@lau.edu.lb"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>

        {/* Back to Login */}
        <Link 
          to="/auth/login"
          className="flex items-center justify-center mt-6 text-sm text-gray-600 dark:text-gray-400 hover:text-aksob-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>
      </Card>
    </AuthLayout>
  );
}
```

### File: `apps/web/app/auth/reset-password.tsx`

```tsx
import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/auth/password-strength";
import { authClient } from "@/lib/auth-client";
import { Lock, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No token = invalid link
  if (!token) {
    return (
      <AuthLayout>
        <Card variant="glass" className="p-8 text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-gray-500 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link to="/auth/forgot-password">
            <Button fullWidth>Request New Link</Button>
          </Link>
        </Card>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    const { error } = await authClient.resetPassword({
      token,
      newPassword: password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <Card variant="glass" className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Password Reset!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your password has been successfully reset.
          </p>

          <Link to="/auth/login">
            <Button fullWidth>Sign In</Button>
          </Link>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card variant="glass" className="p-8">
        <div className="w-16 h-16 bg-aksob-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-aksob-primary" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Set New Password
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Your new password must be at least 8 characters.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
```

---

# 6. Phase 3: Chat Backend

## 6.1 Directory Structure

```
apps/api/src/
├── modules/
│   └── chat/
│       ├── chat.routes.ts       # REST API endpoints
│       ├── chat.service.ts      # Business logic
│       ├── chat.types.ts        # TypeBox schemas
│       └── chat.ws.ts           # WebSocket handler
├── lib/
│   └── websocket.ts             # WebSocket state management
```

## 6.2 WebSocket State Management

### File: `apps/api/src/lib/websocket.ts`

```typescript
// ═══════════════════════════════════════════════════════════════
// WEBSOCKET CONNECTION STATE
// ═══════════════════════════════════════════════════════════════

interface ConnectionData {
  userId: string;
  username: string;
  connectedAt: Date;
  subscriptions: Set<string>; // Conversation IDs
}

// Map of WebSocket ID → Connection Data
export const connections = new Map<string, ConnectionData>();

// Map of User ID → WebSocket IDs (for multi-device support)
export const userConnections = new Map<string, Set<string>>();

// Typing indicators: conversationId → Map<userId, expiresAt>
export const typingIndicators = new Map<string, Map<string, number>>();

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function addConnection(wsId: string, userId: string, username: string) {
  connections.set(wsId, {
    userId,
    username,
    connectedAt: new Date(),
    subscriptions: new Set(),
  });

  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId)!.add(wsId);
}

export function removeConnection(wsId: string) {
  const conn = connections.get(wsId);
  if (conn) {
    userConnections.get(conn.userId)?.delete(wsId);
    if (userConnections.get(conn.userId)?.size === 0) {
      userConnections.delete(conn.userId);
    }
    connections.delete(wsId);
  }
}

export function isUserOnline(userId: string): boolean {
  return userConnections.has(userId) && userConnections.get(userId)!.size > 0;
}

export function getOnlineUsers(userIds: string[]): string[] {
  return userIds.filter(isUserOnline);
}
```

## 6.3 Chat WebSocket Handler

### File: `apps/api/src/modules/chat/chat.ws.ts`

```typescript
import { Elysia, t } from "elysia";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { 
  messages, 
  conversations, 
  conversationParticipants,
  messageAttachments 
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { 
  connections, 
  addConnection, 
  removeConnection,
  typingIndicators 
} from "@/lib/websocket";

// ═══════════════════════════════════════════════════════════════
// MESSAGE SCHEMAS
// ═══════════════════════════════════════════════════════════════

const IncomingMessageSchema = t.Object({
  type: t.Union([
    t.Literal("message"),
    t.Literal("typing_start"),
    t.Literal("typing_stop"),
    t.Literal("mark_read"),
    t.Literal("subscribe"),
    t.Literal("unsubscribe"),
  ]),
  conversationId: t.String(),
  content: t.Optional(t.String()),
  replyToId: t.Optional(t.String()),
  attachments: t.Optional(t.Array(t.Object({
    type: t.String(),
    url: t.String(),
    filename: t.String(),
    mimeType: t.Optional(t.String()),
    sizeBytes: t.Optional(t.Number()),
  }))),
});

// ═══════════════════════════════════════════════════════════════
// WEBSOCKET HANDLER
// ═══════════════════════════════════════════════════════════════

export const chatWebSocket = new Elysia()
  .ws("/ws/chat", {
    // Validate incoming messages
    body: IncomingMessageSchema,

    // ─────────────────────────────────────────────────────────────
    // CONNECTION OPENED
    // ─────────────────────────────────────────────────────────────
    async open(ws) {
      // Authenticate via cookie/header
      const session = await auth.api.getSession({
        headers: ws.data.headers,
      });

      if (!session?.user) {
        ws.close(4001, "Unauthorized");
        return;
      }

      const wsId = crypto.randomUUID();
      ws.data.wsId = wsId;
      ws.data.userId = session.user.id;
      ws.data.username = session.user.name || "Anonymous";

      addConnection(wsId, session.user.id, session.user.name || "Anonymous");

      // Auto-subscribe to all user's conversations
      const participations = await db.query.conversationParticipants.findMany({
        where: and(
          eq(conversationParticipants.userId, session.user.id),
          eq(conversationParticipants.leftAt, null)
        ),
      });

      for (const p of participations) {
        ws.subscribe(p.conversationId);
        connections.get(wsId)?.subscriptions.add(p.conversationId);
      }

      // Notify user of successful connection
      ws.send(JSON.stringify({
        type: "connected",
        userId: session.user.id,
        subscribedConversations: participations.map(p => p.conversationId),
      }));
    },

    // ─────────────────────────────────────────────────────────────
    // MESSAGE RECEIVED
    // ─────────────────────────────────────────────────────────────
    async message(ws, data) {
      const userId = ws.data.userId;
      const username = ws.data.username;

      if (!userId) {
        ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
        return;
      }

      switch (data.type) {
        // ═══════════════════════════════════════════════════════
        // SEND MESSAGE
        // ═══════════════════════════════════════════════════════
        case "message": {
          if (!data.content?.trim() && !data.attachments?.length) {
            ws.send(JSON.stringify({ type: "error", message: "Empty message" }));
            return;
          }

          // Verify user is participant
          const participation = await db.query.conversationParticipants.findFirst({
            where: and(
              eq(conversationParticipants.conversationId, data.conversationId),
              eq(conversationParticipants.userId, userId),
              eq(conversationParticipants.leftAt, null)
            ),
          });

          if (!participation) {
            ws.send(JSON.stringify({ type: "error", message: "Not a participant" }));
            return;
          }

          // Insert message
          const [newMessage] = await db.insert(messages).values({
            conversationId: data.conversationId,
            senderId: userId,
            type: data.attachments?.length ? "file" : "text",
            content: data.content || null,
            replyToId: data.replyToId || null,
          }).returning();

          // Insert attachments if any
          if (data.attachments?.length) {
            await db.insert(messageAttachments).values(
              data.attachments.map(att => ({
                messageId: newMessage.id,
                type: att.type as "image" | "video" | "document" | "audio",
                url: att.url,
                filename: att.filename,
                mimeType: att.mimeType,
                sizeBytes: att.sizeBytes,
              }))
            );
          }

          // Update conversation's last message
          await db.update(conversations)
            .set({
              lastMessageId: newMessage.id,
              lastMessageAt: new Date(),
              lastMessagePreview: data.content?.slice(0, 100) || "[Attachment]",
              updatedAt: new Date(),
            })
            .where(eq(conversations.id, data.conversationId));

          // Broadcast to all participants
          const outgoingMessage = {
            type: "message",
            id: newMessage.id,
            conversationId: data.conversationId,
            senderId: userId,
            senderName: username,
            content: data.content,
            attachments: data.attachments,
            replyToId: data.replyToId,
            createdAt: newMessage.createdAt.toISOString(),
          };

          ws.publish(data.conversationId, JSON.stringify(outgoingMessage));
          
          // Also send to self (confirmation)
          ws.send(JSON.stringify({
            type: "message_sent",
            id: newMessage.id,
            conversationId: data.conversationId,
          }));

          break;
        }

        // ═══════════════════════════════════════════════════════
        // TYPING INDICATOR
        // ═══════════════════════════════════════════════════════
        case "typing_start": {
          const conversationId = data.conversationId;
          
          if (!typingIndicators.has(conversationId)) {
            typingIndicators.set(conversationId, new Map());
          }
          
          // Set expiry (3 seconds from now)
          typingIndicators.get(conversationId)!.set(userId, Date.now() + 3000);

          ws.publish(conversationId, JSON.stringify({
            type: "typing",
            conversationId,
            userId,
            username,
            isTyping: true,
          }));

          // Auto-expire after 3 seconds
          setTimeout(() => {
            const expires = typingIndicators.get(conversationId)?.get(userId);
            if (expires && expires <= Date.now()) {
              typingIndicators.get(conversationId)?.delete(userId);
              ws.publish(conversationId, JSON.stringify({
                type: "typing",
                conversationId,
                userId,
                isTyping: false,
              }));
            }
          }, 3000);

          break;
        }

        case "typing_stop": {
          typingIndicators.get(data.conversationId)?.delete(userId);
          
          ws.publish(data.conversationId, JSON.stringify({
            type: "typing",
            conversationId: data.conversationId,
            userId,
            isTyping: false,
          }));

          break;
        }

        // ═══════════════════════════════════════════════════════
        // MARK AS READ
        // ═══════════════════════════════════════════════════════
        case "mark_read": {
          await db.update(conversationParticipants)
            .set({ 
              lastReadAt: new Date(),
            })
            .where(and(
              eq(conversationParticipants.conversationId, data.conversationId),
              eq(conversationParticipants.userId, userId)
            ));

          // Notify other participants (for read receipts)
          ws.publish(data.conversationId, JSON.stringify({
            type: "read_receipt",
            conversationId: data.conversationId,
            userId,
            readAt: new Date().toISOString(),
          }));

          break;
        }

        // ═══════════════════════════════════════════════════════
        // SUBSCRIBE/UNSUBSCRIBE TO CONVERSATION
        // ═══════════════════════════════════════════════════════
        case "subscribe": {
          ws.subscribe(data.conversationId);
          connections.get(ws.data.wsId)?.subscriptions.add(data.conversationId);
          break;
        }

        case "unsubscribe": {
          ws.unsubscribe(data.conversationId);
          connections.get(ws.data.wsId)?.subscriptions.delete(data.conversationId);
          break;
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // CONNECTION CLOSED
    // ─────────────────────────────────────────────────────────────
    close(ws) {
      const wsId = ws.data.wsId;
      if (wsId) {
        removeConnection(wsId);
      }
    },
  });
```

## 6.4 Chat REST API Routes

### File: `apps/api/src/modules/chat/chat.routes.ts`

```typescript
import { Elysia, t } from "elysia";
import { authPlugin } from "@/plugins/auth";
import { db } from "@/db";
import { 
  conversations, 
  conversationParticipants, 
  messages,
  messageAttachments 
} from "@/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { isUserOnline } from "@/lib/websocket";

export const chatModule = new Elysia({ prefix: "/chat" })
  .use(authPlugin)

  // ═══════════════════════════════════════════════════════════════
  // GET CONVERSATIONS (Inbox)
  // ═══════════════════════════════════════════════════════════════
  .get("/conversations", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    // Get all conversations user participates in
    const participations = await db.query.conversationParticipants.findMany({
      where: and(
        eq(conversationParticipants.userId, user.id),
        eq(conversationParticipants.leftAt, null)
      ),
      with: {
        conversation: true,
      },
    });

    // Enrich with participant info and unread counts
    const enrichedConversations = await Promise.all(
      participations.map(async (p) => {
        // Get all participants
        const participants = await db.query.conversationParticipants.findMany({
          where: eq(conversationParticipants.conversationId, p.conversationId),
        });

        // Get other participant(s) info for display
        const otherParticipantIds = participants
          .filter(part => part.userId !== user.id)
          .map(part => part.userId);

        // Count unread messages
        const unreadCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(and(
            eq(messages.conversationId, p.conversationId),
            sql`${messages.createdAt} > ${p.lastReadAt || new Date(0)}`
          ));

        return {
          id: p.conversation.id,
          type: p.conversation.type,
          title: p.conversation.title,
          lastMessagePreview: p.conversation.lastMessagePreview,
          lastMessageAt: p.conversation.lastMessageAt,
          unreadCount: unreadCount[0]?.count || 0,
          isMuted: p.isMuted,
          isPinned: p.isPinned,
          otherParticipantIds,
          // For DMs, we'll need to fetch user info on frontend
        };
      })
    );

    // Sort: pinned first, then by last message time
    enrichedConversations.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0);
    });

    return { conversations: enrichedConversations };
  })

  // ═══════════════════════════════════════════════════════════════
  // GET SINGLE CONVERSATION
  // ═══════════════════════════════════════════════════════════════
  .get("/conversations/:id", async ({ user, params, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    // Verify participation
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, params.id),
        eq(conversationParticipants.userId, user.id),
        eq(conversationParticipants.leftAt, null)
      ),
    });

    if (!participation) {
      set.status = 403;
      return { error: "Not a participant" };
    }

    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, params.id),
      with: {
        participants: true,
      },
    });

    return { conversation };
  }, {
    params: t.Object({ id: t.String() }),
  })

  // ═══════════════════════════════════════════════════════════════
  // CREATE CONVERSATION (DM or Group)
  // ═══════════════════════════════════════════════════════════════
  .post("/conversations", async ({ user, body, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const { type, participantIds, title } = body;

    // For DMs, check if conversation already exists
    if (type === "dm" && participantIds.length === 1) {
      const otherId = participantIds[0];
      
      // Find existing DM between these two users
      const existingDM = await db.execute(sql`
        SELECT cp1.conversation_id 
        FROM conversation_participants cp1
        JOIN conversation_participants cp2 
          ON cp1.conversation_id = cp2.conversation_id
        JOIN conversations c 
          ON c.id = cp1.conversation_id
        WHERE cp1.user_id = ${user.id}
          AND cp2.user_id = ${otherId}
          AND c.type = 'dm'
          AND cp1.left_at IS NULL
          AND cp2.left_at IS NULL
        LIMIT 1
      `);

      if (existingDM.rows.length > 0) {
        return { 
          conversationId: existingDM.rows[0].conversation_id,
          isExisting: true,
        };
      }
    }

    // Create new conversation
    const [newConversation] = await db.insert(conversations).values({
      type,
      title: type === "group" ? title : null,
      createdBy: user.id,
    }).returning();

    // Add creator as participant (owner for groups)
    await db.insert(conversationParticipants).values({
      conversationId: newConversation.id,
      userId: user.id,
      role: type === "group" ? "owner" : "member",
    });

    // Add other participants
    for (const participantId of participantIds) {
      await db.insert(conversationParticipants).values({
        conversationId: newConversation.id,
        userId: participantId,
        role: "member",
      });
    }

    return { 
      conversationId: newConversation.id,
      isExisting: false,
    };
  }, {
    body: t.Object({
      type: t.Union([t.Literal("dm"), t.Literal("group")]),
      participantIds: t.Array(t.String()),
      title: t.Optional(t.String()),
    }),
  })

  // ═══════════════════════════════════════════════════════════════
  // GET MESSAGES (with pagination)
  // ═══════════════════════════════════════════════════════════════
  .get("/conversations/:id/messages", async ({ user, params, query, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    // Verify participation
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, params.id),
        eq(conversationParticipants.userId, user.id)
      ),
    });

    if (!participation) {
      set.status = 403;
      return { error: "Not a participant" };
    }

    const limit = query.limit || 50;
    const cursor = query.cursor; // Message ID for cursor-based pagination

    let messageQuery = db.query.messages.findMany({
      where: eq(messages.conversationId, params.id),
      orderBy: [desc(messages.createdAt)],
      limit: limit + 1, // Fetch one extra to check if there's more
      with: {
        attachments: true,
        reactions: true,
        replyTo: {
          columns: {
            id: true,
            content: true,
            senderId: true,
          },
        },
      },
    });

    const result = await messageQuery;

    const hasMore = result.length > limit;
    const messageList = hasMore ? result.slice(0, -1) : result;

    return {
      messages: messageList.reverse(), // Return in chronological order
      hasMore,
      nextCursor: hasMore ? messageList[0]?.id : null,
    };
  }, {
    params: t.Object({ id: t.String() }),
    query: t.Object({
      limit: t.Optional(t.Number()),
      cursor: t.Optional(t.String()),
    }),
  })

  // ═══════════════════════════════════════════════════════════════
  // SEARCH USERS (for starting new conversations)
  // ═══════════════════════════════════════════════════════════════
  .get("/users/search", async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const searchTerm = query.q;
    if (!searchTerm || searchTerm.length < 2) {
      return { users: [] };
    }

    // Search in Better Auth user table
    const users = await db.execute(sql`
      SELECT id, name, email, image
      FROM user
      WHERE (name LIKE ${'%' + searchTerm + '%'} OR email LIKE ${'%' + searchTerm + '%'})
        AND id != ${user.id}
      LIMIT 20
    `);

    // Add online status
    const enrichedUsers = users.rows.map((u: any) => ({
      ...u,
      isOnline: isUserOnline(u.id),
    }));

    return { users: enrichedUsers };
  }, {
    query: t.Object({
      q: t.String(),
    }),
  })

  // ═══════════════════════════════════════════════════════════════
  // FILE UPLOAD PRESIGNED URL
  // ═══════════════════════════════════════════════════════════════
  .post("/upload/presigned-url", async ({ user, body, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const { filename, contentType, sizeBytes } = body;

    // Validate file size (10MB limit)
    if (sizeBytes > 10 * 1024 * 1024) {
      set.status = 413;
      return { error: "File too large. Maximum size is 10MB." };
    }

    // Validate content type
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(contentType)) {
      set.status = 400;
      return { error: "File type not allowed" };
    }

    // Generate unique key
    const key = `chat/${user.id}/${Date.now()}-${filename}`;

    // TODO: Generate actual S3/R2 presigned URL
    // For now, return a placeholder
    return {
      uploadUrl: `https://storage.aksob.com/upload?key=${key}`,
      fileUrl: `https://cdn.aksob.com/${key}`,
      key,
    };
  }, {
    body: t.Object({
      filename: t.String(),
      contentType: t.String(),
      sizeBytes: t.Number(),
    }),
  });

## 6.5 Register Chat Module in Main App

### File: `apps/api/src/index.ts` (updated)

```typescript
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { dbPlugin } from "@/plugins/db";
import { authPlugin } from "@/plugins/auth";
import { requestLogger } from "@/middleware/http-logger";
import { healthModule } from "@/modules/health/health.routes";
import { profileModule } from "@/modules/profile/profile.routes";
import { chatModule } from "@/modules/chat/chat.routes";
import { chatWebSocket } from "@/modules/chat/chat.ws";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

const app = new Elysia()
  // ─────────────────────────────────────────────────────────────
  // GLOBAL MIDDLEWARE
  // ─────────────────────────────────────────────────────────────
  .use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }))
  .use(swagger({
    documentation: {
      info: {
        title: "AKSOB API",
        version: "1.0.0",
        description: "API for AKSOB Alumni Platform",
      },
    },
  }))
  .use(requestLogger)
  
  // ─────────────────────────────────────────────────────────────
  // PLUGINS
  // ─────────────────────────────────────────────────────────────
  .use(dbPlugin)
  .use(authPlugin)
  
  // ─────────────────────────────────────────────────────────────
  // REST API MODULES
  // ─────────────────────────────────────────────────────────────
  .use(healthModule)
  .use(profileModule)
  .use(chatModule)
  
  // ─────────────────────────────────────────────────────────────
  // WEBSOCKET
  // ─────────────────────────────────────────────────────────────
  .use(chatWebSocket)
  
  // ─────────────────────────────────────────────────────────────
  // ERROR HANDLING
  // ─────────────────────────────────────────────────────────────
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Route not found" };
    }
    
    logger.error("Server error", {
      code,
      error: error instanceof Error ? error.message : error,
    });
    
    set.status = 500;
    return { error: "Internal server error" };
  })
  
  // ─────────────────────────────────────────────────────────────
  // START SERVER
  // ─────────────────────────────────────────────────────────────
  .listen(env.PORT);

logger.info(`🦊 AKSOB API running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
```
