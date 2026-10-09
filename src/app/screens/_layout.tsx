import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="detail" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="orderTracking" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}
