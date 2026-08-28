# Meskni — Product Requirements Document (PRD)

## 1. Product Overview

### Product name
Meskni

### Product type
Rental marketplace and roommate-matching platform for Morocco

### Product vision
Meskni is a trusted platform that helps people find affordable rental housing and compatible roommates in one place, while helping owners publish accurate listings and reducing scam risk through better visibility and moderation.

### Core problem
People looking for affordable housing currently rely on scattered sources such as Facebook groups, WhatsApp, Avito, and word-of-mouth. This leads to:

- fragmented listings
- hard-to-compare options
- unclear affordability
- scam risk
- difficulty finding roommates to share costs with

### Product goal
Create a simple, reliable platform where users can:

- discover rental listings in their city and neighborhood
- compare costs transparently
- estimate roommate-based monthly expenses
- save properties they like
- contact owners directly
- report suspicious listings
- manage their own listings as property owners

---

## 2. Product Summary

Meskni is designed for three primary roles:

- Seeker: user looking for a room, apartment, studio, or roommate
- Owner: user listing a rental property
- Admin: trusted moderator ensuring the platform remains reliable and safe

The initial product should focus on the MVP required to solve the core problem without overbuilding.

---

## 3. Target Users

### 3.1 Seeker
A person who wants to:

- find housing quickly
- compare listings across neighborhoods and cities
- understand cost burden
- find suitable roommate arrangements
- avoid scams or misleading listings

### 3.2 Owner
A property owner or landlord who wants to:

- list a property for rent
- update listing details when needed
- mark the property as no longer available
- receive inquiries from interested renters

### 3.3 Admin
A platform moderator who wants to:

- review suspicious listings
- check reports from users
- suspend or warn problematic accounts
- maintain trust in the platform

---

## 4. Goals and Non-Goals

### 4.1 Goals
- Build a trustworthy housing marketplace for Morocco
- Reduce search friction for affordable rentals
- Make roommate cost sharing transparent
- Offer a practical affordability estimator
- Give owners a simple way to publish listings
- Provide admin tools to moderate bad listings

### 4.2 Non-goals for V1
The following are explicitly not included in the MVP:

- AI roommate matching
- real-time chat
- maps integration
- payments or deposits
- mobile app
- advanced recommendations engine
- identity verification for government compliance
- multilingual localization beyond the default language

---

## 5. User Needs and Problems

### 5.1 Problems for seekers
- housing listings are scattered across multiple channels
- price comparisons are difficult
- it is hard to know total monthly cost with roommates
- some listings are misleading or fraudulent
- finding a roommate is difficult without structure

### 5.2 Problems for owners
- posting a listing is often manual and disconnected
- it is hard to manage multiple listings and updates
- they may receive low-quality leads or irrelevant messages
- they need a durable listing status system

### 5.3 Problems for admins
- scam and duplicate listings create trust issues
- user reports need a structured review workflow
- abusive or fraudulent behavior must be flagged and addressed

---

## 6. Product Scope

### 6.1 In scope for MVP
- User registration and login
- User profile management
- Property listing creation and editing
- Listing search and filtering
- Listing detail pages
- Roommate cost calculation
- Affordability calculator
- Saved listings
- Listing contact message feature
- Listing reporting workflow
- Admin moderation dashboard

### 6.2 Out of scope for MVP
- real-time messaging
- AI-based duplicate detection
- live map search
- agency management
- payment processing
- recommendation rankings
- mobile-only experience

---

## 7. Roles and Permissions

| Role | Description | Permissions |
|---|---|---|
| Visitor | Unauthenticated user | Browse public listings, view basic listing details |
| User | Registered normal account | Search, save listings, contact owners, report listings |
| Owner | Registered user with listing permissions | Create/edit/delete own listings |
| Admin | Platform moderator | Review reports, suspend users, manage listings |

### Business rules
- Only authenticated users can save listings, contact owners, and report listings.
- Only the owner can edit or delete their own listing.
- Admins can review and resolve reports.
- Listings can be marked as active, rented, or archived.
- Users should not be able to edit or remove another user's listings.

---

## 8. Core Functional Requirements

### 8.1 Authentication
Users must be able to:

- register with full name, email, phone, password, city, and role/account type
- login with email/phone + password
- logout securely
- verify email address
- reset password via secure email flow
- edit profile information
- upload or change profile picture
- choose account type: housing seeker or property owner
- delete account with confirmation if required by policy

#### Acceptance criteria
- User receives validation errors for invalid email/password/phone input.
- Password is securely hashed before persistence.
- Registration creates a valid account in the default role.
- Login fails gracefully for invalid credentials.
- Password reset flow sends a secure token or link.

### 8.2 Profile management
Users must be able to:

- update their name, phone, city, and profile photo
- view their account details
- choose whether they are looking for housing or offering housing

#### Acceptance criteria
- Profile updates persist correctly.
- Avatar upload is validated for file type and file size.
- User can see their profile after login.

### 8.3 Listing creation
Owners must be able to create rental listings containing:

- title
- description
- property type: apartment, room, studio, house
- city
- neighborhood
- address/location
- monthly rent
- security deposit
- available date
- bedrooms
- bathrooms
- surface area
- furnished status
- utilities included status
- internet included status
- parking availability
- gender preference: any, female, male
- photos

#### Acceptance criteria
- Listing creation requires all mandatory fields.
- Invalid numeric values are rejected.
- Photos can be uploaded and stored safely.
- Listing is associated with the authenticated owner.

### 8.4 Listing editing and lifecycle
Owners must be able to:

- edit a listing after creation
- remove outdated listings
- mark a listing as rented or inactive

#### Acceptance criteria
- Only the owner can update the listing.
- A listing marked rented is excluded from active search results.
- User receives clear feedback when a listing is deleted or updated.

### 8.5 Search and filtering
Users must be able to search by:

- city
- neighborhood
- property type
- rent range
- furnished status
- available date
- gender preference
- utilities included

#### Acceptance criteria
- Search results are filtered correctly using selected parameters.
- Empty filters return meaningful default results.
- Results show listing cards with preview image, price, location, and key attributes.
- Search supports consistent pagination or loading behavior.

### 8.6 Listing details
Each listing detail page must show:

- title and description
- price and deposit
- neighborhood and city
- property attributes
- availability date
- amenities and room details
- photos
- owner/contact action
- save listing button
- report listing action

#### Acceptance criteria
- Listing page shows complete accurate data from the database.
- Price and attributes are formatted clearly for the user.
- Save, report, and contact actions are available to authenticated users.

### 8.7 Roommate cost calculation
The system should calculate estimated cost per person for shared housing.

#### Formula example
- Monthly rent divided by number of occupants or bedrooms/people expectation
- Utilities split by occupants
- Estimated total = rent/person + utility/person

Example:
- rent: 4,000 MAD
- roommate count: 2
- utilities: 750 MAD total
- rent/person: 2,000 MAD
- utilities/person: 375 MAD
- total/person: 2,375 MAD

#### Acceptance criteria
- UI displays estimated total per roommate dynamically.
- The calculation uses valid numeric inputs.
- If no roommate count is provided, the default estimate is clear and consistent.

### 8.8 Affordability calculator
Users should be able to estimate whether a listing is manageable based on their monthly income and expenses.

#### Inputs
- monthly income
- housing cost
- utilities
- transport
- food
- other expenses

#### Output
- remaining income after expenses
- housing cost percentage of income
- status indicator such as manageable or high housing burden

#### Acceptance criteria
- Calculation is based on the numbers entered by the user.
- The UI clearly labels the result as an estimate, not financial advice.
- For valid calculations, the result should be consistent and easily displayed.

### 8.9 Saved listings
Authenticated users should be able to save a listing and view saved items later.

#### Data model
- User has many saved listings
- Saved listing relates to listing

#### Acceptance criteria
- A saved listing appears in the user's saved list once.
- Duplicate save requests are prevented.
- User can remove a saved listing.

### 8.10 Contact owner
Users should be able to send a simple inquiry to the owner from a listing page.

#### Behavior
- User opens listing
- clicks contact owner
- sends a short message
- message is recorded with sender, receiver, and listing context

#### Acceptance criteria
- Message creation is authenticated.
- Message includes listing context.
- If no conversation system exists yet, the message is stored as a simple contact message record.

### 8.11 Reporting system
Users must be able to report a suspicious listing.

#### Required reasons
- scam/fraud
- duplicate listing
- incorrect information
- property does not exist
- inappropriate content
- other

#### Acceptance criteria
- User can select a reason and add an optional explanation.
- A report is stored with listing, reporter, reason, status, and timestamps.
- Reports are visible to admins in a moderation dashboard.

### 8.12 Admin moderation
Admins must be able to:

- view reports in a queue
- see report count and status
- review listing details associated with a report
- mark the report as resolved, pending, or rejected
- suspend or warn the offending user
- hide or remove suspicious listings from search results

#### Acceptance criteria
- Admin dashboard gives an overview of active reports.
- Actions update report status persistently.
- Moderation actions are logged and not silently ignored.

---

## 9. Business Rules and Edge Cases

### 9.1 Listing business rules
- Rent must be a positive number.
- Deposit must be a non-negative number.
- Available date should be a valid date and cannot be in the past for a future listing unless explicitly allowed.
- Property type must use one of the valid enum values.
- User cannot publish a listing without login.
- A listing should not be shown publicly if marked rented or archived.

### 9.2 Search edge cases
- Empty search should return general active listings by city/default order.
- Query containing invalid price values should be rejected or ignored.
- Search by neighborhood should narrow results without failing if the city filter is absent.

### 9.3 Reporting edge cases
- Duplicate reports from the same user for the same listing should be prevented or limited.
- Report statuses should be immutable until admin intervention, unless explicitly updated.
- A user cannot report their own listing.

### 9.4 Authentication edge cases
- Password reset should expire after a valid token lifetime.
- Unverified email should not grant full privileges unless the flow is designed to allow that state.
- Login attempts should be rate-limited.

### 9.5 Authorization edge cases
- A normal user cannot edit a listing they do not own.
- Admin can moderate listings, but should not change unrelated user records without scope.

---

## 10. Non-Functional Requirements

### 10.1 Security
- Store hashed passwords using a secure hashing mechanism.
- Validate all user input on the server side.
- Enforce authorization checks on every write operation.
- Rate limit login, registration, report submissions, and contact messages.
- Restrict and validate uploaded file types and sizes.

### 10.2 Performance
- Listing pages should load quickly with optimized queries.
- Search results should support filtering and pagination.
- Images should be served in a way that reduces load time and bandwidth usage.

### 10.3 Reliability
- Critical actions like creating or editing listings must be atomic.
- Errors should be clear and recoverable.
- The app should provide consistent success and validation messages.

### 10.4 Accessibility
- Buttons and links must be keyboard accessible.
- Forms must have labels and validation feedback.
- Color-coded states should also be explained with text.

### 10.5 Usability
- The product should feel simple for users who are not highly technical.
- Rental cards should be clear and comparable.
- The affordability calculator should be easy to understand and not visually intimidating.

---

## 11. MVP Definition

### 11.1 Meskni V1 includes
- authentication and profiles
- property creation and updates
- public listing search and filters
- listing details
- roommate cost splitting
- affordability calculator
- saved listings
- contact owner
- report listing
- admin moderation for reports

### 11.2 Meskni V1 excludes
- AI matching
- live chat
- map-based geolocation
- payment integration
- advanced fraud detection
- WhatsApp-style messaging flows
- agency onboarding

---

## 12. User Stories

### 12.1 Seeker stories
- As a user looking for housing, I want to search by city so that I can find relevant listings.
- As a user, I want to filter listings by price so that I can avoid irrelevant properties.
- As a user, I want to see estimated costs per roommate so that I understand my actual monthly housing cost.
- As a user, I want to save listings so that I can compare them later.
- As a user, I want to contact the owner so that I can ask questions.
- As a user, I want to report suspicious listings so that other users are protected.

### 12.2 Owner stories
- As an owner, I want to publish a listing so that renters can find my property.
- As an owner, I want to edit my listing so that information stays accurate.
- As an owner, I want to mark a property as rented so that people stop contacting me.

### 12.3 Admin stories
- As an admin, I want to review reported listings so that scams can be removed.
- As an admin, I want to suspend users who repeatedly violate the rules.

---

## 13. User Flows

### 13.1 Seeker flow
1. visit homepage
2. search by city and neighborhood
3. filter by price and property type
4. view listing cards and compare options
5. open listing details
6. calculate affordability or roommate cost
7. save or contact owner
8. report suspicious content if necessary

### 13.2 Owner flow
1. register and select owner account type
2. create a listing with full details
3. upload photos
4. review and publish listing
5. later edit or mark as rented
6. respond to message inquiries

### 13.3 Admin flow
1. open reports dashboard
2. review flagged listings and reasons
3. investigate listing and user data
4. resolve report
5. hide or remove listing if required
6. suspend or warn user if needed

---

## 14. Functional Acceptance Criteria Checklist

### Authentication
- [ ] Users can register
- [ ] Users can log in and log out
- [ ] Password reset flow exists
- [ ] Role is stored and used for access control

### Listings
- [ ] Owner can create listing
- [ ] Owner can edit listing
- [ ] Owner can delete or mark listing as rented
- [ ] Listing fields validate correctly

### Search
- [ ] Search supports city and neighborhood filters
- [ ] Search supports price and property filters
- [ ] Search returns relevant active listings

### Cost features
- [ ] Roommate cost split is displayed dynamically
- [ ] Affordability calculator estimates monthly burden

### Saved listings
- [ ] User can save and unsave a listing
- [ ] Saved items are viewable in profile/dashboard

### Messages and reports
- [ ] User can contact owner
- [ ] User can report listing with reason and note
- [ ] Admin can review reports and resolve them

---

## 15. Data Requirements (High Level)

### Users
- id
- full_name
- email
- phone
- password_hash
- city
- role
- avatar_url
- created_at
- updated_at

### Listings
- id
- user_id
- title
- description
- property_type
- city
- neighborhood
- address
- rent
- deposit
- available_from
- bedrooms
- bathrooms
- surface_area
- furnished
- utilities_included
- internet_included
- parking
- gender_preference
- max_occupants
- status
- created_at
- updated_at

### Listing images
- id
- listing_id
- image_url
- sort_order

### Saved listings
- id
- user_id
- listing_id
- created_at

### Messages
- id
- sender_id
- receiver_id
- listing_id
- content
- read_at
- created_at

### Reports
- id
- reporter_id
- listing_id
- reason
- description
- status
- created_at
- resolved_at

---

## 16. Recommended Initial Backlog

### Phase 1 — Foundation
- project setup
- database design
- authentication
- role-based access control
- profile management

### Phase 2 — Listings
- create listing
- edit listing
- delete listing
- photo upload
- listing status management

### Phase 3 — Discovery
- browse listings
- advanced search and filters
- listing detail pages
- pagination

### Phase 4 — Financial features
- roommate cost estimator
- affordability calculator

### Phase 5 — Engagement
- save listings
- contact owner

### Phase 6 — Safety and moderation
- report listing
- admin review dashboard
- moderation actions

### Phase 7 — Hardening
- validation
- security
- tests
- deployment

---

## 17. Success Metrics

The project is successful if:

- users can register and create listings without confusion
- listings can be searched and filtered effectively
- room sharing cost estimates are understandable and useful
- affordability calculator is seen as a differentiating feature
- suspicious listings can be flagged and moderated
- the app can realistically demo a complete end-to-end rental workflow

---

## 18. Definition of Done for MVP

The MVP is complete when:

- a user can register and log in
- an owner can create, update, and manage a listing
- a seeker can browse and filter listings
- listing detail pages show essential information
- roommate cost and affordability estimates work
- users can save listings
- users can contact owners or create a contact message
- users can report listings
- admins can review reports and moderate content
- the app works on desktop and mobile-responsive layouts
- sensitive features have validation and authorization in place

---

## 19. Project Positioning

Meskni should not be positioned as a generic real-estate website. It should be positioned as:

> A Moroccan rental and roommate platform designed to simplify affordable housing discovery, make cost-sharing transparent, and reduce scam risk through moderation.

This stronger positioning makes it much more compelling for portfolio and stakeholder use.

---

## 20. Final Recommendation

For the first build, the team should resist feature creep. The MVP should remain focused on the minimum viable experience that solves the actual housing problem for Moroccan renters and owners.

The most important principle is this:

> Build the trust layer first: authentication, authorization, listing quality, moderation, and clear pricing.

If the platform can accomplish those reliably, the broader product roadmap becomes credible and scalable.
