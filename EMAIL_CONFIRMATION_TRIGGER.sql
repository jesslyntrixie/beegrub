-- =====================================================
-- AUTOMATIC USER PROFILE CREATION ON EMAIL CONFIRMATION
-- =====================================================
-- This trigger automatically creates user records in the users table
-- when a user confirms their email in Supabase Auth

-- Function to create user record after email confirmation
CREATE OR REPLACE FUNCTION handle_new_user_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if email was just confirmed (confirmed_at changed from NULL to a timestamp)
  IF OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    -- Insert into users table
    INSERT INTO public.users (
      auth_user_id,
      email,
      role,
      status,
      email_verified,
      password_hash
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'role', 'student'), -- Get role from signup metadata, default to student
      'active',
      true,
      '' -- Empty password_hash since we're using Supabase Auth
    )
    ON CONFLICT (auth_user_id) DO NOTHING; -- Avoid duplicates
    
    -- If role is student, create student profile
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
      INSERT INTO public.students (
        id,
        student_id,
        full_name,
        phone
      )
      SELECT 
        u.id,
        COALESCE(NEW.raw_user_meta_data->>'studentId', 'TEMP-' || LEFT(NEW.id::text, 8)), -- Temporary student ID
        COALESCE(NEW.raw_user_meta_data->>'fullName', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
      FROM public.users u
      WHERE u.auth_user_id = NEW.id
      ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- If role is vendor, create vendor profile
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'vendor' THEN
      INSERT INTO public.vendors (
        id,
        business_name,
        location,
        contact_phone,
        status
      )
      SELECT 
        u.id,
        COALESCE(NEW.raw_user_meta_data->>'canteenName', 'New Vendor'),
        COALESCE(NEW.raw_user_meta_data->>'canteenLocation', 'TBD'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'pending' -- Requires admin approval
      FROM public.users u
      WHERE u.auth_user_id = NEW.id
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Create trigger that fires when auth.users is updated
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_confirmation();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Grant necessary permissions for the trigger to work
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO postgres;
