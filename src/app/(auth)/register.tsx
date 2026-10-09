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

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={GlobalStyles.safeAreaWhite}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Theme.colors.text} />
        </TouchableOpacity>

        {/* Logo Center */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Titles */}
        <Text style={styles.title}>Daftar Akun</Text>
        <Text style={styles.subtitle}>
          Buat akun untuk memulai layanan Shoefresh
        </Text>

        {/* 4 Inputs */}
        <InputField
          iconName="person-outline"
          placeholder="Nama Lengkap"
          value={fullName}
          onChangeText={setFullName}
        />

        <InputField
          iconName="call-outline"
          placeholder="Nomor HP"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <InputField
          iconName="mail-outline"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <InputField
          iconName="lock-closed-outline"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          isPassword
        />

        {/* Submit Button */}
        <PrimaryButton
          title="Daftar"
          onPress={handleRegister}
          style={styles.registerBtn}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>Masuk di sini</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
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
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 95,
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
  registerBtn: {
    marginTop: 10,
    marginBottom: 32,
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