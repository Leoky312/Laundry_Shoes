import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';

const AdminProfileScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { user, logout, updateProfile } = useAuth();
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const handleChooseAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUpdatingAvatar(true);
        const asset = result.assets[0];
        const formData = new FormData();
        const uriParts = asset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';

        formData.append('avatar', {
          uri: asset.uri,
          name: `admin_avatar_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });

        const res = await updateProfile(formData);
        if (res.success) {
          if (Platform.OS === 'web') {
            window.alert('Foto profil Admin berhasil diperbarui!');
          } else {
            Alert.alert('Sukses', 'Foto profil Admin berhasil diperbarui!');
          }
        } else {
          Alert.alert('Gagal', res.message || 'Gagal mengubah foto profil.');
        }
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Terjadi kesalahan saat memilih foto.');
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleLogout = () => {
    const performLogout = async () => {
      await logout();
      if (navigation?.replace) {
        navigation.replace('Login');
      } else {
        navigation?.navigate?.('Login');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Apakah Anda yakin ingin keluar dari akun Admin?')) {
        performLogout();
      }
    } else {
      Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun Admin?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  const adminMenuItems = [
    {
      icon: 'receipt-outline',
      title: 'Kelola Seluruh Pesanan',
      subtitle: 'Pantau status antrian, proses pengerjaan & foto hasil',
      onPress: () => navigation.navigate('Orders'),
      badge: 'Order',
    },
    {
      icon: 'sparkles-outline',
      title: 'Katalog & Tarif Layanan',
      subtitle: 'Atur paket deep clean, fast clean, unyellowing',
      onPress: () => navigation.navigate('Services'),
      badge: 'Layanan',
    },
    {
      icon: 'bar-chart-outline',
      title: 'Laporan Keuangan & Omset',
      subtitle: 'Analisis transaksi masuk dan pendapatan bersih',
      onPress: () => navigation.navigate('Reports'),
      badge: 'Keuangan',
    },
    {
      icon: 'business-outline',
      title: 'Informasi Workshop ShoeFresh',
      subtitle: 'Lokasi cabang workshop & jam operasional toko',
      onPress: () => {
        const info = `ShoeFresh Workshop Laundry Sepatu\nAlamat: ${user?.address || 'Jl. Jend. Sudirman No. 88, Malang'}\nJam Operasional: 08.00 - 20.00 WIB\nKontak: ${user?.phone || '0812-3456-7890'}`;
        if (Platform.OS === 'web') {
          window.alert(info);
        } else {
          Alert.alert('Informasi Workshop', info);
        }
      },
    },
    {
      icon: 'hardware-chip-outline',
      title: 'Pengaturan Sistem & Server',
      subtitle: 'ShoeFresh App v1.0.0 • Pemrograman Mobile Modul 3',
      onPress: () => {
        const sys = 'Sistem Terhubung:\n• Mock REST API Service Aktif\n• Mode Otentikasi Role-Based (Admin & Customer)\n• Platform: Expo React Native & TypeScript';
        if (Platform.OS === 'web') {
          window.alert(sys);
        } else {
          Alert.alert('Sistem & Status Server', sys);
        }
      },
    },
  ];

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
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#132A1B" />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Profil Administrator</Text>
              <Text style={styles.headerSubtitle}>Control Center ShoeFresh</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Admin Identity Card */}
          <View style={styles.adminCard}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleChooseAvatar}
              activeOpacity={0.85}
              disabled={updatingAvatar}
            >
              <Image
                source={{
                  uri:
                    getImageUrl(user?.avatar) ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
                }}
                style={styles.avatarImg}
              />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={13} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.adminBadgeRow}>
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={13} color="#236B38" />
                <Text style={styles.adminBadgeText}>SUPER ADMINISTRATOR</Text>
              </View>
              <View style={styles.activeDotRow}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Online</Text>
              </View>
            </View>

            <Text style={styles.adminName}>{user?.name || 'Admin ShoeFresh'}</Text>
            <Text style={styles.adminEmail}>{user?.email || 'admin@laundryshoes.com'}</Text>
            <Text style={styles.adminPhone}>{user?.phone || '0812 3456 7890'}</Text>
          </View>

          {/* Info Banner Workshop */}
          <View style={styles.workshopBanner}>
            <View style={styles.workshopIconCircle}>
              <Ionicons name="storefront" size={20} color="#236B38" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.workshopBannerTitle}>Workshop ShoeFresh Pusat</Text>
              <Text style={styles.workshopBannerDesc}>
                {user?.address || 'Jl. Jend. Sudirman No. 88, Lowokwaru, Kota Malang'}
              </Text>
            </View>
          </View>

          {/* Menu Sections */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Menu Pengelolaan Toko</Text>
          </View>

          <View style={styles.menuContainer}>
            {adminMenuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.menuRow}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <Ionicons name={item.icon} size={20} color="#236B38" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}

            {/* Logout Row */}
            <TouchableOpacity
              style={[styles.menuRow, styles.logoutRow]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.logoutTitle}>Keluar dari Akun Admin</Text>
                  <Text style={styles.logoutSubtitle}>Tutup sesi control center dan kembali ke login</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminProfileScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAF8',
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
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingBottom: 30,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  topHeader: {
    paddingTop: Platform.OS === 'web' ? 16 : 50,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#132A1B',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  headerLogoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#236B38',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#236B38',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF5EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#236B38',
    letterSpacing: 0.5,
  },
  activeDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  activeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  adminName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#132A1B',
    marginTop: 2,
  },
  adminEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  adminPhone: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  workshopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5EC',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#D1E7D6',
  },
  workshopIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workshopBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#132A1B',
  },
  workshopBannerDesc: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  sectionHeaderRow: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#132A1B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EAF5EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#132A1B',
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutRow: {
    borderBottomWidth: 0,
    backgroundColor: '#FFFBFB',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  logoutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  logoutSubtitle: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 2,
  },
});
