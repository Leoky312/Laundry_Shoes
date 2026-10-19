import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ManageOrdersScreen from '@/screens/ManageOrdersScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function AdminOrdersPage() {
  const navigation = useAppNavigation();
  const params = useLocalSearchParams();

  return (
    <ManageOrdersScreen
      navigation={navigation}
      route={{ params }}
    />
  );
}
