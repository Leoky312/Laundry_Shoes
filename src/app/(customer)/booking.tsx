import React from 'react';
import BookingScreen from '@/screens/BookingScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function BookingPage() {
  const navigation = useAppNavigation();
  return <BookingScreen navigation={navigation} />;
}
