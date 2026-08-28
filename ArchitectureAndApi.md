# Meskni — System Architecture & API Specification

## 1. Purpose
This document defines the architecture and API contract for Meskni V1 before implementation begins. It translates the requirements, use cases, flows, and database model into a concrete engineering structure for the frontend, backend, authentication, data access, and integrations.

The purpose is to ensure that the project is built as a coherent full-stack system rather than as disconnected screens and ad hoc API routes.

---

## 2. Product Architecture Summary

### 2.1 High-level architecture

```text
                      ┌─────────────────────────────┐
                      │          Browser           │
                      │      React + TypeScript     │
                      └──────────────┬──────────────┘
                                     │ HTTPS / JSON
                                     ▼
                      ┌─────────────────────────────┐
                      │      Laravel API Layer      │
                      │  routes / controllers /     │
                      │  requests / resources /     │
                      │  policies / middleware      │
                      └──────────────┬──────────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
                  ▼                  ▼                  ▼
          ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
          │ PostgreSQL   │   │ File Storage │   │ Email/SMS    │
          │  Database    │   │ Images / AVs │   │ future infra │
          └──────────────┘   └──────────────┘   └──────────────┘
```

### 2.2 Design approach
The system is split into three primary layers:

- Frontend: user interaction, validation, rendering, route navigation
- Backend: business logic, authorization, validation, persistence
- Data layer: PostgreSQL for relational data, object storage for images and uploads

This separation is important because:

- the backend owns authorization and validation
- the frontend owns UX and form behavior
- both layers validate input but only the server is authoritative

---

## 3. Recommended Technology Stack

### 3.1 Frontend
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios or fetch wrapper
- React Hook Form
- Zod (validation schema support)

### 3.2 Backend
- Laravel
- PHP
- Laravel Sanctum (for API auth)
- Laravel Form Requests
- Laravel Policies
- API Resources
- PHPUnit / Pest

### 3.3 Database
- PostgreSQL

### 3.4 Storage
- Local disk for V1 or cloud storage such as S3-compatible object storage

### 3.5 Dev tooling
- Git + GitHub
- Postman or Insomnia
- Docker optional for local environment parity

---

## 4. Architectural Principles

### 4.1 Security by default
- protect all modifying routes with auth
- verify ownership on listing updates and deletion
- enforce admin permissions on moderation routes
- validate all data server-side
- never trust client input for authorization

### 4.2 Separation of concerns
- UI handles display and interaction
- API handles requests and responses
- service layer handles complex business calculations
- model layer handles persistence and relationships
- policies decide access

### 4.3 Feature slices over monolithic coding
The backend should be implemented in complete feature slices, not broad untested infrastructure.

### 4.4 Business logic in services
Rules such as:

- roommate cost calculation
- affordability calculation
- report moderation decisions

should live in dedicated service classes instead of controllers.

---

## 5. Frontend Architecture

### 5.1 Suggested application structure

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── listing/
│   │   ├── ListingCard.tsx
│   │   ├── ListingGallery.tsx
│   │   └── ListingFilters.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── calculators/
│   │   ├── RoommateCostCalculator.tsx
│   │   └── AffordabilityCalculator.tsx
│   └── admin/
│       ├── ReportsTable.tsx
│       └── UsersTable.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── SearchPage.tsx
│   ├── ListingDetailPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── SavedListingsPage.tsx
│   ├── MessagesPage.tsx
│   ├── CreateListingPage.tsx
│   ├── EditListingPage.tsx
│   └── admin/
│       ├── AdminDashboardPage.tsx
│       ├── ReportsPage.tsx
│       └── UsersPage.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useListings.ts
│   ├── useSavedListings.ts
│   └── useReports.ts
├── services/
│   ├── api.ts
│   ├── authApi.ts
│   ├── listingApi.ts
│   ├── savedListingsApi.ts
│   ├── messagesApi.ts
│   └── reportApi.ts
├── types/
│   ├── auth.ts
│   ├── listing.ts
│   ├── report.ts
│   └── user.ts
├── utils/
│   ├── format.ts
│   ├── validation.ts
│   └── constants.ts
└── styles/
    └── index.css
```

### 5.2 Frontend pages and user groups

#### Public pages
- Home
- Search results
- Listing details
- Login
- Register

#### Authenticated user pages
- Dashboard
- Saved listings
- Message inbox
- Profile
- Create listing
- Edit listing

#### Admin pages
- Admin dashboard
- Reports queue
- User moderation

---

## 6. Backend Architecture

### 6.1 Laravel application structure

```text
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── ListingController.php
│   │   ├── SavedListingController.php
│   │   ├── MessageController.php
│   │   ├── ReportController.php
│   │   └── AdminController.php
│   ├── Middleware/
│   │   ├── EnsureUserIsOwner.php
│   │   └── EnsureUserIsAdmin.php
│   ├── Requests/
│   │   ├── StoreListingRequest.php
│   │   ├── UpdateListingRequest.php
│   │   ├── LoginRequest.php
│   │   ├── RegisterRequest.php
│   │   ├── StoreReportRequest.php
│   │   └── StoreMessageRequest.php
│   └── Resources/
│       ├── ListingResource.php
│       ├── UserResource.php
│       ├── ReportResource.php
│       └── MessageResource.php
├── Models/
│   ├── User.php
│   ├── Listing.php
│   ├── ListingImage.php
│   ├── SavedListing.php
│   ├── Message.php
│   ├── Report.php
│   └── ModerationAction.php
├── Policies/
│   ├── ListingPolicy.php
│   ├── ReportPolicy.php
│   └── UserPolicy.php
├── Services/
│   ├── RoommateCostCalculator.php
│   ├── AffordabilityCalculator.php
│   ├── ListingSearchService.php
│   └── FileUploadService.php
├── Exceptions/
│   └── Handler.php
└── Providers/
    └── AppServiceProvider.php
```

### 6.2 Core backend responsibilities
- authentication and session handling
- listing CRUD and validation
- search and filtering logic
- listing image upload handling
- saved listing persistence
- message persistence
- report creation and moderation
- role-based authorization
- business calculations
- error standardization

---

## 7. Authentication & Authorization Strategy

### 7.1 Authentication mechanism
Use Laravel Sanctum for API authentication.

Recommended auth flow:

- POST /api/register
- POST /api/login
- GET /api/me
- POST /api/logout

Use:

- token-based API auth for SPA or React client
- session-based auth only if the app later becomes a hybrid server-rendered app

### 7.2 Role model
The V1 role model is simple and explicit:

- seeker
- owner
- admin

The user is authenticated and then authorized by role. Public registration must only allow `seeker` and `owner`; `admin` is created manually or through a controlled admin bootstrap path.

### 7.3 Authorization rules
- Visitor: public browsing only
- Seeker: can save listings, contact owners, report listings
- Owner: can create and manage own listings
- Admin: can moderate reports, inspect listings, suspend users

### 7.4 Authorization implementation
Use Laravel policies and middleware:

- ListingPolicy
  - view
  - update
  - delete
- ReportPolicy
  - review
  - resolve
- UserPolicy
  - suspend

### 7.5 Access results
- 401 Unauthorized for unauthenticated access
- 403 Forbidden for authenticated but not allowed
- 404 Not Found for missing resource
- 422 Unprocessable Entity for validation issues

---

## 8. API Design Principles

### 8.1 Base URL
```text
/api
```

### 8.2 Response format
All JSON responses should follow a consistent structure.

#### Success response
```json
{
  "data": {
    "id": 42,
    "title": "Bright room near Agdal"
  },
  "message": "Listing created successfully"
}
```

#### Error response
```json
{
  "message": "Validation failed",
  "errors": {
    "rent": ["The rent field is required."]
  }
}
```

### 8.3 Pagination response format
```json
{
  "data": [
    { "id": 1, "title": "..." }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 12,
    "total": 142,
    "last_page": 12
  }
}
```

### 8.4 HTTP status codes
- 200 OK for successful reads and updates
- 201 Created for new resource creation
- 204 No Content for successful deletion
- 400 Bad Request for malformed requests
- 401 Unauthorized for missing or invalid auth
- 403 Forbidden for insufficient permissions
- 404 Not Found for missing resources
- 422 Unprocessable Entity for validation failures
- 500 Internal Server Error for unexpected failures

---

## 9. API Specification

## 9.1 Authentication endpoints

### POST /api/register
Create a new user account.

#### Request body
```json
{
  "name": "Sara Benali",
  "email": "sara@example.com",
  "phone": "+212600000000",
  "password": "StrongPass123!",
  "city": "Rabat",
  "role": "seeker"
}
```

#### Validation rules
- name required
- email required, unique, valid format
- phone required, unique
- password required, min 8
- city required
- role in [seeker, owner] only for public registration
- admin creation is not permitted via public registration

#### Responses
- 201: user created
- 422: invalid input
- 409: duplicate user data

---

### POST /api/login
Authenticate an existing user.

#### Request body
```json
{
  "email": "sara@example.com",
  "password": "StrongPass123!"
}
```

#### Responses
- 200: returns auth token and user payload
- 401: invalid credentials
- 403: suspended or restricted account

---

### POST /api/logout
Log the authenticated user out.

#### Authentication
Required

#### Responses
- 200: successful logout

---

### GET /api/me
Fetch the authenticated user profile.

#### Authentication
Required

#### Response
```json
{
  "data": {
    "id": 7,
    "name": "Sara Benali",
    "email": "sara@example.com",
    "role": "seeker",
    "city": "Rabat"
  }
}
```

---

## 9.2 Listing endpoints

### GET /api/listings
Return a list of active listings with filters.

#### Query parameters
- city
- neighborhood
- min_price
- max_price
- property_type
- listing_type
- furnished
- internet_included
- parking
- available_from
- gender_preference
- page
- per_page

#### Example
```text
GET /api/listings?city=Rabat&neighborhood=Agdal&min_price=1500&max_price=4000&page=1
```

#### Response
```json
{
  "data": [
    {
      "id": 12,
      "title": "Bright room near Agdal",
      "city": "Rabat",
      "neighborhood": "Agdal",
      "rent": 2000,
      "property_type": "room",
      "listing_type": "private_room"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 12,
    "total": 46,
    "last_page": 4
  }
}
```

---

### GET /api/listings/{id}
Fetch one listing by ID.

#### Authentication
Not required for public listing view.

#### Response
```json
{
  "data": {
    "id": 12,
    "owner_id": 5,
    "title": "Bright room near Agdal",
    "description": "Well-lit room near Agdal center",
    "city": "Rabat",
    "neighborhood": "Agdal",
    "property_type": "room",
    "listing_type": "private_room",
    "rent": 2000,
    "estimated_utilities": 350,
    "available_from": "2026-10-01",
    "bedrooms": 1,
    "bathrooms": 1,
    "furnished": true,
    "internet_included": true,
    "parking": false,
    "gender_preference": "female",
    "current_occupants": 1,
    "available_spots": 1,
    "status": "active"
  }
}
```

---

### POST /api/listings
Create a listing.

#### Authentication
Required, owner role

#### Request body
```json
{
  "title": "Bright room near Agdal",
  "description": "Comfortable room in central area",
  "property_type": "room",
  "listing_type": "private_room",
  "city": "Rabat",
  "neighborhood": "Agdal",
  "address": "Rue Mohammed V",
  "rent": 2000,
  "estimated_utilities": 350,
  "deposit": 500,
  "available_from": "2026-10-01",
  "bedrooms": 1,
  "bathrooms": 1,
  "surface_area": 30,
  "furnished": true,
  "internet_included": true,
  "parking": false,
  "gender_preference": "female",
  "current_occupants": 1,
  "available_spots": 1,
  "max_occupants": 2,
  "status": "active"
}
```

#### Validation rules
- title required
- description required
- property_type required in allowed list
- listing_type required in allowed list
- city required
- neighborhood required
- rent numeric and min 0
- deposit numeric and min 0
- available_from valid date
- gender_preference allowed
- owner role required

#### Response
- 201 Created
- 422 Validation error
- 403 Forbidden for unauthorized user

---

### PUT /api/listings/{id}
Update an existing listing.

#### Authentication
Required

#### Authorization
User must own the listing or be admin.

#### Response
- 200 OK on success
- 403 if user is not the owner
- 404 if listing is missing

---

### PATCH /api/listings/{id}/archive
Archive a listing.

#### Authentication
Required

#### Authorization
Owner or admin only

#### Behavior
- owner action: archive their own listing
- admin action: hide or remove the listing from public search
- the listing is not physically deleted in V1, because reports and moderation history may still reference it

#### Response
- 200 OK on success
- 403 if unauthorized
- 404 if listing is missing

> V1 should not implement a generic hard-delete listing endpoint for ordinary users. Soft archive is the default lifecycle; admin removal can be a separate administrative action if required.

---

## 9.3 Listing image endpoints

### POST /api/listings/{id}/images
Upload one or more images for a listing.

#### Authentication
Required, owner or admin

#### Request
Multipart form data with files.

#### Validation
- file type allowed: jpeg, png, webp
- max file size limit
- max number of images per listing

#### Response
```json
{
  "data": {
    "listing_id": 12,
    "images": [
      { "id": 31, "image_url": "/storage/listings/12/1.jpg" }
    ]
  }
}
```

---

### DELETE /api/listings/{id}/images/{image}
Delete one listing image.

#### Authentication
Required

#### Authorization
Listing owner or admin

---

## 9.4 Saved listing endpoints

### GET /api/saved-listings
Return the authenticated user's saved listings.

#### Authentication
Required

#### Response
```json
{
  "data": [
    { "id": 7, "listing_id": 12, "title": "Bright room near Agdal" }
  ]
}
```

---

### POST /api/listings/{id}/save
Save a listing.

#### Authentication
Required

#### Behavior
- if listing does not exist => 404
- if already saved => return 409 or 200 with existing state
- if success => create saved_listings record

---

### DELETE /api/listings/{id}/save
Remove a saved listing.

#### Authentication
Required

---

## 9.5 Inquiry / message endpoints

The V1 design is an inquiry and message system, not a full chat application. This keeps the product simple while still supporting owner contact flows and future conversational expansion.

### POST /api/listings/{id}/messages
Send a message to the listing owner.

#### Authentication
Required

#### Request body
```json
{
  "content": "Hi, is this room still available?"
}
```

#### Validation
- content required
- content length within limit
- listing exists
- user may not message themselves if business rule forbids it

#### Response
```json
{
  "data": {
    "id": 99,
    "sender_id": 7,
    "receiver_id": 5,
    "listing_id": 12,
    "content": "Hi, is this room still available?",
    "created_at": "2026-08-28T12:00:00Z"
  }
}
```

---

### GET /api/messages
Fetch messages for the authenticated user.

#### Authentication
Required

#### Query parameters
- page
- listing_id optional

---

## 9.6 Report endpoints

### POST /api/listings/{id}/reports
Submit a listing report.

#### Authentication
Required

#### Request body
```json
{
  "reason": "scam_or_fraud",
  "description": "The owner requested a deposit before a viewing."
}
```

#### Validation
- reason required and valid option
- description optional but limited length
- reporter cannot be listing owner
- duplicate report prevented when appropriate

#### Response
- 201 Created

---

### GET /api/admin/reports
Fetch report queue for admin.

#### Authentication
Required, admin role

#### Query params
- status
- page

#### Response
```json
{
  "data": [
    {
      "id": 4,
      "listing_id": 19,
      "reason": "scam_or_fraud",
      "status": "pending"
    }
  ]
}
```

---

### PUT /api/admin/reports/{id}
Update report status.

#### Authentication
Required, admin role

#### Request body
```json
{
  "status": "resolved",
  "notes": "Listing was removed after investigation."
}
```

#### Response
- 200 OK

---

## 9.7 Admin user management endpoints

### GET /api/admin/users
List users for moderation.

#### Authentication
Required, admin role

---

### PUT /api/admin/users/{id}/suspend
Suspend a user.

#### Authentication
Required, admin role

#### Request body
```json
{
  "status": "suspended",
  "notes": "Repeated scam reports and suspicious behavior."
}
```

---

## 10. Core Business Logic Services

### 10.1 RoommateCostCalculator
Responsible for calculating per-person rent and utility costs.

#### Input
- rent
- estimated_utilities
- number_of_people

#### Formula
```text
rent_per_person = rent / number_of_people
utilities_per_person = estimated_utilities / number_of_people
total_per_person = rent_per_person + utilities_per_person
```

#### Example
```json
{
  "rent": 4000,
  "estimated_utilities": 750,
  "number_of_people": 2,
  "rent_per_person": 2000,
  "utilities_per_person": 375,
  "total_per_person": 2375
}
```

### 10.2 AffordabilityCalculator
Responsible for estimating affordability.

#### Input
- income
- housing_cost
- utilities
- transport
- food
- other

#### Formula
```text
total_expenses = housing_cost + utilities + transport + food + other
remaining = income - total_expenses
housing_share = (housing_cost / income) * 100
```

#### Example output
```json
{
  "income": 6500,
  "housing_cost": 2000,
  "utilities": 375,
  "transport": 400,
  "food": 1500,
  "other": 300,
  "total_expenses": 4575,
  "remaining": 1925,
  "housing_share": 30.77,
  "status": "manageable"
}
```

### 10.3 ListingSearchService
Responsible for building the listing query with filters.

#### Filters
- city
- neighborhood
- price range
- property_type
- listing_type
- furnished
- internet_included
- parking
- available_from
- gender_preference
- status = active only

#### Performance note
For V1, keep the initial search stack simple: PostgreSQL queries with proper indexes and a focused service layer. Do not introduce broad full-text or search infrastructure before measuring query patterns and product performance.

---

## 11. Validation Rules and Policies

### 11.1 Form request validation
Each route should use a dedicated request class to enforce validation rules and messages.

Examples:
- RegisterRequest
- LoginRequest
- StoreListingRequest
- UpdateListingRequest
- StoreReportRequest
- StoreMessageRequest

### 11.2 Policies
- ListingPolicy
  - update, delete, view
- ReportPolicy
  - viewAny, update
- UserPolicy
  - suspend

### 11.3 Middleware
- auth:sanctum
- admin
- owner
- ensureListingOwner

---

## 12. File Upload Strategy

### 12.1 Storage model
- images stored in object storage or local disk
- URL/path stored in listing_images
- metadata stored in database

### 12.2 Validation rules
- allowed MIME types: jpg, jpeg, png, webp
- max upload size: 2MB per file or agreed project limit
- max images per listing: define per product limit
- sanitize filenames
- isolate uploads by listing ID or folder

### 12.3 Security notes
- never trust client file names
- verify MIME type on the server
- reject suspicious files early
- do not expose raw storage paths to users

---

## 13. Error Handling Strategy

### 13.1 Global behavior
Use Laravel exception handling to normalize errors into JSON responses.

Examples:
- ValidationException => 422
- AuthenticationException => 401
- AuthorizationException => 403
- ModelNotFoundException => 404

### 13.2 User-safe error messages
The user should never see raw stack traces or database details.

---

## 14. Pagination and Filtering Convention

### 14.1 Query parameter examples
```text
?page=2&per_page=12
&city=Rabat
&neighborhood=Agdal
&min_price=1500
&max_price=4000
&property_type=room
&listing_type=private_room
&furnished=true
```

### 14.2 Default behavior
- default page size 12
- sort by newest first for listing results unless otherwise specified

---

## 15. Recommended V1 Build Order

The implementation sequence should be kept practical and product-focused, with one complete vertical slice before broad UI work.

1. Foundation
   - Laravel project
   - PostgreSQL
   - Sanctum
   - React + Vite + TypeScript
   - Tailwind
   - environment configuration

2. Database
   - users
   - listings
   - listing_images
   - saved_listings
   - messages
   - reports
   - moderation_actions

3. Authentication
   - Register
   - Login
   - Logout
   - /me
   - auth middleware
   - role authorization

4. Listings
   - Create
   - Read
   - Update
   - Archive
   - listing images
   - listing policies

5. Search
   - City
   - Neighborhood
   - Price
   - Property type
   - Listing type
   - Amenities
   - Availability
   - Pagination

6. User features
   - Save listing
   - Remove saved listing
   - Inquiry/message
   - dashboard

7. Trust & safety
   - Report listing
   - Admin report queue
   - Resolve/reject reports
   - Suspend users
   - Moderation audit log

8. Product logic
   - Roommate calculator
   - Affordability calculator
   - Listing cost calculations

9. Frontend polish
   - Responsive UI
   - Loading states
   - Empty states
   - Error states
   - Form validation
   - Accessibility

10. Testing + deployment
   - API tests
   - Authorization tests
   - Validation tests
   - Frontend integration
   - Production database
   - Storage
   - Deployment

> The first end-to-end slice should be: Register → Login → Create Listing → Upload Images → Search Listing → View Listing.
> That is the minimum product demonstration that turns Meskni from a set of screens into a functioning application.

---

## 16. Deployment Architecture

### 16.1 Production topology
```text
Internet
  │
  ▼
Frontend (Vercel or Netlify)
  │
  ▼
Laravel API (Render / Railway / VPS)
  │
  ▼
PostgreSQL (managed service)
  │
  ▼
Object storage (S3-compatible)
```

### 16.2 Production environment variables
- APP_URL
- DB_CONNECTION
- DB_HOST
- DB_DATABASE
- DB_USERNAME
- DB_PASSWORD
- SANCTUM_STATEFUL_DOMAINS
- FILESYSTEM_DISK
- STORAGE_BUCKET
- MAIL_* values

---

## 17. Final Engineering Interpretation

The architecture and API specification define the required shape of the application before implementation begins.

This is important because it creates a disciplined link between:

- requirements
- database model
- backend routes
- authorization rules
- frontend pages
- tests
- deployment

This is how a real product is built, and it is the correct stage before writing controllers or frontend pages.

The Meskni V1 system is deliberately constrained to a powerful but manageable scope:

- auth and RBAC
- listings and images
- search and filters
- cost calculations
- saved listings
- message inquiries
- reports and moderation

That is a strong, realistic full-stack project for a portfolio and an excellent learning path.
