import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import DetailServiceScreen from '@/screens/DetailServiceScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function DetailServicePage() {
  const navigation = useAppNavigation();
  const params = useLocalSearchParams();

  return (
    <DetailServiceScreen
      navigation={navigation}
      route={{ params }}
    />
  );
}
