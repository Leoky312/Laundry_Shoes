import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import '@/services/mockApi';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { useRouter, useSegments, Slot } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

function RootNavigation() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect unauthenticated users to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated users away from login
      if (isAdmin) {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/');
      }
    } else if (isAuthenticated && isAdmin && segments[0] !== '(admin)' && segments[0] !== 'profile') {
      // Redirect admin to admin dashboard if they try to access customer pages, except profile
      router.replace('/(admin)/dashboard');
    }
  }, [isAuthenticated, isAdmin, isLoading, segments]);

  if (isLoading) {
    return <AnimatedSplashOverlay />;
  }

  // If unauthenticated (login page), don't show tabs
  if (!isAuthenticated) {
    return <Slot />;
  }

  // Otherwise, render Customer tabs
  return (
    <>
      <AnimatedSplashOverlay />
      <AppTabs />
    </>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <CartProvider>
          <RootNavigation />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
