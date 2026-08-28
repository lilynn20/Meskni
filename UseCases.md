# Meskni — Use-Case Specification

## 1. Purpose
This document converts the SRS into a practical use-case specification. Each use case defines the actor, trigger, preconditions, main flow, alternative flows, postconditions, and acceptance criteria for a V1 feature.

The goal is to describe what the system must do from a user perspective while remaining consistent with the product boundaries established in the SRS.

---

## 2. Use-Case Overview

| ID | Name | Primary Actor |
|---|---|---|
| UC-01 | Register account | Visitor |
| UC-02 | Log in | Visitor |
| UC-03 | Create rental listing | Owner |
| UC-04 | Edit rental listing | Owner |
| UC-05 | Search listings | Visitor / Seeker |
| UC-06 | View listing details | Visitor / Seeker |
| UC-07 | Calculate roommate cost | Seeker |
| UC-08 | Calculate affordability | Seeker |
| UC-09 | Save listing | Seeker |
| UC-10 | Contact owner | Seeker |
| UC-11 | Report listing | Seeker |
| UC-12 | Moderate report | Admin |
| UC-13 | Suspend user | Admin |

---

## 3. Use Cases

## UC-01 — Register Account

### Actor
Visitor

### Description
A new user creates an account on the platform.

### Preconditions
- User is not already authenticated.
- User is not already registered with the same email or phone.

### Trigger
User selects the Register action from the homepage or navigation.

### Main flow
1. System displays registration form.
2. User enters full name, email, phone, password, city, and account type.
3. User submits the form.
4. System validates all required fields.
5. System checks for duplicate email and phone.
6. System hashes the password securely.
7. System creates a new user record.
8. System creates the initial profile state for the new user.
9. System returns success response.
10. System redirects the user to login or onboarding flow.

### Alternative flows
A1. Invalid input
- System displays validation errors and prompts for correction.

A2. Duplicate email or phone
- System rejects registration and explains the issue.

A3. Weak password
- System rejects the registration and requests a stronger password.

A4. Server/database failure
- System returns a generic error message and logs the failure.

### Postconditions
- A new user account exists.
- Account is associated with the selected role/account type.
- User can log in if credentials are valid.

### Acceptance criteria
- A valid registration creates a user record.
- Invalid input is blocked with clear validation feedback.
- Password is never stored in plain text.
- Duplicate account identifiers are rejected.

---

## UC-02 — Log In

### Actor
Visitor

### Description
A previously registered user logs into the system.

### Preconditions
- User has an existing account.
- User is not currently authenticated.

### Trigger
User selects the Login action.

### Main flow
1. System displays login form.
2. User enters email/phone and password.
3. User submits the form.
4. System validates the request.
5. System verifies the credentials.
6. System creates an authenticated session.
7. System redirects the user to the appropriate dashboard or homepage.

### Alternative flows
A1. Invalid credentials
- System shows an authentication failure message.

A2. Account locked or suspended
- System informs the user that access is restricted.

A3. Rate-limit triggered
- System rejects the attempt and informs the user to retry later.

A4. Server error
- System returns a generic failure response.

### Postconditions
- User is authenticated.
- User can access protected functionality according to role.

### Acceptance criteria
- Valid credentials create a session.
- Invalid credentials do not authenticate the user.
- Suspended users cannot access accounts.

---

## UC-03 — Create Rental Listing

### Actor
Owner

### Description
An owner creates a new rental listing for a property.

### Preconditions
- User is authenticated.
- User has Owner permissions.

### Trigger
Owner clicks Create listing.

### Main flow
1. Owner opens the create listing page.
2. System displays the listing form.
3. Owner enters listing details such as title, description, city, neighborhood, address, rent, deposit, property type, amenities, availability, and home attributes.
4. Owner uploads photos.
5. Owner submits the form.
6. System validates all required fields.
7. System verifies the authenticated user is allowed to create listings.
8. System creates a listing record linked to the authenticated owner.
9. System stores listing images and associates them with the listing.
10. System returns a success result.
11. System redirects the owner to the created listing or dashboard.

### Alternative flows
A1. Invalid form data
- System displays field-level errors and does not save the listing.

A2. Invalid image upload
- System rejects the upload and instructs the owner to choose valid files.

A3. Unauthorized request
- System denies access and logs the authorization failure.

A4. Database failure
- System returns an error and leaves the listing in a non-created state.

### Postconditions
- Listing exists in the database.
- Listing belongs to the authenticated owner.
- Listing is in an active or draft lifecycle state depending on product policy.

### Acceptance criteria
- An owner can create a listing with valid data.
- Invalid input is rejected before persistence.
- Unauthorized requests are denied.
- Listing is associated with the correct owner.

---

## UC-04 — Edit Rental Listing

### Actor
Owner

### Description
An owner updates details on a listing they created.

### Preconditions
- User is authenticated.
- User owns the listing being edited.

### Trigger
Owner selects Edit listing from their own listing management screen or detail page.

### Main flow
1. System loads the owner's listing data.
2. System displays the edit form with current values.
3. Owner changes one or more listing fields.
4. Owner submits the updated form.
5. System validates the new values.
6. System verifies ownership of the listing.
7. System updates the listing record.
8. System updates associated images if new uploads are added.
9. System confirms success.

### Alternative flows
A1. Invalid field values
- System rejects the update and shows validation messages.

A2. Unauthorized access
- System denies the edit and returns a forbidden response.

A3. Listing not found
- System displays a not-found error.

A4. Database write failure
- System shows an error and keeps the previous version of the listing intact.

### Postconditions
- Listing data has been updated.
- Ownership remains unchanged.
- Search results reflect the latest valid information.

### Acceptance criteria
- Only the listing owner can edit it.
- Updates persist correctly.
- Invalid data is not saved.

---

## UC-05 — Search Listings

### Actor
Visitor / Seeker

### Description
A user searches for properties using city, neighborhood, filters, and pricing criteria.

### Preconditions
- Application is available.
- User can access the browse/search page.

### Trigger
User enters search criteria and submits the filter form.

### Main flow
1. User opens the search page.
2. User enters city and optional neighborhood filters.
3. User optionally applies filters such as price range, property type, furnished status, gender preference, and utilities inclusion.
4. User submits the search.
5. System validates the filter values.
6. System queries active listings matching the filters.
7. System orders or paginates the results.
8. System returns a result list of listing cards.
9. User reviews the listed results.

### Alternative flows
A1. Empty search criteria
- System returns the default active listings or a generalized set.

A2. Invalid numeric filters
- System rejects invalid values and displays a helpful message.

A3. No results found
- System displays an empty state with guidance.

A4. System/database query failure
- System returns a generic error state.

### Postconditions
- Relevant listings are displayed to the user.
- Search state reflects the requested filters.

### Acceptance criteria
- Search supports city and neighborhood filters.
- Price and amenity filters are applied correctly.
- Empty or invalid filters are handled gracefully.

---

## UC-06 — View Listing Details

### Actor
Visitor / Seeker

### Description
A user views a specific listing in detail.

### Preconditions
- Listing exists and is active or at least publicly visible according to policy.

### Trigger
User clicks a listing card or link from search results.

### Main flow
1. User selects a listing from search results.
2. System loads listing detail data.
3. System retrieves property attributes, media, price, address, and owner information as allowed by policy.
4. System renders the listing detail page.
5. User sees all relevant property information and actions.
6. User may choose to save the listing, contact the owner, or report it if authenticated.

### Alternative flows
A1. Listing not found
- System renders a not-found state.

A2. Listing is hidden or archived
- System may show a restricted or unavailable message.

A3. Media retrieval fails
- System shows the listing without images or with a placeholder.

### Postconditions
- User has viewed the listing information.
- Appropriate actions are available depending on authentication state.

### Acceptance criteria
- Public listing detail view works for valid active listings.
- Hidden or invalid listings are not shown as normal results.
- Relevant actions are displayed based on auth state.

---

## UC-07 — Calculate Roommate Cost

### Actor
Seeker

### Description
A user calculates the estimated monthly cost per person for a shared rental and utilities arrangement.

### Preconditions
- User is on a listing detail page or rental cost calculator page.
- Listing contains rent and associated utility data or a modeled estimate.

### Trigger
User opens or interacts with the roommate cost estimator.

### Main flow
1. System displays the roommate cost calculator.
2. User enters or confirms monthly rent and expected number of sharers.
3. User enters or confirms estimated utility values.
4. System calculates per-person rent.
5. System calculates per-person utility cost.
6. System sums rent/person and utilities/person to produce a total estimated monthly cost.
7. System displays the final result to the user.

### Alternative flows
A1. Missing values
- System prompts for required rental or utility amounts.

A2. Zero or invalid values
- System rejects invalid numeric input.

A3. Calculation not applicable
- System shows fallback text or disables the calculation.

### Postconditions
- User sees a clear cost estimate per person.
- Estimate is based on known values and the system formula.

### Acceptance criteria
- The formula produces a correct per-person estimate.
- Invalid values are rejected.
- The result is presented clearly and understandably.

---

## UC-08 — Calculate Affordability

### Actor
Seeker

### Description
A user estimates whether the monthly housing cost is manageable based on income and expenses.

### Preconditions
- User is authenticated or has access to the calculator if the product allows guest access.

### Trigger
User opens the affordability calculator and submits monthly financial inputs.

### Main flow
1. System displays inputs for income, rent, utilities, transport, food, and other expenses.
2. User enters values.
3. User submits the form.
4. System calculates remaining income after deductions.
5. System calculates housing cost Percentage = (housing cost / income) x 100.
6. System categorizes the result as manageable, moderate, or high burden according to internal thresholds.
7. System displays the result with a clear note that it is an estimate only.

### Alternative flows
A1. Missing or invalid input
- System shows validation messages.

A2. Income is zero or negative
- System rejects input as invalid.

A3. Calculation result is extreme
- System displays the result but still labels it as estimate-based.

### Postconditions
- User receives an affordability assessment.
- Result is presented as informational, not as financial advice.

### Acceptance criteria
- Calculation uses the values entered by the user.
- Output is clearly labeled as an estimate.
- Invalid values are not accepted.

---

## UC-09 — Save Listing

### Actor
Seeker

### Description
A user saves a listing for later comparison.

### Preconditions
- User is authenticated.
- Listing exists.

### Trigger
User clicks the Save or Favorite button on the listing page or result card.

### Main flow
1. User clicks Save on a listing.
2. System verifies the user is authenticated.
3. System verifies the listing exists and is not already saved by the same user.
4. System creates a saved listing association.
5. System returns success feedback.
6. System shows the listing in the user's saved listings area.

### Alternative flows
A1. Listing already saved
- System shows a no-op or duplicate error state.

A2. Unauthorized access
- System denies the action.

A3. Listing not found
- System returns a not-found state.

### Postconditions
- Saved listing relation exists in the database.
- User can access saved listings in their dashboard or profile.

### Acceptance criteria
- A user can save and unsave a listing.
- Duplicate saves are prevented.
- Saved items are associated with the correct user.

---

## UC-10 — Contact Owner

### Actor
Seeker

### Description
A user sends a message to the owner of a listing.

### Preconditions
- User is authenticated.
- Listing exists.
- User is not contacting themselves, if that rule is enforced.

### Trigger
User clicks Contact owner on a listing detail page.

### Main flow
1. User opens the listing detail page.
2. User clicks Contact owner.
3. System displays a message form.
4. User enters a message.
5. User submits the form.
6. System validates the form content.
7. System verifies the user is authenticated and may contact the owner.
8. System stores a message record with sender, receiver, listing, and content.
9. System confirms success.

### Alternative flows
A1. Message empty or too long
- System rejects the message and asks for correction.

A2. Unauthorized access
- System denies the action.

A3. Listing owner not available
- System informs the user the listing cannot be contacted.

A4. Database failure
- System returns an error.

### Postconditions
- A message exists for the owner inquiry.
- The contact flow is recorded for future conversation workflows.

### Acceptance criteria
- Authenticated users can contact listing owners.
- Messages are linked to sender, recipient, and listing.
- Empty messages are blocked.

---

## UC-11 — Report Listing

### Actor
Seeker

### Description
A user reports a suspicious or misleading listing.

### Preconditions
- User is authenticated.
- Listing exists.
- User is not the owner of the listing.

### Trigger
User selects Report listing from the listing page.

### Main flow
1. User opens the report form from the listing detail page.
2. System displays options for report reason and explanation.
3. User selects a reason.
4. User optional adds explanation text.
5. User submits the report.
6. System validates the reason and optional text.
7. System verifies the reporter is authenticated and not the listing owner.
8. System stores a report record with status pending.
9. System informs the user the report was submitted.

### Alternative flows
A1. Missing reason
- System rejects the report and requires a valid selection.

A2. Duplicate report
- System informs the user that the listing was already reported or limits further duplicates.

A3. Unauthorized access
- System denies the report.

A4. Database failure
- System returns an unavailable state.

### Postconditions
- Report exists in the system.
- Admin can review the report.

### Acceptance criteria
- A valid report is stored with status pending.
- The reporter cannot report their own listing.
- Reports are visible to admin moderation workflows.

---

## UC-12 — Moderate Report

### Actor
Admin

### Description
An administrator reviews and resolves a user-submitted listing report.

### Preconditions
- User is authenticated.
- User has admin privileges.
- At least one report exists.

### Trigger
Admin opens the moderation dashboard and selects a report.

### Main flow
1. Admin opens the admin dashboard.
2. Admin views list of pending reports.
3. Admin selects a report.
4. System shows listing details, reporter data, reason, and report notes.
5. Admin decides to resolve or escalate the case.
6. Admin updates the report status.
7. System records the status update and resolution time.
8. Admin may hide or remove the listing if the report is valid.
9. System confirms completion.

### Alternative flows
A1. Report is invalid
- Admin marks it rejected and records explanation.

A2. Listing is fraudulent or suspicious
- Admin hides or removes the listing and marks the report resolved.

A3. Database/update failure
- System returns an error without losing the previous state.

### Postconditions
- Report status reflects the admin decision.
- Listing may be hidden or restricted if appropriate.

### Acceptance criteria
- Admins can review reports and update status.
- Reports are resolved through a consistent workflow.
- Moderation actions are auditable.

---

## UC-13 — Suspend User

### Actor
Admin

### Description
An administrator suspends a user who violates platform rules or repeatedly abuses the system.

### Preconditions
- User is authenticated.
- User has admin privileges.
- Target user exists.

### Trigger
Admin selects a user record from the moderation dashboard or user management view.

### Main flow
1. Admin opens the user management dashboard.
2. Admin selects a target user.
3. Admin reviews user activity or warnings.
4. Admin chooses suspend account.
5. System verifies the admin has privilege to do so.
6. System updates the target user's status to suspended.
7. System prevents the suspended user from logging in or accessing protected actions.
8. System logs the action for moderation history.
9. System confirms the suspension.

### Alternative flows
A1. User is already suspended
- System informs admin of current state.

A2. User is admin or protected account
- System prevents suspension if unsupported by business policy.

A3. Database failure
- System surfaces an error and keeps current state unchanged.

### Postconditions
- Target user is suspended.
- User loses access to protected features.
- Moderation history records the action.

### Acceptance criteria
- Admin can suspend a user using the admin workflow.
- Suspended users cannot access the system.
- Suspension action is logged and enforceable.

---

## 4. Use-Case Relationships and Cross-Cutting Rules

### Authorization matrix
| Action | Visitor | Seeker | Owner | Admin |
|---|---:|---:|---:|---:|
| Register | Yes | No | No | No |
| Log in | Yes | Yes | Yes | Yes |
| Browse listings | Yes | Yes | Yes | Yes |
| Create listing | No | No | Yes | No |
| Edit own listing | No | No | Yes | Possibly |
| Save listing | No | Yes | Yes | No |
| Contact owner | No | Yes | Yes | No |
| Report listing | No | Yes | Yes | No |
| Review reports | No | No | No | Yes |
| Suspend users | No | No | No | Yes |

### Shared rules
- The system must enforce authentication before protected actions.
- Authorization must be checked at the server side, not just in the frontend.
- The actor identities must match the user session and the target resource ownership.
- Admin actions should be logged for review and auditability.

---

## 5. Use-Case Acceptance Coverage

The use cases above cover the primary user flows defined in the SRS and the V1 scope:

- authentication
- listings
- price and affordability logic
- saved listings
- contact and reporting
- moderation

The use cases intentionally exclude:

- real-time chat
- payments
- map-based location discovery
- AI-based matching
- advanced fraud detection

These are explicitly outside the V1 specification and remain future work.
