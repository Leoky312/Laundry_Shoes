import React from 'react';
import AdminDashboardScreen from '@/screens/AdminDashboardScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function AdminDashboardPage() {
  const navigation = useAppNavigation();
  return <AdminDashboardScreen navigation={navigation} />;
}
