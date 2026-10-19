import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 800);

    const timer = setTimeout(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          navigation.replace('Login');
        }
      }
    }, 2400);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [isLoading, isAuthenticated]);

  const handlePress = () => {
    if (!isLoading && !isAuthenticated) {
      navigation.replace('Login');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      style={styles.container}
    >
      {/* Top Right Decorative Wave */}
      <View style={styles.topShape1} />
      <View style={styles.topShape2} />

      {/* Left Glowing Dot */}
      <View style={styles.leftGlowDot} />

      {/* Bottom Waves */}
      <View style={styles.bottomWaveDark} />
      <View style={styles.bottomWaveLight} />
      <View style={styles.bottomWaveWhite} />

      {/* Center Branding */}
      <View style={styles.centerBox}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.tagline}>
          Sepatu Bersih{'\n'}Langkah Lebih Fresh
        </Text>
      </View>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, activeDot === 0 ? styles.dotActive : styles.dotInactive]} />
        <View style={[styles.dot, activeDot === 1 ? styles.dotActive : styles.dotInactive]} />
        <View style={[styles.dot, activeDot === 2 ? styles.dotActive : styles.dotInactive]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236B38', // Main green background
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Top right waves
  topShape1: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#2A7F43',
    opacity: 0.6,
  },
  topShape2: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.35,
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: '#329650',
    opacity: 0.4,
  },
  // Small dot on the left
  leftGlowDot: {
    position: 'absolute',
    top: height * 0.65,
    left: width * 0.08,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    opacity: 0.15,
  },
  // Bottom complex waves
  bottomWaveDark: {
    position: 'absolute',
    bottom: -height * 0.08,
    left: -width * 0.2,
    width: width * 1.5,
    height: width,
    borderRadius: width * 0.7,
    backgroundColor: '#195428',
    transform: [{ scaleX: 1.3 }, { rotate: '-12deg' }],
  },
  bottomWaveLight: {
    position: 'absolute',
    bottom: -height * 0.15,
    right: -width * 0.1,
    width: width * 1.5,
    height: width,
    borderRadius: width * 0.7,
    backgroundColor: '#EAF5EC',
    opacity: 0.25,
    transform: [{ scaleX: 1.2 }, { rotate: '15deg' }],
  },
  bottomWaveWhite: {
    position: 'absolute',
    bottom: -height * 0.25,
    left: -width * 0.15,
    width: width * 1.4,
    height: width,
    borderRadius: width * 0.7,
    backgroundColor: '#FFFFFF',
    transform: [{ scaleX: 1.4 }, { rotate: '-6deg' }],
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 30,
    marginBottom: height * 0.1, // Push up slightly to make room for bottom waves
  },
  logoBadge: {
    width: width * 0.65,
    height: width * 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: height * 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default SplashScreen;
