-- =====================================================
-- STEP 1: Fix Current User (Brian)
-- =====================================================
-- Insert the current user record manually
INSERT INTO public.users (auth_user_id, email, role, status, email_verified, password_hash)
VALUES (
  '5c04573d-08ce-4477-ada4-0260ddc14368',
  'brian.darmadi@binus.ac.id',
  'student',
  'active',
  true,
  ''
)
ON CONFLICT (auth_user_id) DO NOTHING;

-- =====================================================
-- STEP 2: Create Trigger for Future Users
-- =====================================================
-- This trigger automatically creates user records when email is confirmed

-- Drop existing function if exists
DROP FUNCTION IF EXISTS handle_new_user_confirmation() CASCADE;

-- Create function to handle email confirmation
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
      COALESCE(NEW.raw_user_meta_data->>'role', 'student'), -- Get role from signup metadata
      'active',
      true,
      '' -- Empty password_hash since we're using Supabase Auth
    )
    ON CONFLICT (auth_user_id) DO NOTHING; -- Avoid duplicates
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Create trigger that fires when auth.users is updated
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_confirmation();

-- =====================================================
-- STEP 3: Verify Everything Works
-- =====================================================
-- Check if the user record was created
SELECT * FROM public.users WHERE email = 'brian.darmadi@binus.ac.id';

-- Check if the trigger was created
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_confirmed';
