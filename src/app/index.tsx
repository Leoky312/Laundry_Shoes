import React from 'react';
import SplashScreen from '@/screens/SplashScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function IndexScreen() {
  const navigation = useAppNavigation();
  return <SplashScreen navigation={navigation} />;
}
