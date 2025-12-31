import { createClient } from '@supabase/supabase-js';

// Your Supabase project credentials
const supabaseUrl = 'https://etconfsqdceomsarqbpb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y29uZnNxZGNlb21zYXJxYnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMDQwNzgsImV4cCI6MjA3NjY4MDA3OH0.ltoSk8oVjqF2JUwxjEwTmco5OZ0XdrEWzWjuffT2Qeo';

// Create the real Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const authService = {
  // Sign up new user
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: 'beegrub://confirm-email',
      }
    });
    return { data, error };
},

  // Sign in user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Send password reset email
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'beegrub://reset-password',
    });
    return { data, error };
  },

  // Update password for the currently authenticated (recovered) user
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get current session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// User functions
export const userService = {
  // Get user role from database
  getUserRole: async (authUserId) => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', authUserId);
    
    // Don't use .single() - handle arrays instead
    if (error) {
      return { data: null, error };
    }
    
    // Return the first user's role, or null if no users found
    if (Array.isArray(data) && data.length > 0) {
      return { data: data[0], error: null };
    }
    
    return { data: null, error: null };
  },

  // Get full user data including vendor/admin status
  getUserData: async (authUserId) => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        auth_user_id,
        email,
        role,
        status,
        vendors (
          id,
          business_name,
          status
        ),
        admins (
          id
        )
      `)
      .eq('auth_user_id', authUserId);
    
    if (error) {
      return { data: null, error };
    }
    
    if (Array.isArray(data) && data.length > 0) {
      return { data: data[0], error: null };
    }
    
    return { data: null, error: null };
  }
};