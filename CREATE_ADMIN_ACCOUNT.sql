-- =====================================================
-- CREATE ADMIN ACCOUNT
-- =====================================================
-- Run this to create an admin account for vendor management

-- STEP 1: First, create the admin user in Supabase Dashboard
-- Go to: Authentication > Users > Add User
-- Email: admin@beegrub.com (or your preferred email)
-- Password: (choose a strong password)
-- Email Confirmed: YES (toggle this on)
-- Copy the User ID after creation

-- STEP 2: Run this SQL (replace USER_ID with the auth user ID from Step 1)
DO $$
DECLARE
  admin_auth_id UUID := '50b795b1-7852-4677-9692-ba573788a3d3'; -- Replace this!
  admin_email TEXT := 'admin@beegrub.com'; -- Match the email from Step 1
  admin_user_id UUID;
BEGIN
  -- Insert into users table (or get existing user)
  INSERT INTO public.users (
    auth_user_id,
    email,
    role,
    status,
    email_verified,
    password_hash
  )
  VALUES (
    admin_auth_id,
    admin_email,
    'admin',
    'active',
    true,
    ''
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET 
    role = 'admin',
    status = 'active',
    email_verified = true
  RETURNING id INTO admin_user_id;

  -- Insert into admins table (or do nothing if exists)
  INSERT INTO public.admins (id, name)
  VALUES (admin_user_id, 'System Admin')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Admin account created/updated successfully!';
END $$;

-- STEP 3: Verify admin account
SELECT 
  u.email,
  u.role,
  u.status,
  a.name as admin_name
FROM users u
JOIN admins a ON a.id = u.id
WHERE u.role = 'admin';

-- =====================================================
-- ALTERNATIVE: Quick Admin Creation (All-in-One)
-- =====================================================
-- If you already have an existing user and want to make them admin:

-- Option A: Make existing user an admin
-- UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
-- INSERT INTO admins (id, name) SELECT id, 'Admin' FROM users WHERE email = 'your@email.com';

-- Option B: Check if admin exists
-- SELECT * FROM users WHERE role = 'admin';

-- =====================================================
-- VERIFY TRIGGER IS SET FOR MANUAL APPROVAL
-- =====================================================
-- This ensures vendors need admin approval (status='pending')

SELECT 
  'Trigger Status:' as info,
  proname as function_name,
  prosrc as source
FROM pg_proc
WHERE proname = 'handle_new_user_confirmation';

-- Check if trigger sets status='pending' for vendors
-- Look for: status = 'pending' in the function source above

-- =====================================================
-- CHECK CURRENT VENDOR STATUS
-- =====================================================

SELECT 
  'Vendor Status Summary:' as info,
  status,
  COUNT(*) as count
FROM vendors
GROUP BY status;

-- =====================================================
-- MANUAL APPROVAL COMMANDS (For Testing)
-- =====================================================

-- Approve all pending vendors:
-- UPDATE vendors SET status = 'approved', approved_at = NOW() WHERE status = 'pending';

-- Approve specific vendor:
-- UPDATE vendors SET status = 'approved', approved_at = NOW() WHERE business_name = 'Vendor Name';

-- Reject vendor:
-- UPDATE vendors SET status = 'rejected' WHERE business_name = 'Vendor Name';

-- Suspend vendor:
-- UPDATE vendors SET status = 'suspended' WHERE business_name = 'Vendor Name';
