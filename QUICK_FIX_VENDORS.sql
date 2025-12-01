-- =====================================================
-- QUICK FIX: CREATE USERS RECORDS FOR EXISTING VENDORS
-- =====================================================
-- This creates user records for vendors that already exist in the vendors table
-- Run this in Supabase SQL Editor

-- Step 1: Check which vendors are missing users records
SELECT 
  v.id,
  v.business_name,
  v.location,
  'Missing users record' as issue
FROM vendors v
LEFT JOIN users u ON v.id = u.id
WHERE u.id IS NULL;

-- Step 2: Create users records for those vendors
-- This assumes they don't have Supabase Auth accounts yet
-- If they do have auth accounts, you'll need to link them manually

INSERT INTO users (id, auth_user_id, email, role, status, email_verified, password_hash)
SELECT 
  v.id,
  NULL, -- auth_user_id will be NULL until they actually register/login through Supabase Auth
  COALESCE(v.contact_phone || '@temp.vendor.local', 'vendor_' || v.id || '@temp.vendor.local'), -- Temporary email
  'vendor',
  'active',
  false, -- Not verified yet since no auth account
  ''
FROM vendors v
LEFT JOIN users u ON v.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify all vendors now have users records
SELECT 
  v.business_name,
  u.email,
  u.role,
  CASE 
    WHEN u.auth_user_id IS NULL THEN 'No auth account - needs to register'
    ELSE 'Has auth account'
  END as auth_status
FROM vendors v
JOIN users u ON v.id = u.id;

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. Vendors with NULL auth_user_id need to register through the app
-- 2. When they register with the same email, the trigger will update their users record
-- 3. Or you can manually link their auth_user_id if they already have Supabase Auth accounts
