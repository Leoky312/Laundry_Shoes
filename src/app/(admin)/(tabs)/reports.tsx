import React from 'react';
import ReportScreen from '@/screens/ReportScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function AdminReportsPage() {
  const navigation = useAppNavigation();
  const ScreenComponent = ReportScreen as any;
  return <ScreenComponent navigation={navigation} />;
}
