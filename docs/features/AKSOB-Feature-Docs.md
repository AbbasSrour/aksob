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
# Authentication (Sign Up & Login)

## What Is This Feature?

Authentication is how users create accounts and sign in. It handles registration, login, password resets, and email verification. Once signed up, every new user goes through onboarding before they can access the full platform.

---

## Who Can Do What?

| Action | Anyone | Logged In |
|---|---|---|
| Register a new account | ✅ | ❌ |
| Log in | ✅ | ❌ |
| Request a password reset | ✅ | ❌ |
| Reset password (with token) | ✅ | ❌ |
| Verify email (with token) | ✅ | ✅ |
| Log out | ❌ | ✅ |

---

## How It Works

### Registration

1. User fills out: **name**, **email**, **password**, and selects a **user type** (Student, Alumni, or Faculty)
2. Account is created immediately — no email confirmation required to start using the platform
3. User is taken directly to **onboarding**
4. Email verification is optional — the user can verify later from their profile

> **Default admin account**: The system automatically creates `admin@aksob.lau.edu.lb` on first startup. The password is set by the system administrator. This admin account has full platform access.

### Login

- Email + password authentication
- "Keep me signed in" checkbox — extends the session duration
- Sessions last **7 days** by default
- On login, user is redirected to the **Galaxy** page (or the page they were trying to access before logging in)

### Password Reset

1. User clicks "Forgot password" on the login page
2. Enters their email address
3. A reset link is sent to their email
4. User clicks the link, enters a new password
5. Redirected to login to sign in with the new password

### Email Verification

- Optional — users can use the platform without verifying their email
- Verification link is sent to the user's email
- After clicking the link, the email is marked as verified
- Users can request a new verification email from their profile

### User Types

The user type is set **once at registration** and determines what features are available:

| Type | Who Should Choose It |
|---|---|
| **Student** | Currently enrolled at LAU |
| **Alumni** | Graduated from LAU |
| **Faculty** | Teaching or working at LAU |

> The user type affects which connection types you can use and which profile fields you see. It cannot be changed after registration.

---

## How To — Step by Step

---

#### 1. Register a New Account

1. Go to the public website
2. Click **"Join"** (top-right) or go to `/auth/register`
3. Fill in:
   - **Name**: Your full name
   - **Email**: A valid email address
   - **Password**: At least 8 characters (a strength indicator shows how strong it is)
   - **User Type**: Select Student, Alumni, or Faculty
4. Click **"Create Account"**
5. You're taken to the **onboarding wizard** to complete your profile

---

#### 2. Log In

1. Go to the public website
2. Click **"Login"** (top-right) or go to `/auth/login`
3. Enter your email and password
4. Optionally check **"Keep me signed in"**
5. Click **"Sign In"**
6. You're taken to the Galaxy page

---

#### 3. Reset Your Password

1. From the login page, click **"Forgot password?"**
2. Enter your email address
3. Click **"Send Reset Link"**
4. Check your inbox for the password reset email
5. Click the link in the email (takes you to `/auth/reset-password?token=...`)
6. Enter a new password and confirm it
7. Click **"Reset Password"**
8. Go back to the login page and sign in with your new password

---

#### 4. Verify Your Email

1. Check your inbox for the verification email (sent after registration)
2. Click the verification link
3. You'll see a confirmation that your email is verified
4. If the link expired, go to your profile and click "Resend verification email"

---

#### 5. Log Out

1. Click your **avatar** (top-right)
2. Click **"Log Out"**

---

## Common Questions

**Q: Do I need to verify my email to use the platform?**

→ No. Email verification is optional. You can use all features without it. It's recommended for account recovery.

**Q: Can I change my user type after registration?**

→ No. Student, Alumni, and Faculty types are fixed at registration. If you selected the wrong one, contact an admin.

**Q: What happens if I forget my password?**

→ Use the "Forgot password" link on the login page. You'll receive a reset email. If you don't see it, check your spam folder.

**Q: Is there a limit on login attempts?**

→ No. But the session expires after 7 days and you'll need to log in again.

**Q: Can I use Google or social login?**

→ Not yet. Only email and password authentication is supported.

**Q: What's the default admin account?**

→ `admin@aksob.lau.edu.lb` is created automatically on first startup. The password is set in the system configuration — ask the system administrator.
# Onboarding

## What Is This Feature?

Onboarding is the profile setup wizard every new user goes through after registration. It's a 6-step walkthrough that collects your education, work experience, skills, goals, and visibility preferences. Completing onboarding unlocks the full platform and enables AI-powered connection matching.

---

## Who Sees Onboarding?

- **New users**: Taken to onboarding immediately after registration
- **Returning users who skipped it**: Redirected to onboarding when they try to access most pages (except the home page and Galaxy)
- **Completed users**: Never see onboarding again
- **Users who took >7 days**: A gentle reminder banner appears at the top of the page

---

## How It Works

### The 6 Steps

| Step | What You Do | Why It Matters |
|---|---|---|
| **0. Welcome** | See feature highlights. Click "Build Your Profile." | Sets expectations |
| **1. Education** | Add your academic programs and graduation year. Mark one as primary. | Used for Galaxy clustering and connection matching |
| **2. Experience** | Add work positions: title, company, dates. Mark current positions. | Helps the AI find relevant connections |
| **3. Skills & Goals** | Add tags for your skills, goals, and hobbies/interests. | Core data the AI uses to find matches |
| **4. Visibility** | Choose: visible in Galaxy? Show email? Show phone? Which connection types are you open to? | Controls who can find you and how |
| **5. Done** | Confirmation screen with "Find My First Connection" button. | Takes you to the Galaxy to start connecting |

### Skip Behavior

- You can skip onboarding at any step (each page has a skip link)
- Skipping takes you to the Galaxy page
- Your profile data (whatever you filled so far) is saved
- You'll be prompted to complete onboarding later when you try to access most pages

### The Nudge Banner

If you haven't completed onboarding after 7 days:
- A banner appears at the top of every page
- It says: "Complete your profile to get better AI-powered connections"
- Clicking it takes you back to onboarding
- The banner disappears once you complete onboarding

### What Happens When You Complete

1. Your onboarding status is set to **complete**
2. The system generates an **AI profile embedding** — a mathematical representation of your skills, goals, education, and experience
3. This embedding is what powers the connection matching system
4. You're now fully visible (if you chose to be) and can use all features

---

## How To — Step by Step

---

#### 1. Go Through Onboarding (New User)

After registering, you're automatically taken to onboarding. If you skipped it and want to return:

1. Go to any non-public page (e.g., try to access Profile or Events)
2. You'll be redirected to `/onboarding`
3. Follow the wizard steps:
   - **Step 0**: Read the highlights, click **"Build Your Profile"**
   - **Step 1**: Search for your academic program in the dropdown, select it, add graduation year. Click **"Next"**
   - **Step 2**: Add work experiences — title, company, dates. Toggle "currently working here" if applicable. You can add multiple. Click **"Next"**
   - **Step 3**: Type a skill and press Enter to add it. Do the same for goals and hobbies. Click **"Next"**
   - **Step 4**: Toggle "Visible in Galaxy" ON. Choose which connection types you're open to. Set email/phone visibility. Click **"Next"**
   - **Step 5**: Review your info. Click **"Find My First Connection"** to go to the Galaxy, or click **"Done"** to go to your profile

---

#### 2. Skip Onboarding

1. At any step, click the **"Skip"** link
2. You're taken to the Galaxy page
3. Your partial data is saved
4. You can return later — you'll be redirected automatically when you try to access protected pages

---

## Common Questions

**Q: Can I change my answers later?**

→ Yes. Everything you set during onboarding can be updated from your **Profile → About tab** at any time.

**Q: What happens if I skip onboarding entirely?**

→ You can still browse the Galaxy and read public content. But you won't appear in other people's match results, and you'll be redirected to onboarding when you try to access most features.

**Q: Why do I need to complete onboarding for connections?**

→ The AI matching system needs your education, skills, and goals to find compatible people. Without this data, the system can't make meaningful matches.

**Q: Can I redo onboarding?**

→ Once completed, you can't restart onboarding. But you can edit all the same information from your **Profile**.

**Q: I set "Visible in Galaxy" to OFF during onboarding. Can people still find me?**

→ No. You won't appear in the Galaxy visualization or in connection match results. You can change this anytime in Profile → Privacy settings.
# User Profiles & Visibility

## What Is This Feature?

Your profile is your identity on the platform. It stores your education, work experience, skills, goals, social links, and privacy preferences. It's also where you manage your connections, events, and stories — everything you create on the platform lives under your profile.

---

## Who Can Do What?

| Action | Anyone | Logged In (own profile) | Logged In (others) |
|---|---|---|---|
| View basic profile info | ✅ | ✅ | ✅ |
| View full profile details | ✅ (if visible) | ✅ | ✅ (if visible) |
| Edit profile sections | ❌ | ✅ | ❌ |
| Change privacy settings | ❌ | ✅ | ❌ |
| Upload avatar | ❌ | ✅ | ❌ |

---

## Profile Sections

Your profile has **4 tabs**:

| Tab | What's There |
|---|---|
| **About** | Your info, education, experience, skills, links, and privacy settings — all editable |
| **Connections** | All your connections, filterable by status |
| **Events** | Events you created, with Upcoming/Past tabs and a Create button |
| **Stories** | Stories you wrote, with status badges and a Create button |

---

### About Tab — Editable Sections

| Section | What You Set | How It's Used |
|---|---|---|
| **Header** | Name, bio, avatar, phone number | Displayed everywhere — Galaxy, events, chat, stories |
| **Education** | Academic programs, graduation year, primary program | Galaxy clustering, connection matching |
| **Experience** | Work positions, titles, companies, dates | Connection matching, profile display |
| **Skills & Goals** | Tags for skills, goals, and hobbies | Core data for AI connection matching |
| **Links** | Social profiles (LinkedIn, GitHub, Twitter, Website, Other) | Displayed on your profile |
| **Privacy** | Galaxy visibility, email/phone visibility, connection type preferences | Controls who can find and contact you |

---

## How Visibility Works

This is the most important section of your profile. Your visibility settings control how you appear to others.

### The Visibility Gate

**"Visible in Galaxy"** is the master toggle:

| Visible in Galaxy | What Happens |
|---|---|
| **ON** | You appear in the Galaxy visualization, in search results, and in connection matching. You can set email/phone visibility and connection preferences. |
| **OFF** | You're hidden from the Galaxy, search, and match results. All your exposure settings (email, phone, connection types) are automatically cleared. |

> **The gate rule**: You cannot show your email, phone number, or open yourself to connections while invisible. If you turn visibility OFF, everything else turns OFF automatically.

### Email & Phone Visibility

| Setting | OFF | ON |
|---|---|---|
| **Email visible** | Email hidden from other users | Email shown on your profile |
| **Phone visible** | Phone hidden from other users | Phone shown on your profile |

### Connection Type Preferences

You choose which connection types you're open to receiving requests for. Your available options depend on your user type:

| Available To | Connection Types |
|---|---|
| **Students** | Mentorship, Career Coaching, Study Partner, Buddy, Research, Project |
| **Alumni & Faculty** | Mentorship, Career Coaching, Research, Project |

> You must check at least one connection type for the system to suggest you as a match to others.

---

## How To — Step by Step

---

#### 1. View Your Profile

1. Click your **avatar** (top-right) and select **"Profile"** from the dropdown
2. You land on the **About** tab showing your current info

---

#### 2. Edit Your Basic Info (Name, Bio, Avatar)

1. On the About tab, find the header section at the top
2. Click your **avatar** to upload a new photo (or change it)
3. Click the **edit icon** next to your name to change your name or bio
4. Click **"Save"** to apply changes

---

#### 3. Add or Edit Education

1. On the About tab, scroll to the **Education** section
2. Click **"Edit"**
3. Select a program from the dropdown, add a graduation year
4. Mark one program as **"Primary"** — this is the one shown in the Galaxy
5. Add more programs or remove existing ones
6. Click **"Save"**

---

#### 4. Add or Edit Work Experience

1. On the About tab, scroll to the **Experience** section
2. Click **"Edit"**
3. Add a position: title, company, type
4. Set start and end dates. Toggle **"Currently working here"** if applicable.
5. Add multiple positions — they're listed chronologically
6. Click **"Save"**

---

#### 5. Manage Skills, Goals & Hobbies

1. On the About tab, scroll to the **Skills & Interests** section
2. Click **"Edit"**
3. You'll see three fields: Skills, Goals, Hobbies
4. Type a tag and press **Enter** to add it
5. Click the **X** on a tag to remove it
6. Click **"Save"**

> **Be specific**: Instead of "tech," use "Machine Learning," "React," or "Data Analysis." Specific tags lead to better connection matches.

---

#### 6. Add Social Links

1. On the About tab, scroll to the **Links** section
2. Click **"Edit"**
3. Choose a platform from the dropdown: LinkedIn, GitHub, Twitter, Website, or Other
4. Enter the full URL
5. Add multiple links
6. Click **"Save"**

---

#### 7. Configure Privacy Settings

1. On the About tab, scroll to the **Privacy** section
2. Click **"Edit"**
3. **Visible in Galaxy**: Toggle ON to appear in the Galaxy and match results
4. **Email visible**: Toggle ON to show your email on your profile
5. **Phone visible**: Toggle ON to show your phone on your profile
6. **Open to connections**: Check the boxes for the connection types you want to receive requests for
7. Click **"Save"**

> **If you turn "Visible in Galaxy" OFF**: All other toggles (email, phone, connections) are automatically turned OFF and cleared.

---

## Common Questions

**Q: Can other users see my email?**

→ Only if you toggle "Email visible" ON in your Privacy settings. By default, it's hidden.

**Q: What does "Visible in Galaxy" actually do?**

→ When ON, you appear as a star in the 3D Galaxy visualization and in connection match results. When OFF, you're completely hidden from other users in those places — but you can still use the platform, create events, write stories, and chat.

**Q: If I turn off Galaxy visibility, can I still use connections?**

→ You won't appear in other people's match results, and you can't find matches yourself. The system needs you to be visible to make matching work.

**Q: Can I see who viewed my profile?**

→ No. Profile views are not tracked.

**Q: How do I change my user type (Student / Alumni / Faculty)?**

→ You can't. The user type is set at registration. Contact an admin if you need it changed.

**Q: Can I change my primary program later?**

→ Yes. Edit your Education section, select a different program as Primary, and save.

**Q: Do my skills and tags affect connection matching?**

→ Yes — they're the primary data the AI uses to find compatible connections. The more specific and accurate your tags, the better your match results.
# Events

## What Is This Feature?

Events lets community members create and manage gatherings — workshops, conferences, meetups, and more. Attendees can register, get email reminders, and check in with QR tickets. Admins review events before they go live.

## Who Can Do What?

### Base Abilities (by user type)

| Action | Public | Logged In |
|---|---|---|
| Browse events | ✅ | ✅ |
| View approved event details | ✅ | ✅ |
| Create a new event | ❌ | ✅ |
| Register for events | ❌ | ✅ |
| Cancel your registration | ❌ | ✅ |

### Extra Powers on Events You're Involved With

| Action | Owner | Organizer | Admin |
|---|---|---|---|
| Edit the event | ✅ (draft/rejected only) | ✅ (any status) | ✅ (any event) |
| Delete the event | ✅ (draft only) | ❌ | ✅ (any event) |
| Submit for review | ✅ | ✅ | Auto-approved |
| Cancel the event | ✅ | ❌ | ✅ |
| Close / reopen registration | ✅ | ✅ | ✅ |
| Add / remove organizers | ✅ | ❌ | ✅ |
| View attendee list | ✅ | ✅ | ✅ |
| Approve / reject attendees | ✅ | ✅ | ✅ |
| Check-in attendees | ✅ | ✅ | ✅ |
| Approve / reject event | ❌ | ❌ | ✅ |

**Owner vs. Organizer**: The person who creates the event is the Owner. Organizers are people the owner adds to help run things. Organizers can do almost everything — except delete, cancel, or add more organizers.

**Admin**: Can do anything on any event. Creates auto-approved (no review needed). Edits preserve the current status.

---

## How It Works

### The Lifecycle

```
User creates → DRAFT ──(submit)──> PENDING REVIEW ──> APPROVED or REJECTED
                                                           |
                              REJECTED ──(edit)──> back to PENDING REVIEW
                                                           |
                              APPROVED ──(start date)──> IN PROGRESS ──(end date)──> COMPLETED
                                                           |
                              (owner or admin cancels) ──> CANCELLED
```

```
Admin creates → APPROVED (skips draft and review)
```

| Status | Meaning | Public? |
|---|---|---|
| **Draft** | Still editing, not submitted | No |
| **Pending Review** | Waiting for admin approval | No |
| **Approved** | Live, registration open | Yes |
| **Rejected** | Admin declined with a reason. Edit to resubmit. | No |
| **In Progress** | Event is happening | Yes |
| **Completed** | Event ended | Yes |
| **Cancelled** | Cancelled before end | Yes (marked cancelled) |

### Two Creation Paths

The same form behaves differently depending on who fills it:

| Who | Initial Status | Why |
|---|---|---|
| **Admin** | Approved (live immediately) | Admins are trusted |
| **Regular user** | Draft (must submit + get approved) | Events need oversight |

### Editing Rules

| Who Edits | Effect |
|---|---|
| **Owner** editing a draft | Stays draft |
| **Owner** editing a rejected event | Resets to draft, clears rejection reason |
| **Owner** editing an approved event | **Resets to draft — disappears from public until re-approved** |
| **Admin** editing any event | Status is preserved, stays live |

### Registration

**Open mode**: Instant confirmation. Ticket token generated.  
**Approval mode**: Goes to "Pending" — organizer must approve or reject.

**Capacity**: If full, new registrants go on **waitlist**. When someone cancels, the first waitlisted person is auto-promoted.

**Cannot register if**: You're the owner/organizer, already registered, past the deadline, or registration is closed.

### Registration Statuses

| Status | Meaning |
|---|---|
| **Pending** | Awaiting organizer approval (approval mode) |
| **Approved** | Confirmed, has ticket token |
| **Rejected** | Organizer declined |
| **Cancelled** | User cancelled their registration |
| **Waitlisted** | Event full, queued for a spot |

---

## How To — Step by Step

> **Where to do each action**: The platform has two apps. The **Public Website** is where regular users browse, create, and register. The **Admin Dashboard** is where admins review, approve, and manage everything.

---

### For Regular Users — Public Website

These steps are done on the public-facing website (the one with the galaxy).

---

#### 1. Create an Event

1. Log in to the public website
2. Click your **avatar** (top-right) and go to **Profile**, or click your name in the navigation
3. Click the **Events** tab on your profile
4. Click the **"Create Event"** button (top-right of the Events section)
5. Fill out the form:
   - **Basic Info**: Title, description, and an optional cover image
   - **Type & Location**: Choose In-Person, Online, or Hybrid. Fill location and/or meeting URL as needed.
   - **Date & Time**: Start date, end date, and registration deadline
   - **Registration Settings**: Enable registration, choose Open or Approval mode, set capacity, decide if check-in is needed
5. Click **"Create Event"**
6. You're taken to the event page. The event is in **Draft** status — visible only to you.

> **Fields to pay attention to**:
> - If you choose In-Person, you **must** provide a location.
> - If you choose Online or Hybrid, you **must** provide a meeting URL.
> - The registration deadline must be **before** the event start date.
> - The start date must be **before** the end date.
> - Leave capacity blank for unlimited attendees.

---

#### 2. Submit Your Event for Review

1. Go to your event page (click it from **Profile → Events tab** or from the direct URL)
2. Verify all details are correct — you can still edit at this point
3. Click the **"Submit for Review"** button
4. The status badge changes from **Draft** to **Pending Review**
5. An admin will now see it in their review queue

> **What happens next**: You wait. There's no notification when an admin reviews it — check back on your event page or Profile → Events to see the updated status.

---

#### 3. Register for an Event

1. Browse the **Events** page to find approved events
2. Click an event card to see its details
3. Review the date, time, location, and description
4. Click the **"Register"** button
5. Depending on the event's registration mode:
   - **Open mode**: You're instantly confirmed. A ticket token and confirmation appear on screen. You also get a confirmation email (if emails are configured).
   - **Approval mode**: You see "Pending — waiting for organizer approval." You'll be notified when the organizer acts on your registration.
6. If the event is full, you'll be placed on the **waitlist** instead.

> **You cannot register if**: You're the event owner, you're an organizer on this event, you're already registered, the registration deadline has passed, or registration was manually closed.

---

#### 4. Cancel Your Registration

1. Go to the event page where you're registered
2. Find the registration panel — it shows your current status
3. Click **"Cancel Registration"**
4. Confirm the cancellation
5. Your spot is freed. If there's a waitlist, the first waitlisted person is automatically promoted.

---

#### 5. Edit Your Event

1. Go to your event page (find it under **Profile → Events tab**)
2. Click the **"Edit"** button
3. Make your changes
4. Click **"Save"**
5. The event behavior depends on its current status:
   - Was **Draft** → stays Draft
   - Was **Rejected** → resets to Draft (rejection reason is cleared, you'll need to resubmit)
   - Was **Approved** → resets to Draft (disappears from public, needs re-approval)
   - Was **In Progress or Completed** → you can no longer edit

> **"Notify attendees of changes" checkbox**: When editing an already-published event, you'll see a checkbox asking if you want to email all registrants about the changes. Check it if the changes matter to them.

#### 6. Delete Your Event

1. Go to your event page — must be in **Draft** status
2. Click **"Delete"**
3. Confirm the deletion
4. You can only delete your own events when they're in Draft. Once submitted or approved, only an admin can delete.

---

### For Event Owners & Organizers — Public Website

These additional actions are available on events you own or help organize. Access them from the event page.

---

#### 7. Add a Co-Organizer

1. Go to your event page (you must be the **Owner** — organizers cannot add other organizers)
2. Find the **Organizers** section
3. Click **"Add Organizer"**
4. Search for the person by name
5. Select them from the results
6. They instantly gain organizer powers on this event (can edit, manage attendees, check-in)

> **Removing an organizer**: Click the remove icon next to their name. Only the Owner or an Admin can remove organizers.

---

#### 8. Approve or Reject Attendees (Approval Mode Only)

*This only applies when the event uses Approval registration mode.*

1. Go to your event page
2. Click the **Attendees** tab
3. You'll see a list grouped by status: Pending, Approved, Waitlisted, Rejected, Cancelled
4. For each pending attendee, click **"Approve"** or **"Reject"**
5. Approved attendees get a confirmation email with their ticket. Rejected attendees get a rejection notice.

> **Bulk tip**: You can approve or reject multiple pending attendees one by one. There's currently no "approve all" button.

---

#### 9. Check In Attendees

*Only available if "Check-in" was enabled when the event was created.*

1. Go to your event page
2. Find the **Check-in** section
3. Ask the attendee for their **ticket token** (they can find it on their event page under "My Registration" or in their confirmation email)
4. Enter the token and click **"Check In"**
5. The attendee is marked as checked in with the current time

> **Important**: A ticket token can only be checked in once. Attempting to reuse a token will show an error.

---

#### 10. Close or Reopen Registration

1. Go to your event page
2. Click **"Close Registration"** to stop new sign-ups
3. Click **"Reopen Registration"** to allow sign-ups again
4. This is separate from the registration deadline — it's a manual override you can use at any time.

> **When to use**: Close registration early if you've reached capacity informally. Reopen if you decide to accept more people.

---

#### 11. Cancel Your Event

1. Go to your event page
2. Click **"Cancel Event"**
3. Confirm the cancellation
4. The event status changes to **Cancelled**
5. All approved and pending registrants receive a cancellation email
6. The event remains visible but clearly marked as cancelled

> **Who can cancel**: Only the Owner or an Admin. Organizers cannot cancel the event. Once cancelled, the event cannot be reactivated.

---

### For Admins — Admin Dashboard

These steps are done on the **Admin Dashboard** (a separate application from the public website).

---

#### 12. Create an Event (Auto-Approved)

1. Log in to the Admin Dashboard
2. Click **Events** in the sidebar
3. Click **"Create Event"**
4. Fill out the same form as on the public website
5. Click **"Create"**
6. The event is created with **Approved** status — it's immediately public and open for registration. No review needed.

> **Why auto-approved?** The system trusts admins. If you want an event to go through review (e.g., you're testing), create it from the public website using a non-admin account instead.

---

#### 13. Approve or Reject a Submitted Event

1. In the Admin Dashboard, click **Events** in the sidebar
2. Use the status filter to show **"Pending Review"** events
3. Click the event to open its detail page
4. Review the event details: title, description, dates, location, registration settings
5. Click **"Approve"** to publish the event — it goes live immediately
6. Or click **"Reject"** — you must provide a reason. The creator will see this reason on their event page and can edit and resubmit.

> **The creator does not get a notification** when you approve or reject. They need to check their event page or Profile → Events tab to see the updated status.

---

#### 14. View and Manage Attendees

1. In the Admin Dashboard, open the event detail page
2. Click the **Attendees** tab
3. You'll see all registrations grouped by status: Pending, Approved, Waitlisted, Rejected, Cancelled
4. For approval-mode events, approve or reject pending registrations
5. You can also remove any attendee from the list

---

#### 15. Edit Any Event

1. In the Admin Dashboard, open the event
2. Click **"Edit"**
3. Make your changes
4. Click **"Save"**
5. **The event's status is preserved** — unlike regular users, admin edits do NOT reset the event to draft. If it was approved, it stays approved.

---

#### 16. Cancel Any Event

1. In the Admin Dashboard, open the event
2. Click **"Cancel Event"**
3. All registrants receive a cancellation email
4. The event is marked as cancelled

---

#### 17. Delete Any Event

1. In the Admin Dashboard, open the event
2. Click **"Delete"**
3. Confirm the deletion
4. The event is permanently removed — all registrations, organizers, reminders, and surveys for this event are also deleted.

> **Admin can delete any event** regardless of status. Regular users can only delete their own events when they're in Draft status.

---

## Emails Sent by Events

| Trigger | Who Receives | What It Contains |
|---|---|---|
| Registration — open mode | The registrant | Confirmation, ticket token, QR code, event details |
| Registration — approval mode | The registrant | "Pending — organizer will review" notice |
| Registration approved | The registrant | Approval notice, ticket token, QR code, meeting link, event details |
| Registration rejected | The registrant | Rejection notice (no reason shared) |
| Waitlist promotion | The registrant | "A spot opened up — you're now registered!" with ticket and event details |
| Event cancelled | All approved + pending registrants | Cancellation notice with reason (if provided by admin/owner) |
| Event details updated | All approved registrants | Updated event info (only if owner checked "Notify attendees" when saving) |
| Reminder (24 hours before) | All approved registrants | Reminder with event title, date, location/URL |
| Reminder (1 hour before) | All approved registrants | Final reminder |
| Post-event survey | By audience group (alumni/students/organizers) | Link to feedback survey, scheduled by organizer |

> **Note**: Emails require the `RESEND_API_KEY` to be configured. If not set, emails are silently skipped and all other functionality works normally.

---

## Automatic Timelines

| What | When | Result |
|---|---|---|
| Registration closes | At the registration deadline | "Register" button disabled. Existing registrations stay. |
| Event starts | At start date | Status auto-changes: Approved → In Progress |
| Event ends | At end date | Status auto-changes: In Progress → Completed |
| 24h reminder | 24 hours before start | Email to all approved registrants |
| 1h reminder | 1 hour before start | Email to all approved registrants |
| Survey sent | At scheduled time | Email to the specified audience group |

---

## Common Questions

**Q: I'm a student and I created an event. Why isn't it showing on the public events page?**

→ It's in "Draft" status. Click "Submit for Review" on the event page. An admin will review it, and once approved, it will appear publicly.

**Q: How long does approval take?**

→ There's no automated delay — it depends on when an admin reviews the queue. Admins see all pending events in their dashboard.

**Q: My event was rejected. What do I do?**

→ You'll see the rejection reason on your event page. Click "Edit" to fix the issue, then resubmit. The event goes back to "Pending Review" automatically when you save.

**Q: I edited my approved event and now it's gone from the public page. What happened?**

→ When a regular user edits an approved event, it resets to "Draft" and needs re-approval. This is by design — to make sure changes are reviewed. The event will reappear after admin re-approves.

**Q: As an admin, can I create an event that goes live immediately?**

→ Yes. Any event created by an admin starts as "Approved" — no review needed. This is so admins can publish directly.

**Q: What's the difference between Open and Approval registration?**

→ **Open**: Anyone who clicks "Register" is instantly confirmed. **Approval**: Registration is "pending" until an organizer manually approves it. Use approval mode if you need to screen attendees (e.g., limited seats, prerequisites).

**Q: What happens when the event is full?**

→ New registrants go on a waitlist. If someone cancels, the first waitlisted person is automatically promoted and gets an email. The waitlist works in order (first come, first served).

**Q: Can I see who else is attending?**

→ Only if the event creator enabled "Show attendee list." Organizers and admins can always see the full list.

**Q: How does check-in work?**

→ Each confirmed registration gets a unique ticket token (shown on their event page and in their confirmation email). Organizers enter this token on the check-in screen. It marks the attendee as "checked in" with a timestamp.

**Q: Can I add someone to help me manage the event?**

→ Yes. On your event page, use "Add Organizer" to search for users and add them as co-organizers. They can manage attendees, check people in, and edit the event — but they cannot delete it or add other organizers (only the owner can).

**Q: Can I close registration early?**

→ Yes. Click "Close Registration" on your event page. You can also "Reopen Registration" later if needed.

**Q: Do emails actually get sent?**

→ Yes, if the system has an email provider configured (Resend). Registration confirmations include a QR code ticket. If emails aren't configured, nothing is sent but the platform still works normally.

**Q: What happens to reminders if I reschedule my event?**

→ When you save changes to an event's date/time, the reminder emails are recalculated automatically for the new date.
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
# Messaging (Chat)

## What Is This Feature?

Messaging lets community members have direct, one-on-one conversations. It's the communication layer of the platform — once you've found someone through the Galaxy or connected via Connections, you can message them directly. The chat is simple, private, and designed for quick conversations.

---

## Who Can Do What?

| Action | Public | Student | Alumni | Faculty |
|---|---|---|---|---|
| View your conversations | ❌ | ✅ | ✅ | ✅ |
| Start a conversation with someone | ❌ | ✅ | ✅ | ✅ |
| Send messages | ❌ | ✅ | ✅ | ✅ |
| Receive messages | ❌ | ✅ | ✅ | ✅ |
| Search conversations | ❌ | ✅ | ✅ | ✅ |

> **There is no admin role for chat.** Admins cannot read other users' private messages. Chat is private between the two participants.

---

## How It Works

### Starting a Conversation

There are three ways to start a conversation:

| Method | Where | How |
|---|---|---|
| **From the Galaxy** | Galaxy page | Click a star in the 3D visualization, open the sidebar, click "Start Conversation" |
| **From the Chat page** | Chat page | If you already have a conversation with someone, it appears in your list. Currently, you cannot search for and start a chat with any user from the Chat page — only from the Galaxy. |
| **From a Connection** | After connecting | Once you have an active connection, you can message that person |

> **Important**: Starting a conversation from the Galaxy does NOT create a formal "Connection." It simply opens a chat. Connections (mentorship, career coaching, etc.) are a separate feature with a formal request/accept flow.

### How Conversations Work

- **One conversation per pair of users**: If you message someone, then message them again later, it's still the same conversation thread — not a new one
- **Both people see the same conversation**: If you start a chat with someone, it appears in both people's conversation lists
- **No group chats**: All conversations are strictly 1-on-1
- **No deleting conversations**: Once started, a conversation stays in both people's lists
- **Messages are permanent**: You cannot delete or edit sent messages

### Message Status

| Icon | Meaning |
|---|---|
| **Single check** ✓ | Message was sent successfully |
| **Double check** ✓✓ | The other person has seen the message (they opened the conversation) |

### Auto-Refresh

- **Conversation list**: Refreshes every 5 seconds to show new conversations
- **Messages**: When you're in a conversation, new messages appear every 3 seconds
- **No manual refresh needed**: You don't need to reload the page to see new messages

---

## How To — Step by Step

All chat actions are done on the **Public Website**.

---

### For All Users — Public Website

---

#### 1. Access the Chat Page

1. Log in to the public website
2. Click the **Chat icon** (speech bubble) in the top navigation bar
3. You're taken to the Chat page with a split layout:
   - **Left sidebar** (340px): Your conversation list
   - **Right area**: The current conversation (or an empty state if none selected)

> **Mobile**: On small screens, you see either the conversation list or the messages — not both at once. Tap a conversation to see messages, tap the back arrow to return to the list.

---

#### 2. Start a Conversation from the Galaxy

This is the primary way to start a new conversation.

1. Go to the **Galaxy** page
2. Navigate the 3D visualization — click a cluster to zoom in, then click a star (person)
3. A sidebar opens on the right showing the person's:
   - Name and avatar
   - Academic program
   - Position/company (if set)
   - Location
   - Bio
4. Click the **"Start Conversation"** button at the bottom of the sidebar
5. The button changes to **"Starting..."** while the conversation is created
6. You're taken to the Chat page with the new conversation open
7. Type your first message and press Enter to send

> **If the conversation already exists**: If you've messaged this person before, the existing conversation opens instead of creating a duplicate.

---

#### 3. Send a Message

1. Open a conversation from the left sidebar
2. The message area shows:
   - **Header**: The other person's name, avatar, and program
   - **Message list**: Previous messages, with yours on the right (green bubbles) and theirs on the left (white bubbles)
   - **Input area**: Text field at the bottom
3. Type your message in the text input
4. Press **Enter** to send. (Use **Shift + Enter** for a new line within your message.)
5. Your message appears immediately with a single check ✓
6. When the other person opens the conversation, it changes to double check ✓✓

> **Message limit**: 4,000 characters per message. The input won't let you type more.

---

#### 4. Read and Reply to Messages

1. New conversations with unread messages appear at the top of your conversation list
2. Each conversation in the list shows:
   - The other person's avatar and name
   - The last message preview
   - How long ago it was sent
3. Click a conversation to open it
4. Messages are displayed in chronological order — newest at the bottom
5. The view auto-scrolls to show the newest message

---

#### 5. Search Your Conversations

1. On the Chat page, use the **search bar** at the top of the conversation list
2. Type part of the other person's name
3. The conversation list filters to show matching conversations only
4. Clear the search to see all conversations again

---

#### 6. Navigate Between Conversations

1. Click any conversation in the left sidebar to switch to it
2. The previous conversation stays open in the background — you can switch back anytime
3. All your conversations are preserved

---

## Common Questions

**Q: Can I chat with anyone on the platform?**

→ Yes. Any logged-in user can message any other logged-in user. You don't need a formal "Connection" to chat — you can start a conversation directly from the Galaxy by clicking on someone's star.

**Q: What's the difference between Chat and Connections?**

| | Chat | Connections |
|---|---|---|
| **Purpose** | Private messaging | Formal relationships (mentorship, career coaching, etc.) |
| **How to start** | Click a star in Galaxy → "Start Conversation" | Use "Find Connections" AI matching → Send request → They accept |
| **Structure** | Simple message thread | Has a type, status, lifecycle (pending → active → completed) |
| **Visibility** | Only the two participants | Managed on your Profile → Connections tab |

You can chat with someone without a formal connection, and you can have a connection without chatting. They're independent features that work well together.

**Q: Can I delete a conversation or a message I sent?**

→ No. Conversations and messages are permanent. Once sent, a message cannot be edited or deleted.

**Q: Can I have group chats?**

→ No. Currently only 1-on-1 conversations are supported.

**Q: Can I send images or files?**

→ Not yet. The attachment button is visible but disabled. Image/file sharing is planned for a future update.

**Q: How do I know if someone read my message?**

→ Look for the check marks next to your message:
- ✓ (single check) = Sent — the message was delivered but the person hasn't opened the conversation yet
- ✓✓ (double check) = Read — the person has opened the conversation and seen your message

**Q: Does the other person get notified when I message them?**

→ Not by email or push notification. They'll see the new message when they open the Chat page — the conversation appears at the top of their list with a preview of your message.

**Q: Can admins read my private messages?**

→ No. Chat conversations are private between the two participants. Admins do not have access to other users' messages.

**Q: Can I block someone from messaging me?**

→ Not currently. If someone is bothering you, contact an admin who can ban the user from the platform.

**Q: How many messages are kept in a conversation?**

→ All messages are kept permanently. When you open a conversation, the most recent 100 messages are loaded. As you scroll up, more messages may appear.
