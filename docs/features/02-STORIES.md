# Stories

## What Is This Feature?

Stories lets community members share their achievements — career milestones, entrepreneurial ventures, industry awards, social impact work, and more. Each story is a rich-text article with images, published after admin review. Stories appear on the public Stories page and on the home page as featured success stories, inspiring the community.

---

## Who Can Do What?

| Action | Public | Logged In | Author (own story) | Admin |
|---|---|---|---|---|
| Browse stories | ✅ | ✅ | ✅ | ✅ |
| View approved stories | ✅ | ✅ | ✅ | ✅ |
| Write a new story | ❌ | ✅ | — | ✅ |
| Edit a story | ❌ | ❌ | ✅ (resets to pending) | ✅ (status preserved) |
| Delete a story | ❌ | ❌ | ✅ | ✅ (any) |
| View story in any status | ❌ | ❌ | ✅ | ✅ |
| See rejection feedback | ❌ | ❌ | ✅ | ✅ |
| Approve / reject | ❌ | ❌ | ❌ | ✅ |
| Assign a different author | ❌ | ❌ | ❌ | ✅ |

**Author**: The person who wrote the story. Admins can create stories and assign any user as the author — the story appears in that user's profile as if they wrote it.

**Admin**: Can do anything on any story. Creates auto-approved (no review needed). Edits preserve the current status.

---

## Story Categories

Each story is categorized into one of nine types:

| Category | Examples |
|---|---|
| **Career Advancement** | Promotion, new role, career change |
| **Entrepreneurship** | Started a company, launched a product |
| **Industry Recognition** | Awards, honors, certifications |
| **Social Impact** | Community service, volunteering, NGO work |
| **Academic Achievement** | Research publication, degree completion, fellowships |
| **Innovation** | Patents, inventions, technical breakthroughs |
| **Leadership** | Board positions, organization leadership, mentoring programs |
| **Community Service** | LAU-specific community involvement |
| **Other** | Anything that doesn't fit the above |

---

## How It Works

### The Story Lifecycle

```
[User Creates Story]
       |
       v
    PENDING ────────────────┐
       |                     |
   ┌───┴───┐                 |
   v       v                 |
APPROVED  REJECTED           |
   |      (author sees       |
   |       review notes)     |
   |          |              |
   |    (user edits) ────────┘
   |    (resets to pending)
   v
PUBLIC (visible on stories page and home page)
```

```
[Admin Creates Story]
       |
       v
    APPROVED (skips pending — goes live immediately)
```

```
[Admin Creates Story for Another User]
       |
       v
    APPROVED (appears in that user's profile as their story)
```

> **Unlike Events, Stories has no "Draft" status.** When a user creates a story, it goes straight to **Pending** (awaiting review). There's no separate "submit" step — creating IS submitting.

### Status Meanings

| Status | What It Means | Visible Publicly? | Visible to Author? |
|---|---|---|---|
| **Pending** | Submitted for admin review. Waiting. | No | Yes |
| **Approved** | Published and visible to everyone. | Yes | Yes |
| **Rejected** | Admin declined with notes. Author can edit and it goes back to Pending. | No | Yes |

### The Two Creation Paths

| Who Creates | Initial Status | Review Needed? | Why |
|---|---|---|---|
| **Admin** | Approved | No — auto-approved | Admins are trusted to publish directly |
| **Regular User** (student, alumni, faculty) | Pending | Yes — admin must approve | Stories need admin oversight before going public |

### Editing Rules

| Who Edits | What Happens to Status | What Happens to Review Data |
|---|---|---|
| **Author** editing a rejected story | Resets to **Pending** — needs re-approval | Previous review notes are preserved (author can still see them) |
| **Author** editing an approved story | Resets to **Pending** — needs re-approval | Story disappears from public until re-approved |
| **Admin** editing any story | **Status is preserved** | Review data is preserved |

> **Important**: If you edit your approved story, it goes back to Pending and disappears from the public page. This prevents changes from going live without admin review.

### Visibility Rules

Who can see a story depends on its status and who is looking:

| Story Status | Public (no login) | Any Logged-in User | The Author | Admin |
|---|---|---|---|---|
| Pending | ❌ | ❌ | ✅ | ✅ |
| Approved | ✅ | ✅ | ✅ | ✅ |
| Rejected | ❌ | ❌ | ✅ | ✅ |

> **The Stories page** (`/stories`) only shows approved stories.  
> **The Home page** success stories section only shows approved stories.  
> **Your Profile → Stories tab** shows all your stories in every status.

### Image Handling

- Stories support a **cover image** (hero) and a **thumbnail image** (small preview)
- Images are uploaded directly in the story editor
- The rich text editor also supports inserting images into the story body
- When you replace an image or delete a story, old images are automatically cleaned up
- Each image upload has a size limit (8 MB per image)

---

## How To — Step by Step

---

### For Regular Users — Public Website

---

#### 1. Write a Story

1. Log in to the public website
2. Click your **avatar** (top-right) and go to **Profile**
3. Click the **Stories** tab
4. Click the **"Create Story"** button (top-right)
5. The story editor opens with three areas:
   - **Main editor** (left): Cover image upload, title, description, and the rich text editor where you write your story
   - **Sidebar** (right): Choose a category, set the story date, upload a thumbnail
6. Write your story using the formatting toolbar: bold, italic, headings, lists, quotes, links, and images
7. Click **"Create Story"** at the bottom
8. Your story is created with **Pending** status — it goes directly to the admin review queue

> **No separate "Submit" step**: Unlike events, creating a story automatically submits it for review. You cannot save as draft — it goes straight to pending.

---

#### 2. Edit Your Story

1. Go to **Profile → Stories tab**
2. Find your story — you'll see a status badge (Pending / Approved / Rejected)
3. Click the **edit icon** (pencil) on the story card, or open the story and click Edit
4. Make your changes in the editor
5. Click **"Save"**
6. The story status resets to **Pending** (even if it was previously approved)
7. An admin must re-approve it before it's public again

---

#### 3. Delete Your Story

1. Go to **Profile → Stories tab**
2. Open the story you want to delete
3. Click the **"Delete"** button at the bottom of the editor
4. Confirm the deletion
5. The story and all its images are permanently removed

---

#### 4. See Admin Feedback on a Rejected Story

1. Go to **Profile → Stories tab**
2. Find the story with a **"Rejected"** badge
3. Click the story to open it
4. The rejection feedback is displayed — the admin's review notes explaining why it was rejected
5. Click **"Edit"** to make changes and resubmit — the story goes back to Pending automatically

---

### For Admins — Admin Dashboard

---

#### 5. Create a Story (Auto-Approved)

1. Log in to the Admin Dashboard
2. Click **Stories** in the sidebar
3. Click **"Create Story"**
4. Fill out the story form. You can also:
   - **Assign an author**: Select any user as the author — the story will appear in their profile
   - **Leave yourself as author**: If you don't select someone else, you're the author
5. Click **"Create"**
6. The story is created with **Approved** status — immediately public

> **Creating for another user**: Use the author dropdown to select someone else. This is useful when admins want to publish a story on behalf of an alumnus who doesn't use the platform, or to migrate content.

---

#### 6. Approve or Reject a Submitted Story

1. In the Admin Dashboard, click **Stories** in the sidebar
2. Use the status filter to show **"Pending"** stories
3. Click a story to open its detail/edit page
4. Read the story content, check the category and date
5. Click **"Approve"** — the story is published immediately, visible on the Stories page and home page
6. Or click **"Reject"** — you must provide review notes. The author sees these notes and can edit + resubmit.

> **The author does not get a notification.** They need to check their Profile → Stories tab to see the updated status and feedback.

---

#### 7. Edit Any Story

1. In the Admin Dashboard, find the story and open it
2. Click **"Edit"**
3. Make changes (content, category, date, images, author)
4. Click **"Save"**
5. **The story's status is preserved** — admin edits do NOT reset it to pending. If it was approved, it stays approved.

---

#### 8. Delete Any Story

1. In the Admin Dashboard, open the story
2. Click **"Delete"**
3. Confirm the deletion
4. The story and all its images are permanently removed

> **Admin can delete any story** regardless of status or author. Regular users can only delete their own stories.

---

## Common Questions

**Q: I wrote a story. Why isn't it showing on the public Stories page?**

→ It's in "Pending" status. An admin needs to approve it first. Check your Profile → Stories tab to see the current status.

**Q: How is this different from Events? In Events I have to "Submit for Review" separately.**

→ Correct. Stories go straight to Pending when you create them — there's no separate "submit" button. Events have a "Draft" phase where you can save your work before submitting. Stories don't have drafts — creating IS submitting.

**Q: My story was rejected. What do I do?**

→ Open the story from your Profile → Stories tab. You'll see the admin's review notes explaining why. Click "Edit," make the changes, and save — it automatically goes back to Pending for re-review.

**Q: I edited my approved story and now it's gone from the public page. What happened?**

→ When an author edits a story, it resets to "Pending" and needs re-approval. This is by design — changes need admin review before going public again.

**Q: As an admin, can I publish a story for someone else?**

→ Yes. When creating a story from the Admin Dashboard, use the author dropdown to select any user. The story appears in their profile as if they wrote it, and it starts as Approved (auto-published).

**Q: What's the difference between the cover image and the thumbnail?**

→ The **cover image** is the large hero image at the top of the story. The **thumbnail** is a smaller version used in story cards on the Stories page, home page, and profile. If you don't upload a separate thumbnail, the system may use the cover image instead.

**Q: Can I include images inside my story (not just as cover)?**

→ Yes. The rich text editor has an image button that lets you insert images directly into the story body, between paragraphs.

**Q: What happens to images when I delete or replace them?**

→ Old images are automatically removed from storage. You don't need to clean them up manually.

**Q: How many stories can I write?**

→ No limit. Write as many as you want. Each one goes through the same review process.

**Q: Can I change the category after publishing?**

→ Yes, but editing the story resets it to Pending and it needs re-approval.
