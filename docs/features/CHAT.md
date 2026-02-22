# Chat Feature

Complete specification for the real-time chat system including design specs, wireframes, and implementation details.

---

## Table of Contents

1. [Design Specification](#design-specification)
   - [Chat Layout](#chat-layout)
   - [Conversation List](#conversation-list)
   - [Message Components](#message-components)
   - [Message Input](#message-input)
   - [New Chat Modal](#new-chat-modal)
   - [Empty States](#empty-states)
2. [Implementation](#implementation)
   - [Database Schema](#database-schema)
   - [WebSocket Protocol](#websocket-protocol)
   - [REST API](#rest-api)
   - [Frontend Components](#frontend-components)
   - [File Structure](#file-structure)

---

## Design Specification

### Chat Layout (Split View)

#### Desktop Layout (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [NAVIGATION BAR - 64px height]                                                  │
├────────────────────────┬─────────────────────────────────────────────────────────┤
│                        │                                                         │
│   SIDEBAR (320px)      │              MAIN CONTENT AREA                          │
│                        │                                                         │
│  ┌──────────────────┐  │  ┌─────────────────────────────────────────────────┐   │
│  │  Search...    🔍 │  │  │  CHAT HEADER                                    │   │
│  └──────────────────┘  │  │  [Avatar] John Doe  ●Online                     │   │
│                        │  └─────────────────────────────────────────────────┘   │
│  ┌──────────────────┐  │                                                         │
│  │ + New Chat       │  │  ┌─────────────────────────────────────────────────┐   │
│  └──────────────────┘  │  │                                                 │   │
│                        │  │                                                 │   │
│  ┌──────────────────┐  │  │              MESSAGE LIST                       │   │
│  │ [Av] John Doe    │  │  │                                                 │   │
│  │ Hey, how are...  │  │  │  ┌─────────────────────┐                        │   │
│  │            2m ago│  │  │  │ Hey! How are you?   │  ← Other's message     │   │
│  ├──────────────────┤  │  │  └─────────────────────┘                        │   │
│  │ [Av] Jane Smith  │  │  │                                                 │   │
│  │ See you tomor... │  │  │              ┌─────────────────────┐            │   │
│  │           1h ago │  │  │              │ I'm good, thanks!   │  ← My msg  │   │
│  ├──────────────────┤  │  │              └─────────────────────┘            │   │
│  │ [Av] Study Group │  │  │                                                 │   │
│  │ Meeting at 3pm   │  │  │  John is typing...                              │   │
│  │          3h ago  │  │  │                                                 │   │
│  └──────────────────┘  │  └─────────────────────────────────────────────────┘   │
│                        │                                                         │
│                        │  ┌─────────────────────────────────────────────────┐   │
│                        │  │  [📎] [📷]  Type a message...          [Send]   │   │
│                        │  └─────────────────────────────────────────────────┘   │
│                        │                                                         │
└────────────────────────┴─────────────────────────────────────────────────────────┘
```

#### Layout Specifications

| Element            | Value                                        |
|--------------------|----------------------------------------------|
| Sidebar Width      | 320px (fixed)                                |
| Sidebar Background | `#FFFFFF` (light) / `--aksob-darkest` (dark) |
| Sidebar Border     | 1px solid `--gray-200` (right edge)          |
| Main Area          | flex: 1 (fills remaining space)              |
| Main Background    | `--off-white` (light) / `#0a0a0a` (dark)     |
| Total Height       | `100vh - 64px` (below nav)                   |

#### Mobile Layout (<1024px)

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│  [NAV]              [☰]     │     │  [←]  John Doe    ●         │
├─────────────────────────────┤     ├─────────────────────────────┤
│                             │     │                             │
│   CONVERSATION LIST         │     │      MESSAGE VIEW           │
│   (Full Width)              │ ──► │      (Full Width)           │
│                             │     │                             │
│  ┌───────────────────────┐  │     │  Messages...                │
│  │ [Av] John Doe      2m │  │     │                             │
│  ├───────────────────────┤  │     ├─────────────────────────────┤
│  │ [Av] Jane Smith    1h │  │     │  [Type a message...]  [➤]   │
│  └───────────────────────┘  │     └─────────────────────────────┘
│                             │
│  [+ New Chat]               │     Tap conversation → Navigate to
│                             │     /chat/:conversationId
└─────────────────────────────┘
```

| Behavior    | Description                              |
|-------------|------------------------------------------|
| List View   | Full-width conversation list             |
| Detail View | Full-width message view with back button |
| Navigation  | React Router navigation between views    |
| Back Button | Returns to `/chat` (list view)           |

---

### Conversation List Component

#### Search Bar

```
┌─────────────────────────────────────┐
│  🔍  Search conversations...        │
└─────────────────────────────────────┘
```

| Property      | Value                        |
|---------------|------------------------------|
| Height        | 44px                         |
| Padding       | 0 16px                       |
| Background    | `--gray-100`                 |
| Border Radius | 8px                          |
| Icon          | `Search`, 18px, `--gray-400` |
| Placeholder   | "Search conversations..."    |
| Focus Border  | `--aksob-primary`            |

#### New Chat Button

```
┌─────────────────────────────────────┐
│  [+]  New Conversation              │
└─────────────────────────────────────┘
```

| Property      | Value               |
|---------------|---------------------|
| Height        | 44px                |
| Background    | `--aksob-primary`   |
| Text          | `#FFFFFF`           |
| Icon          | `Plus`, 18px        |
| Border Radius | 8px                 |
| Hover         | `--aksob-secondary` |

#### List Container

| Property | Value               |
|----------|---------------------|
| Overflow | `auto` (scrollable) |
| Padding  | 8px                 |
| Gap      | 4px                 |

---

### Conversation Item Component

#### Standard Item

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌────┐  John Doe                              2m ago    ●  │
│  │ JD │  Hey, how are you doing today?                   3  │
│  └────┘                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
    ↑         ↑                              ↑              ↑
  Avatar    Name                          Time         Unread
            Last Message                              Badge
```

#### Item Specifications

| Element           | Specification                              |
|-------------------|--------------------------------------------|
| Container Height  | 72px                                       |
| Container Padding | 12px 16px                                  |
| Border Radius     | 8px                                        |
| Avatar            | 44px, circular                             |
| Name Font         | 14px, 600 weight, `--aksob-darkest`        |
| Preview Font      | 13px, 400 weight, `--gray-600`             |
| Preview Max       | 1 line, ellipsis overflow                  |
| Time Font         | 12px, 400 weight, `--gray-500`             |
| Unread Badge      | 18px circle, `--aksob-primary`, white text |

#### Item States

| State           | Background    | Other                                |
|-----------------|---------------|--------------------------------------|
| Default         | `transparent` | —                                    |
| Hover           | `--gray-50`   | —                                    |
| Active/Selected | `--pale-mint` | Left border 3px `--aksob-primary`    |
| Unread          | —             | Name bold, preview `--aksob-darkest` |

#### Group Conversation Item

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌────┐  Study Group                           3h ago       │
│  │ 👥 │  Jane: Meeting at 3pm tomorrow                      │
│  └────┘                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Difference | Value                         |
|------------|-------------------------------|
| Avatar     | Group icon or stacked avatars |
| Preview    | Shows sender name prefix      |

---

### Chat Header Component

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  [←]   ┌────┐  John Doe                                          [⋯]       │
│        │ JD │  ● Online                                                     │
│        └────┘                                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
   ↑       ↑        ↑           ↑                                    ↑
 Back   Avatar    Name       Status                               Menu
(mobile)
```

#### Header Specifications

| Property      | Value                    |
|---------------|--------------------------|
| Height        | 64px                     |
| Background    | `#FFFFFF` / glass effect |
| Border Bottom | 1px solid `--gray-200`   |
| Padding       | 0 16px                   |
| Shadow        | `--shadow-sm`            |

#### Elements

| Element     | Specification                     |
|-------------|-----------------------------------|
| Back Button | 40px, visible only on mobile      |
| Avatar      | 40px                              |
| Name        | 16px, 600 weight                  |
| Status Text | 12px, `--gray-500` or `--success` |
| Status Dot  | 8px, inline with text             |
| Menu Button | 40px, `MoreVertical` icon         |

#### Status States

| Status  | Color             | Text                            |
|---------|-------------------|---------------------------------|
| Online  | `--success`       | "Online"                        |
| Offline | `--gray-400`      | "Offline" or "Last seen 2h ago" |
| Typing  | `--aksob-primary` | "Typing..."                     |

---

### Message Components

#### Message List Container

| Property        | Value               |
|-----------------|---------------------|
| Overflow        | `auto` (scrollable) |
| Padding         | 16px                |
| Background      | `--off-white`       |
| Scroll Behavior | `smooth`            |
| Flex Direction  | `column`            |
| Gap             | 8px                 |

#### Date Separator

```
                    ─────────  Today  ─────────
```

| Property   | Value            |
|------------|------------------|
| Font       | 12px, 500 weight |
| Color      | `--gray-500`     |
| Margin     | 16px 0           |
| Line Color | `--gray-200`     |

#### Own Message (Right-aligned)

```
                                          ┌─────────────────────────────┐
                                          │ I'm doing great! Just       │
                                          │ finished my project.        │
                                          │                    2:34 PM ✓✓│
                                          └─────────────────────────────┘
```

| Property      | Value               |
|---------------|---------------------|
| Background    | `--aksob-primary`   |
| Text Color    | `#FFFFFF`           |
| Border Radius | 16px 16px 4px 16px  |
| Max Width     | 70% of container    |
| Padding       | 12px 16px           |
| Font Size     | 15px                |
| Line Height   | 1.4                 |
| Time Font     | 11px, right-aligned |
| Alignment     | `flex-end` (right)  |

#### Other's Message (Left-aligned)

```
┌────┐
│ JD │
└────┘
┌─────────────────────────────┐
│ Hey! How are you doing      │
│ today?                      │
│ 2:32 PM                     │
└─────────────────────────────┘
```

| Property      | Value                                             |
|---------------|---------------------------------------------------|
| Background    | `#FFFFFF`                                         |
| Text Color    | `--aksob-darkest`                                 |
| Border Radius | 16px 16px 16px 4px                                |
| Border        | 1px solid `--gray-200`                            |
| Avatar        | 32px, shown only for first in group               |
| Sender Name   | 12px, 600 weight, `--aksob-primary` (groups only) |

#### Read Receipt Icons

```
✓   = Sent
✓✓  = Delivered  (gray)
✓✓  = Read       (--aksob-primary)
```

| State     | Icon           | Color             |
|-----------|----------------|-------------------|
| Sending   | Spinner (12px) | `--gray-400`      |
| Sent      | Single check   | `--gray-400`      |
| Delivered | Double check   | `--gray-400`      |
| Read      | Double check   | `--aksob-primary` |

#### Reply Preview (Nested)

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ ▌ John: Hey, how are you?           │ │  ← Reply reference
│ └─────────────────────────────────────┘ │
│                                         │
│ I'm good, thanks for asking!            │  ← Actual message
│                              2:34 PM ✓✓ │
└─────────────────────────────────────────┘
```

| Element         | Specification                                    |
|-----------------|--------------------------------------------------|
| Reply Container | Background `--gray-100`, padding 8px, radius 8px |
| Left Border     | 3px solid `--aksob-primary`                      |
| Sender Name     | 12px, 600 weight                                 |
| Preview Text    | 12px, 1 line, ellipsis                           |
| Margin Bottom   | 8px                                              |

#### Image Message

```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │      [IMAGE PREVIEW]    │ │
│ │       max 300x300       │ │
│ │                         │ │
│ └─────────────────────────┘ │
│ Check out this view!        │  ← Optional caption
│                    2:34 PM ✓✓│
└─────────────────────────────┘
```

| Property        | Value                             |
|-----------------|-----------------------------------|
| Image Container | Rounded 12px, overflow hidden     |
| Max Dimensions  | 300px × 300px                     |
| Object Fit      | `cover`                           |
| Caption         | Below image, same styling as text |
| Click Action    | Open in lightbox/new tab          |

#### File/Document Message

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ 📄  project-report.pdf              │ │
│ │     2.4 MB                          │ │
│ └─────────────────────────────────────┘ │
│                              2:34 PM ✓✓ │
└─────────────────────────────────────────┘
```

| Property       | Value                                                   |
|----------------|---------------------------------------------------------|
| File Container | Background `rgba(0,0,0,0.05)`, padding 12px, radius 8px |
| Icon           | File type icon, 24px                                    |
| Filename       | 14px, 500 weight, ellipsis                              |
| File Size      | 12px, `--gray-500`                                      |
| Click Action   | Download file                                           |

---

### Message Input Component

#### Default State

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  [📎]  [📷]   Type a message...                                    [Send]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Specifications

| Property         | Value                               |
|------------------|-------------------------------------|
| Container Height | 64px (min), auto-expand up to 150px |
| Background       | `#FFFFFF`                           |
| Border Top       | 1px solid `--gray-200`              |
| Padding          | 12px 16px                           |
| Gap              | 12px                                |

#### Elements

| Element           | Specification                              |
|-------------------|--------------------------------------------|
| Attachment Button | 40px, `Paperclip` icon, `--gray-500`       |
| Image Button      | 40px, `Image` icon, `--gray-500`           |
| Text Area         | flex: 1, resize none, no border, 16px font |
| Send Button       | 40px, `Send` icon, `--aksob-primary`       |
| Send Disabled     | `--gray-300` when input empty              |

#### With Reply Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ ▌ Replying to John: Hey, how are you doing today?              [✕] │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  [📎]  [📷]   Type a message...                                    [Send]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Property             | Value                       |
|----------------------|-----------------------------|
| Reply Bar Background | `--pale-mint`               |
| Reply Bar Padding    | 8px 12px                    |
| Close Button         | 24px, `X` icon              |
| Left Border          | 3px solid `--aksob-primary` |

#### With Attachment Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌──────┐ ┌──────┐                                                          │
│  │ IMG  │ │ IMG  │  ← Thumbnail previews                                    │
│  │  ✕   │ │  ✕   │                                                          │
│  └──────┘ └──────┘                                                          │
│                                                                             │
│  [📎]  [📷]   Add a caption...                                     [Send]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Property         | Value                                |
|------------------|--------------------------------------|
| Thumbnail Size   | 60px × 60px                          |
| Thumbnail Radius | 8px                                  |
| Remove Button    | 20px circle, top-right, `--error` bg |
| Gap              | 8px                                  |

---

### Typing Indicator Component

```
┌────┐
│ JD │  John is typing
└────┘  ● ● ●
           ↑
        Animated dots
```

#### Specifications

| Property  | Value                                          |
|-----------|------------------------------------------------|
| Container | Same position as message bubble (left-aligned) |
| Avatar    | 32px                                           |
| Text      | 13px, italic, `--gray-500`                     |
| Dots      | 6px circles, `--gray-400`                      |
| Animation | Sequential bounce, 0.6s loop                   |

#### Animation Keyframes

```css
@keyframes typingDot {
  0%, 60%, 100% { 
    transform: translateY(0); 
    opacity: 0.4;
  }
  30% { 
    transform: translateY(-4px); 
    opacity: 1;
  }
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }
```

---

### New Chat Modal

#### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  New Conversation                                      [✕]  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  To:                                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔍 Search by name or email...                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Selected: ┌─────────┐ ┌─────────┐                          │
│            │ John ✕  │ │ Jane ✕  │   ← Chips                │
│            └─────────┘ └─────────┘                          │
│                                                             │
│  Suggestions                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Av] Sarah Ahmed          ● Online                  │    │
│  │      sarah.ahmed@lau.edu.lb                         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ [Av] Mike Johnson                                   │    │
│  │      mike.johnson@lau.edu.lb                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Start Conversation                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Modal Specifications

| Property      | Value                                 |
|---------------|---------------------------------------|
| Width         | 480px (desktop), 100% - 32px (mobile) |
| Max Height    | 80vh                                  |
| Background    | `#FFFFFF`                             |
| Border Radius | 16px                                  |
| Shadow        | `--shadow-lg`                         |
| Backdrop      | `rgba(0,0,0,0.5)` with blur           |

#### User Search Result Item

| Property            | Value              |
|---------------------|--------------------|
| Height              | 56px               |
| Avatar              | 40px               |
| Name                | 14px, 600 weight   |
| Email               | 12px, `--gray-500` |
| Online Dot          | 8px, right side    |
| Hover Background    | `--gray-50`        |
| Selected Background | `--pale-mint`      |

#### Selected User Chip

| Property      | Value                       |
|---------------|-----------------------------|
| Background    | `--pale-mint`               |
| Border        | 1px solid `--aksob-primary` |
| Padding       | 4px 8px 4px 12px            |
| Border Radius | 16px                        |
| Font          | 13px                        |
| Remove Icon   | 16px `X`, `--gray-500`      |

---

### Empty States

#### No Conversations

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                         💬                                  │
│                                                             │
│              No conversations yet                           │
│                                                             │
│    Start a conversation with someone from the Galaxy        │
│                                                             │
│           ┌─────────────────────────┐                       │
│           │  Start a Conversation   │                       │
│           └─────────────────────────┘                       │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### No Conversation Selected (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                         👋                                  │
│                                                             │
│              Select a conversation                          │
│                                                             │
│       Choose a chat from the sidebar to get started         │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Empty State Specifications

| Property    | Value                                       |
|-------------|---------------------------------------------|
| Icon Size   | 64px                                        |
| Icon Color  | `--gray-300`                                |
| Title       | 20px, 600 weight, `--aksob-darkest`         |
| Description | 14px, `--gray-500`, max-width 300px, center |
| Button      | Primary, margin-top 24px                    |
| Alignment   | Center (both axes)                          |

---

## Implementation

### Database Schema

File: `apps/api/src/db/schema.ts`

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
  lastMessagePreview: text("last_message_preview"),
  
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
  
  userId: text("user_id").notNull(),
  
  // Permissions
  role: text("role", { enum: ["owner", "admin", "member"] })
    .notNull().default("member"),
  
  // User-specific settings
  isMuted: integer("is_muted", { mode: "boolean" }).notNull().default(false),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  
  // Read tracking
  lastReadAt: integer("last_read_at", { mode: "timestamp" }),
  lastReadMessageId: text("last_read_message_id"),
  
  joinedAt: integer("joined_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
  leftAt: integer("left_at", { mode: "timestamp" }),
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
  
  content: text("content"),
  
  // Reply threading
  replyToId: text("reply_to_id"),
  
  // Edit/Delete tracking
  isEdited: integer("is_edited", { mode: "boolean" }).notNull().default(false),
  isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  
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
  
  type: text("type", { enum: ["image", "video", "document", "audio"] })
    .notNull(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
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
  emoji: text("emoji").notNull(),
  
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
});
```

---

### WebSocket Protocol

**Endpoint**: `ws://localhost:3000/ws/chat`

**Client → Server Events:**

| Event          | Payload                                   | Description                    |
|----------------|-------------------------------------------|--------------------------------|
| `message`      | `{ conversationId, content, replyToId? }` | Send a message                 |
| `typing_start` | `{ conversationId }`                      | User started typing            |
| `typing_stop`  | `{ conversationId }`                      | User stopped typing            |
| `mark_read`    | `{ conversationId }`                      | Mark messages as read          |
| `subscribe`    | `{ conversationId }`                      | Subscribe to conversation      |
| `unsubscribe`  | `{ conversationId }`                      | Unsubscribe from conversation  |

**Server → Client Events:**

| Event          | Payload                                          | Description                    |
|----------------|--------------------------------------------------|--------------------------------|
| `connected`    | `{ userId, subscribedConversations }`            | Connection established         |
| `message`      | `{ id, conversationId, senderId, content, ... }` | New message received           |
| `message_sent` | `{ id, conversationId }`                         | Message sent confirmation      |
| `typing`       | `{ conversationId, userId, isTyping }`           | Typing indicator update        |
| `read_receipt` | `{ conversationId, userId, readAt }`             | Read receipt received          |
| `error`        | `{ message }`                                    | Error message                  |

---

### REST API

| Method | Endpoint                           | Description               |
|--------|------------------------------------|---------------------------|
| GET    | `/chat/conversations`              | List user's conversations |
| POST   | `/chat/conversations`              | Create DM or group        |
| GET    | `/chat/conversations/:id`          | Get conversation details  |
| GET    | `/chat/conversations/:id/messages` | Get messages (paginated)  |
| GET    | `/chat/users/search?q=`            | Search users for new chat |
| POST   | `/chat/upload/presigned-url`       | Get upload URL for files  |

---

### Frontend Components

**Pages** (`apps/web/app/chat/`):
- `chat-layout.tsx` - Split view shell
- `inbox.tsx` - Default empty state
- `conversation.tsx` - Active chat view

**Components** (`apps/web/app/components/chat/`):
- `conversation-list.tsx` - Inbox sidebar
- `conversation-item.tsx` - Individual conversation item
- `message-list.tsx` - Messages container with scroll
- `message-bubble.tsx` - Single message display
- `message-input.tsx` - Compose area with attachments
- `typing-indicator.tsx` - Animated typing dots
- `user-search.tsx` - User search for new chat
- `new-chat-modal.tsx` - New conversation modal
- `chat-header.tsx` - Conversation header
- `empty-state.tsx` - Empty states

**Hooks**:
- `use-chat.ts` - WebSocket connection management
- `use-conversations.ts` - Fetch conversations
- `use-messages.ts` - Fetch messages

---

### File Structure

```
apps/
├── api/
│   └── src/
│       ├── lib/
│       │   └── websocket.ts          # WebSocket state management
│       └── modules/
│           └── chat/
│               ├── chat.routes.ts    # REST API endpoints
│               ├── chat.service.ts   # Business logic
│               ├── chat.types.ts     # TypeBox schemas
│               └── chat.ws.ts        # WebSocket handler
│
└── web/
    └── app/
        ├── lib/
        │   └── chat-client.ts        # WebSocket client
        ├── hooks/
        │   ├── use-chat.ts           # Chat WebSocket hook
        │   ├── use-conversations.ts  # Fetch conversations
        │   └── use-messages.ts       # Fetch messages
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
        └── chat/
            ├── chat-layout.tsx
            ├── inbox.tsx
            └── conversation.tsx
```

---

### Environment Variables

**Backend** (`apps/api/.env`):
```bash
# WebSocket is handled by same Elysia instance on port 3000
```

**Frontend** (`apps/web/.env`):
```bash
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws/chat
```

---

*Last Updated: February 2026*
