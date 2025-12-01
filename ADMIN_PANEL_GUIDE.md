# 🔐 Admin Panel Setup Guide

## 📋 Overview

The admin panel is now fully implemented! Admins can:
- ✅ View pending vendor registrations
- ✅ Approve/Reject/Suspend vendors
- ✅ View all users (students, vendors, admins)
- ✅ View all orders and revenue
- ✅ See platform statistics

---

## 🚀 Quick Setup (3 Steps)

### **Step 1: Create Admin Account in Supabase**

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **Authentication > Users**
3. Click **"Add User"**
4. Fill in:
   - **Email:** `admin@beegrub.com` (or your preferred email)
   - **Password:** Choose a strong password
   - **Email Confirmed:** Toggle **ON** ✅
5. Click **"Create User"**
6. **Copy the User ID** (you'll need it in Step 2)

---

### **Step 2: Link Admin to Database**

1. Open Supabase **SQL Editor**
2. Open the file: `CREATE_ADMIN_ACCOUNT.sql`
3. **Replace** `PASTE_YOUR_AUTH_USER_ID_HERE` with the User ID from Step 1
4. **Replace** `admin@beegrub.com` with your email if different
5. Click **Run** ▶️

The SQL will:
- Create admin record in `users` table
- Create admin profile in `admins` table
- Verify creation

---

### **Step 3: Login as Admin**

1. Open BeeGrub app
2. Login with admin credentials
3. You'll see the **Admin Dashboard**! 🎉

---

## 📱 Admin Panel Features

### **Dashboard (Main Screen)**

**Statistics Overview:**
- Total users (students + vendors)
- Pending vendor count
- Total orders & revenue

**Quick Actions:**
- 👥 Manage Users
- 📦 View Orders

**Vendor Management:**
- **Pending Tab:** New vendor registrations waiting for approval
- **Approved Tab:** Active vendors

**For Each Vendor You Can:**
- ✅ **Approve** - Allow vendor to login and operate
- ❌ **Reject** - Deny vendor application
- ⊘ **Suspend** - Temporarily disable an approved vendor

---

### **Manage Users Screen**

**View all users with filters:**
- All users
- Students only
- Vendors only
- Admins only

**User Information Shown:**
- Email address
- Role (Student/Vendor/Admin)
- Status (Active/Inactive)
- Email verified status
- Join date

---

### **View Orders Screen**

**See all orders across the platform:**
- Order number
- Vendor name
- Pickup location & time
- Order status
- Total amount
- Created date

**Summary Statistics:**
- Total number of orders
- Total platform revenue

---

## 🔄 Vendor Registration Flow (With Admin Approval)

### **What Happens:**

1. **Vendor registers** → Fills registration form
2. **Email sent** → Vendor receives confirmation email
3. **Email confirmed** → Vendor clicks confirmation link
4. **Status set to 'pending'** → Vendor created but cannot login yet ⏳
5. **Admin notified** → (You should check dashboard regularly)
6. **Admin reviews** → Check vendor details in admin panel
7. **Admin approves** → Click "Approve" button
8. **Vendor can login** → Now they have access ✅

---

## 🧪 Testing the Admin Panel

### **Test Scenario 1: Approve New Vendor**

1. **Register a vendor account:**
   - Email: `testvendor@gmail.com`
   - Canteen Name: `Test Canteen`
   - Location: `Building C`

2. **Confirm email** (manually in Supabase):
   ```sql
   UPDATE auth.users 
   SET confirmed_at = NOW() 
   WHERE email = 'testvendor@gmail.com';
   ```

3. **Try to login as vendor** → Should fail (pending approval)

4. **Login as admin** → See vendor in "Pending" tab

5. **Click "Approve"** → Vendor status changes to 'approved'

6. **Login as vendor again** → Should work now ✅

---

### **Test Scenario 2: Reject Vendor**

1. Follow steps 1-4 above
2. Click **"Reject"** instead of approve
3. Vendor status → 'rejected'
4. Vendor cannot login

---

### **Test Scenario 3: Suspend Vendor**

1. Approve a vendor first (follow Scenario 1)
2. Go to **"Approved"** tab
3. Click **"Suspend"** on that vendor
4. Vendor status → 'suspended'
5. Vendor can no longer login (even though previously approved)

---

## 📊 Database Status Checks

### **Check Vendor Status:**
```sql
SELECT 
  v.business_name,
  v.status,
  v.approved_at,
  u.email
FROM vendors v
JOIN users u ON u.id = v.id
ORDER BY v.created_at DESC;
```

### **Count Vendors by Status:**
```sql
SELECT status, COUNT(*) as count 
FROM vendors 
GROUP BY status;
```

### **Check Admin Accounts:**
```sql
SELECT 
  u.email,
  u.role,
  a.name
FROM users u
JOIN admins a ON a.id = u.id
WHERE u.role = 'admin';
```

---

## 🔧 Troubleshooting

### **Problem: Can't see Admin Dashboard after login**

**Check:**
1. User role is set to 'admin' in database
2. Admin record exists in `admins` table

**Fix:**
```sql
-- Verify role
SELECT email, role FROM users WHERE email = 'admin@beegrub.com';

-- If role is wrong, update it
UPDATE users SET role = 'admin' WHERE email = 'admin@beegrub.com';

-- Ensure admin profile exists
INSERT INTO admins (id, name) 
SELECT id, 'Admin' FROM users WHERE email = 'admin@beegrub.com'
ON CONFLICT (id) DO NOTHING;
```

---

### **Problem: Vendors still auto-approving**

**Check trigger:**
```sql
-- View current trigger function
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user_confirmation';
```

**Look for:**
- Should have: `status = 'pending'` for vendors
- Should NOT have: `status = 'approved'` for vendors

**If wrong, run:**
`COMPLETE_REGISTRATION_TRIGGER.sql` (sets status='pending')

---

### **Problem: Pending vendors not showing**

**Check:**
1. Vendor email confirmed?
```sql
SELECT email, confirmed_at FROM auth.users WHERE email = 'vendor@email.com';
```

2. Vendor created in database?
```sql
SELECT * FROM vendors WHERE contact_phone = 'VENDOR_PHONE';
```

3. Status is 'pending'?
```sql
SELECT business_name, status FROM vendors WHERE status = 'pending';
```

---

## 📝 Admin Best Practices

### **Before Approving a Vendor:**

1. ✅ Verify business name is legitimate
2. ✅ Check location is on campus
3. ✅ Verify contact phone is valid
4. ✅ Check if business already exists (no duplicates)

### **When to Suspend:**

- Vendor violates terms of service
- Multiple customer complaints
- Inactivity for extended period
- Suspicious activity

### **When to Reject:**

- Duplicate application
- Fake/invalid business information
- Off-campus location
- Incomplete information

---

## 🎯 Current Status Summary

✅ **Implemented:**
- Admin authentication & routing
- Admin Dashboard with stats
- Vendor management (approve/reject/suspend)
- User management screen
- Order viewing screen
- Pull-to-refresh on all screens
- Status badges and filters

📋 **Files Created:**
1. `AdminDashboardScreen.js` - Main admin panel
2. `AdminUsersScreen.js` - User management
3. `AdminOrdersScreen.js` - Order viewing
4. `AdminNavigator.js` - Admin navigation (updated)
5. `api.js` - Admin API functions (updated)
6. `CREATE_ADMIN_ACCOUNT.sql` - Admin setup SQL
7. `ADMIN_PANEL_GUIDE.md` - This guide

⚙️ **Database:**
- Trigger: `handle_new_user_confirmation()` sets vendors to 'pending'
- Admin can approve via app or SQL
- Status options: pending, approved, rejected, suspended

---

## 🚀 Next Steps

1. **Create your admin account** (Steps 1-2 above)
2. **Test the approval flow** (register test vendor)
3. **Check existing vendors** - Any pending vendors to approve?
4. **Set up monitoring** - Check dashboard regularly for new registrations

---

## 📞 Quick Reference Commands

**Approve all pending vendors:**
```sql
UPDATE vendors SET status = 'approved', approved_at = NOW() WHERE status = 'pending';
```

**Create admin from existing user:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
INSERT INTO admins (id, name) SELECT id, 'Admin' FROM users WHERE email = 'your@email.com';
```

**Check trigger status:**
```sql
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_confirmed';
```

---

**Admin Panel is Ready! 🎉**

Login as admin to start managing vendors.

**Last Updated:** November 30, 2024
