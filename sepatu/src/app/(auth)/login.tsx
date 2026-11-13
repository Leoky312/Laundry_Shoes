import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import LoginScreen from '@/screens/LoginScreen';
import useAppNavigation from '@/hooks/useAppNavigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const navigation = useAppNavigation();
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        router.replace('/(admin)/(tabs)');
      } else {
        router.replace('/(customer)/(tabs)');
      }
    }
  }, [isAuthenticated, isAdmin]);

  return <LoginScreen navigation={navigation} />;
}
