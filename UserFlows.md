# Meskni — User Flow Specification

## 1. Purpose
This document translates the use cases into user-facing flows that show how the application behaves in real usage. The goal is to model the experience as a sequence of screens, states, decisions, and failure paths, while keeping the scope within the V1 MVP defined in the SRS.

These flows are intended to support both product design and software engineering. They help define frontend navigation, validation, authorization rules, and the data that must exist behind each interaction.

---

## 2. Role Model and Access State

The correct mental model for Meskni is:

- Visitor = unauthenticated user state
- Authenticated User = logged-in state
- Seeker, Owner, Admin = role-based specialization of the authenticated user state

This matters because Visitor is not a database role; it is an application state. Authorization should be checked after authentication, then with role-based checks.

---

## 3. Core User Flow Overview

| Flow | Primary Actor | Key Outcome |
|---|---|---|
| F-01 | Visitor | Register account |
| F-02 | Visitor | Log in |
| F-03 | Owner | Create listing |
| F-04 | Owner | Edit listing |
| F-05 | Visitor / Seeker | Search listings |
| F-06 | Visitor / Seeker | View listing details |
| F-07 | Seeker | Estimate roommate cost |
| F-08 | Seeker | Estimate affordability |
| F-09 | Seeker | Save listing |
| F-10 | Seeker | Contact owner |
| F-11 | Seeker | Report listing |
| F-12 | Admin | Moderate report |
| F-13 | Admin | Suspend user |

---

## 4. Flow Diagrams and Narratives

## F-01 — Registration Flow

### User journey
Visitor → Home page → Register → Form → Submit → Validation → Create account → Login redirect

### Flow diagram
```text
VISITOR
  │
  ▼
Home page
  │
  ▼
Register link
  │
  ▼
Registration form
  │
  ├── Missing/invalid fields ─────► Show validation errors
  │
  └── Valid form
       │
       ▼
    Check duplicates
       │
       ├── Email/phone exists ─────► Show account exists message
       │
       └── Unique
            │
            ▼
       Hash password
            │
            ▼
       Create user
            │
            ▼
       Success message
            │
            ▼
       Redirect to login / onboarding
```

### Notes
- Registration is allowed only for unauthenticated users.
- The system must validate uniqueness of email/phone.
- This is a product registration flow, not an administrative user creation flow.

### Key states
- idle form
- validation errors
- duplicate account error
- registration success

---

## F-02 — Login Flow

### User journey
Visitor → Login → Credentials → Authenticated session → Dashboard/home

### Flow diagram
```text
VISITOR
  │
  ▼
Login page
  │
  ▼
Enter email/phone + password
  │
  ▼
Submit credentials
  │
  ├── Invalid credentials ─────► Show auth failure
  │
  ├── Suspended account ───────► Show access restricted message
  │
  ├── Rate limited ─────────────► Show retry later message
  │
  └── Valid credentials
       │
       ▼
    Create session
       │
       ▼
    Redirect to dashboard or homepage
```

### Notes
- Login is the transition from Visitor → Authenticated User.
- The auth layer should enforce role permissions after login.

### Key states
- login form
- validation failure
- auth failure
- suspended access
- authenticated session

---

## F-03 — Create Listing Flow

### User journey
Owner → Dashboard → Create listing → Fill form → Upload photos → Submit → Validate → Save → Redirect to listing

### Flow diagram
```text
OWNER
  │
  ▼
Dashboard / My listings
  │
  ▼
Create listing
  │
  ▼
Listing form
  │
  ├── Invalid data ─────────────► Show field-level errors
  │
  └── Valid data
       │
       ▼
    Upload photos
       │
       ├── Invalid image ─────► Show upload validation error
       │
       └── Valid images
            │
            ▼
       Submit listing
            │
            ▼
       Check authentication
            │
            ├── No session ─────► 401 / redirect to login
            │
            └── Authenticated
                 │
                 ▼
            Check ownership permissions
                 │
                 ├── Not owner ─► 403 forbidden
                 │
                 └── Owner allowed
                      │
                      ▼
                 Validate server-side data
                      │
                      ├── Validation fail ─► Return form errors
                      │
                      └── Validation OK
                           │
                           ▼
                      Save listing
                           │
                           ▼
                      Save images & relations
                           │
                           ▼
                      Success
                           │
                           ▼
                      Redirect to listing detail page
```

### Notes
- This flow should enforce authentication and owner authorization on the server.
- Listing creation is a core Owner permission.

### Key states
- draft form
- validation errors
- upload errors
- unauthorized access
- created listing

---

## F-04 — Edit Listing Flow

### User journey
Owner → My listings → Select listing → Edit form → Save changes → Redirect to listing

### Flow diagram
```text
OWNER
  │
  ▼
My listings
  │
  ▼
Select listing
  │
  ▼
Edit listing form
  │
  ├── Invalid edit values ─────► Show validation errors
  │
  └── Valid values
       │
       ▼
    Check owner identity
       │
       ├── Different owner or no permission ─► 403
       │
       └── Allowed owner
            │
            ▼
       Update listing record
            │
            ▼
       Update images if added or removed
            │
            ▼
       Success
            │
            ▼
       Redirect to listing detail or dashboard
```

### Notes
- The edit flow is restricted to the listing owner.
- The app should use the listing ID plus authenticated user ID to authorize changes.

### Key states
- listing loaded
- edit form open
- validation failure
- forbidden access
- listing updated

---

## F-05 — Search Listings Flow

### User journey
Visitor / Seeker → Search page → Enter filters → Submit → Review result cards

### Flow diagram
```text
VISITOR / SEEKER
  │
  ▼
Search page
  │
  ▼
Enter city / neighborhood / filters
  │
  ├── Invalid price / numeric values ─► Validation error
  │
  └── Valid request
       │
       ▼
    Query active listings
       │
       ├── No matching listings ─► Empty state
       │
       └── Matching listings
            │
            ▼
       Show result cards
            │
            ▼
       User clicks listing
```

### Notes
- Public search is available to both visitors and authenticated users.
- Search and filters should be server-side validated.

### Key states
- search form
- invalid filters
- no results
- result list
- listing selected

---

## F-06 — View Listing Details Flow

### User journey
Visitor / Seeker → List result → View property details → Save / Contact / Report if authenticated

### Flow diagram
```text
VISITOR / SEEKER
  │
  ▼
Choose listing from search results
  │
  ▼
Load listing details
  │
  ├── Not found ─────────────► Show not-found page
  │
  ├── Archived/hidden ─────► Show unavailable message
  │
  └── Found listing
       │
       ▼
    Show listing card, description, price, photos, attributes
       │
       ▼
    User decides action
       │
       ├── Save listing ─────► Auth required
       │
       ├── Contact owner ─────► Auth required
       │
       ├── Report listing ───► Auth required
       │
       └── Continue browsing
```

### Notes
- Listing details should be publicly readable when the listing is active.
- Action availability depends on authentication state and page policy.

### Key states
- listing page loaded
- not found
- hidden/archived listing
- action selection

---

## F-07 — Roommate Cost Calculation Flow

### User journey
Seeker → Listing page → Open cost calculator → Enter rent and roommate count → See estimated monthly cost per person

### Flow diagram
```text
SEEKER
  │
  ▼
Open listing details
  │
  ▼
Open roommate cost calculator
  │
  ▼
Enter rent value
  │
  ▼
Enter roommate count / utility estimate
  │
  ├── Missing or invalid values ─► Show validation error
  │
  └── Valid values
       │
       ▼
    Calculate per-person rent
       │
       ▼
    Calculate per-person utilities
       │
       ▼
    Total = rent/person + utilities/person
       │
       ▼
    Display estimate
```

### Notes
- This is a calculation workflow, not a payment workflow.
- The estimate should be readable and easy to explain to users.

### Key states
- calculator opened
- values entered
- calculation error
- estimate displayed

---

## F-08 — Affordability Calculation Flow

### User journey
Seeker → Open affordability calculator → Enter income and monthly expenses → See affordability result

### Flow diagram
```text
SEEKER
  │
  ▼
Open affordability calculator
  │
  ▼
Enter monthly income
  │
  ▼
Enter housing, utilities, transport, food, other expenses
  │
  ├── Empty or invalid values ─► Show validation errors
  │
  └── Valid values
       │
       ▼
    remaining = income - expenses
       │
       ▼
    housing_share = (housing / income) * 100
       │
       ▼
    Determine status: manageable / moderate / high burden
       │
       ▼
    Display result with estimate disclaimer
```

### Notes
- The result is informational only and must not be framed as financial advice.
- Calculation logic should be deterministic and straightforward.

### Key states
- form entry
- validation failure
- affordability result

---

## F-09 — Save Listing Flow

### User journey
Seeker → Listing page → Save listing → Saved listings list

### Flow diagram
```text
SEEKER
  │
  ▼
Open listing details
  │
  ▼
Click save listing
  │
  ▼
Check authentication
  │
  ├── Not authenticated ─────► Redirect to login or show auth prompt
  │
  └── Authenticated
       │
       ▼
    Check if already saved
       │
       ├── Already saved ─────► Show already saved state
       │
       └── Not saved
            │
            ▼
       Create saved listing record
            │
            ▼
       Success feedback
            │
            ▼
       Show in saved listings dashboard
```

### Notes
- This is a simple relationship between User and Listing.
- Duplicate saves should be prevented.

### Key states
- save action
- not authenticated
- duplicate save
- saved success

---

## F-10 — Contact Owner Flow

### User journey
Seeker → Listing page → Contact owner → Compose message → Send → Confirmation

### Flow diagram
```text
SEEKER
  │
  ▼
Open listing details
  │
  ▼
Click contact owner
  │
  ▼
Message form
  │
  ├── Empty / invalid content ─► Show validation message
  │
  └── Valid message
       │
       ▼
    Check authentication
       │
       ├── Not authenticated ─► Redirect to login
       │
       └── Authenticated
            │
            ▼
       Check listing + recipient validity
            │
            ▼
       Save message record
            │
            ▼
       Success confirmation
```

### Notes
- This is a basic inquiry flow, not a full chat system.
- Message records may be built as a lightweight conversation entity or a direct message table.

### Key states
- form open
- invalid message
- unauthorized access
- sent successfully

---

## F-11 — Report Listing Flow

### User journey
Seeker → Listing page → Report listing → Select reason → Submit → Admin review queue

### Flow diagram
```text
SEEKER
  │
  ▼
Open listing details
  │
  ▼
Click report listing
  │
  ▼
Report form
  │
  ├── No reason selected ─────► Show required field error
  │
  └── Reason selected
       │
       ▼
    Add explanation (optional)
       │
       ▼
    Check authentication
       │
       ├── Not authenticated ─► Redirect to login
       │
       └── Authenticated
            │
            ▼
       Check reporter ≠ listing owner
            │
            ├── Same owner ─────► Reject report
            │
            └── Allowed
                 │
                 ▼
            Save report with status = pending
                 │
                 ▼
            Success message
                 │
                 ▼
            Entry appears in admin moderation queue
```

### Notes
- This is the trust / safety workflow.
- The product must encourage users to report suspicious listings and provide a clear moderation pathway.

### Key states
- report form
- rejected reason
- owner self-reporting blocked
- pending report created

---

## F-12 — Admin Moderation Flow

### User journey
Admin → Reports dashboard → Select report → Review listing → Resolve or reject → Notify or hide listing

### Flow diagram
```text
ADMIN
  │
  ▼
Admin dashboard
  │
  ▼
Open reports queue
  │
  ▼
Select report
  │
  ▼
Load report + listing details + user context
  │
  ▼
Decision point
  │
  ├── Valid report ─────► Mark resolved; hide/remove listing if needed
  │
  └── Invalid report ───► Mark rejected
       │
       ▼
    Save moderation state
       │
       ▼
    Update report timeline / audit
       │
       ▼
    Return to reports queue
```

### Notes
- This is the main moderation workflow that protects the platform.
- Admin actions should be auditable and consistent.

### Key states
- reports queue
- report details
- resolved
- rejected
- hidden listing

---

## F-13 — User Suspension Flow

### User journey
Admin → User management → Select account → Suspend → Prevent login and protected access

### Flow diagram
```text
ADMIN
  │
  ▼
Admin dashboard
  │
  ▼
User management
  │
  ▼
Select user account
  │
  ▼
Review account state
  │
  ├── Already suspended ─► Show current status
  │
  └── Active account
       │
       ▼
    Choose suspend user
       │
       ▼
    Verify admin privilege
       │
       ├── Not allowed ─► Access denied
       │
       └── Allowed
            │
            ▼
       Set account status = suspended
            │
            ▼
       Enforce login and permission restrictions
            │
            ▼
       Log moderation action
            │
            ▼
       Confirm suspension
```

### Notes
- Suspension is a critical moderation measure.
- It must be enforced at authentication and authorization layers, not only in the UI.

### Key states
- active user
- suspended user
- forbidden action
- logged moderation action

---

## 5. Cross-Flow Rules

### Authentication rules
- Visitor cannot create listings, save listings, contact owners, or report listings.
- Protected actions must check session validity before proceeding.

### Role rules
- Seeker can search and view listings, calculate affordability, save listings, contact owners, and report suspicious listings.
- Owner can create, edit, and manage their own listings.
- Admin can review reports and suspend users.

### Validation rules common to all flows
- required fields must be present
- numeric fields must be valid
- file uploads must be allowed and safe
- duplicate resources should be prevented when the business rule requires it

### Error handling rules
- invalid form data should show inline validation
- forbidden actions should return 401/403 appropriately
- system failure should show a generic user-safe error and log details internally

---

## 6. Relationship Between Use Cases and Flows

These flows directly correspond to the use cases in the prior specification:

- UC-01 ↔ F-01 Registration
- UC-02 ↔ F-02 Login
- UC-03 ↔ F-03 Create listing
- UC-04 ↔ F-04 Edit listing
- UC-05 ↔ F-05 Search listings
- UC-06 ↔ F-06 View listing details
- UC-07 ↔ F-07 Roommate cost calculation
- UC-08 ↔ F-08 Affordability calculation
- UC-09 ↔ F-09 Save listing
- UC-10 ↔ F-10 Contact owner
- UC-11 ↔ F-11 Report listing
- UC-12 ↔ F-12 Moderate report
- UC-13 ↔ F-13 Suspend user

This keeps the product design consistent across requirements, UI behavior, and engineering implementation.

---

## 7. Design Implications for Engineering

The user-flows stage exposes the exact data and behavior that the database and backend must support:

- sessions for authentication
- user role assignment
- listing ownership
- listing visibility status
- images associated with listings
- saved listings relationship
- messages tied to listing and participants
- reports tied to listing and reporter
- moderation status updates and audit history

This is why the next step after user flows is data modeling: the flows tell us what must exist in the system, and the ERD is how we represent that structure formally.
