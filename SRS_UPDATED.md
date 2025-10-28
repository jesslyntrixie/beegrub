# Software Requirements Specification (SRS)

## BeeGrub: Campus Food Pre-Order Platform

**Version:** 2.0 (Updated)  
**Date:** October 26, 2025  
**Last Updated:** Based on development discussions and actual implementation  
**Organization:** BINUS University Entrepreneurship Project  
**Prepared by:** Jesslyn + Development Team

---

## 1. Introduction

### 1.1 Purpose

This SRS document defines all functional and non-functional requirements for **BeeGrub**, a mobile application for campus food pre-ordering. It serves as the single source of truth for the development team to build, test, and validate the application.

### 1.2 Scope

BeeGrub is a **hyper-local digital platform** designed to solve rush-hour queuing problems at BINUS Anggrek Campus canteens by enabling:

- **Students:** Pre-order food for specific times → pickup without waiting
- **Vendors:** Manage orders efficiently → reduce peak-hour chaos
- **Admin:** Monitor platform health → approve vendors

**Core Problem Solved:** Students miss classes due to food queuing during rush hours (09:00-09:20, 11:00-11:20, 13:00-13:20)

**Solution:** Let students order 2-3 hours in advance, pick up at designated times

### 1.3 Out of Scope (MVP)

- ❌ Delivery outside campus
- ❌ Food reviews/ratings (Phase 2+)
- ❌ Loyalty programs (Phase 2+)
- ❌ Vendor analytics dashboard (Phase 3+)
- ❌ Push notifications (Phase 2+)

---

## 2. Overall Description

### 2.1 Product Vision

**A frictionless food pre-ordering platform that eliminates campus queuing chaos**

Students order ahead → vendors prepare efficiently → pickup on time → everyone's happy

### 2.2 User Types

| User Type | Pain Point | Solution |
|-----------|-----------|----------|
| **Student** | Busy schedule + hunger + queue anxiety | Order ahead, pick up on time |
| **Vendor** | Unpredictable demand + peak-hour chaos | Plan production with pre-orders |
| **Admin** | Platform growth + vendor vetting | Approve vendors, monitor system |

### 2.3 Operating Environment

```
Mobile App:
  - Platform: iOS + Android (React Native + Expo)
  - Min OS Version: iOS 13+, Android 8+

Backend:
  - BaaS: Supabase (PostgreSQL + Auth)
  - API: Auto-generated REST APIs + Real-time subscriptions

Admin Panel:
  - Browser-based web dashboard (Phase 4+)
```

### 2.4 Key Assumptions

- All users have smartphones + internet access
- Users are BINUS students/staff with valid email
- Vendors operate within campus buildings
- Pickup locations are predetermined (4 locations campus-wide)
- Pre-order window: 2-3 hours before pickup time
- Peak order times: 09:00, 11:00, 13:00 (linked to class breaks)

---

## 3. Functional Requirements

### 3.1 User Authentication (F1.0)

**Requirement:** System manages role-based login for Students, Vendors, Admin

#### FR-1.1: Role Selection
- User sees two options at signup: "Student" OR "Canteen Partner"
- Each role has different registration flow

#### FR-1.2: Student Registration
- **Must** use official BINUS email (@binus.ac.id)
- Collect: email, password, full name, student ID, phone
- Email verification required before activation
- Auto-create record in `students` table after signup

#### FR-1.3: Vendor Registration
- Collect: business name, contact phone, location (campus building), description
- **Status:** "Pending" until admin approval
- Vendor cannot place orders until status = "Approved"
- Admin approves through admin panel

#### FR-1.4: Login & Authorization
- All users login with email + password
- System redirects to role-appropriate dashboard:
  - Student → HomeScreen (vendor list)
  - Vendor → VendorDashboard (order list)
  - Admin → AdminDashboard (user management)

#### FR-1.5: Session Management
- Session maintained via Supabase Auth JWT token
- Auto-logout after 24 hours inactivity
- Logout button on all dashboards

---

### 3.2 Student Ordering Flow (F2.0)

**Requirement:** Students browse, order, and track food

#### FR-2.1: Browse Vendors
- After login, student sees list of **approved vendors only**
- Each vendor card shows:
  - Business name
  - Description (cuisine type)
  - Location (e.g., "Building A Ground Floor")
  - Contact phone
- Student can tap any vendor to view menu

#### FR-2.2: View Menu
- Student selects vendor → sees all available menu items
- Each item displays:
  - Food name
  - Description
  - Price (in IDR)
  - Availability status (✓ available / ✗ unavailable)
  - Optional: image (Phase 2+)
- Can add any available item to cart

#### FR-2.3: Add to Cart & Quantity
- "Add to Cart" button for each item
- Quantity selector (1, 2, 3, ... up to 10)
- Cart state persists on same vendor
- Cart icon shows total item count
- Can view cart anytime without checkout

#### FR-2.4: Order Type Selection
**NEW (from discussion):** System supports TWO order types:

**A) Pre-Order (Scheduled)** ← PRIMARY for MVP
- Student selects pickup time 2-3 hours in advance
- Available time slots: 09:00-09:20, 11:00-11:20, 13:00-13:20, 15:00-15:20, 17:00-17:20
- System calculates: "advance_order_hours" = current_time to pickup_time
- Vendor gets notice with time, prepares accordingly

**B) Live Order (Immediate)** ← SECONDARY (bonus feature)
- Student orders now → pickup in 30-45 minutes
- No specific time slot (vendor estimates)
- Rare during peak hours (mainly off-peak)

#### FR-2.5: Checkout Details
- Student provides:
  - ✅ Food items + quantities
  - ✅ Order type (pre-order OR live)
  - ✅ Pickup time (if pre-order)
  - ✅ Pickup location (from 4 preset campus locations)
  - ✅ Special instructions (optional, e.g., "No onion")
- System displays:
  - Order summary (all items)
  - Subtotal (sum of prices)
  - Service fee (3000 IDR per item)
  - **Total price**
- Student must confirm before payment

#### FR-2.6: Price Transparency
**NEW (from discussion):** Pricing model is transparent:

```
Menu Item (Nasi Padang)        = 25,000 IDR
+ Menu Item (Es Teh)           = 5,000 IDR
─────────────────────────────────────
Subtotal                       = 30,000 IDR
+ Service Fee (2 items × 3k)   = 6,000 IDR
─────────────────────────────────────
TOTAL                          = 36,000 IDR
```

- NO hidden taxes or markups
- Service fee = 3000 IDR per item (transparent cost)
- Student sees this breakdown BEFORE payment

---

### 3.3 Payment System (F3.0)

**Requirement:** Digital, secure payment processing

#### FR-3.1: Payment Methods
- Minimum: QRIS (QR Code Indonesian Standard)
- Optional: E-wallet (GCash, OVO, Dana in Phase 2)
- MVP: Mock payment for testing (real integration Phase 3)

#### FR-3.2: Payment Flow
1. Student reviews order → taps "Pay"
2. Student selects payment method
3. System shows payment confirmation dialog
4. Student confirms payment
5. System processes payment (mock confirms instantly)
6. ✅ Order created in database
7. ✅ Confirmation screen shown

#### FR-3.3: Order Creation
After successful payment, system automatically:
- Creates `orders` record with:
  - Order number (auto-generated format: "BG-YYYYMMDD-###")
  - Student ID, Vendor ID, Pickup location, Time slot
  - Order type (pre_order or live_order)
  - Subtotal, service fee, total
  - Status: "confirmed"
  - Timestamps
- Creates `order_items` records (one per cart item)
- Creates `payments` record (amount, method, timestamp)

#### FR-3.4: Payment Confirmation
- Student sees confirmation screen with:
  - ✅ Order number (e.g., "BG-20251026-001")
  - ✅ Vendor name
  - ✅ Items ordered
  - ✅ Pickup time + location
  - ✅ Total amount paid
  - ✅ "Continue Shopping" or "View My Orders" buttons

---

### 3.4 Order Management - Student (F2.7)

**Requirement:** Students track their orders

#### FR-2.7: Order History
- Student sees list of all past orders
- Each order card shows:
  - Order number
  - Vendor name
  - Items summary (e.g., "2x Nasi Padang, 1x Es Teh")
  - Pickup time (if pre-order)
  - Order status (pending, confirmed, preparing, ready, completed)
  - Date/time placed
- Tap order → see full details
- Pull-to-refresh to reload
- Filter options: Active / Completed (optional for MVP)

#### FR-2.8: Order Status Tracking
- Student receives real-time updates on order status:
  - "pending" → Student just ordered
  - "confirmed" → Vendor accepted order
  - "preparing" → Vendor is cooking
  - "ready" → Available for pickup
  - "completed" → Student picked up
- Status changes show timestamps
- Optional: Push notifications on status change (Phase 2)

---

### 3.5 Vendor Order Management (F4.0)

**Requirement:** Vendors receive and manage orders

#### FR-4.1: Vendor Dashboard
- After login, vendor sees:
  - **New Orders** section (not yet accepted)
  - **Active Orders** section (accepted, being prepared)
  - **Completed Orders** section (picked up)
- Each order shows: student order count, items, pickup time, special instructions

#### FR-4.2: Accept/Reject Orders
- Vendor can accept or reject new orders
- Rejection reason collected (e.g., "Out of stock")
- Accepted order → moves to "Active" section
- Rejected order → marked as "rejected", student gets refund notification

#### FR-4.3: Update Order Status
- Vendor updates status as they cook:
  - "pending" → "confirmed" (acknowledging order)
  - "confirmed" → "preparing" (started cooking)
  - "preparing" → "ready" (placed at pickup point)
  - "ready" → "completed" (student picked up)

#### FR-4.4: Notifications
- When new order arrives → in-app notification to vendor
- When student changes order → notification to vendor
- When payment confirmed → notification to vendor

---

### 3.6 Admin Management (F5.0)

**Requirement:** Admin controls platform

#### FR-5.1: Admin Authentication
- Admin has separate secure login
- Access only from admin panel (web, Phase 4)

#### FR-5.2: Vendor Approval
- Admin sees list of pending vendor registrations
- Can approve → status changes to "approved"
- Can reject → reason collected, vendor notified

#### FR-5.3: User Management
- Admin can view all students and vendors
- Can deactivate/reactivate accounts
- Can view account details

#### FR-5.4: Transaction Reports
- Admin sees total transactions, revenue
- Can filter by date, vendor, student
- Export reports (optional for MVP)

---

## 4. Non-Functional Requirements

### 4.1 Performance

- **Screen Load Time:** Max 2-3 seconds
- **Payment Processing:** Confirmation within 5 seconds
- **Order Updates:** Real-time (within 2 seconds)
- **API Response:** All Supabase queries < 1 second

### 4.2 Security

- **Authentication:** Supabase Auth (industry standard)
- **Passwords:** Encrypted by Supabase (bcrypt)
- **Data in Transit:** HTTPS only
- **Data at Rest:** Encrypted in PostgreSQL
- **Row Level Security:** RLS policies for all tables
  - Students can only see their own orders
  - Vendors can only see their own menu + orders
  - Admin can see everything
- **Rate Limiting:** Prevent API abuse (future)

### 4.3 Reliability

- **Uptime:** 99%+ availability
- **Error Handling:** Graceful failures with user-friendly messages
- **Data Backup:** Automatic Supabase backups
- **Rollback:** Can revert to previous schema if needed

### 4.4 Usability

- **Accessibility:** Mobile-first responsive design
- **User Learning:** New student can complete first order in < 2 minutes
- **Error Messages:** Clear, actionable feedback
- **Navigation:** Intuitive flow, no dead ends
- **Language:** Clear, simple English + Indonesian (Phase 2)

### 4.5 Scalability

- Database can handle 10,000+ concurrent orders
- API auto-scales with Supabase
- Can add new vendors/menus without code changes

---

## 5. Data Model (Database Schema)

### 5.1 Core Tables

```
users (all user types)
├── id (UUID)
├── email (unique)
├── password_hash
├── role (student/vendor/admin)
├── status (active/inactive)
└── auth_user_id (links to Supabase Auth)

students (extends users)
├── id (FK → users)
├── student_id (unique BINUS ID)
├── full_name
└── phone

vendors (extends users)
├── id (FK → users)
├── business_name
├── contact_phone
├── location
├── description
├── status (pending/approved/rejected)
├── approved_by (admin ID)
└── approved_at

menu_items
├── id (UUID)
├── vendor_id (FK → vendors)
├── name
├── description
├── price
└── is_available

orders
├── id (UUID)
├── order_number (auto-generated: "BG-YYYYMMDD-###")
├── student_id (FK → students)
├── vendor_id (FK → vendors)
├── order_type (pre_order / live_order)
├── pickup_location_id (FK → pickup_locations)
├── scheduled_pickup_time (null for live orders)
├── time_slot (e.g., "09:00-09:20")
├── advance_order_hours (for pre-orders)
├── subtotal
├── service_fee (3000 per item)
├── total
├── status (pending/confirmed/preparing/ready/completed)
├── special_instructions
└── created_at, updated_at

order_items
├── id (UUID)
├── order_id (FK → orders)
├── menu_item_id (FK → menu_items)
├── quantity
├── unit_price
└── total_price

payments
├── id (UUID)
├── order_id (FK → orders)
├── amount
├── payment_method (qris/ewallet/etc)
├── status (pending/completed/failed)
├── paid_at
└── transaction_id (from payment provider)

pickup_locations
├── id (UUID)
├── name
├── campus_building
└── coordinates (optional)

time_slots
├── id (UUID)
├── time_start
├── time_end
├── is_rush_hour
└── max_orders (optional)
```

### 5.2 Security: Row Level Security (RLS)

All tables have RLS policies:

- **Students:** Can only read/update their own data
- **Vendors:** Can only read/update their own menu items + orders for their venue
- **Admin:** Can read/update all data
- **Public:** Can read approved vendors + menu items (no auth needed for browsing)

---

## 6. User Workflows

### 6.1 Happy Path: Student Pre-Order

```
1. Student opens app
2. Student logs in with @binus.ac.id email ✅
3. Sees list of 3+ approved vendors ✅
4. Taps "Canteen A - Nasi Padang"
5. Sees 10+ menu items with prices ✅
6. Adds: 1x Nasi Padang (25k), 1x Es Teh (5k) ✅
7. Taps "Checkout"
8. Selects pickup time: "13:00-13:20" (1 PM) ✅
9. Selects location: "Library Main Entrance" ✅
10. Reviews: Subtotal 30k, Service Fee 6k, Total 36k ✅
11. Taps "Pay with QRIS"
12. Confirms payment (mock)
13. Sees confirmation: Order #BG-20251026-001 ✅
14. Gets reminder: "Ready for pickup at 1:00 PM at Library"
15. Student shows up at 1:00 PM, picks up food
```

### 6.2 Happy Path: Vendor Receives Order

```
1. Student pays for order
2. Vendor receives notification: "New order: #BG-20251026-001"
3. Vendor opens dashboard
4. Sees: "Nasi Padang (1x), Es Teh (1x) | Pickup: 1:00 PM at Library"
5. Vendor taps "Accept Order"
6. Order moves to "Preparing" section
7. As vendor cooks, updates status → "Preparing"
8. Places food at Library entrance
9. Updates status → "Ready for Pickup"
10. Student gets notification: "Your food is ready!"
11. Student picks up food
12. Vendor marks → "Completed"
```

---

## 7. Constraints & Business Rules

### 7.1 Pre-Order Rules

- **Minimum advance notice:** 2 hours before pickup time
- **Maximum advance:** 7 days (future feature)
- **Pre-defined time slots:** 09:00, 11:00, 13:00, 15:00, 17:00
- **Each slot:** 20-minute window (e.g., 09:00-09:20)
- **Max orders per slot:** Unlimited for MVP (Phase 2: add limits)

### 7.2 Pricing Rules

- **Service fee:** 3000 IDR per item (transparent)
- **No discounts:** MVP doesn't include loyalty/coupons
- **Payment required:** Order = payment confirmed
- **Currency:** Indonesian Rupiah (IDR) only

### 7.3 Vendor Rules

- **Approval required:** Must be approved by admin before going live
- **Menu management:** Can add/update/remove items anytime
- **Order acceptance:** Can accept/reject within 5 minutes of order
- **Availability:** Must keep "is_available" status updated

### 7.4 Cancellation Rules (Phase 2)

- **Student cancellation:** Allowed up to 1 hour before pickup (full refund)
- **Vendor rejection:** Allowed anytime (full refund + apology)
- **No-show:** Order marked completed after 30 mins past pickup time

---

## 8. Success Metrics

### 8.1 MVP Success

✅ **Functional:**
- [ ] 100 orders completed in first week
- [ ] 50+ active student users
- [ ] 5+ approved vendors
- [ ] Zero payment failures

✅ **Technical:**
- [ ] 99%+ uptime
- [ ] < 2 second screen loads
- [ ] Zero critical bugs

✅ **User:**
- [ ] 90%+ student satisfaction
- [ ] Average order time < 2 minutes
- [ ] Average payment < 30 seconds

### 8.2 Metrics to Track

- Daily active users (DAU)
- Orders per day
- Average order value
- Peak order times
- Vendor response time
- Payment success rate
- App crashes
- Load times

---

## 9. Future Enhancements (Phase 2+)

- [ ] Push notifications
- [ ] Food images
- [ ] Reviews & ratings
- [ ] Loyalty points
- [ ] Dietary preferences (vegetarian, halal, etc)
- [ ] Special promotions
- [ ] Referral system
- [ ] Multi-language support (English/Bahasa)
- [ ] Vendor analytics dashboard
- [ ] Real payment integration (Midtrans/Xendit)
- [ ] Vendor menu scheduling (open/close times)
- [ ] Student subscription/meal plans

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| **Pre-Order** | Student orders 2-3 hours in advance for specific pickup time |
| **Live Order** | Student orders immediately, pickup ~30-45 mins later |
| **Service Fee** | Platform fee (3000 IDR per item) for order processing |
| **Pickup Location** | Designated on-campus spot where student collects food |
| **Time Slot** | 20-minute window (e.g., 09:00-09:20) for grouped pickups |
| **RLS** | Row Level Security - database policies for data access control |
| **BaaS** | Backend-as-a-Service (Supabase) |

---

## 11. References

- BeeGrub Business Plan (Original)
- Development Roadmap (Updated Oct 26, 2025)
- Database Schema (database_schema.sql)
- Seed Data (seed_data.sql)
- BINUS Entrepreneurship Course Materials

---

## 12. Approval & Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | Jesslyn | Oct 26, 2025 | ✅ |
| Tech Lead | GitHub Copilot (Mentor) | Oct 26, 2025 | ✅ |
| Project Lead | Jesslyn | Oct 26, 2025 | ✅ |

---

**Document Status:** ✅ APPROVED FOR DEVELOPMENT

**Next Review:** After Phase 2 (November 8, 2025)

---

*Last Updated: October 26, 2025*  
*Version 2.0 - Based on actual implementation progress*
