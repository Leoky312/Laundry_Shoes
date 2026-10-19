import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';

export default function IndexScreen() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (isAdmin) {
        router.replace('/(admin)/(tabs)');
      } else {
        router.replace('/(customer)/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      <Text style={styles.text}>Memuat Shoefresh...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  spinner: {
    marginVertical: 14,
  },
  text: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
