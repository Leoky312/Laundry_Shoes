import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const firstSegment = (segments as string[])[0];
    const inAuthGroup = firstSegment === '(auth)';
    const isRoot = !firstSegment;

    // 1. Pengguna belum login: tidak boleh mengakses (customer) atau (admin)
    if (!isAuthenticated) {
      if (!inAuthGroup && !isRoot) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // 2. Pengguna sudah login sebagai ADMIN: tidak boleh masuk ke rute customer
    if (isAdmin && firstSegment === '(customer)') {
      router.replace('/(admin)/(tabs)');
      return;
    }

    // 3. Pengguna sudah login sebagai CUSTOMER: tidak boleh masuk ke rute admin
    if (!isAdmin && firstSegment === '(admin)') {
      router.replace('/(customer)/(tabs)');
      return;
    }
  }, [isLoading, isAuthenticated, isAdmin, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const fontLinkId = 'shoefresh-google-fonts';
      if (!document.getElementById(fontLinkId)) {
        const link = document.createElement('link');
        link.id = fontLinkId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Poppins:wght@600;700;800;900&family=Nunito:wght@700;800;900&display=swap';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.id = 'shoefresh-global-font-style';
        style.textContent = `
          * {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <AuthGate>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(customer)" />
              <Stack.Screen name="(admin)" />
            </Stack>
          </AuthGate>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
