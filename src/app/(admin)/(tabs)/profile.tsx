import React from 'react';
import AdminProfileScreen from '@/screens/AdminProfileScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function AdminProfilePage() {
  const navigation = useAppNavigation();
  const ScreenComponent = AdminProfileScreen as any;
  return <ScreenComponent navigation={navigation} />;
}
