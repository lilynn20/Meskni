# Meskni — Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document defines the software requirements for the first version of Meskni, a Moroccan rental and roommate marketplace. It converts the product brief and PRD into a software-engineering specification suitable for architecture, database design, API design, implementation planning, and testing.

The purpose of this SRS is to establish a clear, shared understanding of:

- the problem being solved
- the users and roles involved
- what the system must do
- what the system must not do in V1
- the constraints and quality attributes to be satisfied
- the assumptions that guide the implementation

### 1.2 Scope
The system will support three authenticated user roles:

- Seeker
- Owner
- Admin

The system will also have a Visitor state, which is not a stored database role but an unauthenticated access state.

The core scope of V1 is:

- authentication and profile management
- listing publication and management
- listing search and filtering
- roommate cost estimation
- affordability calculation
- saved listings
- owner contact flow
- reporting of suspicious listings
- admin moderation workflow

The system will intentionally exclude:

- real-time messaging
- AI-based matching
- mobile native app
- payments
- map APIs
- biometric verification
- advanced fraud detection

---

## 2. Product Context

### 2.1 Problem Statement
Users looking for affordable housing in Morocco often search across fragmented sources such as Facebook groups, WhatsApp, Avito, and informal referrals. This creates:

- poor comparison of alternatives
- unclear affordability
- scams and fake listings
- difficulty coordinating roommate arrangements
- unreliable listing management for owners

### 2.2 Product Vision
Meskni should become a trusted marketplace for affordable rentals and roommate matching, helping users compare listings, understand costs, save housing options, and protect themselves from suspicious listings.

### 2.3 Core Value Proposition
Meskni helps users:

- discover relevant rental options quickly
- compare listings in a consistent format
- estimate actual expenses per roommate
- judge affordability based on income and spending
- reduce risk by reporting suspicious listings

### 2.4 Business Goal
The product must provide a complete, usable end-to-end rental workflow for users and owners while maintaining a trustworthy moderation layer for admins.

---

## 3. System Actors and Roles

### 3.1 Visitor
A Visitor is a person who is not authenticated.

Responsibilities:

- browse public listing pages
- perform basic search and filtering
- read public listing details
- register or log in

Not allowed to:

- create listings
- save listings
- contact owners
- report listings
- access admin tools

### 3.2 Authenticated User
An Authenticated User is any user who has successfully logged in.

This is a broad classification. In the product model, the authenticated user is specialized into:

- Seeker
- Owner
- Admin

### 3.3 Seeker
A Seeker is a user looking for housing or a roommate.

Capabilities:

- search for listings
- filter results
- view listing details
- estimate roommate cost
- calculate affordability
- save listings
- contact owners
- report suspicious listings

### 3.4 Owner
An Owner is a user who publishes and manages rental properties.

Capabilities:

- create a listing
- edit a listing
- delete or archive a listing
- mark a listing as rented
- receive contact messages from interested users

### 3.5 Admin
An Admin is a trusted moderator responsible for platform quality and trust.

Capabilities:

- review reports
- inspect reported listings and reporting data
- update report status
- hide or remove suspicious listings
- suspend or warn offenders

---

## 4. System Boundaries

### 4.1 In-Scope Components
The Meskni system includes:

- web frontend
- backend application
- authentication service
- database for users, listings, saved items, reports, and messages
- object/file storage for listing images and avatars
- admin moderation workflows
- search and filtering logic
- calculation services for shared costs and affordability

### 4.2 Out-of-Scope Components
The following are outside the initial system boundary:

- real-time chat infrastructure
- dynamic geospatial map services
- banking or payment systems
- AI recommendation engine
- advanced duplicate detection with embeddings
- mobile app clients
- identity verification integrations

### 4.3 External Dependencies
The system depends on:

- email service for verification and password reset
- file storage for images
- web server and application runtime
- PostgreSQL or MySQL relational database
- deployment environment for production

---

## 5. Functional Requirements

### 5.1 Authentication and Account Management
FR-01: The system shall allow a user to register with full name, email, phone, password, city, and account type.

FR-02: The system shall allow a user to log in using valid credentials and create a secure authenticated session.

FR-03: The system shall allow a user to log out of the current session.

FR-04: The system shall allow a user to reset a forgotten password using a secure token or link.

FR-05: The system shall allow a user to verify their email address before full activation, if required by the product flow.

FR-06: The system shall allow a user to edit profile information such as name, phone, city, and avatar.

FR-07: The system shall allow a user to choose whether they are a seeker or an owner.

FR-08: The system shall reject invalid or duplicate registration data with clear validation messages.

### 5.2 Profiles
FR-09: The system shall store user profile details and associate them with the authenticated account.

FR-10: The system shall allow each user to upload a profile picture subject to file validation rules.

FR-11: The system shall display a profile summary relevant to the user role and current account state.

### 5.3 Listing Creation and Management
FR-12: The system shall allow an Owner to create a listing with the required fields for title, description, location, rent, availability, and property type.

FR-13: The system shall allow an Owner to add photos to a listing.

FR-14: The system shall allow an Owner to edit their own listing.

FR-15: The system shall allow an Owner to delete or archive a listing they created.

FR-16: The system shall allow an Owner to mark a listing as rented or inactive.

FR-17: The system shall prevent a user from editing or deleting another user's listing.

FR-18: The system shall ensure mandatory listing fields are validated before saving.

### 5.4 Search and Discovery
FR-19: The system shall allow a Visitor or Authenticated User to search listings by city and neighborhood.

FR-20: The system shall allow filtering by price range, property type, furnished status, availability, utilities inclusion, and gender preference.

FR-21: The system shall return only active listings matching the current filters.

FR-22: The system shall display listing cards with price, location, key attributes, and thumbnail image.

FR-23: The system shall support pagination or lazy loading for large result sets.

### 5.5 Listing Details
FR-24: The system shall provide a dedicated listing details page containing all relevant listing information.

FR-25: The system shall show property details such as bedrooms, bathrooms, size, amenities, and availability.

FR-26: The system shall display listing images in a clear gallery or carousel format.

FR-27: The system shall show actions for save, contact owner, and report listing when the user is authenticated.

### 5.6 Roommate Cost Calculation
FR-28: The system shall calculate an estimated cost per person based on monthly rent and the applicable roommate-sharing assumptions.

FR-29: The system shall calculate utility distribution among the number of shared occupants.

FR-30: The system shall display a total estimated monthly cost per person in a clear, understandable format.

FR-31: The system shall allow the displayed estimate to adjust when the number of people or total utility values change.

### 5.7 Affordability Calculator
FR-32: The system shall allow a user to enter monthly income and expense values.

FR-33: The system shall calculate remaining disposable income after housing and other expenses.

FR-34: The system shall compute the housing cost as a percentage of income.

FR-35: The system shall classify the affordability result using a simple, readable indicator such as manageable or high burden.

FR-36: The system shall clearly indicate that the result is an estimate and not financial advice.

### 5.8 Saved Listings
FR-37: The system shall allow an authenticated user to save a listing.

FR-38: The system shall prevent duplicate saves for the same user and listing.

FR-39: The system shall allow a user to view saved listings in a dedicated list.

FR-40: The system shall allow a user to remove a saved listing.

### 5.9 Contact Owner
FR-41: The system shall allow an authenticated user to send a message to the listing owner.

FR-42: The system shall capture the sender, receiver, listing, message text, and timestamp.

FR-43: The system shall allow the message to be stored even if a later real-time chat system is not implemented.

### 5.10 Reporting
FR-44: The system shall allow an authenticated user to report a listing.

FR-45: The system shall require a report reason and allow an optional explanation.

FR-46: The system shall store the report with reporter identity, target listing, reason, description, status, and timestamps.

FR-47: The system shall reject duplicate or invalid reports where appropriate.

FR-48: The system shall prevent a user from reporting their own listing.

### 5.11 Admin Moderation
FR-49: The system shall provide an Admin dashboard with a list of reports.

FR-50: The system shall allow an Admin to view report details and relevant listing information.

FR-51: The system shall allow an Admin to update report status to a valid workflow state such as pending, reviewed, resolved, or rejected.

FR-52: The system shall allow an Admin to hide, remove, or restrict access to suspicious listings.

FR-53: The system shall allow an Admin to warn or suspend users who violate platform rules.

---

## 6. Non-Functional Requirements

### 6.1 Security
NFR-01: Passwords shall be stored using a secure password hashing mechanism.

NFR-02: All server-side endpoints shall validate input before processing.

NFR-03: Authorization checks shall be enforced on every sensitive route and action.

NFR-04: Role-based access control shall prevent unauthorized listing modification and admin access.

NFR-05: File uploads shall be validated for allowed types and maximum size.

NFR-06: Sensitive routes such as login, registration, contact, and reports shall be rate-limited.

NFR-07: Session handling shall be secure and should require authenticated state for protected actions.

### 6.2 Performance
NFR-08: Search results shall load within a reasonable response time for standard datasets.

NFR-09: Listing queries shall be optimized to avoid unnecessary joins and excessive data transfer.

NFR-10: Image handling shall minimize load cost through compression and proper storage strategies.

### 6.3 Reliability
NFR-11: Listing creation and update operations shall be atomic and consistent.

NFR-12: The application shall provide informative validation and error messages for failed operations.

NFR-13: The system shall gracefully handle invalid or missing input without exposing internal errors.

### 6.4 Usability
NFR-14: The user interface shall be understandable for users without technical expertise.

NFR-15: Forms shall provide validation feedback before submission and after submission.

NFR-16: Listing cards shall be clear and comparable at a glance.

### 6.5 Accessibility
NFR-17: Key interactive elements shall be keyboard accessible.

NFR-18: Forms shall have associated labels and clear error feedback.

NFR-19: Information that is color-coded must also be communicated with text.

### 6.6 Maintainability
NFR-20: The codebase shall be organized by domain or feature to support future extension.

NFR-21: Business logic shall be separated from presentation logic where possible.

NFR-22: The backend shall use validation, authorization, and modular services to reduce duplication.

---

## 7. Assumptions

A-01: The product will launch as a web application, not a native mobile app.

A-02: The first release is designed for a single country and default language context, with Moroccan pricing and locations.

A-03: Users will be authenticated using standard web session or token-based authentication.

A-04: Owners and seekers are separate account types but both are still users in the application data model.

A-05: The default listing status is active unless later set to rented or hidden.

A-06: A listing may have multiple photos but does not require all of them to be stored in a special media service at V1.

A-07: The affordability calculator is informational only and not a regulated financial advisory feature.

A-08: Report moderation will be handled through a web admin interface rather than a separate admin application.

---

## 8. Constraints

C-01: V1 must be realistic and avoid broad feature creep.

C-02: Real-time chat is explicitly excluded from this release.

C-03: Activity must be handled without advanced AI, machine learning, or semantic matching in the initial build.

C-04: The project must prioritize trust, moderation, and clear cost representation over visual complexity.

C-05: The system must manage file uploads securely and within reasonable storage constraints.

C-06: The platform must remain usable on desktop and mobile-responsive layouts.

C-07: The product must support standard authorization rules and not allow cross-user data access.

---

## 9. Business Rules

BR-01: Only an authenticated user may save, contact, or report a listing.

BR-02: A listing may only be edited by its owner or an admin when explicitly allowed by policy.

BR-03: A listing marked rented shall not appear as an open listing in standard consumer search results.

BR-04: A user cannot report their own listing.

BR-05: A report must contain a valid reason.

BR-06: Duplicate saves for the same listing and user shall be prevented.

BR-07: Residential listing fields such as rent, bedrooms, and bathrooms must be valid numeric values.

BR-08: Gallery image uploads must match the allowed file rules.

BR-09: The affordability calculation must be clearly labeled as an estimate.

BR-10: The system must not expose private user information to unauthorized actors.

---

## 10. Quality Attributes and Risk Considerations

### 10.1 Trustworthiness
The system must feel safe and reliable. Users should be able to trust the listings, see clear costs, and know they can report bad content.

### 10.2 Clear Affordability Logic
The product's differentiator is cost transparency. The calculation logic should be easy to understand and consistent.

### 10.3 Moderate Complexity
The system is substantial but still manageable in V1 if scope remains controlled.

### 10.4 Security by Design
Because rental and housing data touches personal data, security and authorization must be considered from the first design phase.

### 10.5 Quality Risk Areas
The highest-risk areas are:

- authorization correctness
- listing validation
- report moderation abuse
- image upload security
- incomplete user lifecycle flows

---

## 11. Requirement Prioritization

### Must-Have for V1
- authentication
- role-based authorization
- listing creation and management
- public listing browse and search
- listing detail view
- roommate cost estimator
- affordability calculator
- saved listings
- contact owner message flow
- report listing
- admin moderation

### Should-Have Later
- more advanced filtering
- duplicate listing heuristics
- richer dashboards
- analytics

### Not in V1
- real-time chat
- AI matching
- payments
- maps
- deep fraud detection

---

## 12. Acceptance Summary

The system will satisfy the requirements when:

- visitors can browse public listings but cannot access protected actions
- users can register, log in, and manage profiles
- owners can publish and update listings
- seekers can search, compare, and save listings
- roommate and affordability calculations are clear and consistent
- users can report suspicious listings
- admins can review and resolve reports
- protected operations are subject to authorization and validation rules

---

## 13. Final Engineering Interpretation

The main engineering decision in this SRS is the distinction between Visitor and Authenticated User.

This matters because:

- Visitor is not a stored role in the database; it is a state of being unauthenticated.
- Seeker, Owner, and Admin are genuine authorization roles that can be assigned and enforced.
- Authorization logic should therefore be designed around the authenticated state first, then role-based permission checks second.

This separation is fundamental to building a correct RBAC model for Meskni.

The system should not be designed around a single broad user type with ad hoc permission checks. It should be organized as:

- unauthenticated access
- authenticated access
- role-specific capabilities

That is the correct basis for the database schema, API policies, UI behavior, and moderation workflows.
