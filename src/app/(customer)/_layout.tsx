import React from 'react';
import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="detail-service" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="order-tracking" />
    </Stack>
  );
}
