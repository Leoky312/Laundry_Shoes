import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="service/[id]" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="screens" />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
