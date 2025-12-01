-- =====================================================
-- AUTO-APPROVE VENDORS ON REGISTRATION
-- =====================================================
-- This updates the trigger to automatically approve vendors
-- so they can login immediately after email confirmation

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_confirmation() CASCADE;

-- Recreate function with auto-approve for vendors
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
      COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
      'active',
      true,
      ''
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    
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
        COALESCE(NEW.raw_user_meta_data->>'studentId', 'TEMP-' || LEFT(NEW.id::text, 8)),
        COALESCE(NEW.raw_user_meta_data->>'fullName', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
      FROM public.users u
      WHERE u.auth_user_id = NEW.id
      ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- If role is vendor, create vendor profile with AUTO-APPROVE
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'vendor' THEN
      INSERT INTO public.vendors (
        id,
        business_name,
        location,
        contact_phone,
        status,  -- Changed to 'approved' instead of 'pending'
        approved_at  -- Set approval timestamp
      )
      SELECT 
        u.id,
        COALESCE(NEW.raw_user_meta_data->>'canteenName', 'New Vendor'),
        COALESCE(NEW.raw_user_meta_data->>'canteenLocation', 'TBD'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'approved',  -- ✅ AUTO-APPROVE
        NOW()        -- ✅ Set approval time
      FROM public.users u
      WHERE u.auth_user_id = NEW.id
      ON CONFLICT (id) DO NOTHING;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_confirmation();

-- =====================================================
-- FIX EXISTING PENDING VENDORS
-- =====================================================
-- Approve all currently pending vendors

UPDATE public.vendors
SET 
  status = 'approved',
  approved_at = NOW()
WHERE status = 'pending';

-- =====================================================
-- VERIFY
-- =====================================================
SELECT 
  'Trigger installed:' as info,
  COUNT(*) as count
FROM pg_trigger 
WHERE tgname = 'on_auth_user_confirmed'

UNION ALL

SELECT 
  'Approved vendors:' as info,
  COUNT(*) as count
FROM vendors 
WHERE status = 'approved';
