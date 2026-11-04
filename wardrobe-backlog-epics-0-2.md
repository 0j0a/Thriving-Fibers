# Sustainable Wardrobe App: Backlog for Epics 0 to 2

**Vision:** Help people own fewer, better-fitting clothes and keep them longer.
**Scope:** Phase 0 (Foundation) and Phase 1 (MVP). Use together with `wardrobe-app-spec.md`.

**Priority key:** P1 = must have for MVP, P2 = should have, P3 = nice to have.
**Size key:** S = under half a day, M = about a day, L = several days (with AI help).

---

## Epic 0: Accounts, data and privacy

Goal: users can securely own their data, and the app is installable.

### 0.1 Sign up and log in (P1, M)
*As a new user, I can create an account with email so my closet is saved.*
- [ ] Sign up with email and password, or magic link
- [ ] Logged-out users are redirected to the login page
- [ ] Clear error messages for wrong password or existing email
- [ ] Session persists after closing the browser

### 0.2 Secure data per user (P1, M)
*As a user, only I can see my closet.*
- [ ] Row-level security enabled on every table
- [ ] Test: a second account cannot read or edit the first account's items
- [ ] No API keys or secrets in client code

### 0.3 Delete my account and data (P1, S)
*As a user, I can delete everything I have stored.*
- [ ] "Delete account" in settings with a confirmation step
- [ ] Removes profile, items, wear logs and photos
- [ ] Confirmation message after deletion

### 0.4 Installable PWA (P2, M)
*As a user, I can install the app to my phone's home screen.*
- [ ] Web manifest with name, icons and theme colour
- [ ] Service worker caches the app shell
- [ ] Install prompt works on Android Chrome
- [ ] App opens full screen after install

### 0.5 Light and dark mode, mobile layout (P2, S)
*As a user, the app looks right on my phone and matches my system theme.*
- [ ] Layout works from 360px wide upward
- [ ] Follows system light or dark setting
- [ ] All buttons reachable by keyboard with visible focus

---

## Epic 1: Wardrobe catalog

Goal: users can record every piece they own with little friction.

### 1.1 Add an item (P1, L)
*As a user, I can add a piece of clothing with its details.*
- [ ] Required: name, category. Optional: everything else
- [ ] Fields: colour, fabric (one or blend), brand, size label, condition, source (new, secondhand, swapped, gifted), year acquired, memory or note, fit feedback
- [ ] Saved item appears in the list immediately
- [ ] No price field anywhere in the app
- [ ] Validation: name cannot be empty

### 1.2 Add a photo (P1, M)
*As a user, I can photograph or upload a picture of the item.*
- [ ] Take a photo with the camera or choose from the gallery
- [ ] Image is compressed before upload (max ~1200px)
- [ ] Items without a photo show a colour swatch
- [ ] Upload failure shows a message and keeps the other form data

### 1.3 View my closet (P1, M)
*As a user, I can browse everything I own.*
- [ ] Grid of items showing photo, name, category and wear count
- [ ] Empty state explains what to do next ("Add your first piece")
- [ ] List loads quickly with 100+ items (paginate or lazy-load images)

### 1.4 Filter and search (P1, S)
*As a user, I can quickly find a piece.*
- [ ] Filter chips by category
- [ ] Text search by name
- [ ] Additional filters: fabric, colour, condition

### 1.5 Edit and remove an item (P1, S)
*As a user, I can correct details or remove a piece.*
- [ ] Edit all fields from the item detail page
- [ ] Remove asks for a reason: donated, sold, discarded, other (sets status, keeps history)
- [ ] Removed items disappear from the main closet but stay in stats history

### 1.6 Item detail page (P2, M)
*As a user, I can open a piece to see everything about it.*
- [ ] Shows photo, all fields, wear history, last worn and time owned
- [ ] Shows the care tip for its fabric (placeholder text until Epic 3)
- [ ] Edit and remove actions available

### 1.7 Quick-add for bulk cataloging (P2, L)
*As a user with a big wardrobe, I can add many items fast.*
- [ ] Add multiple photos at once, then fill in names later
- [ ] "Needs details" label on incomplete items
- [ ] Progress indicator ("32 of about 80 pieces logged")

### 1.8 Fit feedback (P3, S)
*As a user, I can note whether a piece fits well, runs small or runs large.*
- [ ] Three options on add and edit
- [ ] Shown as a small label on the item card

---

## Epic 2: Wear tracking

Goal: users see which pieces they actually use, and what each costs per wear.

### 2.1 Mark as worn today (P1, S)
*As a user, I can log that I wore something with one tap.*
- [ ] "Worn today" button on the item card and detail page
- [ ] Creates a wear log with today's date
- [ ] Wear count updates immediately
- [ ] Logging the same item twice in one day asks for confirmation

### 2.2 Log a past date (P2, S)
*As a user, I can record a wear from an earlier day.*
- [ ] Date picker on the item detail page
- [ ] Future dates are not allowed

### 2.3 Undo a wear (P2, S)
*As a user, I can fix an accidental tap.*
- [ ] Undo message appears for a few seconds after logging
- [ ] Wear history list lets me delete a single entry

### 2.4 Wear history and time owned (P1, S)
*As a user, I can see how long a piece has been with me and when I last wore it.*
- [ ] Shows wear count, last worn ("3 days ago") and time owned ("With you 4 years")
- [ ] Shows "Not worn yet" when wear count is 0

### 2.5 Mindful summary (P1, M)
*As a user, I can see a quiet summary of my relationship with my wardrobe.*
- [ ] Shows total pieces, pieces kept 3+ years, pieces not bought new, and check-ins waiting
- [ ] "Check-ins waiting" opens a gentle list, not a scoreboard
- [ ] No money figures anywhere

### 2.7 Mindful check-in (P1, M)
*As a user, I am gently asked about pieces I have not worn in a while.*
- [ ] After 60 days without a wear or check-in, the item asks "Still love it?"
- [ ] Answers: keep, needs a fix (opens repair guide), pass it on (sets status)
- [ ] Answering resets the timer; one check-in per piece at a time

### 2.8 Feeling and memory (P2, S)
*As a user, I can note how a piece felt and keep a memory with it.*
- [ ] After "Worn today", optional one-tap feeling: great, fine, off
- [ ] Optional note on the item ("wore this to my sister's wedding")

### 2.6 Daily outfit log (P3, M)
*As a user, I can log several pieces I wore together.*
- [ ] Select multiple items and save as one outfit for today
- [ ] Each item gets a wear log entry
- [ ] Optional: reminder notification in the evening

---

## Suggested build order

| Sprint | Stories | Result |
|---|---|---|
| 1 | 0.1, 0.2, 0.5 | Secure login and a working shell |
| 2 | 1.1, 1.3, 1.5 | Add, view, edit and remove items |
| 3 | 1.2, 1.4, 2.1, 2.4 | Photos, filters, wear tracking, time owned |
| 4 | 2.5, 2.7, 1.6, 0.3, 0.4 | Mindful summary, check-ins, detail page, delete account, PWA |
| 5 | 2.8, 1.7, 2.2, 2.3, 1.8 | Feelings, bulk add and polish |
| Later | 2.6 | Outfit logging |

## Definition of done (every story)
- Acceptance criteria all ticked
- Works on a phone-sized screen
- Tested with a second account (no data leakage)
- Empty, loading and error states handled
- Changes committed to Git with a clear message

## MVP success questions (test with 5 to 10 people)
1. Do they log 20 or more items without being nudged?
2. Do they come back and tap "Worn today" in the following week?
3. Do the check-in questions make them think differently about a piece, or feel nagging?
4. What did they try to do that the app could not?

## How to use this with AI
For each story, paste the spec, the story and its acceptance criteria, then ask: "Implement this story. Do not change the schema without asking." Test it, commit, then move on.
