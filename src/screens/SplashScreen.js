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

const { width: winWidth, height: winHeight } = Dimensions.get('window');
// Skala proporsional mobile agar di browser laptop/web tidak melar/membesar
const width = Math.min(winWidth, 420);
const height = Math.min(winHeight, 840);

const SplashScreen = ({ navigation }) => {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 600);

    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        navigation?.replace ? navigation.replace('Login') : navigation?.navigate?.('Login');
      } else if (isAdmin || user?.role === 'ADMIN') {
        navigation?.replace ? navigation.replace('Dashboard') : navigation?.navigate?.('Dashboard');
      } else {
        navigation?.replace ? navigation.replace('HomeTab') : navigation?.navigate?.('HomeTab');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, isAdmin, user, navigation]);

  const handlePress = () => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigation?.replace ? navigation.replace('Login') : navigation?.navigate?.('Login');
    } else if (isAdmin || user?.role === 'ADMIN') {
      navigation?.replace ? navigation.replace('Dashboard') : navigation?.navigate?.('Dashboard');
    } else {
      navigation?.replace ? navigation.replace('HomeTab') : navigation?.navigate?.('HomeTab');
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
    backgroundColor: '#236B38', // Hijau khas Shoefresh
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
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
    marginBottom: height * 0.08,
  },
  logoBadge: {
    width: 200,
    height: 200,
    maxWidth: 200,
    maxHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    bottom: 50,
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
