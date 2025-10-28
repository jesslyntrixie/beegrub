-- =====================================================
-- FIX: Add missing INSERT policies for user registration
-- =====================================================

-- 1. Allow unauthenticated users (anon role) to INSERT during signup
--    This is needed for the registration process
CREATE POLICY "users_insert_signup" ON users
FOR INSERT 
TO anon
WITH CHECK (true);

-- 2. Allow authenticated users to INSERT (for future use)
CREATE POLICY "users_insert_authenticated" ON users
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- =====================================================
-- FIX: Add INSERT policy for students table
-- =====================================================

-- Allow authenticated users to create their own student profile
CREATE POLICY "students_insert_self" ON students
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = students.id
      AND u.auth_user_id = auth.uid()
  )
);

-- =====================================================
-- VERIFY: Check that these policies are in place
-- =====================================================

-- Run this query after applying the policies to verify:
-- SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies 
-- WHERE tablename IN ('users', 'students')
-- ORDER BY tablename, policyname;
