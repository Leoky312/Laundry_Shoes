import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleNext();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.touchContainer}
      onPress={handleNext}
    >
      <StatusBar style="light" />
      <ImageBackground
        source={require('../../assets/images/splash-bg.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Sneaker liquid splash logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo-splash.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Tagline */}
            <View style={styles.taglineContainer}>
              <Text style={styles.tagline}>Sepatu Bersih</Text>
              <Text style={styles.tagline}>Langkah Lebih Fresh</Text>
            </View>

            {/* Pagination / Onboarding Dots */}
            <View style={styles.dots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotInactive]} />
            </View>
          </View>

          {/* Subtle floating bubble accent */}
          <View style={styles.bubble} />
        </SafeAreaView>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchContainer: {
    flex: 1,
    backgroundColor: '#256325',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: height * 0.08,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoImage: {
    width: Math.min(width * 0.76, 290),
    height: Math.min(width * 0.76, 290) * (862 / 1054),
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 44,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 28,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  bubble: {
    position: 'absolute',
    left: 24,
    top: '64%',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
});