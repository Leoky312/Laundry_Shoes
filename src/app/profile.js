import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/services/api';

const ProfileScreen = ({}) => {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const handleChooseAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        const formData = new FormData();
        const uriParts = photo.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('avatar', {
          uri: photo.uri,
          name: `avatar_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });

        const res = await updateProfile(formData);
        if (res.success) {
          if (Platform.OS === 'web') {
            window.alert('Foto profil berhasil diperbarui!');
          } else {
            Alert.alert('Sukses', 'Foto profil berhasil diperbarui!');
          }
        }
      }
    } catch (err) {
      console.log('Error avatar pick:', err);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Apakah Anda yakin ingin keluar dari akun?')) {
        logout();
      }
    } else {
      Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const menuItems = [
    {
      icon: 'location-outline',
      title: 'Alamat Saya',
      onPress: () => {
        if (Platform.OS === 'web') {
          window.alert(`Alamat Anda:\n${user?.address || 'Jl. Melati No. 12, Lowokwaru, Malang'}`);
        } else {
          Alert.alert('Alamat Saya', user?.address || 'Jl. Melati No. 12, Lowokwaru, Malang');
        }
      },
    },
    {
      icon: 'card-outline',
      title: 'Metode Pembayaran',
      onPress: () => {
        if (Platform.OS === 'web') {
          window.alert('Metode Pembayaran Aktif:\n• DANA\n• Transfer Bank\n• COD');
        } else {
          Alert.alert('Metode Pembayaran', '• DANA\n• Transfer Bank\n• COD');
        }
      },
    },
    {
      icon: 'receipt-outline',
      title: 'Riwayat Pesanan',
      onPress: () => router.push('/history'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Bantuan & FAQ',
      onPress: () => {
        if (Platform.OS === 'web') {
          window.alert('Hubungi Customer Support:\nWhatsApp: 0812-3456-7890\nJam Operasional: 08.00 - 20.00');
        } else {
          Alert.alert('Bantuan & FAQ', 'Customer Support:\nWhatsApp: 0812-3456-7890');
        }
      },
    },
    {
      icon: 'information-circle-outline',
      title: 'Tentang Kami',
      onPress: () => {
        if (Platform.OS === 'web') {
          window.alert('Shoefresh App v1.0.0\nSolusi Perawatan & Laundry Sepatu Modern Terpercaya.');
        } else {
          Alert.alert('Tentang Kami', 'Shoefresh App v1.0.0\nSolusi Perawatan & Laundry Sepatu Modern.');
        }
      },
    },
  ];

  // Jika admin, buang item menu yang hanya untuk customer
  const filteredMenuItems = user?.role === 'ADMIN' 
    ? menuItems.filter(item => ['Bantuan & FAQ', 'Tentang Kami'].includes(item.title))
    : menuItems;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainContainer, isDesktop && styles.desktopContainer]}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace(user?.role === 'ADMIN' ? '/(admin)/dashboard' : '/');
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#132A1B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profil</Text>
            <TouchableOpacity style={styles.gearBtn} activeOpacity={0.8}>
              <Ionicons name="settings-outline" size={20} color="#132A1B" />
            </TouchableOpacity>
          </View>

          {/* User Card */}
          <View style={styles.userSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleChooseAvatar}
              activeOpacity={0.85}
            >
              <Image
                source={{
                  uri:
                    getImageUrl(user?.avatar) ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop',
                }}
                style={styles.avatarImg}
              />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>{user?.name || 'Fatir'}</Text>
            {user?.role === 'ADMIN' && (
              <View style={styles.adminRolePill}>
                <Ionicons name="shield-checkmark" size={13} color={Colors.primary} />
                <Text style={styles.adminRoleText}>ADMINISTRATOR</Text>
              </View>
            )}
            <Text style={styles.userPhone}>{user?.phone || '0812 3456 7890'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'fatir@example.com'}</Text>
          </View>

          {/* Menu Items List */}
          <View style={styles.menuContainer}>
            {filteredMenuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.menuRow}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <Ionicons name={item.icon} size={20} color="#132A1B" />
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}

            {/* Keluar */}
            <TouchableOpacity
              style={[styles.menuRow, styles.logoutRow]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                </View>
                <Text style={styles.logoutTitle}>Keluar</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  desktopScrollContent: {
    paddingVertical: 20,
  },
  mainContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  desktopContainer: {
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingBottom: 30,
    marginTop: 10,
  },
  topHeader: {
    paddingTop: Platform.OS === 'web' ? 14 : 50,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#132A1B',
  },
  gearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#EAF5EC',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#236B38',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#132A1B',
    marginBottom: 4,
  },
  adminRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF5EC',
    borderWidth: 1,
    borderColor: '#C3E6CB',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  adminRoleText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  userPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoutRow: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  logoutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});

export default ProfileScreen;
