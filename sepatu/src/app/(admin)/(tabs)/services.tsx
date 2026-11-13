import React from 'react';
import ManageServicesScreen from '@/screens/ManageServicesScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function AdminServicesPage() {
  const navigation = useAppNavigation();
  const ScreenComponent = ManageServicesScreen as any;
  return <ScreenComponent navigation={navigation} />;
}
