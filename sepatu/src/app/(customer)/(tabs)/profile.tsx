import React from 'react';
import ProfileScreen from '@/screens/ProfileScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function CustomerProfilePage() {
  const navigation = useAppNavigation();
  return <ProfileScreen navigation={navigation} />;
}
