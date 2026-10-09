import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../constants/theme';
import GlobalStyles from '../../constants/styles';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={GlobalStyles.safeAreaWhite}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Center */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Header Texts */}
        <Text style={styles.title}>Selamat Datang!</Text>
        <Text style={styles.subtitle}>Login untuk melanjutkan</Text>

        {/* Inputs */}
        <InputField
          iconName="mail-outline"
          placeholder="Email atau Nomor HP"
          value={identifier}
          onChangeText={setIdentifier}
        />

        <InputField
          iconName="lock-closed-outline"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          isPassword
        />

        {/* Checkbox & Forgot Password */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberBox}
            activeOpacity={0.8}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && (
                <Ionicons name="checkmark" size={14} color={Theme.colors.white} />
              )}
            </View>
            <Text style={styles.rememberText}>Ingat saya</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.forgotText}>Lupa password?</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <PrimaryButton
          title="Masuk"
          onPress={handleLogin}
          style={styles.loginBtn}
        />

        {/* Divider "atau masuk dengan" */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>atau masuk dengan</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
            <Ionicons name="logo-google" size={24} color="#EA4335" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
            <Ionicons name="logo-apple" size={26} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Daftar di sini</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 140,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 6,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: 24,
    textAlign: 'left',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
    marginTop: 4,
  },
  rememberBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: Theme.colors.white,
  },
  checkboxActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  rememberText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  loginBtn: {
    marginBottom: 26,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 36,
  },
  socialButton: {
    width: 60,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.card,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
});