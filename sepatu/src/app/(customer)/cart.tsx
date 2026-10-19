import React from 'react';
import CartScreen from '@/screens/CartScreen';
import useAppNavigation from '@/hooks/useAppNavigation';

export default function CartPage() {
  const navigation = useAppNavigation();
  return <CartScreen navigation={navigation} />;
}
