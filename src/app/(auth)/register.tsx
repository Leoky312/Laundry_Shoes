import React from 'react';
import RegisterScreen from '@/screens/RegisterScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function RegisterPage() {
  const navigation = useAppNavigation();
  return <RegisterScreen navigation={navigation} />;
}
