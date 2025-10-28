# 🐝 BeeGrub MVP - Quick Roadmap

**Project:** BeeGrub Campus Food Pre-Order Platform  
**Timeline:** 6 weeks (Oct 19 - Nov 30, 2025)  
**Status:** Phase 2.1 (Sprint: Browse Vendors)

---

## 📊 Phase Overview

| Phase | Focus | Timeline | Status |
|-------|-------|----------|--------|
| **1** | Infrastructure & Auth | Oct 19-25 | ✅ DONE |
| **2** | Student Ordering Flow | Oct 26-Nov 8 | 🔄 IN PROGRESS |
| **3** | Vendor Dashboard | Nov 8-15 | ⏳ Next |
| **4** | Admin Panel | Nov 16-20 | ⏳ Next |
| **5** | Polish & Deploy | Nov 21-30 | ⏳ Next |

---

## ✅ Phase 1: Complete
- Database schema (11 tables with RLS)
- Supabase setup + real credentials
- Seed data (3 vendors, 32 menu items, 3 orders)
- Student login working ✅

---

## 🔄 Phase 2: Student Ordering Flow

### Sprint 2.1: Browse Vendors ← **YOU ARE HERE**
**Duration:** 1-2 days | **Status:** CURRENT

**Build:** `HomeScreen.js`
- Fetch vendors from Supabase
- Display vendor cards (name, description, location)
- Tap vendor → navigate to MenuScreen
- Show loading + error states

**Test:** Login → See 3 vendors → Tap vendor

**Acceptance:** ✅ All 3 vendors display correctly

---

### Sprint 2.2: Menu & Cart
**Duration:** 2-3 days

**Build:** `MenuScreen.js` + `CartContext.js`
- Fetch menu items for vendor
- Display food items with price
- Add to cart functionality
- Cart state management

**Acceptance:** ✅ Can add items to cart, see count badge

---

### Sprint 2.3: Checkout
**Duration:** 2-3 days

**Build:** `CheckoutScreen.js`
- Order summary
- Select pickup time slot
- Select pickup location
- Show total (subtotal + service fee)
- Validation before payment

**Acceptance:** ✅ Can select time & location, see total

---

### Sprint 2.4: Payment
**Duration:** 2-3 days

**Build:** `PaymentScreen.js` + `OrderConfirmationScreen.js`
- Mock payment (QRIS, E-wallet)
- Create order in database
- Generate order number
- Show confirmation with details

**Acceptance:** ✅ Order created in DB, confirmation shown

---

### Sprint 2.5: Order History
**Duration:** 1-2 days

**Build:** `OrdersScreen.js` + `OrderDetailScreen.js`
- Fetch student's orders
- Display order cards with status
- View order details
- Real-time status updates (optional)

**Acceptance:** ✅ Can view all past orders with status

---

## ⏳ Phase 3: Vendor Dashboard
- Vendor sees new orders
- Accept/reject orders
- Update order status (preparing → ready)
- Real-time notifications to student

---

## ⏳ Phase 4: Admin Panel
- View all users & transactions
- Approve vendor registrations
- Manage accounts
- Transaction reports

---

## ⏳ Phase 5: Polish & Deploy
- Bug fixes
- Performance optimization
- UI polish
- End-to-end testing
- Production deployment

---

## 🛠️ Tech Stack

**Frontend:** React Native + Expo  
**Backend:** Supabase (PostgreSQL + Auth)  
**State:** Context API  
**Payment:** Mock (Phase 5: Real integration)

---

## 📋 Database

**Tables:** users, students, vendors, menu_items, orders, order_items, payments, time_slots, pickup_locations

**Seed Data:**
- 7 users (3 students, 3 vendors, 1 admin)
- 3 vendors with 32 menu items
- 4 pickup locations
- 5 time slots
- 3 sample orders

---

## ✅ Right Now: Sprint 2.1

**Task:** Build `HomeScreen.js`

**Steps:**
1. Create file: `src/screens/student/HomeScreen.js`
2. Fetch vendors: `supabase.from('vendors').select('*')`
3. Display vendor cards
4. Add vendor tap → navigate to MenuScreen
5. Test: Login → See vendors ✅

**Acceptance Criteria:**
- ✅ Shows 3 vendors (Canteen A, B, Warung Bu Sari)
- ✅ Each card shows name, description, location
- ✅ Tap vendor → navigates to MenuScreen
- ✅ Loading state while fetching
- ✅ Error handling for failures

---

## 📞 Quick Reference

**Test Credentials:**
```
Email: jesslyn.edvilie@binus.ac.id
(Or create new student in Supabase Auth)
```

**Supabase Project:**
```
URL: https://etconfsqdceomsarqbpb.supabase.co
```

**File Locations:**
```
Roadmap: ROADMAP_QUICK.md (this file)
SRS: SRS_UPDATED.md
AppNavigator: src/navigation/AppNavigator.js
Services: src/services/supabase.js
```

---

## 🎯 Success = Shipping

**MVP Definition:** Student can order food end-to-end

**Minimum for "Done":**
1. ✅ Login
2. ✅ Browse vendors
3. ✅ View menu
4. ✅ Add to cart
5. ✅ Checkout
6. ✅ Pay (mock)
7. ✅ See confirmation
8. ✅ View order history

**All = 8 sprints across Phases 2-3**

---

## 📅 This Week

| Day | Sprint | Task |
|-----|--------|------|
| Oct 26-27 | 2.1 | HomeScreen.js |
| Oct 28-30 | 2.2 | MenuScreen.js + Cart |
| Oct 31-Nov 2 | 2.3 | CheckoutScreen.js |
| Nov 3-5 | 2.4 | PaymentScreen.js |
| Nov 6-7 | 2.5 | OrdersScreen.js |

---

**Let's build! 🚀**
