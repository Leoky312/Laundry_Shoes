import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (inputEmail, inputPassword) => {
    const targetEmail = inputEmail || identifier;
    const targetPassword = inputPassword || password;

    if (!targetEmail || !targetPassword) {
      setErrorMsg('Harap masukkan email atau nomor HP dan password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await login(targetEmail, targetPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      if (Platform.OS === 'web') {
        window.alert(`Gagal Masuk: ${res.message}`);
      } else {
        Alert.alert('Gagal Masuk', res.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Title & Subtitle */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Selamat Datang!</Text>
          <Text style={styles.subtitle}>Login untuk melanjutkan</Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Input
            placeholder="Email atau Nomor HP"
            value={identifier}
            onChangeText={(txt) => {
              setIdentifier(txt);
              setErrorMsg('');
            }}
            keyboardType="email-address"
            iconName="mail-outline"
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setErrorMsg('');
            }}
            secureTextEntry
            iconName="lock-closed-outline"
          />

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.rememberMeText}>Ingat saya</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Lupa password?</Text>
            </TouchableOpacity>
          </View>

          {/* Action Button: Masuk */}
          <Button
            title="Masuk"
            onPress={() => handleLogin()}
            loading={loading}
            style={styles.loginBtn}
            size="lg"
          />

          {/* Or Continue With */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau masuk dengan</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Logins */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Ionicons name="logo-apple" size={22} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Belum punya akun? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Daftar di sini</Text>
            </TouchableOpacity>
          </View>

          {/* Demo Quick Login Options */}
          <View style={styles.quickAccessSection}>
            <Text style={styles.quickAccessTitle}>Akun Demo Cepat:</Text>
            <View style={styles.quickAccessRow}>
              <TouchableOpacity
                style={styles.quickAccessBtn}
                onPress={() => {
                  setIdentifier('customer@gmail.com');
                  setPassword('customer123');
                  handleLogin('customer@gmail.com', 'customer123');
                }}
              >
                <Text style={styles.quickAccessText}>👤 Masuk Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAccessBtn}
                onPress={() => {
                  setIdentifier('admin@laundryshoes.com');
                  setPassword('admin123');
                  handleLogin('admin@laundryshoes.com', 'admin123');
                }}
              >
                <Text style={styles.quickAccessText}>🛡️ Masuk Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 130,
    height: 100,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#132A1B',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  form: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
    marginTop: 2,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#236B38',
    borderColor: '#236B38',
  },
  rememberMeText: {
    fontSize: 13,
    color: '#374151',
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#236B38',
  },
  loginBtn: {
    backgroundColor: '#236B38',
    borderRadius: 28,
    paddingVertical: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#9CA3AF',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 26,
  },
  socialBtn: {
    width: 60,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  registerPrompt: {
    fontSize: 13,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#236B38',
  },
  quickAccessSection: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  quickAccessTitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAccessBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  quickAccessText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
});

export default LoginScreen;
