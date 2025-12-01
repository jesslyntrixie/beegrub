# 🚀 Vendor Registration - Quick Setup Guide

## 📋 Current Situation

**Problem:** After vendors register, they have `status='pending'` and cannot login because there's no admin approval system yet.

**Solution:** Choose one of two options below.

---

## ⚡ OPTION 1: Auto-Approve (Recommended for NOW)

### Use this if:
- ✅ You need vendors to login immediately
- ✅ You're still testing/developing
- ✅ You trust all vendors who register
- ✅ **You want it working TODAY**

### Steps:

#### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

#### 2. Run This SQL
Copy and paste `AUTO_APPROVE_VENDORS.sql` and click **Run**

This will:
- ✅ Update trigger to auto-approve new vendors
- ✅ Approve all existing pending vendors
- ✅ Vendors can login immediately after email confirmation

#### 3. Test It
1. Register a new vendor account
2. Confirm email (or run manual confirmation SQL)
3. Login immediately ✅

---

## 🏢 OPTION 2: Admin Approval (Production-Ready)

### Use this if:
- ✅ You want quality control
- ✅ You need to verify vendors before they go live
- ✅ You want an admin to review each application
- ✅ **You're ready for production**

### Steps:

#### 1. Keep Current Trigger (No Changes)
The trigger in `COMPLETE_REGISTRATION_TRIGGER.sql` already sets `status='pending'`

#### 2. Login as Admin
You need an admin account in your database:
```sql
-- Check if you have an admin account
SELECT * FROM users WHERE role = 'admin';
```

If you don't have one, create it manually:
```sql
-- 1. Create in Supabase Auth
-- Go to Authentication > Users > Add User
-- Email: admin@beegrub.com
-- Password: (your choice)

-- 2. After creating auth user, get the auth_user_id and run:
INSERT INTO users (auth_user_id, email, role, status, email_verified)
VALUES ('PASTE_AUTH_USER_ID_HERE', 'admin@beegrub.com', 'admin', 'active', true);

INSERT INTO admins (id, name)
SELECT id, 'Admin' FROM users WHERE email = 'admin@beegrub.com';
```

#### 3. Admin Approves Vendors
1. Login as admin in BeeGrub app
2. You'll see AdminDashboardScreen
3. Go to "Pending" tab
4. Review vendors and click **Approve** or **Reject**

#### 4. Vendor Can Login
After approval, vendor's status changes to 'approved' and they can login ✅

---

## 🧪 Testing Guide

### Test New Vendor Registration

#### 1. Register
```
Email: testvendor@gmail.com
Password: test123
Full Name: Test Vendor
Phone: 081234567890
Canteen Name: Test Canteen
Location: Building A
```

#### 2. Confirm Email

**Option A - Production (Real Email):**
- Check email inbox
- Click confirmation link

**Option B - Development (Manual):**
```sql
-- Manually confirm email
UPDATE auth.users 
SET confirmed_at = NOW() 
WHERE email = 'testvendor@gmail.com';
```

#### 3. Check Status
```sql
SELECT 
  u.email,
  u.role,
  v.business_name,
  v.status,
  v.approved_at
FROM users u
JOIN vendors v ON v.id = u.id
WHERE u.email = 'testvendor@gmail.com';
```

**Expected Results:**
- **Option 1 (Auto-Approve):** `status='approved'`, `approved_at=NOW()` → Can login ✅
- **Option 2 (Manual Approve):** `status='pending'`, `approved_at=NULL` → Cannot login until admin approves ⏳

#### 4. Login
Try logging in with vendor credentials:
- **Auto-Approve:** Should work immediately ✅
- **Manual Approve:** Will fail until admin approves ⏳

---

## 🔧 Manual Database Operations

### Approve a Specific Vendor
```sql
UPDATE vendors 
SET status = 'approved', approved_at = NOW() 
WHERE business_name = 'Test Canteen';
```

### Approve ALL Pending Vendors
```sql
UPDATE vendors 
SET status = 'approved', approved_at = NOW() 
WHERE status = 'pending';
```

### Check All Vendors
```sql
SELECT 
  v.business_name,
  v.location,
  v.status,
  v.approved_at,
  u.email
FROM vendors v
JOIN users u ON u.id = v.id
ORDER BY v.created_at DESC;
```

### Suspend a Vendor
```sql
UPDATE vendors 
SET status = 'suspended' 
WHERE business_name = 'Bad Vendor';
```

---

## 📊 What's in the Code

### Files Created:
1. ✅ **AUTO_APPROVE_VENDORS.sql** - Auto-approve trigger
2. ✅ **AdminDashboardScreen.js** - Admin panel for vendor management
3. ✅ **VENDOR_REGISTRATION_GUIDE.md** - Full documentation
4. ✅ **VENDOR_SETUP_QUICK.md** - This file

### Files Already Exist:
1. ✅ **AdminNavigator.js** - Already in your navigation
2. ✅ **AppNavigator.js** - Already routes admin role correctly
3. ✅ **COMPLETE_REGISTRATION_TRIGGER.sql** - Trigger with manual approval

---

## 🎯 My Recommendation

**For TODAY (Nov 30):**
👉 **Use Option 1 - Auto-Approve**

**Reason:**
- You need it working now
- You're still developing
- Easy to switch to manual approval later

**For PRODUCTION (Later):**
👉 **Switch to Option 2 - Admin Approval**

**Steps to Switch:**
1. Run `COMPLETE_REGISTRATION_TRIGGER.sql` (sets status='pending')
2. Login as admin
3. Start approving vendors manually

---

## ⚠️ Important Notes

### Auto-Approve Security
- ⚠️ Anyone can register as vendor and get approved
- ⚠️ No quality control
- ✅ Fine for testing/development
- ❌ Not recommended for production

### Manual Approve Security
- ✅ Quality control
- ✅ Verify legitimate businesses
- ✅ Prevent spam
- ⚠️ Requires admin intervention

---

## 🆘 Troubleshooting

### Vendor Can't Login After Registration

**Check 1: Email Confirmed?**
```sql
SELECT email, confirmed_at FROM auth.users WHERE email = 'vendor@test.com';
```
If `confirmed_at` is NULL → Run manual confirmation

**Check 2: Vendor Status?**
```sql
SELECT status FROM vendors WHERE contact_phone = '081234567890';
```
If `status='pending'` → Approve manually or switch to auto-approve

**Check 3: Vendor Record Exists?**
```sql
SELECT * FROM vendors WHERE contact_phone = '081234567890';
```
If no record → Trigger didn't fire, confirm email again

---

## 📞 Quick Commands

### Manual Email Confirmation
```sql
UPDATE auth.users SET confirmed_at = NOW() WHERE email = 'YOUR_EMAIL';
```

### Manual Vendor Approval
```sql
UPDATE vendors SET status = 'approved', approved_at = NOW() WHERE business_name = 'VENDOR_NAME';
```

### Check Trigger Status
```sql
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_confirmed';
```

---

## ✅ Next Steps

1. **Choose:** Auto-Approve (Option 1) or Manual Approve (Option 2)
2. **Run:** Appropriate SQL file in Supabase
3. **Test:** Register new vendor and try logging in
4. **Verify:** Check database to confirm status

---

**Need Help?** 
- Check `VENDOR_REGISTRATION_GUIDE.md` for full documentation
- Check database with SQL queries above
- Ask GitHub Copilot 🤖

**Last Updated:** November 30, 2024
