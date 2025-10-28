# BeeGrub Database Entity Relationship Diagram (ERD)

## Visual Schema Representation

```
                                    BeeGrub Database Schema
                                         (PostgreSQL)

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    USERS HIERARCHY                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌───────────┐ │
│  │     USERS       │────▶│    STUDENTS     │     │    VENDORS      │     │   ADMINS  │ │
│  │                 │     │                 │     │                 │     │           │ │
│  │ • id (UUID)     │     │ • id (FK)       │     │ • id (FK)       │     │ • id (FK) │ │
│  │ • email         │     │ • student_id    │     │ • business_name │     │ • name    │ │
│  │ • password_hash │     │ • full_name     │     │ • contact_info  │     │ • perms   │ │
│  │ • role (enum)   │     │ • phone         │     │ • verification  │     │           │ │
│  │ • status        │     │ • preferences   │     │ • rating        │     │           │ │
│  │ • verification  │     │ • pickup_pref   │     │ • operating_hrs │     │           │ │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘     └───────────┘ │
│           │                        │                        │                          │
└───────────┼────────────────────────┼────────────────────────┼──────────────────────────┘
            │                        │                        │
            │                        │                        │
┌───────────┼────────────────────────┼────────────────────────┼──────────────────────────┐
│           │               PRODUCT MANAGEMENT               │                          │
├───────────┼────────────────────────┼────────────────────────┼──────────────────────────┤
│           │                        │                        │                          │
│           │    ┌────────────────────┼─────────────────┐      │                          │
│           │    │                    │                 │      │                          │
│           │    │  ┌─────────────────▼──────────────┐  │      │                          │
│           │    │  │      FOOD_CATEGORIES          │  │      │                          │
│           │    │  │                               │  │      │                          │
│           │    │  │ • id (UUID)                   │  │      │                          │
│           │    │  │ • name                        │  │      │                          │
│           │    │  │ • description                 │  │      │                          │
│           │    │  │ • sort_order                  │  │      │                          │
│           │    │  └───────────────┬───────────────┘  │      │                          │
│           │    │                  │                  │      │                          │
│           │    │  ┌───────────────▼───────────────┐  │      │                          │
│           │    │  │        MENU_ITEMS            │◀─┼──────┼──────────────────────────┘
│           │    │  │                               │  │      │
│           │    │  │ • id (UUID)                   │  │      │
│           │    │  │ • vendor_id (FK)              │  │      │
│           │    │  │ • category_id (FK)            │  │      │
│           │    │  │ • name, description           │  │      │
│           │    │  │ • price, image_url            │  │      │
│           │    │  │ • preparation_time            │  │      │
│           │    │  │ • ingredients, allergens      │  │      │
│           │    │  │ • nutritional_info (JSONB)    │  │      │
│           │    │  │ • tags, spice_level           │  │      │
│           │    │  └───────────────┬───────────────┘  │      │
│           │    │                  │                  │      │
│           │    │  ┌───────────────▼───────────────┐  │      │
│           │    │  │    MENU_ITEM_VARIANTS        │  │      │
│           │    │  │                               │  │      │
│           │    │  │ • id (UUID)                   │  │      │
│           │    │  │ • menu_item_id (FK)           │  │      │
│           │    │  │ • name (size, addon)          │  │      │
│           │    │  │ • price_adjustment            │  │      │
│           │    │  └───────────────────────────────┘  │      │
│           │    └─────────────────────────────────────┘      │
│           │                                                 │
└───────────┼─────────────────────────────────────────────────┼──────────────────────────┘
            │                                                 │
            │                                                 │
┌───────────┼─────────────────────────────────────────────────┼──────────────────────────┐
│           │                    ORDER MANAGEMENT             │                          │
├───────────┼─────────────────────────────────────────────────┼──────────────────────────┤
│           │                                                 │                          │
│           │         ┌─────────────────────────────────────┐ │                          │
│           │         │       PICKUP_LOCATIONS             │ │                          │
│           │         │                                     │ │                          │
│           │         │ • id (UUID)                         │ │                          │
│           │         │ • name, description                 │ │                          │
│           │         │ • building, floor                   │ │                          │
│           │         │ • coordinates, capacity             │ │                          │
│           │         └─────────────┬───────────────────────┘ │                          │
│           │                       │                         │                          │
│  ┌────────▼─────────────────┐     │     ┌───────────────────▼───────────────┐          │
│  │       ORDERS            │     │     │            ORDER_ITEMS             │          │
│  │                         │     │     │                                    │          │
│  │ • id (UUID)             │     │     │ • id (UUID)                        │          │
│  │ • order_number          │─────┼─────│ • order_id (FK)                    │          │
│  │ • student_id (FK)       │     │     │ • menu_item_id (FK)                │          │
│  │ • vendor_id (FK)        │     │     │ • quantity                         │          │
│  │ • pickup_location_id    │─────┘     │ • unit_price, total_price          │          │
│  │ • status (enum)         │           │ • special_instructions             │          │
│  │ • subtotal, tax, total  │           └─────────────┬──────────────────────┘          │
│  │ • pickup_times          │                         │                                 │
│  │ • special_instructions  │           ┌─────────────▼──────────────────────┐          │
│  │ • timestamps            │           │      ORDER_ITEM_VARIANTS           │          │
│  └─────────────┬───────────┘           │                                    │          │
│                │                       │ • id (UUID)                        │          │
│                │                       │ • order_item_id (FK)               │          │
│                │                       │ • variant_id (FK)                  │          │
│                │                       └────────────────────────────────────┘          │
│                │                                                                       │
└────────────────┼───────────────────────────────────────────────────────────────────────┘
                 │
                 │
┌────────────────┼───────────────────────────────────────────────────────────────────────┐
│                │                PAYMENT & COMMUNICATION                                │
├────────────────┼───────────────────────────────────────────────────────────────────────┤
│                │                                                                       │
│  ┌─────────────▼───────────────┐           ┌─────────────────────────────────────────┐ │
│  │        PAYMENTS             │           │           NOTIFICATIONS                 │ │
│  │                             │           │                                         │ │
│  │ • id (UUID)                 │           │ • id (UUID)                             │ │
│  │ • order_id (FK)             │           │ • user_id (FK)                          │ │
│  │ • payment_method (enum)     │           │ • type (enum)                           │ │
│  │ • amount                    │           │ • title, message                        │ │
│  │ • status (enum)             │           │ • data (JSONB)                          │ │
│  │ • external_transaction_id   │           │ • is_read, timestamps                   │ │
│  │ • gateway_response (JSONB)  │           │ • order_id, payment_id (FK)             │ │
│  │ • timestamps                │           └─────────────────────────────────────────┘ │
│  │ • failure_handling          │                                                     │ │
│  └─────────────────────────────┘                                                     │ │
│                                                                                       │ │
└───────────────────────────────────────────────────────────────────────────────────────┘
            │                                                 │
            │                                                 │
┌───────────┼─────────────────────────────────────────────────┼──────────────────────────┐
│           │                 QUALITY & SYSTEM                │                          │
├───────────┼─────────────────────────────────────────────────┼──────────────────────────┤
│           │                                                 │                          │
│  ┌────────▼─────────────────┐     ┌─────────────────────────▼───────────────────────┐ │
│  │       REVIEWS           │     │              APP_SETTINGS                      │ │
│  │                         │     │                                                │ │
│  │ • id (UUID)             │     │ • id (UUID)                                    │ │
│  │ • order_id (FK)         │     │ • key, value                                   │ │
│  │ • student_id (FK)       │     │ • data_type                                    │ │
│  │ • vendor_id (FK)        │     │ • description                                  │ │
│  │ • rating (1-5)          │     │ • is_public                                    │ │
│  │ • comment               │     │ • timestamps                                   │ │
│  │ • is_anonymous          │     └────────────────────────────────────────────────┘ │
│  │ • timestamps            │                                                        │ │
│  └─────────────────────────┘     ┌────────────────────────────────────────────────┐ │
│                                  │            ACTIVITY_LOGS                      │ │
│                                  │                                                │ │
│                                  │ • id (UUID)                                    │ │
│                                  │ • user_id (FK)                                 │ │
│                                  │ • action, entity_type, entity_id               │ │
│                                  │ • old_values, new_values (JSONB)               │ │
│                                  │ • ip_address, user_agent                       │ │
│                                  │ • created_at                                   │ │
│                                  └────────────────────────────────────────────────┘ │
│                                                                                     │ │
└─────────────────────────────────────────────────────────────────────────────────────┘

```

## Relationship Types Legend

- **─────** : One-to-Many relationship
- **▶** : Foreign Key relationship
- **◀** : Reverse Foreign Key reference
- **(FK)** : Foreign Key column
- **(UUID)** : Primary Key using UUID
- **(enum)** : Enumerated type
- **(JSONB)** : JSON document storage

## Key Relationships Summary

### 1. User Relationships
- `users` ➤ `students` (1:1)
- `users` ➤ `vendors` (1:1)  
- `users` ➤ `admins` (1:1)
- `users` ➤ `notifications` (1:Many)
- `users` ➤ `activity_logs` (1:Many)

### 2. Product Relationships
- `vendors` ➤ `menu_items` (1:Many)
- `food_categories` ➤ `menu_items` (1:Many)
- `menu_items` ➤ `menu_item_variants` (1:Many)

### 3. Order Relationships
- `students` ➤ `orders` (1:Many)
- `vendors` ➤ `orders` (1:Many)
- `pickup_locations` ➤ `orders` (1:Many)
- `orders` ➤ `order_items` (1:Many)
- `menu_items` ➤ `order_items` (1:Many)
- `order_items` ➤ `order_item_variants` (1:Many)
- `menu_item_variants` ➤ `order_item_variants` (1:Many)

### 4. Payment & Communication
- `orders` ➤ `payments` (1:Many)
- `orders` ➤ `notifications` (1:Many)
- `payments` ➤ `notifications` (1:Many)

### 5. Quality & Reviews
- `orders` ➤ `reviews` (1:1)
- `students` ➤ `reviews` (1:Many)
- `vendors` ➤ `reviews` (1:Many)

## Database Features

### Performance Optimizations
- **Strategic Indexing**: All foreign keys, search columns, and filter columns
- **Materialized Views**: `order_summary`, `vendor_metrics`, `popular_menu_items`
- **Query Optimization**: Composite indexes for common query patterns

### Security Features
- **Row Level Security (RLS)**: Prevents unauthorized data access
- **Audit Trails**: Complete activity logging for compliance
- **Data Encryption**: Password hashing, token-based authentication
- **Access Control**: Role-based permissions with granular controls

### Scalability Design
- **UUID Primary Keys**: Distributed system friendly
- **JSONB Storage**: Flexible document storage for configurations
- **Horizontal Scaling**: Stateless design supports microservices
- **Caching Ready**: Structure optimized for Redis integration

### Data Integrity
- **Referential Integrity**: Comprehensive foreign key constraints
- **Business Rules**: Check constraints for valid data ranges
- **Automatic Timestamps**: Triggers for created_at/updated_at
- **Unique Constraints**: Prevent duplicate critical data

This ERD represents a production-ready database schema that supports all BeeGrub application requirements while maintaining flexibility for future enhancements and scaling needs.