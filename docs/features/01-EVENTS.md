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
