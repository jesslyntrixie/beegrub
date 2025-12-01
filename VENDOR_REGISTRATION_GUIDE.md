# 🏪 Vendor Registration Guide

## 📋 Overview

This document explains how vendor registration works in BeeGrub and how to manage it.

---

## 🔄 Current Flow (Auto-Approve)

### Step 1: Vendor Registers
1. Opens BeeGrub app
2. Taps "Sign up as Vendor"
3. Fills registration form:
   - Email
   - Full Name
   - Phone Number
   - Password
   - Canteen Name
   - Canteen Location

### Step 2: Email Confirmation
1. Supabase sends confirmation email
2. Vendor clicks confirmation link
3. Email is verified

### Step 3: Auto-Approval (Current Setup)
1. Database trigger fires: `handle_new_user_confirmation()`
2. Creates records:
   - ✅ `auth.users` (Supabase Auth)
   - ✅ `users` table (role='vendor', status='active')
   - ✅ `vendors` table (status='approved', approved_at=NOW())
3. Vendor can immediately login

---

## 🎯 What Happens Behind the Scenes

### Database Trigger
```sql
-- Trigger: on_auth_user_confirmed
-- Fires when: auth.users.confirmed_at changes from NULL → timestamp
-- Function: handle_new_user_confirmation()

-- Creates:
1. users table entry (auth_user_id linked to auth.users.id)
2. vendors table entry (id linked to users.id)
```

### Vendor Status Options
- **`pending`** - Waiting for admin approval (cannot login)
- **`approved`** - Can login and use the app ✅
- **`rejected`** - Application rejected (cannot login)
- **`suspended`** - Account suspended by admin (cannot login)

---

## 🛠️ Setup Instructions

### Option A: Auto-Approve Vendors (Current)

**Use Case:** MVP, testing, or trusted vendors only

**Setup:**
1. Open Supabase SQL Editor
2. Run `AUTO_APPROVE_VENDORS.sql`
3. This updates the trigger to set `status='approved'` automatically

**Pros:**
- ✅ Vendors can login immediately
- ✅ No admin intervention needed
- ✅ Faster onboarding

**Cons:**
- ⚠️ No quality control
- ⚠️ Anyone can register as vendor

---

### Option B: Admin Approval Required (Production)

**Use Case:** Production app with quality control

**Setup:**
1. Open Supabase SQL Editor
2. Run `COMPLETE_REGISTRATION_TRIGGER.sql` (sets status='pending')
3. Add AdminNavigator to AppNavigator.js
4. Admin must approve vendors manually

**Pros:**
- ✅ Quality control
- ✅ Verify legitimate businesses
- ✅ Prevent spam/fake vendors

**Cons:**
- ⚠️ Admin must manually review each vendor
- ⚠️ Slower onboarding

---

## 👨‍💼 Admin Approval Process

### For Admins:

1. Login as admin
2. Go to "Vendor Management" screen
3. See "Pending" tab with new vendor applications
4. Review vendor details:
   - Business name
   - Location
   - Contact phone
   - Description (if provided)
5. Choose action:
   - **Approve** → Vendor can login
   - **Reject** → Vendor cannot login
   - **Suspend** → Temporarily disable approved vendor

### Admin Screen Features:
- ✅ Pending vendors list
- ✅ Approved vendors list
- ✅ Approve/Reject/Suspend buttons
- ✅ Pull-to-refresh
- ✅ Search/filter (future enhancement)

---

## 🧪 Testing Vendor Registration

### Test Scenario 1: New Vendor Registration

1. **Register:**
   - Email: `newvendor@test.com`
   - Password: `test123`
   - Canteen Name: `Test Canteen`
   - Location: `Building C`

2. **Confirm Email:**
   - Option A: Click email link (production)
   - Option B: Manually confirm in Supabase:
     ```sql
     UPDATE auth.users 
     SET confirmed_at = NOW() 
     WHERE email = 'newvendor@test.com';
     ```

3. **Check Database:**
   ```sql
   -- Check if vendor was created
   SELECT 
     u.email, 
     u.role, 
     v.business_name, 
     v.status 
   FROM users u
   JOIN vendors v ON v.id = u.id
   WHERE u.email = 'newvendor@test.com';
   ```

4. **Expected Result:**
   - If Auto-Approve: `status='approved'` → Can login ✅
   - If Manual Approve: `status='pending'` → Cannot login until admin approves

---

## 🔧 Troubleshooting

### Problem: Vendor registered but not in database

**Solution:**
1. Check if email was confirmed:
   ```sql
   SELECT email, confirmed_at FROM auth.users WHERE email = 'vendor@test.com';
   ```
2. If `confirmed_at` is NULL, confirm email manually
3. Trigger will fire automatically when `confirmed_at` is updated

---

### Problem: Vendor cannot login after registration

**Check:**
1. Email confirmed? (`confirmed_at` not NULL)
2. Vendor status? (Should be 'approved')
3. Check vendors table:
   ```sql
   SELECT id, business_name, status FROM vendors WHERE contact_phone = '123456789';
   ```

**Fix:**
```sql
-- Approve vendor manually
UPDATE vendors 
SET status = 'approved', approved_at = NOW() 
WHERE business_name = 'Your Canteen Name';
```

---

### Problem: Old vendors still have status='pending'

**Fix:**
Run this SQL to approve all existing pending vendors:
```sql
UPDATE vendors 
SET status = 'approved', approved_at = NOW() 
WHERE status = 'pending';
```

---

## 📊 Monitoring Vendors

### Check All Vendors
```sql
SELECT 
  v.business_name,
  v.location,
  v.status,
  v.approved_at,
  u.email,
  u.created_at as registered_at
FROM vendors v
JOIN users u ON u.id = v.id
ORDER BY v.created_at DESC;
```

### Count by Status
```sql
SELECT status, COUNT(*) as count 
FROM vendors 
GROUP BY status;
```

---

## 🚀 Next Steps

### For MVP (Now):
- ✅ Use auto-approve (run `AUTO_APPROVE_VENDORS.sql`)
- ✅ Vendors can register and login immediately

### For Production (Later):
- [ ] Switch to manual approval (run `COMPLETE_REGISTRATION_TRIGGER.sql`)
- [ ] Add AdminNavigator to AppNavigator
- [ ] Test admin approval flow
- [ ] Add email notifications to admin when new vendor registers
- [ ] Add email notifications to vendor when approved/rejected

---

## 📝 Summary

| Setup | Status After Registration | Can Login? | Admin Action Required? |
|-------|--------------------------|------------|------------------------|
| Auto-Approve | `approved` | ✅ Yes | ❌ No |
| Manual Approve | `pending` | ❌ No | ✅ Yes |

**Current Setup:** Auto-Approve ✅  
**Recommended for Production:** Manual Approve

---

**Last Updated:** November 30, 2024  
**Author:** GitHub Copilot
