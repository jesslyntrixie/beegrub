# 🚀 Student Screens Implementation Guide

**Date:** October 26, 2025  
**Sprint:** 2.1 - Browse Vendors + Phase 2 Setup  
**Status:** ✅ Ready to Integrate

---

## 📋 What's Been Created

### ✅ Context (State Management)
- **File:** `src/context/CartContext.js`
- **Purpose:** Manages shopping cart globally
- **Functions:**
  - `addToCart(item, vendor_id, vendor_name)` - Add item or increase quantity
  - `removeFromCart(menu_item_id)` - Remove item
  - `updateQuantity(menu_item_id, quantity)` - Change quantity
  - `clearCart()` - Empty cart completely
  - `getCartTotals()` - Returns { itemCount, subtotal, serviceFee, total }

### ✅ Components
- **File:** `src/components/specific/VendorCard.js`
- **Purpose:** Reusable vendor card component for HomeScreen
- **Props:**
  - `vendor` - Vendor object from DB
  - `onPress` - Callback function on tap

### ✅ Screens (All Exist)
1. **HomeScreen.js** - Browse vendors ← Sprint 2.1
2. **MenuScreen.js** - View menu items ← Sprint 2.2
3. **CheckoutScreen.js** - Confirm order details ← Sprint 2.3
4. **OrdersScreen.js** - View order history ← Sprint 2.5

---

## 🔧 Integration Steps

### Step 1: Wrap App with CartProvider

**File:** `App.js` or wherever your navigation is wrapped

```javascript
import { CartProvider } from './src/context/CartContext';

export default function App() {
  return (
    <CartProvider>
      {/* Your navigation here */}
    </CartProvider>
  );
}
```

### Step 2: Update AppNavigator.js

Make sure navigation includes all student screens:

```javascript
import HomeScreen from '../screens/student/HomeScreen';
import MenuScreen from '../screens/student/MenuScreen';
import CheckoutScreen from '../screens/student/CheckoutScreen';
import OrdersScreen from '../screens/student/OrdersScreen';

// In your Student Navigator Stack:
const StudentStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MenuScreen" 
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CheckoutScreen" 
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="OrdersScreen" 
        component={OrdersScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
```

### Step 3: Make Sure Colors are Defined

**File:** `src/constants/colors.js`

```javascript
export const colors = {
  primary: '#FFB81C',      // BeeGrub Yellow
  background: '#F5F5F5',   // Light gray
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#999999',
  border: '#EEEEEE',
  error: '#E74C3C',
  success: '#27AE60',
  warning: '#F39C12',
  info: '#3498DB',
  black: '#000000',
};
```

---

## 🎯 User Flow (Phase 2 Complete)

```
Login Screen
    ↓
HomeScreen (Browse Vendors)
    ↓ [Tap Vendor]
MenuScreen (Browse Menu Items)
    ↓ [Add items → Tap Cart]
CheckoutScreen (Review Order)
    ↓ [Select time + location]
PaymentScreen (Process Payment)
    ↓ [Confirm Payment]
OrderConfirmationScreen (Show details)
    ↓ [Continue Shopping OR View Orders]
OrdersScreen (View Past Orders)
```

---

## 🧪 Testing Checklist

### HomeScreen Tests
- [ ] Login successfully
- [ ] See 3 vendors (Canteen A, B, Warung Bu Sari)
- [ ] Each vendor card shows name, description, location
- [ ] Tap vendor → navigate to MenuScreen
- [ ] Pull-to-refresh loads vendors
- [ ] Loading state appears while fetching

### MenuScreen Tests
- [ ] See 10+ menu items for selected vendor
- [ ] Each item shows name, description, price
- [ ] Tap "+" button → add to cart
- [ ] Cart icon shows item count
- [ ] Cart footer shows total with service fee
- [ ] Tap cart footer → go to CheckoutScreen

### CheckoutScreen Tests
- [ ] Show all items from cart with quantities
- [ ] Display pricing: subtotal, service fee, total
- [ ] Can select pickup time slot
- [ ] Can select pickup location
- [ ] Can add special instructions (optional)
- [ ] "Proceed" button disabled until time + location selected
- [ ] Tap "Proceed" → go to PaymentScreen

### OrdersScreen Tests
- [ ] See all past orders
- [ ] Each order shows vendor, items, status, time
- [ ] Tap order → see full details
- [ ] Pull-to-refresh works
- [ ] Status updates in real-time (if implemented)

---

## 🛠️ Common Issues & Solutions

### Issue 1: CartContext is undefined
**Solution:** Make sure App.js wraps navigation with `<CartProvider>`

### Issue 2: Menu items not loading
**Solution:** Check that:
- Supabase credentials are correct in `supabase.js`
- Seed data was loaded (check menu_items table)
- vendor.id is being passed correctly

### Issue 3: Navigation errors
**Solution:**
- Make sure all screens are registered in AppNavigator
- Check screen names match exactly (case-sensitive)
- Verify route params are passed with `route.params`

### Issue 4: Colors not showing
**Solution:** Check `src/constants/colors.js` is properly imported with correct values

---

## 📊 Data Model Reference

### Cart State Structure
```javascript
cart = {
  items: [
    {
      menu_item_id: "uuid",
      name: "Nasi Padang Rendang",
      price: 25000,
      quantity: 2
    }
  ],
  vendor_id: "uuid",
  vendor_name: "Canteen A - Nasi Padang"
}
```

### Order (to be created at payment)
```sql
INSERT INTO orders (
  student_id,
  vendor_id,
  pickup_location_id,
  order_type,
  subtotal,
  service_fee,
  total,
  status,
  scheduled_pickup_time,
  time_slot,
  special_instructions
) VALUES (...)
```

---

## 🔄 Next Steps (Phase 3+)

After Phase 2 is complete:

1. **Create PaymentScreen.js**
   - Show payment methods (QRIS, E-wallet)
   - Mock payment processing
   - Create order in database

2. **Create OrderConfirmationScreen.js**
   - Show order number, status, pickup details
   - Option to continue shopping or view orders

3. **Implement Vendor Dashboard**
   - Vendor sees new orders
   - Accept/reject orders
   - Update order status

4. **Real-time Notifications** (Phase 2.5+)
   - Subscribe to order status changes
   - Auto-refresh OrdersScreen

---

## 🚀 Ready to Test?

1. ✅ Wrap App with CartProvider
2. ✅ Verify AppNavigator has all screens
3. ✅ Check colors.js is configured
4. ✅ Run `npm start`
5. ✅ Test login → HomeScreen → MenuScreen → Checkout flow

**Expected Result:**
- Student can browse vendors
- Student can add items to cart
- Student can proceed to checkout
- Cart shows correct totals with service fee

---

## 📝 Code Examples

### Using CartContext in a Component

```javascript
import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';

export default function MyComponent() {
  const { cart, addToCart, getCartTotals } = useContext(CartContext);
  const { total } = getCartTotals();

  return (
    <Text>Cart Total: IDR {total.toLocaleString()}</Text>
  );
}
```

### Fetching Vendors with Supabase

```javascript
import { supabase } from '../../services/supabase';

const fetchVendors = async () => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('status', 'approved');

  if (error) console.error(error);
  return data;
};
```

### Creating an Order (PaymentScreen logic)

```javascript
const createOrder = async (checkoutData) => {
  const { data: user } = await supabase.auth.getUser();

  const { data: order, error } = await supabase
    .from('orders')
    .insert([
      {
        student_id: user.id,
        vendor_id: cart.vendor_id,
        pickup_location_id: checkoutData.selectedLocation.id,
        order_type: 'pre_order',
        subtotal,
        service_fee: serviceFee,
        total,
        status: 'pending',
        scheduled_pickup_time: checkoutData.selectedTimeSlot.time_start,
        time_slot: `${checkoutData.selectedTimeSlot.time_start}-${checkoutData.selectedTimeSlot.time_end}`,
        special_instructions: checkoutData.specialInstructions
      }
    ])
    .select()
    .single();

  // Create order_items
  for (const item of cart.items) {
    await supabase
      .from('order_items')
      .insert([
        {
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }
      ]);
  }

  // Create payment record
  await supabase
    .from('payments')
    .insert([
      {
        order_id: order.id,
        amount: total,
        payment_method: 'qris',
        status: 'completed',
        paid_at: new Date()
      }
    ]);

  return order;
};
```

---

## ✅ Acceptance Criteria for Phase 2

**Sprint 2.1 (HomeScreen) - DONE**
- [x] Fetch vendors from Supabase
- [x] Display vendor cards with name, description, location
- [x] Tap vendor → navigate to MenuScreen
- [x] Loading and error states
- [x] Pull-to-refresh functionality

**Sprint 2.2 (MenuScreen) - IN PROGRESS**
- [ ] Fetch menu items for vendor
- [ ] Display items with name, description, price
- [ ] Add to cart functionality
- [ ] Cart state persists across screens
- [ ] Show cart count and total

**Sprint 2.3 (CheckoutScreen) - NEXT**
- [ ] Show order summary
- [ ] Select pickup time slot
- [ ] Select pickup location
- [ ] Calculate and display pricing
- [ ] Validate selections before payment

**Sprint 2.4 (PaymentScreen) - NEXT**
- [ ] Mock payment processing
- [ ] Create order in database
- [ ] Create order_items records
- [ ] Create payments record
- [ ] Show confirmation

**Sprint 2.5 (OrdersScreen) - NEXT**
- [ ] Fetch student's orders
- [ ] Display order history
- [ ] Show order status
- [ ] Real-time updates (optional)

---

**Document Version:** 1.0  
**Last Updated:** October 26, 2025  
**Status:** ✅ READY FOR DEVELOPMENT
