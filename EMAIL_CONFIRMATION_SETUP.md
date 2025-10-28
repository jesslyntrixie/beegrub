# Email Confirmation Setup Guide

## What We've Done ✅

1. **Created ConfirmEmailScreen** - A beautiful screen that shows after registration
2. **Updated RegisterScreen** - Now navigates to confirmation screen instead of auto-login
3. **Added metadata to signup** - Stores user data (role, name, phone, etc.) in Supabase Auth metadata
4. **Created database trigger** - Automatically creates user/student/vendor records when email is confirmed

## What You Need to Do 🔧

### Step 1: Run the Database Trigger SQL

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `EMAIL_CONFIRMATION_TRIGGER.sql` in this project
3. Copy and paste the entire SQL script
4. Click **Run**

This creates a trigger that automatically:
- Creates a `users` table record when email is confirmed
- Creates a `students` or `vendors` profile based on the role
- Uses the metadata from signup (name, phone, student ID, etc.)

### Step 2: Test the Flow

1. **Hard refresh your app** (Ctrl+Shift+R or `r` in Expo)
2. **Register a new account** with a real email you can access
3. You should see the **"Check Your Email"** screen
4. **Check your email** for the confirmation link from Supabase
5. **Click the confirmation link**
6. **Go back to the app** and login with your credentials
7. You should now be logged in successfully!

## How It Works 🔄

### Registration Flow:
```
1. User fills registration form
   ↓
2. App calls signUp() with user metadata (role, name, phone, etc.)
   ↓
3. Supabase creates Auth user (unconfirmed)
   ↓
4. Supabase sends confirmation email automatically
   ↓
5. App navigates to ConfirmEmailScreen
```

### Email Confirmation Flow:
```
1. User clicks confirmation link in email
   ↓
2. Supabase confirms the Auth user (sets confirmed_at)
   ↓
3. Database trigger fires automatically
   ↓
4. Trigger creates:
   - Record in `users` table
   - Record in `students` or `vendors` table
   - Uses metadata from signup
```

### Login Flow:
```
1. User tries to login
   ↓
2. Supabase checks if email is confirmed
   ↓
3. If confirmed: Login succeeds → App fetches role → Navigate to home
4. If not confirmed: Login fails with "Email not confirmed" error
```

## Troubleshooting 🔍

### If email doesn't arrive:
- Check spam/junk folder
- Verify email settings in Supabase Dashboard → Authentication → Email Templates
- Check if SMTP is configured correctly

### If login fails after confirmation:
- Make sure the trigger SQL was executed successfully
- Check if records exist in `users` and `students`/`vendors` tables
- Check Supabase logs for any trigger errors

### If you want to test without email:
- Disable email confirmation: Supabase Dashboard → Authentication → Providers → Email → Turn OFF "Confirm email"
- You'll need to manually create user records (not recommended)

## Database Schema Note 📝

The trigger uses `raw_user_meta_data` from Supabase Auth to get:
- `role` (student/vendor)
- `fullName`
- `phone`
- `studentId` (for students)
- `canteenName` (for vendors)
- `canteenLocation` (for vendors)

Make sure these field names match what you're sending in the signup metadata!

## Benefits of This Approach ✨

✅ **Secure** - Email verification ensures valid email addresses
✅ **Automatic** - No manual user record creation needed
✅ **Clean** - Separation between Auth and app data
✅ **Scalable** - Works for any number of users
✅ **Professional** - Follows industry best practices

## For Production 🚀

Before deploying:
1. Customize the email template in Supabase Dashboard
2. Set up proper SMTP (Gmail, SendGrid, etc.)
3. Add your app's redirect URL for email confirmation
4. Test the entire flow with real emails
5. Consider adding resend confirmation email feature
