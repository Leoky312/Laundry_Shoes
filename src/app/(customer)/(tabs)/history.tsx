import React from 'react';
import HistoryScreen from '@/screens/HistoryScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function CustomerHistoryPage() {
  const navigation = useAppNavigation();
  return <HistoryScreen navigation={navigation} />;
}
