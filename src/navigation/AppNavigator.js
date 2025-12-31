import React, { useState, useEffect, forwardRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

// Navigation Stacks
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { VendorNavigator } from './VendorNavigator';
import { AdminNavigator } from './AdminNavigator';

// Supabase Auth Service
import { authService, userService } from '../services/supabase';

// Colors
import { COLORS } from '../constants/colors';

const ROLE_FETCH_TIMEOUT_MS = 20000;

/**
 * Runs the provided async factory function but aborts if it does not resolve before the timeout elapses.
 * This gives us a safety net so the UI is not blocked forever when Supabase takes too long to reply.
 * @param {() => Promise<unknown>} factory Lazy async operation to execute.
 * @param {number} [timeoutMs=ROLE_FETCH_TIMEOUT_MS] Maximum time to wait before failing.
 * @param {string} [timeoutMessage='Role fetch timeout'] Message used when the timeout is hit.
 * @returns {Promise<unknown>} Resolves with the factory result if it finishes in time.
 * @throws {Error} Throws when the timeout expires before the factory resolves.
 */
const withTimeout = async (factory, timeoutMs = ROLE_FETCH_TIMEOUT_MS, timeoutMessage = 'Role fetch timeout') => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    const result = await Promise.race([factory(), timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Top-level navigator that decides which stack to render based on Supabase authentication state
 * and the role fetched from the `users` table. Acts as the entry point for every experience variant
 * (auth, student, vendor, admin).
 */
export const AppNavigator = forwardRef((props, ref) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleTargetUserId, setRoleTargetUserId] = useState(null);
  const [roleFetchTicket, setRoleFetchTicket] = useState(0);

  useEffect(() => {
    console.log('📡 Setting up auth state listener...');
    
    // Subscribe to auth changes - this is the primary way to detect auth state
    try {
      const { data: { subscription } } = authService.onAuthStateChange(
        (_event, session) => {
          console.log('📡 Auth state changed:', _event, session?.user?.email);

          const nextUser = session?.user ?? null;

          if (_event === 'SIGNED_OUT' || !nextUser) {
            console.log('🚪 User signed out, clearing state...');
            setUser(null);
            setUserRole(null);
            setRoleTargetUserId(null);
            setLoading(false);
            return;
          }

          setUser(nextUser);
          const shouldForceRefresh = _event === 'INITIAL_SESSION' || _event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED';
          setRoleTargetUserId((prev) => {
            const idChanged = prev !== nextUser.id;

            if (idChanged) {
              setUserRole(null);
              setRoleFetchTicket((ticket) => ticket + 1);
              return nextUser.id;
            }

            if (shouldForceRefresh) {
              setRoleFetchTicket((ticket) => ticket + 1);
            }

            return prev;
          });
        }
      );

      return () => {
        console.log('🧹 Unsubscribing from auth changes');
        subscription?.unsubscribe();
      };
    } catch (err) {
      console.error('🔴 Error setting up auth listener:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!roleTargetUserId) {
      return;
    }

    let isActive = true;

    const fetchRole = async () => {
      console.log('👤 Fetching user role for:', roleTargetUserId);
      setLoading(true);

      try {
        const { data, error } = await withTimeout(
          () => userService.getUserRole(roleTargetUserId)
        );
        if (!isActive) {
          return;
        }

        console.log('📊 User role data:', { data, error });

        if (error) {
          console.error('❌ Error fetching role:', error);
          console.log('⚠️ Defaulting to student role');
          setUserRole('student');
          return;
        }

        if (data) {
          const role = data?.role;
          console.log('🎯 Role:', role);
          setUserRole(role || 'student');
          return;
        }

        console.warn('⚠️ No role data returned, defaulting to student');
        setUserRole('student');
      } catch (err) {
        if (!isActive) {
          return;
        }
        console.error('🔴 Exception fetching role:', err);
        console.log('⚠️ Defaulting to student role due to error');
        setUserRole('student');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchRole();

    return () => {
      isActive = false;
    };
  }, [roleTargetUserId, roleFetchTicket]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={ref}>
      {!user ? (
        <AuthNavigator />
      ) : userRole === 'student' ? (
        <StudentNavigator />
      ) : userRole === 'vendor' ? (
        <VendorNavigator />
      ) : userRole === 'admin' ? (
        <AdminNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
});