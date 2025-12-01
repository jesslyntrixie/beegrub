-- =====================================================
-- CHECK VENDOR REGISTRATION STATUS
-- =====================================================
-- Run this to see what's currently happening with vendor registrations

-- 1. CHECK TRIGGER STATUS
SELECT 
  'TRIGGER STATUS' as info,
  tgname as trigger_name,
  CASE 
    WHEN tgenabled = 'O' THEN '✅ ENABLED'
    WHEN tgenabled = 'D' THEN '❌ DISABLED'
    ELSE 'UNKNOWN'
  END as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_confirmed';

-- 2. CHECK ALL VENDORS AND THEIR STATUS
SELECT 
  '📊 ALL VENDORS' as section,
  v.business_name,
  v.location,
  v.contact_phone,
  v.status,
  v.approved_at,
  u.email,
  u.created_at as registered_at
FROM vendors v
JOIN users u ON u.id = v.id
ORDER BY v.created_at DESC;

-- 3. COUNT VENDORS BY STATUS
SELECT 
  '📈 VENDOR COUNT BY STATUS' as section,
  status,
  COUNT(*) as count
FROM vendors
GROUP BY status
ORDER BY count DESC;

-- 4. CHECK PENDING VENDORS (Need Approval)
SELECT 
  '⏳ PENDING VENDORS' as section,
  v.business_name,
  v.location,
  v.contact_phone,
  u.email,
  v.created_at as registered_at
FROM vendors v
JOIN users u ON u.id = v.id
WHERE v.status = 'pending'
ORDER BY v.created_at DESC;

-- 5. CHECK APPROVED VENDORS (Can Login)
SELECT 
  '✅ APPROVED VENDORS' as section,
  v.business_name,
  v.location,
  v.approved_at,
  u.email
FROM vendors v
JOIN users u ON u.id = v.id
WHERE v.status = 'approved'
ORDER BY v.approved_at DESC;

-- 6. CHECK UNCONFIRMED VENDOR EMAILS
SELECT 
  '📧 UNCONFIRMED VENDOR EMAILS' as section,
  email,
  created_at,
  CASE 
    WHEN confirmed_at IS NULL THEN '❌ NOT CONFIRMED'
    ELSE '✅ CONFIRMED'
  END as email_status,
  confirmed_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'vendor'
ORDER BY created_at DESC;

-- 7. CHECK ADMIN ACCOUNTS
SELECT 
  '👨‍💼 ADMIN ACCOUNTS' as section,
  u.email,
  u.status,
  a.name
FROM users u
JOIN admins a ON a.id = u.id
WHERE u.role = 'admin';

-- =====================================================
-- QUICK ACTIONS (Uncomment to use)
-- =====================================================

-- APPROVE ALL PENDING VENDORS:
-- UPDATE vendors SET status = 'approved', approved_at = NOW() WHERE status = 'pending';

-- CONFIRM ALL UNCONFIRMED VENDOR EMAILS (for testing):
-- UPDATE auth.users SET confirmed_at = NOW() WHERE raw_user_meta_data->>'role' = 'vendor' AND confirmed_at IS NULL;

-- APPROVE SPECIFIC VENDOR:
-- UPDATE vendors SET status = 'approved', approved_at = NOW() WHERE business_name = 'YOUR VENDOR NAME';
