import React, { useEffect, useRef } from 'react';
import { CartProvider } from './src/context/CartContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as Linking from 'expo-linking';
import { supabase, passwordRecoveryState } from './src/services/supabase';

export default function App() {
  const navRef = useRef(null);

  useEffect(() => {
    const processUrl = async (url) => {
      if (!url) return;

      try {

        // Supabase recovery links include tokens in the hash fragment, e.g.:
        // beegrub://reset-password#access_token=...&refresh_token=...&type=recovery
        const parsed = new URL(url);
        const hash = parsed.hash?.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;
        const params = new URLSearchParams(hash);

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (type !== 'recovery' || !accessToken || !refreshToken) {
          return;
        }

        // IMPORTANT: mark recovery BEFORE setting the session so that
        // the auth state listener in AppNavigator sees the flag when
        // Supabase emits the auth event (e.g. SIGNED_IN / INITIAL_SESSION).
        passwordRecoveryState.start();

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          return;
        }

        if (navRef.current) {
          navRef.current.navigate('ResetPassword');
        }
      } catch (err) {
      }
    };

    const handleDeepLink = (event) => {
      processUrl(event.url);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Also handle the case where the app is cold-started from the reset link
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        processUrl(initialUrl);
      }
    })();

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <CartProvider>
      <AppNavigator ref={navRef} />
    </CartProvider>
  );
}
