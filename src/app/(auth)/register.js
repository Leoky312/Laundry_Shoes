import { useRouter } from 'expo-router';
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
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

const RegisterScreen = ({}) => {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setErrorMsg('Nama lengkap, email, dan password wajib diisi!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await register({
      name,
      email,
      password,
      phone,
      address: 'Malang, Jawa Timur',
    });

    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      if (Platform.OS === 'web') {
        window.alert(`Gagal Mendaftar: ${res.message}`);
      } else {
        Alert.alert('Gagal Mendaftar', res.message);
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
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#132A1B" />
        </TouchableOpacity>

        {/* Center Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Daftar Akun</Text>
          <Text style={styles.subtitle}>
            Buat akun untuk memulai layanan Shoefresh
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Input
            placeholder="Nama Lengkap"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              setErrorMsg('');
            }}
            iconName="person-outline"
          />

          <Input
            placeholder="Nomor HP"
            value={phone}
            onChangeText={(txt) => {
              setPhone(txt);
              setErrorMsg('');
            }}
            keyboardType="phone-pad"
            iconName="call-outline"
          />

          <Input
            placeholder="Email"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
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

          {/* Action Button: Daftar */}
          <Button
            title="Daftar"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerBtn}
            size="lg"
          />

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Sudah punya akun? </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Masuk di sini</Text>
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 120,
    height: 90,
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#132A1B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
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
  registerBtn: {
    backgroundColor: '#236B38',
    borderRadius: 28,
    marginTop: 10,
    paddingVertical: 14,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  loginPrompt: {
    fontSize: 13,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#236B38',
  },
});

export default RegisterScreen;
