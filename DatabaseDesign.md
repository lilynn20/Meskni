# Meskni — Database Design & ERD

## 1. Purpose
This document turns the product requirements, use cases, and user flows into a normalized relational database design. The goal is to define the actual data objects Meskni must store, the relationships among them, and the integrity rules needed to support authentication, listing management, saved listings, contact flow, reporting, and moderation.

The design is grounded in the V1 scope and deliberately excludes future features such as real-time chat, payments, map services, and AI-based matching.

---

## 2. Design Method
The database is derived in this order:

1. Extract entities from user flows and requirements
2. Determine the identity and lifecycle of each entity
3. Define relationships and cardinality
4. Normalize the schema to avoid duplication and invalid state
5. Define constraints, indexes, and audit fields
6. Convert the design into a relational model suitable for Laravel migrations

---

## 3. Entity Extraction from the Product Flows

The product flows imply the following primary data objects:

- User
- Listing
- ListingImage
- SavedListing
- Message
- Report
- ModerationAction
- User status

### Important modeling decision
For V1, role is modeled directly on the user record rather than as a separate roles table.

```text
users.role = seeker | owner | admin
```

However, the public registration flow should only allow `seeker` and `owner`. `admin` is a protected role created manually by an existing admin or system user and is not exposed through the public registration endpoint.

This is intentionally simpler than a user_roles bridge table because the product does not require multiple simultaneous roles per user in the initial version.

### 3.1 Entity decision: tables vs enum-like fields

Some values are clearly better represented as enums or constrained fields rather than separate tables in V1.

#### Candidate fields that should be enum-like or restricted values
- role
  - seeker
  - owner
  - admin
- user status
  - active
  - suspended
  - pending_verification
- listing status
  - active
  - rented
  - archived
  - draft
- property_type
  - apartment
  - room
  - studio
  - house
- gender_preference
  - any
  - female
  - male
- report reason
  - scam_or_fraud
  - duplicate_listing
  - incorrect_information
  - property_does_not_exist
  - inappropriate_content
  - other
- report status
  - pending
  - under_review
  - resolved
  - rejected

These can be implemented as:

- PostgreSQL/MySQL enum columns
- Laravel string columns with validation constraints
- a small lookup table if the team wants full relational normalization later

For V1, using constrained string enums is usually the simplest and cleanest approach unless there is a strong need for admin-managed lookups.

---

## 4. Core Domain Model

## 4.1 User
A User is the central identity in the system.

The User model stores authentication and account data.

### User attributes
- id
- name
- email
- phone
- password
- city
- role
- status
- avatar_url
- email_verified_at
- created_at
- updated_at
- deleted_at (optional for soft delete)

### Why these fields exist
- name: for profile display and communication
- email: for authentication and contact
- phone: for registration and account recovery
- password: required for secure auth; stored as a hashed password value, not in plain text
- city: important for listing/search relevance
- role: differentiates seeker, owner, admin
- status: supports suspension and moderation control
- avatar_url: supports profile management
- email_verified_at: supports secure account flow

### Design note
Password reset and session management are not modeled as bespoke columns on users in V1. Laravel's built-in auth and password reset support should be used instead.

### User lifecycle states
A user can be:
- active
- suspended
- pending_verification

Deletion is handled through `deleted_at` soft deletion rather than a normal status value. This keeps historical integrity for listings, reports, and moderation logs.

For V1, the most important state is active vs suspended.

---

## 4.2 Listing
A Listing is the primary product object for the marketplace.

### Listing attributes
- id
- owner_id
- title
- description
- property_type
- listing_type
- city
- neighborhood
- address
- rent
- estimated_utilities
- deposit
- available_from
- bedrooms
- bathrooms
- surface_area
- furnished
- internet_included
- parking
- gender_preference
- current_occupants
- available_spots
- max_occupants
- status

### V1 occupancy invariant
The listing must maintain a consistent occupancy model:

```text
current_occupants + available_spots <= max_occupants
```

This ensures the listing cannot claim more free places than the property allows. The validation should be enforced in business logic and can be mirrored with a database check if desired.
- created_at
- updated_at
- deleted_at (optional)

### Why these fields exist
- owner_id: identifies who published the listing
- title, description: core content
- property_type: apartment, room, studio, or house
- listing_type: entire_place, private_room, or shared_room; this is important for roommate modeling in V1
- city, neighborhood, address: essential for search and location
- rent, estimated_utilities, deposit: pricing and cost calculations for rents and shared occupancy
- available_from: critical for availability filtering
- bedrooms, bathrooms, surface_area: property comparison
- furnished, internet_included, parking: amenities and filters
- gender_preference: supports listing-specific compatibility rules
- current_occupants: how many people currently occupy the place
- available_spots: how many roommate slots still exist
- max_occupants: maximum people expected or allowed in the property
- status: allows active, rented, archived, or draft states

### Listing status values
- active
- rented
- archived
- draft

### Listing type values
- entire_place
- private_room
- shared_room

### Important note
The model intentionally supports the product's roommate logic without introducing a separate roommate table in V1. The listing itself carries the occupancy and cost context required for calculations.

---

## 4.3 ListingImage
A ListingImage is the media object for a listing.

### ListingImage attributes
- id
- listing_id
- image_url
- sort_order
- created_at
- updated_at

### Why this table exists
Images are a separate concern from the listing itself because:

- a listing can have multiple photos
- image ordering matters for display
- separate validation and deletion logic is cleaner

---

## 4.4 SavedListing
A SavedListing records the relationship between a user and a listing they saved.

### SavedListing attributes
- id
- user_id
- listing_id
- created_at

### Why this table exists
This is a many-to-many relationship between users and listings, but in practice a simple junction table is the correct structure.

A user can save many listings.
A listing can be saved by many users.

### Business rule
Duplicate saves must be prevented with a unique constraint on (user_id, listing_id).

---

## 4.5 Message
A Message records a user inquiry from a seeker to an owner regarding a listing.

### Message attributes
- id
- sender_id
- receiver_id
- listing_id
- content
- read_at
- created_at
- updated_at

### Why this table exists
The system requirements call for a contact-owner inquiry flow without requiring a full real-time chat system at V1. A message table is enough to capture the initial inquiry and future expansion into a proper conversation model later.

For this reason, the V1 design should be referred to as an inquiry/message system, not a chat system.

### Important design note
This is not a full chat system with threads and channels, but it provides the right base model for future evolution.

---

## 4.6 Report
A Report records suspicious listing reports submitted by users.

### Report attributes
- id
- reporter_id
- listing_id
- reason
- description
- status
- created_at
- updated_at
- resolved_at

### Why this table exists
The product requires a reporting workflow for scam or inaccurate listings. This is a high-signal table because it affects moderation and trust.

### Report reason values
- scam_or_fraud
- duplicate_listing
- incorrect_information
- property_does_not_exist
- inappropriate_content
- other

### Report status values
- pending
- under_review
- resolved
- rejected

---

## 4.7 ModerationAction
A ModerationAction records admin decisions over reports, listings, and users.

### ModerationAction attributes
- id
- admin_id
- target_type
- target_id
- action_type
- notes
- created_at

### Why this table exists
The system needs an audit trail showing which admin performed which action and why. This is especially important for:

- report resolution
- listing removal or hiding
- user suspension

### Important modeling note
This is a classic polymorphic relationship in Laravel. A moderation action can target a listing, a report, or a user, so the table uses `target_type` and `target_id` rather than a single foreign key.

Because the database cannot enforce a foreign key across multiple target tables, the Laravel layer must validate that the `target_type` + `target_id` pair actually resolves to a valid record before creating the moderation action.

### Example action types
- report_resolved
- report_rejected
- listing_hidden
- listing_removed
- user_suspended
- user_warned

This is the simplest version of an audit log for V1.

---

## 5. Relationship Model

### 5.1 User to Listing
A User may own many listings.
A Listing belongs to one owner.

Cardinality:
- User 1 ─── N Listing

Foreign key:
- listings.owner_id -> users.id

This is a direct one-to-many relationship.

---

### 5.2 User to SavedListing
A User may save many listings.
A Listing may be saved by many users.

Cardinality:
- User N ─── N Listing

Resolution:
- saved_listings junction table

Foreign keys:
- saved_listings.user_id -> users.id
- saved_listings.listing_id -> listings.id

Unique constraint:
- (user_id, listing_id) unique

---

### 5.3 User to Message
A User may send many messages.
A User may receive many messages.

Cardinality:
- User 1 ─── N Message as sender
- User 1 ─── N Message as receiver

This is a two-direction one-to-many relationship, which is handled with two foreign keys on the messages table.

Foreign keys:
- messages.sender_id -> users.id
- messages.receiver_id -> users.id

---

### 5.4 Listing to Message
A Listing can receive many inquiries.
A Message belongs to one listing.

Cardinality:
- Listing 1 ─── N Message

Foreign key:
- messages.listing_id -> listings.id

---

### 5.5 Listing to Report
A Listing can have many reports.
A Report belongs to one listing.

Cardinality:
- Listing 1 ─── N Report

Foreign key:
- reports.listing_id -> listings.id

---

### 5.6 User to Report
A User can submit many reports.
A Report is submitted by one user.

Cardinality:
- User 1 ─── N Report

Foreign key:
- reports.reporter_id -> users.id

---

### 5.7 User to ModerationAction
An admin can perform many moderation actions.
A moderation action belongs to one admin.

Cardinality:
- User 1 ─── N ModerationAction

Foreign key:
- moderation_actions.admin_id -> users.id

---

### 5.8 Listing to ListingImage
A Listing can have many images.
An image belongs to one listing.

Cardinality:
- Listing 1 ─── N ListingImage

Foreign key:
- listing_images.listing_id -> listings.id

---

## 6. ERD Conceptual View

```text
USER
  |
  | 1:N
  |-------------------> LISTING
  |                     |
  |                     | 1:N
  |                     +----> LISTING_IMAGE
  |
  | N:N
  +-------------------> SAVED_LISTING <------------------+
                          |                               |
                          |                               |
                         LISTING                          USER

USER
  |
  | 1:N (sender)
  +---------------> MESSAGE <------------------------------+
                     |                                     |
                     | 1:N                                 |
                     +--------------------> LISTING          |

USER
  |
  | 1:N
  +---------------> REPORT <------------------------------+
                     |
                     | 1:N
                     +--------------------> LISTING

USER
  |
  | 1:N
  +---------------> MODERATION_ACTION
```

---

## 7. Normalization and Design Rationale

### 7.1 First normal form
Each table has atomic values and does not repeat groups. For example:

- a listing's photos are stored in listing_images, not repeated in listings
- saved relationships are stored in saved_listings, not in a repeating field array

### 7.2 Second normal form
Each non-key attribute depends on the full primary key. For example:

- image_url depends on listing_image.id and listing_id, not on the user directly
- a report reason depends on the report entity, not the reporter alone

### 7.3 Third normal form
No transitive dependency remains. For example:

- user city is stored on users, not repeated in every listing row
- listing attributes are not repeated across report records

### 7.4 Why this schema is not over-normalized
The design intentionally avoids creating separate lookup tables for every enum-like field because the V1 use case does not need full admin-maintained reference tables. A constrained string column is enough unless future admin configuration of categories becomes required.

---

## 8. Key Constraints

### 8.1 users
- email must be unique
- phone must be unique when present
- password cannot be null
- role must be one of { seeker, owner, admin }
- public registration must only accept { seeker, owner }
- status must be one of { active, suspended, pending_verification }
- deletion is handled via `deleted_at`, not a status value

### 8.2 listings
- owner_id cannot be null
- title cannot be empty
- city cannot be empty
- rent must be non-negative
- estimated_utilities must be non-negative
- deposit must be non-negative
- property_type must be one of { apartment, room, studio, house }
- listing_type must be one of { entire_place, private_room, shared_room }
- gender_preference must be { any, female, male }
- current_occupants must be non-negative
- available_spots must be non-negative
- max_occupants must be positive
- current_occupants + available_spots must be <= max_occupants
- status must be one of { active, rented, archived, draft }
- available_from must be valid date or nullable

### 8.3 listing_images
- listing_id cannot be null
- image_url cannot be empty
- sort_order defaults to 0 or increments sequentially

### 8.4 saved_listings
- user_id + listing_id unique together
- user_id/listing_id cannot be null

### 8.5 messages
- sender_id cannot be null
- receiver_id cannot be null
- listing_id cannot be null
- content cannot be empty

### 8.6 reports
- reporter_id cannot be null
- listing_id cannot be null
- reason cannot be null and must belong to valid enumerated values
- status cannot be null
- a user cannot report their own listing (application-level validation + DB trigger if needed)

### 8.7 moderation_actions
- admin_id cannot be null
- target_type cannot be null
- target_id cannot be null
- action_type cannot be null

---

## 9. Recommended Indexes

### users
- idx_users_email (email)
- idx_users_phone (phone)
- idx_users_role (role)
- idx_users_status (status)

### listings
- idx_listings_owner_id (owner_id)
- idx_listings_city (city)
- idx_listings_neighborhood (neighborhood)
- idx_listings_status (status)
- idx_listings_property_type (property_type)
- idx_listings_rent (rent)
- idx_listings_available_from (available_from)

### listing_images
- idx_listing_images_listing_id (listing_id)

### saved_listings
- idx_saved_listings_user_id (user_id)
- idx_saved_listings_listing_id (listing_id)
- unique idx_saved_listings_user_listing (user_id, listing_id)

### messages
- idx_messages_sender_id (sender_id)
- idx_messages_receiver_id (receiver_id)
- idx_messages_listing_id (listing_id)
- idx_messages_created_at (created_at)

### reports
- idx_reports_listing_id (listing_id)
- idx_reports_reporter_id (reporter_id)
- idx_reports_status (status)
- idx_reports_created_at (created_at)

### moderation_actions
- idx_moderation_actions_admin_id (admin_id)
- idx_moderation_actions_target (target_type, target_id)
- idx_moderation_actions_created_at (created_at)

---

## 10. SQL Schema (Relational Version)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    city VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('seeker', 'owner', 'admin')),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
    avatar_url TEXT,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE listings (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    property_type VARCHAR(30) NOT NULL CHECK (property_type IN ('apartment', 'room', 'studio', 'house')),
    listing_type VARCHAR(30) NOT NULL CHECK (listing_type IN ('entire_place', 'private_room', 'shared_room')),
    city VARCHAR(150) NOT NULL,
    neighborhood VARCHAR(150) NOT NULL,
    address TEXT,
    rent DECIMAL(10,2) NOT NULL CHECK (rent >= 0),
    estimated_utilities DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (estimated_utilities >= 0),
    deposit DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (deposit >= 0),
    available_from DATE,
    bedrooms INT NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
    bathrooms INT NOT NULL DEFAULT 0 CHECK (bathrooms >= 0),
    surface_area DECIMAL(8,2),
    furnished BOOLEAN NOT NULL DEFAULT FALSE,
    internet_included BOOLEAN NOT NULL DEFAULT FALSE,
    parking BOOLEAN NOT NULL DEFAULT FALSE,
    gender_preference VARCHAR(20) NOT NULL DEFAULT 'any' CHECK (gender_preference IN ('any', 'female', 'male')),
    current_occupants INT NOT NULL DEFAULT 0 CHECK (current_occupants >= 0),
    available_spots INT NOT NULL DEFAULT 0 CHECK (available_spots >= 0),
    max_occupants INT NOT NULL DEFAULT 1 CHECK (max_occupants > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'rented', 'archived', 'draft')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CHECK (current_occupants + available_spots <= max_occupants)
);

CREATE TABLE listing_images (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_listings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, listing_id)
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reason VARCHAR(40) NOT NULL CHECK (reason IN ('scam_or_fraud', 'duplicate_listing', 'incorrect_information', 'property_does_not_exist', 'inappropriate_content', 'other')),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);

CREATE TABLE moderation_actions (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL,
    target_id BIGINT NOT NULL,
    action_type VARCHAR(40) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_listings_owner_id ON listings(owner_id);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_neighborhood ON listings(neighborhood);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_property_type ON listings(property_type);
CREATE INDEX idx_listings_rent ON listings(rent);
CREATE INDEX idx_listings_available_from ON listings(available_from);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);

CREATE INDEX idx_saved_listings_user_id ON saved_listings(user_id);
CREATE INDEX idx_saved_listings_listing_id ON saved_listings(listing_id);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_listing_id ON messages(listing_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_reports_listing_id ON reports(listing_id);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);

CREATE INDEX idx_moderation_actions_admin_id ON moderation_actions(admin_id);
CREATE INDEX idx_moderation_actions_target ON moderation_actions(target_type, target_id);
CREATE INDEX idx_moderation_actions_created_at ON moderation_actions(created_at);
```

---

## 11. Optional Future Enhancements
These are not part of V1 but are worth noting for future schema evolution:

- conversation_threads and conversation_messages for real chat
- geolocation fields with proper indexes and spatial support
- payment tables for deposits or subscriptions
- user verification tables for identity and document checks
- duplicate detection metadata for listing similarity analysis
- notification entities for email/SMS push alerts

---

## 12. Mapping to Laravel Models
The above schema maps naturally to Laravel models as follows:

- User
- Listing
- ListingImage
- SavedListing
- Message
- Report
- ModerationAction

Recommended relationships:

### User
- hasMany(Listing::class, 'owner_id')
- belongsToMany(Listing::class, 'saved_listings')
- hasMany(Message::class, 'sender_id')
- hasMany(Message::class, 'receiver_id')
- hasMany(Report::class, 'reporter_id')
- hasMany(ModerationAction::class, 'admin_id')

### Listing
- belongsTo(User::class, 'owner_id')
- hasMany(ListingImage::class)
- belongsToMany(User::class, 'saved_listings')
- hasMany(Message::class)
- hasMany(Report::class)

### SavedListing
- belongsTo(User::class)
- belongsTo(Listing::class)

### Message
- belongsTo(User::class, 'sender_id')
- belongsTo(User::class, 'receiver_id')
- belongsTo(Listing::class)

### Report
- belongsTo(User::class, 'reporter_id')
- belongsTo(Listing::class)

### ModerationAction
- belongsTo(User::class, 'admin_id')

---

## 13. Final Design Summary

The database is designed around the actual operations of Meskni:

- Users authenticate and hold account state
- Listings are owned and searchable
- Images belong to listings
- Users save listings to compare later
- Messages support the contact flow
- Reports support scam protection and moderation
- Moderation actions support admin auditing and enforcement

This is the correct architectural foundation for the next layer: backend APIs and Laravel migrations.

The key decisions to keep in mind for implementation are:

- users.role remains a string column, not a separate roles table
- password reset data remains under Laravel's auth system, not as custom fields on users
- moderation_actions is intentionally polymorphic
- roommate cost logic is carried by listing_type, current_occupants, available_spots, and estimated_utilities

The key idea is that every table exists to support a real product workflow and not just because a generic template says so.
