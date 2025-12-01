# 💳 BeeGrub Payment Integration Guide

## 📋 Overview

This guide covers implementing payment methods for BeeGrub, from MVP (cash) to full digital payments (QRIS, e-wallets).

---

## 🎯 Phase 1: Cash on Pickup (MVP) - **LAUNCH WITH THIS**

### Why Start with Cash?
- ✅ Zero implementation time
- ✅ No payment gateway fees
- ✅ Familiar to all users
- ✅ No compliance/legal issues
- ✅ Students still get queue-skipping value
- ✅ Can validate product-market fit first

### Implementation
Already implemented in your schema! Just update order flow:

1. **Student places order** → Status: `scheduled`
2. **Vendor confirms** → Status: `confirmed`
3. **Student picks up & pays cash** → Status: `completed`
4. **Payment record created** with `payment_method: 'cash'`

### Code Changes Needed:
```javascript
// In CheckoutScreen.js
const handlePlaceOrder = async () => {
  // Create order with payment_method: 'cash'
  const orderData = {
    payment_method: 'cash',
    payment_status: 'pending', // Will be 'completed' on pickup
    // ... other order data
  };
};
```

---

## 🚀 Phase 2: QRIS Integration (Recommended Next)

### Option A: Midtrans (RECOMMENDED) 🌟

#### Why Midtrans?
- Most popular in Indonesia
- QRIS + all major e-wallets
- Excellent documentation
- React Native SDK
- Sandbox for testing
- Affordable fees (0.7% QRIS)

#### Setup Steps:

### 1. Register Midtrans Account
```
1. Go to https://midtrans.com
2. Sign up for Sandbox account (free)
3. Get your credentials:
   - Server Key
   - Client Key
```

### 2. Install Dependencies
```bash
npm install --save react-native-midtrans
npm install --save @react-native-async-storage/async-storage
cd ios && pod install
```

### 3. Configure Midtrans

Create `src/services/midtrans.js`:
```javascript
import MidtransNew from 'react-native-midtrans';

// Initialize Midtrans
const initMidtrans = () => {
  MidtransNew.init({
    clientKey: 'YOUR_CLIENT_KEY', // From Midtrans Dashboard
    environment: 'sandbox', // Change to 'production' when live
    merchantBaseUrl: 'YOUR_BACKEND_URL/midtrans-callback',
  });
};

export const payWithQRIS = async (orderData) => {
  try {
    // 1. Get transaction token from your backend
    const snapToken = await getSnapToken(orderData);
    
    // 2. Open payment screen
    const result = await MidtransNew.payment(snapToken, {
      paymentMethod: 'gopay', // For QRIS, use 'gopay' or 'qris'
    });
    
    return {
      success: true,
      transactionId: result.transactionId,
      status: result.transactionStatus,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get snap token from backend
const getSnapToken = async (orderData) => {
  const response = await fetch('YOUR_BACKEND_URL/create-transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderData.orderNumber,
        gross_amount: orderData.total,
      },
      customer_details: {
        first_name: orderData.studentName,
        email: orderData.email,
        phone: orderData.phone,
      },
      item_details: orderData.items.map(item => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
    }),
  });
  
  const data = await response.json();
  return data.token;
};

export default { initMidtrans, payWithQRIS };
```

### 4. Backend API (Node.js/Express)

You'll need a backend endpoint to generate Midtrans tokens:

```javascript
// backend/routes/payment.js
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: 'YOUR_SERVER_KEY',
  clientKey: 'YOUR_CLIENT_KEY',
});

app.post('/create-transaction', async (req, res) => {
  try {
    const parameter = {
      transaction_details: req.body.transaction_details,
      customer_details: req.body.customer_details,
      item_details: req.body.item_details,
      enabled_payments: ['qris', 'gopay', 'shopeepay'], // QRIS + e-wallets
    };
    
    const transaction = await snap.createTransaction(parameter);
    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook for payment notifications
app.post('/midtrans-callback', async (req, res) => {
  const notification = req.body;
  
  // Verify notification
  const statusResponse = await snap.transaction.notification(notification);
  
  const orderId = statusResponse.order_id;
  const transactionStatus = statusResponse.transaction_status;
  
  // Update payment in database
  if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
    // Payment successful
    await updatePaymentStatus(orderId, 'completed');
    await updateOrderStatus(orderId, 'confirmed');
  } else if (transactionStatus === 'pending') {
    await updatePaymentStatus(orderId, 'pending');
  } else if (transactionStatus === 'deny' || transactionStatus === 'cancel') {
    await updatePaymentStatus(orderId, 'failed');
  }
  
  res.json({ status: 'ok' });
});
```

### 5. Update Payment Flow

```javascript
// In CheckoutScreen.js
import { payWithQRIS } from '../../services/midtrans';

const handlePayment = async () => {
  if (paymentMethod === 'cash') {
    // Original flow
    await createOrder({ payment_method: 'cash' });
  } else if (paymentMethod === 'qris') {
    setLoading(true);
    
    // Create order first
    const order = await createOrder({ 
      payment_method: 'qris',
      payment_status: 'pending' 
    });
    
    // Open QRIS payment
    const paymentResult = await payWithQRIS({
      orderNumber: order.order_number,
      total: order.total,
      studentName: user.full_name,
      email: user.email,
      phone: user.phone,
      items: cartItems,
    });
    
    if (paymentResult.success) {
      // Update payment record
      await updatePayment(order.id, {
        status: 'completed',
        external_transaction_id: paymentResult.transactionId,
      });
      
      navigation.navigate('OrderConfirmation', { orderId: order.id });
    } else {
      Alert.alert('Payment Failed', paymentResult.error);
    }
    
    setLoading(false);
  }
};
```

---

## 💰 Cost Breakdown

### Midtrans Fees (Indonesia):
- **QRIS**: 0.7% per transaction
- **GoPay/OVO/ShopeePay**: 2% per transaction
- **Credit Card**: 2.9% + Rp 2,000 per transaction
- **No monthly fees** (pay per transaction only)

### Example:
- Order total: Rp 50,000
- QRIS fee: Rp 350 (0.7%)
- **Vendor receives: Rp 49,650**

---

## 📊 Database Updates Needed

Already in your schema! Just ensure:

```sql
-- payments table (already exists)
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10,2),
  payment_method VARCHAR(50), -- 'cash', 'qris', 'gopay', etc.
  status VARCHAR(20), -- 'pending', 'completed', 'failed'
  external_transaction_id VARCHAR(255), -- Midtrans transaction ID
  gateway_response JSONB, -- Store full Midtrans response
  paid_at TIMESTAMP,
  created_at TIMESTAMP
);
```

---

## 🎨 UI/UX Best Practices

### Payment Method Selection
✅ **Show available methods clearly**
✅ **Mark recommended option** (Cash for MVP, QRIS later)
✅ **"Coming Soon" badges** for unavailable methods
✅ **Clear fee disclosure** (if any)

### QRIS Flow
1. **Student selects QRIS** → Shows "Preparing payment..."
2. **QR code appears** → Student scans with any e-wallet
3. **Payment confirmed** → Automatic redirect to confirmation
4. **Vendor gets notification** → Can start preparing

### Error Handling
- Payment timeout (15 min)
- Network errors
- Insufficient balance
- Clear retry mechanism

---

## ✅ Testing Checklist

### Cash Payment (MVP)
- [ ] Order placement works
- [ ] Payment record created with status 'pending'
- [ ] Vendor can mark as paid on pickup
- [ ] Payment status updates to 'completed'

### QRIS Payment (Phase 2)
- [ ] Midtrans sandbox account setup
- [ ] Test transaction successful
- [ ] Test transaction failed
- [ ] Test transaction timeout
- [ ] Webhook receives notifications
- [ ] Database updates correctly
- [ ] Error messages are clear

---

## 🚀 Launch Timeline Recommendation

### Week 1-2: MVP Launch (Cash Only)
```
✅ Payment method screen (cash only)
✅ Order placement
✅ Cash payment on pickup
✅ Basic analytics
```

### Week 3-4: QRIS Integration
```
✅ Midtrans account setup
✅ Backend API implementation
✅ QRIS payment screen
✅ Testing in sandbox
✅ Production deployment
```

### Month 2: Optimization
```
✅ Add GoPay deep link
✅ Add OVO deep link
✅ Promo code system
✅ Payment analytics
```

---

## 🔐 Security Considerations

### Must-Have:
1. **Never store card details** (use Midtrans tokenization)
2. **Verify webhook signatures** (prevent fake callbacks)
3. **Use HTTPS** for all payment APIs
4. **Log all transactions** for audit trail
5. **Handle refunds properly** (if needed)

### Backend Security:
```javascript
// Verify Midtrans notification signature
const crypto = require('crypto');

const verifySignature = (data, signature, serverKey) => {
  const hash = crypto
    .createHash('sha512')
    .update(`${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`)
    .digest('hex');
  
  return hash === signature;
};
```

---

## 📱 Alternative: Simpler QRIS (Static QR)

If Midtrans integration is too complex for MVP, consider:

### Static QRIS QR Code (Per Vendor)
1. Each vendor gets their own QRIS QR from their bank
2. Student places order
3. Student scans vendor's QRIS manually
4. Student uploads payment proof
5. Vendor confirms payment manually

**Pros**: 
- Zero integration
- Works immediately
- No fees beyond bank's QRIS fee

**Cons**:
- Manual confirmation needed
- Not instant
- More friction

---

## 🎯 My Recommendation

**Start simple, iterate fast:**

```
Phase 1 (Week 1-2): Cash Only
→ Validate product-market fit
→ Get user feedback
→ Zero technical complexity

Phase 2 (Week 3-4): Add Midtrans QRIS
→ Users love it, they'll adopt digital payment
→ Vendors get instant confirmation
→ Professional payment experience

Phase 3 (Month 2+): Optimize
→ Direct e-wallet integration
→ Promo codes
→ Loyalty points
```

**Don't over-engineer payment before you validate the core value proposition** (queue-skipping + pre-ordering).

Cash works perfectly fine for campus food orders. Students are used to it. Add digital payment when you have traction and user demand.

---

## 📞 Need Help?

**Midtrans Support:**
- Docs: https://docs.midtrans.com
- Support: support@midtrans.com
- Sandbox: https://dashboard.sandbox.midtrans.com

**React Native Midtrans:**
- GitHub: https://github.com/anshuman-aroraa/react-native-midtrans-snap

Good luck! 🚀
