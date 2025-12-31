import React, { useEffect, useRef } from 'react';
import { CartProvider } from './src/context/CartContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as Linking from 'expo-linking';
import { supabase } from './src/services/supabase';

export default function App() {
  const navRef = useRef(null);

  useEffect(() => {
    const processUrl = async (url) => {
      if (!url) return;

      try {
        console.log('Received deep link:', url);

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

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.log('Error setting Supabase session from recovery link:', error);
          return;
        }

        if (navRef.current) {
          navRef.current.navigate('ResetPassword');
        }
      } catch (err) {
        console.log('Failed to process deep link:', err);
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
