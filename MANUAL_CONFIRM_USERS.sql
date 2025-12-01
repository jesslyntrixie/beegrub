-- =====================================================
-- MANUALLY CONFIRM USERS FOR TESTING
-- =====================================================
-- Use this to bypass email confirmation during development

-- METHOD 1: Confirm a specific user by email
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'test.student1@binus.ac.id';

-- METHOD 2: Confirm the most recently created user
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE id = (
  SELECT id FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- METHOD 3: Confirm ALL unconfirmed users (careful!)
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE confirmed_at IS NULL;

-- =====================================================
-- VERIFY CONFIRMATION WORKED
-- =====================================================
SELECT 
  email,
  confirmed_at,
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- CHECK IF TRIGGER CREATED STUDENT/VENDOR RECORDS
-- =====================================================
SELECT 
  au.email,
  au.confirmed_at,
  u.id as user_id,
  u.role,
  s.student_id,
  s.full_name as student_name,
  v.business_name as vendor_name
FROM auth.users au
LEFT JOIN users u ON au.id = u.auth_user_id
LEFT JOIN students s ON u.id = s.id
LEFT JOIN vendors v ON u.id = v.id
WHERE au.email LIKE '%test%'
ORDER BY au.created_at DESC;
