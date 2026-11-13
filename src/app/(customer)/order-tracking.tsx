import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import OrderTrackingScreen from '@/screens/OrderTrackingScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function OrderTrackingPage() {
  const navigation = useAppNavigation();
  const params = useLocalSearchParams();

  return (
    <OrderTrackingScreen
      navigation={navigation}
      route={{ params }}
    />
  );
}
