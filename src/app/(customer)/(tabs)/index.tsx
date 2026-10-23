import React from 'react';
import HomeScreen from '@/screens/HomeScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function CustomerHomePage() {
  const navigation = useAppNavigation();
  return <HomeScreen navigation={navigation} />;
}
