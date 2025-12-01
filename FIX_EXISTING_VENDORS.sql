-- =====================================================
-- FIX EXISTING VENDORS WITHOUT USERS RECORDS
-- =====================================================
-- Run this AFTER running COMPLETE_REGISTRATION_TRIGGER.sql

-- Step 1: Check if there are vendors without users records
SELECT 
  v.id as vendor_id,
  v.business_name,
  u.id as user_id,
  u.email
FROM vendors v
LEFT JOIN users u ON v.id = u.id
WHERE u.id IS NULL;

-- Step 2: If the above query returns vendors, you need to:
-- Option A: Delete those orphaned vendors (they can't login anyway)
-- DELETE FROM vendors WHERE id NOT IN (SELECT id FROM users);

-- Option B: Create user records for them (if you know their auth details)
-- You'll need to get their auth_user_id from Supabase Auth dashboard
-- Then insert into users table:
-- INSERT INTO users (id, auth_user_id, email, role, status, email_verified, password_hash)
-- VALUES (
--   '<vendor.id>',
--   '<auth_user_id_from_supabase_auth>',
--   '<their_email>',
--   'vendor',
--   'active',
--   true,
--   ''
-- );

-- Step 3: Verify all vendors now have users records
SELECT 
  COUNT(*) as total_vendors,
  COUNT(u.id) as vendors_with_users,
  COUNT(*) - COUNT(u.id) as orphaned_vendors
FROM vendors v
LEFT JOIN users u ON v.id = u.id;
