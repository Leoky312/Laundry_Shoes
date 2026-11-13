import React from 'react';
import ShoeCareScreen from '@/screens/ShoeCareScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function ExploreTab() {
  const navigation = useAppNavigation();
  return <ShoeCareScreen navigation={navigation} />;
}
