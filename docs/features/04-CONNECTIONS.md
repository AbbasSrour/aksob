# Connections

## What Is This Feature?

Connections is the platform's AI-powered matching system. It helps community members find each other for mentorship, career coaching, study partnerships, research collaboration, and more. You tell the system what kind of connection you're looking for, and it uses AI to match you with the most compatible people. You can then send a connection request, chat, and manage your professional relationships — all from one place.

---

## Connection Types

There are six types of connections. Which ones you can use depends on your user type.

| Connection Type | What It's For | Students | Alumni | Faculty |
|---|---|---|---|---|
| **Mentorship** | Find a mentor or become one | ✅ | ✅ | ✅ |
| **Career Coaching** | Get career advice or coach others | ✅ | ✅ | ✅ |
| **Study Partner** | Find someone to study with | ✅ | ❌ | ❌ |
| **Buddy** | Make friends in the community | ✅ | ❌ | ❌ |
| **Research** | Collaborate on research projects | ✅ | ✅ | ✅ |
| **Project** | Work on projects together | ✅ | ✅ | ✅ |

> **Why the restrictions?** Study Partner and Buddy are student-focused. Faculty and Alumni can still use the other four types — Mentorship, Career Coaching, Research, and Project.

---

## How It Works

### The Connection Lifecycle

```
[You find a match using AI]
       |
       v
[You send a connection request] ──> PENDING ──────────────┐
                                       |                    |
                           ┌───────────┴───────────┐        |
                           v                       v        |
                        ACTIVE                  DECLINED    |
                           |                       |        |
                           | (either person        |        |
                           |  clicks Complete)      |        |
                           v                       |        |
                       COMPLETED                   |        |
                                                   |        |
                      [You cancel before           |        |
                       they respond] ──────────────┘        |
                           |                                |
                           v                                |
                       CANCELLED ◄──────────────────────────┘
```

### Status Meanings

| Status | What It Means | Next Step |
|---|---|---|
| **Pending** | You sent a request. Waiting for the other person to respond. | They can Accept or Decline. You can Cancel. |
| **Active** | Both people accepted. The connection is live. | Either person can Complete it. Either can Cancel it. |
| **Declined** | The other person declined your request. | No further action. You can send a new request to someone else. |
| **Cancelled** | The request was cancelled (by you, or mutually during active). | No further action. |
| **Completed** | The connection has concluded. | No further action. |

---

### Prerequisites for Being Matched

Before you can use Connections, three things must be set up on your profile:

1. **Your profile must be complete** — You need to finish onboarding (education, skills, experience all help the AI make better matches)
2. **You must be visible in the Galaxy** — Toggle "Visible in Galaxy" ON in your Profile → Privacy settings
3. **You must choose which connection types you're open to** — In your Profile → Privacy settings, check the boxes for the connection types you want to receive requests for

> **If these aren't set**: You won't appear as a match for other people, and the system won't suggest matches for you.

---

### How AI Matching Works

The matching system runs in two phases when you click "Find Connections":

**Before matching starts**, the system builds a profile summary from your education, skills, goals, hobbies, experience, and bio. This summary is converted into a mathematical "embedding" — a set of numbers that represents who you are and what you're looking for. Every user with a complete profile has one of these embeddings.

**Phase 1 — Similarity Check**:  
The system compares your embedding against every eligible candidate's embedding using cosine similarity — a mathematical measure of how similar two profiles are. Think of it as: "How close are this person's skills, goals, and background to mine?" Candidates are ranked by similarity score and the top 5 move to the next phase.

**Phase 2 — AI Selection**:  
The top 5 candidates, along with their profiles and similarity scores, are sent to an AI language model. The AI is asked: "Given what the requester is looking for, which of these 5 is the best match and why?" The AI picks the best match and writes a short explanation.

**Results**: You see the AI's top pick, with the explanation of why they were matched with you. You can browse other candidates too.

**Fallback**: If the AI or embedding system isn't available, the system falls back to a simpler similarity-only ranking. You'll still get matches — they just won't come with a personalized explanation.

---

### Rate Limiting

- **Maximum 50 connection requests per day** — This is across all connection types combined
- The counter resets each day at midnight
- This prevents spam and encourages thoughtful requests

---

### Duplicate Prevention

You cannot send a connection request to someone if:
- You already have an active, pending, or completed connection with them (any type)
- They already sent you a request that's still pending

---

## How To — Step by Step

---

### For All Users — Public Website

---

#### 1. Set Up Your Profile for Connections

Before using connections, configure your preferences:

1. Go to your **Profile**
2. Click the **About** tab
3. Scroll to the **Privacy** section
4. Make sure **"Visible in Galaxy"** is toggled ON
5. Under **"Open to connections,"** check the types you want:
   - Students: all six types available
   - Alumni / Faculty: Mentorship, Career Coaching, Research, Project
6. Click **"Save"**

> **Without this step**: You won't show up in other people's match results, and you won't be able to find matches either.

---

#### 2. Find a Connection Match (from the Galaxy)

This is the AI-powered matching flow, accessed from the 3D Galaxy visualization.

1. Go to the **Galaxy** page
2. Wait for the intro animation to finish (or skip it)
3. Click the **"Find Connections"** button (bottom of the screen)
4. **Step 1 — Choose type**: A panel slides up showing the connection types available to you. Click the one you want (e.g., "Mentorship").
5. **Step 2 — Describe what you want**: Write a brief description of what you're looking for. For example: "I'm looking for a mentor in data science who can guide me on career paths." This helps the AI understand your goals.
6. **Step 3 — AI finds matches**: The system processes your request. You'll see a "Finding connection options" status while the AI works.
7. **Results**: Match cards appear at the bottom of the screen. Each card shows:
   - The person's name, program, and graduation year
   - Their bio
   - Navigation arrows to browse between matches

> **If no matches are found**: The system may not have enough candidates who match your criteria and connection type. Try a different connection type or make sure your own profile is complete.

---

#### 3. Send a Connection Request

1. After finding matches, browse through them using the left/right arrows
2. When you find someone you'd like to connect with, click **"Send Request"**
3. The request is sent with your message (the description you wrote in Step 2)
4. The card changes to **"Request Sent"** — you can continue browsing other matches
5. The request now appears in your **Profile → Connections tab** with status "Pending"

> **The person you requested doesn't get a notification.** They need to check their Profile → Connections tab to see incoming requests.

---

#### 4. Accept or Decline an Incoming Request

When someone sends you a connection request:

1. Go to your **Profile**
2. Click the **Connections** tab
3. You'll see tabs: All, Active, **Pending**, Cancelled, Completed
4. Click **Pending** to see incoming requests
5. Each request card shows:
   - Who sent it (name, avatar)
   - Connection type (e.g., "Mentorship")
   - Date sent
   - Their message (if any)
6. Click **"Accept"** to connect — the status changes to Active
7. Click **"Decline"** to reject — the status changes to Declined

> **Accepting creates an active connection**: Once accepted, both people can start a chat conversation from the connection, and either person can mark it as complete later.

---

#### 5. Cancel a Request You Sent

If you change your mind before the other person responds:

1. Go to **Profile → Connections tab**
2. Find the request under **Pending** (it will show as sent by you)
3. Click **"Cancel"**
4. The status changes to Cancelled

---

#### 6. Complete an Active Connection

When a connection has served its purpose (e.g., the mentorship period ended, the project is done):

1. Go to **Profile → Connections tab**
2. Find the connection under **Active**
3. Click **"Complete"**
4. The status changes to Completed

> **Either person can complete a connection**. Both people will see it as completed. You can still view completed connections in your history.

---

#### 7. View and Manage All Your Connections

1. Go to your **Profile → Connections tab**
2. Use the tabs to filter:
   - **All** — Every connection regardless of status
   - **Active** — Currently active connections
   - **Pending** — Requests waiting for response (incoming and outgoing)
   - **Cancelled** — Requests you or the other person cancelled
   - **Completed** — Finished connections
3. Each card shows the other person's name, connection type, status, and date

---

## Common Questions

**Q: How does the AI actually find matches for me?**

→ It compares your profile (education, skills, goals, hobbies, experience) against other users who are open to the same connection type. It ranks them by compatibility and returns the best matches with an explanation.

**Q: Why can't I see certain connection types?**

→ Your available connection types depend on whether you're a Student, Alumni, or Faculty. Students have all six types. Alumni and Faculty have four (they don't have Study Partner and Buddy — those are student-focused).

**Q: I'm not showing up in other people's match results. Why?**

→ Check three things in your Profile → Privacy settings:
1. Is "Visible in Galaxy" ON?
2. Did you check the connection types you're open to?
3. Is your profile complete (onboarding done)?

**Q: How many requests can I send per day?**

→ 50 per day across all connection types. The limit resets daily.

**Q: Can I send a request to the same person twice?**

→ Not if you already have any connection with them (pending, active, completed, declined, or cancelled of any type). The system prevents duplicates.

**Q: What happens after someone accepts my request?**

→ The connection becomes Active. You can now chat with them (via the Chat feature). Either person can later mark the connection as Completed.

**Q: Does the other person get notified when I send a request?**

→ Not directly. They need to check their Profile → Connections tab to see incoming requests. There's a small indicator dot on the bell icon in the navigation bar hinting at pending activity, but no email or push notification.

**Q: Can I change my connection type preferences later?**

→ Yes. Go to Profile → Privacy settings, check/uncheck connection types, and save. Changes take effect immediately.

**Q: What's the difference between Connections and Chat?**

→ Connections is about **finding and forming relationships** — the matching and request flow. Chat is about **communicating** once you're connected. You can chat with anyone you have an active connection with.

**Q: Can I search for a specific person instead of using AI matching?**

→ Not currently. The AI matching system suggests candidates based on compatibility. If you know exactly who you want to connect with, you can browse the Galaxy, click their star, and start a chat directly — but that creates a DM conversation, not a formal connection.
