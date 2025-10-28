# 🐝 BeeGrub MVP Development Roadmap

**Version:** 1.0  
**Last Updated:** October 26, 2025  
**Project Lead:** Jesslyn  
**Mentor:** GitHub Copilot (Professional Mobile Developer)

---

## 📌 Executive Summary

This document is the **SINGLE SOURCE OF TRUTH** for BeeGrub development. It maps out:
- ✅ Completed work
- 🔄 Current sprint
- 📋 All remaining work
- 🎯 Success criteria for each task

**Reference:** SRS Document (September 30, 2025)

---

## 🎯 Project Overview

**Product:** BeeGrub - Hyper-local campus food pre-order & pickup platform for BINUS Anggrek  
**Target Users:** Students, Vendors (Canteens), Admin  
**MVP Scope:** Core student ordering flow + vendor dashboard  
**Timeline:** 6 weeks (Week of Oct 19 - Nov 30, 2025)

---

## 📊 Overall Phase Structure

```
Phase 1: Core Infrastructure & Auth        ✅ COMPLETE
Phase 2: Student Feature Set               🔄 IN PROGRESS (Sprint 2.1)
Phase 3: Vendor Feature Set                ⏳ PLANNED
Phase 4: Admin Feature Set                 ⏳ PLANNED
Phase 5: Polish & Testing                  ⏳ PLANNED
```

---

## ✅ PHASE 1: Core Infrastructure & Auth (COMPLETE)

**Timeline:** Oct 19-25, 2025  
**Status:** ✅ DONE

### Completed Tasks:

- ✅ **Database Design**
  - Created 11-table schema with RLS policies
  - File: `database_schema.sql` (671 lines)
  - Includes: users, students, vendors, menu_items, orders, order_items, payments, time_slots, pickup_locations

- ✅ **Seed Data**
  - 7 test users (1 admin, 3 students, 3 vendors)
  - 32 menu items (Indonesian food) across 3 vendors
  - 3 sample orders (2 pre-orders, 1 live order)
  - File: `seed_data.sql` (346 lines)

- ✅ **Supabase Setup**
  - Project created and deployed
  - Real database credentials configured
  - File: `src/services/supabase.js`
  - URL: `https://etconfsqdceomsarqbpb.supabase.co`

- ✅ **Authentication Flow**
  - Student login tested and working ✅
  - Auth user created: jesslyn.edvilie@binus.ac.id
  - Auth user linked to users table via `auth_user_id`

- ✅ **Mobile UI Screens (Auth Screens)**
  - LoginScreen.js (mobile-optimized)
  - RegisterScreen.js
  - SignupChooseRoleScreen.js
  - LoginChoiceScreen.js

### Deliverables Checklist:
- [x] Database schema deployed to Supabase
- [x] Seed data loaded (7 users, 32 menu items, 3 orders)
- [x] Supabase credentials in supabase.js
- [x] Student can login with real account
- [x] Navigation redirects to next screen after login

---

## 🔥 PHASE 2: Student Feature Set (IN PROGRESS)

**Timeline:** Oct 26 - Nov 8, 2025  
**Objective:** Complete student ordering journey (FR-2.0 and FR-3.0 from SRS)  
**Success Metric:** Student can browse vendors → view menu → add to cart → checkout → pay → see order confirmation

### Sprint Structure:

```
Sprint 2.1: Browse Vendors              🔄 CURRENT
Sprint 2.2: View Menu & Add to Cart     ⏳ NEXT
Sprint 2.3: Checkout & Time Selection   ⏳ PLANNED
Sprint 2.4: Payment Integration         ⏳ PLANNED
Sprint 2.5: Order History               ⏳ PLANNED
```

---

## 🔄 SPRINT 2.1: Browse Vendors (CURRENT - Oct 26-27)

**Status:** 🔄 IN PROGRESS  
**Duration:** 1-2 days  
**SRS Reference:** FR-2.1

### Objective:
After login, student sees list of vendors and can tap to view their menu.

### Tasks:

#### Task 2.1.1: Create HomeScreen.js ⏳ NOT STARTED
- [ ] Create file: `src/screens/student/HomeScreen.js`
- [ ] **Requirements:**
  - Fetch all vendors from Supabase (`vendors` table)
  - Display vendor cards with:
    - Business name
    - Description
    - Location
    - Contact info (optional)
  - On vendor tap → navigate to `MenuScreen` with vendor_id
  - Loading state while fetching
  - Error handling for API failures

- [ ] **Design Specs:**
  - Use React Native ScrollView for vertical scrolling
  - Vendor cards: 90% width, 140px height, rounded corners
  - Card padding: 12px, spacing: 10px
  - Font: Business name (16px bold), Description (12px regular)
  - Colors: Use theme from `src/constants/theme.js`

- [ ] **Code Structure:**
```javascript
// HomeScreen.js
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export default function HomeScreen() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', 'approved');
    
    if (error) console.error(error);
    else setVendors(data);
    setLoading(false);
  };

  // Render vendor cards
}
```

**Acceptance Criteria:**
- ✅ Displays all 3 approved vendors from seed data
- ✅ Each vendor card shows business_name, description, location
- ✅ Tapping vendor navigates to MenuScreen with vendor_id
- ✅ Loading indicator while fetching
- ✅ Error message if fetch fails
- ✅ Mobile-responsive (works on various screen sizes)

---

#### Task 2.1.2: Update AppNavigator.js ⏳ NOT STARTED
- [ ] Update navigation stack
  - After successful login → show `HomeScreen` (not LoginScreen)
  - Create Student navigation stack with HomeScreen as initial screen
  - Ensure MenuScreen is reachable from HomeScreen

**File:** `src/navigation/AppNavigator.js`

**Acceptance Criteria:**
- ✅ Logged-in student sees HomeScreen by default
- ✅ HomeScreen → MenuScreen navigation works

---

#### Task 2.1.3: Test with Seed Data ✅ TESTING
- [ ] Login as: `jesslyn.edvilie@binus.ac.id` / `[password]`
- [ ] Verify 3 vendors appear:
  1. Canteen A - Nasi Padang
  2. Canteen B - Mie Ayam & Bakso
  3. Warung Bu Sari
- [ ] Tap each vendor and verify navigation works
- [ ] Verify no console errors

---

### Deliverables for Sprint 2.1:
- [ ] `HomeScreen.js` - Functional vendor list screen
- [ ] `AppNavigator.js` - Updated navigation
- [ ] All acceptance criteria met
- [ ] Zero console errors

### Definition of Done:
- Code is committed to git
- No console warnings/errors
- Works on both iOS and Android simulators
- Peer reviewed (mentor check)

---

## ⏳ SPRINT 2.2: View Menu & Add to Cart (PLANNED - Oct 28-30)

**Duration:** 2-3 days  
**SRS Reference:** FR-2.2, FR-2.3

### Objective:
Student taps vendor → sees menu items → can add items to cart

### Tasks Overview:
- [ ] Create `MenuScreen.js`
  - Fetch menu_items for selected vendor_id
  - Display food items with price, description, image (if available)
  - Show "Add to Cart" button for each item
  - Quantity selector (1, 2, 3, ...)

- [ ] Create **Cart State Management**
  - Use React Context API (simple for MVP)
  - Store: selected items, quantities, vendor_id
  - File: `src/context/CartContext.js`
  - Functions: addToCart(), removeFromCart(), clearCart(), getCartTotal()

- [ ] Update `Button.js` component
  - Add "Add to Cart" variant

- [ ] Create `CartButton` / `CartIcon` component
  - Shows item count badge
  - Visible on MenuScreen header

### Acceptance Criteria:
- ✅ MenuScreen displays all menu_items for selected vendor (32 items across vendors)
- ✅ Each item shows name, description, price
- ✅ "Add to Cart" button adds item to cart state
- ✅ Cart icon/button shows correct item count
- ✅ Can tap to increase quantity
- ✅ Remove item from cart works

---

## ⏳ SPRINT 2.3: Checkout & Time Selection (PLANNED - Oct 31-Nov 2)

**Duration:** 2-3 days  
**SRS Reference:** FR-2.4, FR-2.5, FR-2.6

### Objective:
Student reviews order, selects pickup time and location, sees total price

### Tasks Overview:
- [ ] Create `CheckoutScreen.js`
  - Display order summary (items, quantities, prices)
  - Time slot selector (dropdown/segmented control)
    - Display available time_slots from DB (5 options)
    - FR-2.4: "Select a specific pickup time"
  - Pickup location selector (dropdown/list)
    - Display pickup_locations from DB (4 options)
    - FR-2.5: "Select designated on-campus pick-up point"
  - Calculate:
    - Subtotal (sum of all items)
    - Service fee (3000 IDR per item or fixed)
    - Total
  - FR-2.6: "Display order summary and total price before payment"
  - "Proceed to Payment" button
  - Validation: Must select time + location before proceeding

- [ ] Update Cart Context
  - Add: selectedTimeSlot, selectedPickupLocation
  - Add: getOrderSummary() function

### Acceptance Criteria:
- ✅ Shows all items added to cart with quantities
- ✅ Time slot dropdown shows 5 available slots
- ✅ Location dropdown shows 4 pickup locations
- ✅ Subtotal, service fee, total calculated correctly
- ✅ Cannot proceed without selecting both time and location
- ✅ Clear error messages for validation

---

## ⏳ SPRINT 2.4: Payment Integration (PLANNED - Nov 3-5)

**Duration:** 2-3 days  
**SRS Reference:** FR-3.0, FR-3.1, FR-3.2, FR-3.3

### Objective:
Student completes payment, order is created in DB, confirmation shown

### Tasks Overview:

#### Option A: Mock Payment (FASTER - Recommended for MVP)
- [ ] Create `PaymentScreen.js`
  - Display final order summary
  - Mock payment methods: QRIS, E-wallet
  - "Confirm Payment" button
  - On tap → mock successful payment

#### Option B: Real Payment (SKIP for now)
- Would require: Midtrans or Xendit integration
- Setup: Payment gateway account, API keys
- Testing: More complex

**RECOMMENDATION:** Use Option A for MVP, add real payments in Phase 5

### Payment Screen Flow:
1. Display order details (what, where, when)
2. Show payment method options (QRIS / E-wallet)
3. On "Confirm Payment":
   - Create `orders` record in Supabase
   - Create `order_items` records (one per cart item)
   - Create `payments` record (status: completed)
   - Clear cart state
   - Show confirmation screen

- [ ] Create `OrderConfirmationScreen.js`
  - Show order number (auto-generated format: "BG-YYYYMMDD-###")
  - Show vendor name, pickup time, pickup location
  - Show total amount paid
  - "Continue Shopping" button → back to HomeScreen
  - "View Order" button → OrdersScreen

### Database Operations:
```sql
-- Function already exists in schema to generate order numbers
-- Trigger already exists to auto-assign order numbers

-- Example order creation:
INSERT INTO orders (
  id, student_id, vendor_id, pickup_location_id, order_type,
  subtotal, service_fee, total, status,
  scheduled_pickup_time, time_slot, advance_order_hours
) VALUES (...);

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES (...);

INSERT INTO payments (order_id, amount, payment_method, status, paid_at) VALUES (...);
```

### Acceptance Criteria:
- ✅ Payment screen shows order details
- ✅ Mock payment completes successfully
- ✅ Order record created in Supabase
- ✅ Order items linked correctly
- ✅ Payment record created
- ✅ Order number generated automatically
- ✅ Confirmation screen shown with order details
- ✅ Cart cleared after successful order

---

## ⏳ SPRINT 2.5: Order History (PLANNED - Nov 6-7)

**Duration:** 1-2 days  
**SRS Reference:** FR-4.4 (receive status updates)

### Objective:
Student can view their past and current orders with real-time status

### Tasks Overview:
- [ ] Create `OrdersScreen.js`
  - Fetch student's orders from Supabase
  - Display order cards with:
    - Vendor name
    - Order items summary (e.g., "2x Nasi Padang, 1x Es Teh")
    - Order status (pending, confirmed, preparing, ready, completed)
    - Pickup time
    - Total price
    - Order number
  - On card tap → show order details
  - Pull-to-refresh to reload orders
  - Filter options: Active / Completed (optional for MVP)

- [ ] Create `OrderDetailScreen.js`
  - Full order details
  - Current status with timestamp
  - All items with prices
  - Pickup location and time
  - Payment method and amount
  - Cancel order button (if status = pending)

- [ ] Real-time Updates (Optional for MVP)
  - Subscribe to order status changes
  - Auto-refresh when vendor updates status
  - Use Supabase real-time subscriptions

### Database Query:
```javascript
const { data } = await supabase
  .from('orders')
  .select('*, order_items(menu_items(name, price)), vendors(business_name)')
  .eq('student_id', currentUser.id)
  .order('created_at', { ascending: false });
```

### Acceptance Criteria:
- ✅ Shows all student's orders
- ✅ Orders sorted by most recent first
- ✅ Status displays correctly (pending, confirmed, etc.)
- ✅ Tap order → shows detailed view
- ✅ Pull-to-refresh works
- ✅ Real-time status updates (if implemented)

---

## ✅ PHASE 2 Success Criteria

Phase 2 is COMPLETE when:

- [x] Student can login
- [ ] Student can browse all vendors (Sprint 2.1)
- [ ] Student can view menu items (Sprint 2.2)
- [ ] Student can add items to cart (Sprint 2.2)
- [ ] Student can select pickup time & location (Sprint 2.3)
- [ ] Student can see order total (Sprint 2.3)
- [ ] Student can complete payment (Sprint 2.4)
- [ ] Student sees order confirmation (Sprint 2.4)
- [ ] Student can view order history (Sprint 2.5)
- [ ] All screens are mobile-responsive
- [ ] No console errors
- [ ] Code is clean and documented

---

## ⏳ PHASE 3: Vendor Feature Set (PLANNED - Nov 8-15)

**Duration:** 1 week

### Sprint 3.1: Vendor Dashboard
- [ ] Vendor sees list of new orders
- [ ] Vendor can accept/reject orders
- [ ] Vendor can update order status
- SRS Reference: FR-4.1, FR-4.2, FR-4.3

### Sprint 3.2: Vendor Notifications
- [ ] Real-time order notifications to vendor
- [ ] Status change → notification to student
- SRS Reference: FR-4.4

---

## ⏳ PHASE 4: Admin Feature Set (PLANNED - Nov 16-20)

**Duration:** 1 week

### Sprint 4.1: Admin Dashboard
- [ ] View all users, transactions
- [ ] Approve/reject vendor registrations
- [ ] Manage user accounts
- [ ] View transaction reports
- SRS Reference: FR-5.0

---

## ⏳ PHASE 5: Polish & Testing (PLANNED - Nov 21-30)

**Duration:** 1 week

- [ ] Bug fixes
- [ ] Performance optimization
- [ ] UI polish
- [ ] End-to-end testing
- [ ] Deployment preparation

---

## 📋 Tech Stack Reference

```
Frontend:
  - React Native
  - Expo
  - React Navigation
  - Context API (for state management)
  - React Native Paper (optional UI library)

Backend:
  - Supabase (BaaS)
  - PostgreSQL (database)
  - Supabase Auth

Database:
  - 11 tables with RLS policies
  - Pre-populated with seed data

Payment (TBD):
  - Option 1: Mock payment (MVP)
  - Option 2: Midtrans / Xendit (Phase 5)
```

---

## 🗂️ File Structure (Current + Planned)

```
src/
├── components/
│   ├── common/
│   │   ├── Button.js              ✅
│   │   ├── Card.js                ✅
│   │   ├── Input.js               ✅
│   │   └── CartIcon.js            ⏳ (Sprint 2.2)
│   └── specific/
│       └── VendorCard.js          ⏳ (Sprint 2.1)
│
├── context/
│   └── CartContext.js             ⏳ (Sprint 2.2)
│
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.js         ✅
│   │   ├── RegisterScreen.js      ✅
│   │   ├── SignupChooseRoleScreen.js ✅
│   │   └── LoginChoiceScreen.js   ✅
│   │
│   └── student/
│       ├── HomeScreen.js          ⏳ (Sprint 2.1 - CURRENT)
│       ├── MenuScreen.js          ⏳ (Sprint 2.2)
│       ├── CheckoutScreen.js      ⏳ (Sprint 2.3)
│       ├── PaymentScreen.js       ⏳ (Sprint 2.4)
│       ├── OrderConfirmationScreen.js ⏳ (Sprint 2.4)
│       └── OrdersScreen.js        ⏳ (Sprint 2.5)
│
├── navigation/
│   └── AppNavigator.js            ⏳ (Sprint 2.1 - CURRENT)
│
├── services/
│   └── supabase.js                ✅
│
├── constants/
│   ├── colors.js                  ✅
│   └── theme.js                   ✅
│
└── utils/
    └── helpers.js                 ✅
```

---

## 📊 Current Test Data Available

### Users (for testing):
```
STUDENTS:
- budi.santoso@binus.ac.id (ID: 10000000-0000-0000-0000-000000000001)
- ani.wijaya@binus.ac.id (ID: 20000000-0000-0000-0000-000000000002)
- charlie.tan@binus.ac.id (ID: 30000000-0000-0000-0000-000000000003)

VENDORS:
- canteen.a@beegrub.com (Canteen A - Nasi Padang)
- canteen.b@beegrub.com (Canteen B - Mie Ayam & Bakso)
- warung.sari@beegrub.com (Warung Bu Sari)

ADMIN:
- admin@beegrub.com
```

### Menu Items (32 total):
```
Canteen A (10 items): Nasi Padang Rendang, Mie Ayam, Bakso, etc. (15k-25k IDR)
Canteen B (10 items): Mie Ayam Bakso, Mie Goreng, etc. (15k-22k IDR)
Warung Bu Sari (12 items): Nasi Goreng, Ayam Bakar, etc. (6k-25k IDR)
```

### Pickup Locations (4):
1. Library Main Entrance
2. Building A Ground Floor
3. Building B Cafeteria
4. Student Center

### Time Slots (5):
1. 09:00-09:20 (morning rush)
2. 11:00-11:20 (lunch rush)
3. 13:00-13:20 (afternoon rush)
4. 15:00-15:20
5. 17:00-17:20

---

## ✅ Checklist for Mentor Reviews

After each sprint, verify:

- [ ] All acceptance criteria met
- [ ] No console.warn or console.error
- [ ] Code follows React best practices
- [ ] Components are reusable
- [ ] State management is clean
- [ ] Navigation works smoothly
- [ ] Mobile responsive (test on different screen sizes)
- [ ] Commit message is clear and descriptive
- [ ] Code is documented with comments

---

## 🔗 Important Links & Files

- **SRS Document:** `SRS Document (September 30, 2025)` (provided by user)
- **Database Schema:** `database_schema.sql`
- **Seed Data:** `seed_data.sql`
- **Supabase Project:** `https://etconfsqdceomsarqbpb.supabase.co`
- **Current Working Status:** Student login ✅

---

## 📞 Communication Protocol

**When stuck or have questions:**
1. Check this roadmap first
2. Review SRS document
3. Check Supabase schema
4. Ask mentor (GitHub Copilot)

**When task is complete:**
1. Mark as complete in this document
2. Commit code with clear message
3. Update the status section

---

## 🎓 Key Principles

1. **MVP First:** Don't add features beyond the scope. Focus on core functionality.
2. **Test Early & Often:** Test each sprint before moving to next.
3. **Clean Code:** Write code you'd be proud to show in an interview.
4. **Communication:** Update this roadmap after every sprint.
5. **User-Centric:** Always think: "Does this solve a student's problem?"

---

## 📝 Notes Section

### Oct 26, 2025 - Sprint 2.1 Starting
- Mentor approved roadmap structure
- Ready to build HomeScreen.js
- All seed data in place (3 vendors, 32 menu items)
- Student login working ✅

### Issues Encountered:
(Track bugs and solutions here)

---

**Last Updated:** October 26, 2025  
**Next Review:** After Sprint 2.1 completion (Oct 27)  
**Mentor:** GitHub Copilot

---

## 🚀 READY TO START SPRINT 2.1?

Next task: **Build HomeScreen.js**

Mentor is ready to help! Let's go! 💪
