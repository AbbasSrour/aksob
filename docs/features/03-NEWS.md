# News

## What Is This Feature?

News is the platform's announcement and article system. Admins write and publish news articles — campus updates, alumni spotlights, event recaps, program announcements, and more. Articles appear on the public News page and can be organized by categories. Unlike Stories (which any user can write), only admins create and manage news.

---

## Who Can Do What?

| Action | Public | Student / Alumni / Faculty | Admin |
|---|---|---|---|
| Browse the News page | ✅ | ✅ | ✅ |
| Read any published article | ✅ | ✅ | ✅ |
| Create an article | ❌ | ❌ | ✅ |
| Edit an article | ❌ | ❌ | ✅ |
| Publish an article | ❌ | ❌ | ✅ |
| Unpublish an article | ❌ | ❌ | ✅ |
| Delete an article | ❌ | ❌ | ✅ |
| Create / delete categories | ❌ | ❌ | ✅ |

---

## How It Works

### The Article Lifecycle

```
[Admin Creates Article]
       |
       v
     DRAFT ────────────────────┐
       |                        |
       | (admin clicks Publish)  |
       v                        |
   PUBLISHED                    |
       |                        |
       | (admin clicks Unpublish)|
       v                        |
     DRAFT ─────────────────────┘
```

- **Draft**: Only visible to admins in the dashboard. Hidden from the public.
- **Published**: Visible to everyone on the News page. No login required.
- **Unpublish**: Returns a published article to draft. It disappears from the public page.

> **There is no user submission or approval flow.** Only admins create news. No review process — the admin decides when to publish.

### Editing Rules

| Who Edits | What Happens to Status |
|---|---|
| **Admin** editing a draft | Stays draft |
| **Admin** editing a published article | Stays published (no reset) |

> **Unlike Events and Stories**, editing does NOT reset the status. If you edit a published article and save, it stays published. The changes go live immediately.

### Visibility Rules

| Article Status | Public (no login) | Any Logged-in User | Admin |
|---|---|---|---|
| Draft | ❌ | ❌ | ✅ |
| Published | ✅ | ✅ | ✅ |

### Categories

- Categories are managed separately by admins
- An article can be assigned to one category (or none)
- Deleting a category does NOT delete its articles — they become uncategorized
- Category names must be unique
- Common categories: Campus News, Alumni Spotlight, Events, Announcements, Research

### Image Handling

- Articles support a cover image and thumbnail image
- Images can also be inserted into the article body via the rich text editor
- When you replace an image or delete an article, old images are automatically cleaned up
- Maximum image size: 4 MB per upload

---

## How To — Step by Step

All news management is done from the **Admin Dashboard**.

---

### For Admins — Admin Dashboard

---

#### 1. Create a News Article

1. Log in to the Admin Dashboard
2. Click **News** in the sidebar
3. Click **"Create Article"**
4. Fill out the form:
   - **Title**: The article headline
   - **Excerpt**: A short summary (1-2 sentences) shown in article cards
   - **Content**: The full article body using the rich text editor
   - **Cover Image**: Optional hero image
   - **Thumbnail**: Optional preview image for listings
   - **Category**: Assign to an existing category
   - **Author**: Usually yourself. Can be changed to another admin.
5. Click **"Create"**
6. The article is created with **Draft** status — visible only to you and other admins

---

#### 2. Publish an Article

1. In the Admin Dashboard, open the article (from the News list)
2. Review the content — make sure everything is correct
3. Click **"Publish"**
4. The article status changes to **Published**
5. It's now visible to everyone on the public News page

---

#### 3. Unpublish an Article

1. Open the published article in the Admin Dashboard
2. Click **"Unpublish"**
3. The article returns to **Draft** status
4. It disappears from the public News page
5. You can edit and republish it later

> **When to unpublish**: If you need to fix an error, update outdated information, or temporarily remove an article. Unlike editing (which changes go live immediately), unpublishing lets you work on it privately.

---

#### 4. Edit an Article

1. In the Admin Dashboard, find the article and open it
2. Click **"Edit"**
3. Make your changes (title, content, images, category, etc.)
4. Click **"Save"**
5. If the article was published, changes go live immediately — no need to republish

---

#### 5. Delete an Article

1. In the Admin Dashboard, open the article
2. Click **"Delete"**
3. Confirm the deletion
4. The article and all its images are permanently removed

---

#### 6. Manage Categories

1. In the Admin Dashboard, go to **News**
2. Find the categories section (in the news list or create/edit form)
3. **Create a category**: Enter a name and click "Create." Names must be unique.
4. **Delete a category**: Click delete next to the category name. Articles in that category become uncategorized (they are NOT deleted).

---

### For Everyone — Public Website

---

#### 7. Browse and Read News

1. Go to the public website
2. Click **News** in the top navigation bar
3. Browse the grid of published articles — each shows the cover image, title, excerpt, author, and read time
4. Click an article to read the full content
5. Use the **search** bar on the News page to find articles by keyword

> **Search searches across**: article titles, excerpts, and content. It only shows published articles.

---

## Common Questions

**Q: Can regular users write news articles?**

→ No. News is admin-only. If a user wants to share their story, they should use the **Stories** feature instead — any logged-in user can submit a story for admin approval.

**Q: What's the difference between News and Stories?**

| | News | Stories |
|---|---|---|
| **Who creates?** | Admins only | Any logged-in user |
| **What is it?** | Official announcements, campus news, updates | Personal achievements, career stories |
| **Review needed?** | No review — admin publishes directly | Yes — admin approves/rejects |
| **Where does it appear?** | News page, search | Stories page, Home page (featured) |

**Q: Can I schedule a news article to publish later?**

→ Not currently. Articles are either Draft or Published. If you want to prepare an article in advance, save it as Draft and publish it manually when you're ready.

**Q: I edited a published article and saved. Did it go back to draft?**

→ No. Unlike Events and Stories, editing a published News article does NOT reset its status. The changes go live immediately. If you want to work on an article privately, unpublish it first, edit, then republish.

**Q: What happens if I delete a category that has articles in it?**

→ The articles are NOT deleted. They simply become uncategorized (no category assigned). You can reassign them to a different category later.

**Q: How is read time calculated?**

→ The system estimates reading time based on the article's content length.

**Q: Can articles have multiple authors?**

→ No. Each article has one author. You can change the author when creating or editing.

**Q: Do published articles show up in search?**

→ Yes. The search bar on the News page searches across titles, excerpts, and content of published articles.
