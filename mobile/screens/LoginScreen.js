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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (inputEmail, inputPassword) => {
    const targetEmail = inputEmail || email;
    const targetPassword = inputPassword || password;

    if (!targetEmail || !targetPassword) {
      setErrorMsg('Harap masukkan email dan password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await login(targetEmail, targetPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      Alert.alert('Gagal Masuk', res.message);
    }
  };

  // Shortcut untuk kemudahan pengujian demo
  const quickLoginAdmin = () => {
    setEmail('admin@laundryshoes.com');
    setPassword('admin123');
    handleLogin('admin@laundryshoes.com', 'admin123');
  };

  const quickLoginCustomer = () => {
    setEmail('customer@gmail.com');
    setPassword('customer123');
    handleLogin('customer@gmail.com', 'customer123');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Icon & Title */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.welcomeTitle}>Selamat Datang!</Text>
          <Text style={styles.welcomeSubtitle}>
            Masuk untuk merawat sepatu kesayangan Anda
          </Text>
        </View>

        {/* Form Box */}
        <View style={styles.form}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Input
            label="Email"
            placeholder="nama@email.com"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              setErrorMsg('');
            }}
            keyboardType="email-address"
            iconName="mail-outline"
          />

          <Input
            label="Kata Sandi"
            placeholder="Minimal 6 karakter"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setErrorMsg('');
            }}
            secureTextEntry
            iconName="lock-closed-outline"
          />

          <Button
            title="Masuk Sekarang"
            onPress={() => handleLogin()}
            loading={loading}
            style={styles.btnLogin}
          />

          {/* Quick Demo Login Chips */}
          <View style={styles.demoSection}>
            <Text style={styles.demoLabel}>🚀 Uji Coba Cepat (1-Klik Akun Demo):</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={styles.demoChipCustomer}
                onPress={quickLoginCustomer}
                activeOpacity={0.8}
              >
                <Ionicons name="person" size={14} color={Colors.primary} />
                <Text style={styles.demoChipCustomerText}>Customer Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoChipAdmin}
                onPress={quickLoginAdmin}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark" size={14} color={Colors.secondary} />
                <Text style={styles.demoChipAdminText}>Admin Demo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  btnLogin: {
    marginTop: 8,
  },
  demoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoChipCustomer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    gap: 6,
  },
  demoChipCustomerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  demoChipAdmin: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
    gap: 6,
  },
  demoChipAdminText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  registerPromptText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
