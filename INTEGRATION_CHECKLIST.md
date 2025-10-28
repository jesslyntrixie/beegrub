# ✅ Student Screens Integration Checklist

**Created:** October 26, 2025  
**Sprint:** 2.1-2.5 (Student Feature Set)  
**Status:** Ready to Integrate

---

## 📦 What's Been Created

### Context (State Management)
- ✅ `src/context/CartContext.js` - Global cart state management

### Components  
- ✅ `src/components/specific/VendorCard.js` - Vendor card component

### Documentation
- ✅ `STUDENT_SCREENS_GUIDE.md` - Implementation guide
- ✅ `SRS_UPDATED.md` - Complete requirements
- ✅ `ROADMAP_QUICK.md` - Project roadmap

### Screens (Already Exist)
- ✅ `src/screens/student/HomeScreen.js` - Browse vendors
- ✅ `src/screens/student/MenuScreen.js` - Browse menu items
- ✅ `src/screens/student/CheckoutScreen.js` - Review order
- ✅ `src/screens/student/OrdersScreen.js` - Order history

---

## 🔧 Integration Tasks (DO THESE)

### Task 1: Wrap App with CartProvider
**File:** App.js or navigation root

```javascript
import { CartProvider } from './src/context/CartContext';

export default function App() {
  return (
    <CartProvider>
      {/* Your navigation */}
    </CartProvider>
  );
}
```
**Status:** ⏳ TO DO

### Task 2: Update AppNavigator.js
**File:** `src/navigation/AppNavigator.js`

Add all student screens to navigation stack:
```javascript
<Stack.Screen 
  name="HomeScreen" 
  component={HomeScreen}
/>
<Stack.Screen 
  name="MenuScreen" 
  component={MenuScreen}
/>
<Stack.Screen 
  name="CheckoutScreen" 
  component={CheckoutScreen}
/>
```

**Status:** ⏳ TO DO

### Task 3: Verify Colors Configuration
**File:** `src/constants/colors.js`

Ensure these colors exist:
- primary (BeeGrub Yellow #FFB81C)
- background
- text
- textLight
- border
- error
- success

**Status:** ⏳ VERIFY

### Task 4: Test HomeScreen
**Expected Flow:**
1. Login → HomeScreen
2. See 3 vendors
3. Tap vendor → MenuScreen

**Status:** ⏳ TO DO

---

## 🎯 Quick Start (3 Steps)

### Step 1: Wrap Cart Provider (2 min)
Edit `App.js`:
```javascript
import { CartProvider } from './src/context/CartContext';

// Wrap your main component
<CartProvider>
  <AppNavigator />
</CartProvider>
```

### Step 2: Update Navigation (5 min)
Edit `AppNavigator.js`:
- Import all 4 student screens
- Add screens to Stack.Navigator
- Test navigation works

### Step 3: Test (5 min)
Run on simulator:
```
npm start
Login → See vendors → Tap vendor → See menu
```

**Total Time:** ~15 minutes ⚡

---

## 📋 Student Flow (What User Sees)

```
1. Login Screen
   ↓
2. HomeScreen (Sprint 2.1)
   "Browse Vendors"
   - See: Canteen A, Canteen B, Warung Bu Sari
   - Action: Tap vendor
   ↓
3. MenuScreen (Sprint 2.2)
   "Select Items"
   - See: 10+ menu items with prices
   - Action: Tap "+" to add to cart
   - Cart count shows in header
   ↓
4. CheckoutScreen (Sprint 2.3)
   "Review Order"
   - See: Order summary, pricing breakdown
   - Action: Select pickup time + location
   ↓
5. PaymentScreen (Sprint 2.4)
   "Payment"
   - See: Final total
   - Action: Confirm payment (mock)
   ↓
6. OrderConfirmationScreen (Sprint 2.4)
   "Confirmation"
   - See: Order number, status, details
   - Action: View orders OR continue shopping
   ↓
7. OrdersScreen (Sprint 2.5)
   "My Orders"
   - See: All past orders with status
   - Action: Tap order to see details
```

---

## 🧪 Testing Scenarios

### Scenario 1: First-time User
```
Login → HomeScreen (see vendors) → MenuScreen (add items) 
→ CheckoutScreen (select time/location) → PaymentScreen 
→ OrderConfirmationScreen (see order #)
```
**Expected:** ✅ Complete order flow works end-to-end

### Scenario 2: Browse Multiple Vendors
```
HomeScreen → MenuScreen (Vendor A) → Back → HomeScreen 
→ MenuScreen (Vendor B)
```
**Expected:** ✅ Cart clears when switching vendors, can browse both

### Scenario 3: Multiple Items in Cart
```
MenuScreen → Add "Nasi Padang" (qty 2) → Add "Es Teh" (qty 1) 
→ CheckoutScreen
```
**Expected:** ✅ Shows 3 items, calculates correct totals with service fee

### Scenario 4: Order History
```
After placing order → OrdersScreen
```
**Expected:** ✅ See past order with status

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "CartContext is undefined" | CartProvider not wrapping app | Add `<CartProvider>` in App.js |
| "Cannot read property 'id' of undefined" | route.params missing | Check navigation params passed correctly |
| "Network error fetching vendors" | Supabase not configured | Check credentials in supabase.js |
| "Colors not showing" | colors.js not imported | Import: `import { colors } from '../../constants/colors'` |
| Navigation not working | Screens not in AppNavigator | Register all screens in Stack |

---

## 📊 File Structure

```
src/
├── components/
│   └── specific/
│       └── VendorCard.js ✅
│
├── context/
│   └── CartContext.js ✅
│
├── screens/
│   └── student/
│       ├── HomeScreen.js ✅
│       ├── MenuScreen.js ✅
│       ├── CheckoutScreen.js ✅
│       └── OrdersScreen.js ✅
│
├── navigation/
│   └── AppNavigator.js ⏳ (needs update)
│
├── services/
│   └── supabase.js ✅
│
└── constants/
    └── colors.js ✅
```

---

## ✅ Pre-Launch Checklist

Before going to Phase 3 (Vendor Dashboard):

- [ ] CartProvider wraps app
- [ ] All 4 student screens in AppNavigator
- [ ] Can login as student
- [ ] HomeScreen shows 3 vendors
- [ ] Can browse MenuScreen
- [ ] Can add items to cart
- [ ] Cart totals are correct
- [ ] Can proceed to CheckoutScreen
- [ ] All UI elements visible and styled
- [ ] No console errors
- [ ] No navigation errors
- [ ] Loading states work
- [ ] Error states work
- [ ] Pull-to-refresh works on HomeScreen

---

## 🚀 Next Phase (After Phase 2)

### Phase 3: Vendor Dashboard
- Vendor sees new orders
- Vendor accepts/rejects orders
- Vendor updates order status
- Real-time notifications

### Phase 4: Admin Panel
- Admin approves vendors
- Admin views all transactions
- Admin manages users

---

## 📞 Support

**Questions?** Reference these docs:
- `STUDENT_SCREENS_GUIDE.md` - How to use each component
- `SRS_UPDATED.md` - What each screen should do
- `ROADMAP_QUICK.md` - Timeline and milestones

---

## 🎉 Ready?

**Next Action:** 
1. Make 3 integration changes above
2. Run `npm start`
3. Test the flow
4. Report any errors

**Expected Time:** 30 minutes

Let's ship it! 🐝

---

**Last Updated:** October 26, 2025  
**Version:** 1.0  
**Status:** ✅ READY FOR IMPLEMENTATION
