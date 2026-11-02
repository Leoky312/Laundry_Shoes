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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, USE_FORCE_MOCK, BASE_SERVER_URL } from '../services/api';
import { useNetwork } from '../context/NetworkContext';

const AdminProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const { isOffline } = useNetwork();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  const handleChooseAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUpdatingAvatar(true);
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
        setIsUpdatingAvatar(false);

        if (res.success) {
          const msg = 'Foto profil admin berhasil diperbarui!';
          if (Platform.OS === 'web') {
            window.alert(msg);
          } else {
            Alert.alert('Sukses', msg);
          }
        } else {
          const err = res.message || 'Gagal memperbarui foto profil.';
          if (Platform.OS === 'web') {
            window.alert(err);
          } else {
            Alert.alert('Gagal', err);
          }
        }
      }
    } catch (err) {
      setIsUpdatingAvatar(false);
      console.log('Error avatar pick:', err);
    }
  };

  const handleLogout = () => {
    const performLogout = async () => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        try {
          document.activeElement?.blur?.();
        } catch (_e) {
          // ignore
        }
      }
      await logout();
      if (navigation && navigation.navigate) {
        navigation.navigate('Login');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Apakah Anda yakin ingin keluar dari akun Admin?')) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Konfirmasi Keluar',
        'Apakah Anda yakin ingin keluar dari sesi Admin ShoeFresh?',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Keluar', style: 'destructive', onPress: performLogout },
        ]
      );
    }
  };

  const adminMenuShortcuts = [
    {
      icon: 'grid-outline',
      title: 'Dashboard Admin',
      subtitle: 'Statistik omset & ringkasan operasional',
      onPress: () => navigation.navigate('AdminDashboard'),
    },
    {
      icon: 'file-tray-full-outline',
      title: 'Kelola Pesanan Laundry',
      subtitle: 'Perbarui status cuci, pembayaran, & kirim',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      icon: 'sparkles-outline',
      title: 'Katalog Layanan Sepatu',
      subtitle: 'Tambah, ubah tarif, & atur diskon layanan',
      onPress: () => navigation.navigate('Services'),
    },
    {
      icon: 'bar-chart-outline',
      title: 'Laporan Penjualan & Keuangan',
      subtitle: 'Rekapitulasi pendapatan dan transaksi',
      onPress: () => navigation.navigate('Reports'),
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainContainer, isDesktop && styles.desktopContainer]}>
          {/* Top Header Bar */}
          <View style={styles.topHeader}>
            <View style={styles.topHeaderTitleRow}>
              <View style={styles.adminIconBox}>
                <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Profil Admin</Text>
                <Text style={styles.headerSubtitle}>ShoeFresh Management Center</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.headerLogoutQuickBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
              accessibilityLabel="Tombol cepat keluar"
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>

          {/* Admin Profile Card */}
          <View style={styles.userSection}>
            <View style={styles.userCardHeaderBg} />

            <View style={styles.userCardContent}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={handleChooseAvatar}
                disabled={isUpdatingAvatar}
                activeOpacity={0.85}
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
                  {isUpdatingAvatar ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="camera" size={13} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>

              <Text style={styles.userName}>{user?.name || 'Administrator ShoeFresh'}</Text>

              <View style={styles.adminRolePill}>
                <Ionicons name="shield-checkmark" size={14} color="#15803D" />
                <Text style={styles.adminRoleText}>SUPER ADMINISTRATOR</Text>
              </View>

              <Text style={styles.userEmail}>{user?.email || 'admin@shoefresh.com'}</Text>
              <Text style={styles.userPhone}>{user?.phone || '0812-9876-5432'}</Text>
            </View>

            {/* Quick Status Bar */}
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View style={[styles.dotIndicator, { backgroundColor: isOffline ? '#EF4444' : '#10B981' }]} />
                <Text style={styles.statusItemText}>
                  {isOffline ? 'Offline' : 'Server Terhubung'}
                </Text>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Ionicons name="sync-outline" size={14} color="#6B7280" />
                <Text style={styles.statusItemText}>
                  {USE_FORCE_MOCK ? 'Mode Mock / Standalone' : 'REST API Server'}
                </Text>
              </View>
            </View>
          </View>

          {/* Section: Navigasi Cepat Admin */}
          <Text style={styles.sectionHeading}>MENU KONTROL ADMIN</Text>
          <View style={styles.menuContainer}>
            {adminMenuShortcuts.map((item, idx) => (
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
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Section: Pengaturan & Sistem */}
          <Text style={styles.sectionHeading}>INFORMASI & SISTEM</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('HomeTab')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="eye-outline" size={20} color="#0284C7" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Pratinjau Tampilan Pelanggan</Text>
                  <Text style={styles.menuSubtitle}>Lihat tampilan katalog & booking pelanggan</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                const info = `ShoeFresh Admin Center v1.0.0\nBackend URL: ${BASE_SERVER_URL}\nStatus Mock: ${
                  USE_FORCE_MOCK ? 'Aktif' : 'Non-Aktif'
                }`;
                if (Platform.OS === 'web') {
                  window.alert(info);
                } else {
                  Alert.alert('Informasi Sistem', info);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#F3F4F6' }]}>
                  <Ionicons name="information-circle-outline" size={20} color="#4B5563" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Informasi Aplikasi & Versi</Text>
                  <Text style={styles.menuSubtitle}>ShoeFresh Admin v1.0.0 • Mobile & Web</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Tombol Logout Utama */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <View style={styles.logoutBtnInner}>
              <Ionicons name="log-out-outline" size={22} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Keluar dari Akun Admin</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  desktopScrollContent: {
    alignItems: 'center',
  },
  mainContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
  },
  desktopContainer: {
    maxWidth: 720,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#236B38',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#236B38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  headerLogoutQuickBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  userCardHeaderBg: {
    height: 60,
    backgroundColor: '#236B38',
  },
  userCardContent: {
    alignItems: 'center',
    marginTop: -38,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImg: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#E2E8F0',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#236B38',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  adminRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    marginBottom: 6,
    gap: 4,
  },
  adminRoleText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  userPhone: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E2E8F0',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default AdminProfileScreen;
