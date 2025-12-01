# 🚀 Admin Panel - Quick Start

## ⚡ 3-Step Setup

### 1️⃣ Create Admin in Supabase Dashboard
```
Authentication > Users > Add User
Email: admin@beegrub.com
Password: (your choice)
Email Confirmed: ✅ ON
→ Copy User ID
```

### 2️⃣ Run SQL (Replace USER_ID)
```sql
DO $$
DECLARE
  admin_auth_id UUID := 'PASTE_USER_ID_HERE';
  admin_email TEXT := 'admin@beegrub.com';
  admin_user_id UUID;
BEGIN
  INSERT INTO public.users (auth_user_id, email, role, status, email_verified, password_hash)
  VALUES (admin_auth_id, admin_email, 'admin', 'active', true, '')
  RETURNING id INTO admin_user_id;
  
  INSERT INTO public.admins (id, name)
  VALUES (admin_user_id, 'System Admin');
END $$;
```

### 3️⃣ Login to App
```
Email: admin@beegrub.com
Password: (from step 1)
→ Admin Dashboard appears ✅
```

---

## 📱 Admin Panel Overview

### **Dashboard**
- 📊 Statistics (users, vendors, orders, revenue)
- 👥 Manage Users
- 📦 View Orders
- ⏳ Pending Vendors (need approval)
- ✅ Approved Vendors (active)

### **Actions**
- **Approve** → Vendor can login ✅
- **Reject** → Vendor cannot login ❌
- **Suspend** → Disable approved vendor ⊘

---

## 🔄 Vendor Flow

```
Register → Email Confirm → Status: Pending
         ↓
Admin Approves → Status: Approved → Can Login ✅
         or
Admin Rejects → Status: Rejected → Cannot Login ❌
```

---

## 🧪 Quick Test

1. **Register vendor:** `testvendor@gmail.com`
2. **Confirm email manually:**
   ```sql
   UPDATE auth.users SET confirmed_at = NOW() 
   WHERE email = 'testvendor@gmail.com';
   ```
3. **Try login as vendor** → Should FAIL
4. **Login as admin** → See in "Pending" tab
5. **Click "Approve"** 
6. **Try login as vendor** → Should WORK ✅

---

## 📝 Quick SQL Commands

**Check vendors:**
```sql
SELECT business_name, status FROM vendors;
```

**Approve all pending:**
```sql
UPDATE vendors SET status = 'approved', approved_at = NOW() 
WHERE status = 'pending';
```

**Check admin exists:**
```sql
SELECT * FROM users WHERE role = 'admin';
```

**Make user admin:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
INSERT INTO admins (id, name) SELECT id, 'Admin' FROM users WHERE email = 'your@email.com';
```

---

## ✅ Implementation Complete

**Files:**
- ✅ AdminDashboardScreen.js
- ✅ AdminUsersScreen.js  
- ✅ AdminOrdersScreen.js
- ✅ Admin API functions
- ✅ Navigation configured

**Database:**
- ✅ Trigger sets vendors to 'pending'
- ✅ Admin can approve via app

**Status:** 🎉 Ready to use!

---

**Read Full Guide:** ADMIN_PANEL_GUIDE.md  
**Last Updated:** Nov 30, 2024
