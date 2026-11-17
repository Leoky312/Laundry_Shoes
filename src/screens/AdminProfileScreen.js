import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { BASE_SERVER_URL, getImageUrl, USE_FORCE_MOCK } from '../services/api';
import RouteMapView from '../components/RouteMapView';
import {
  OUTLET_LOCATION,
  DEFAULT_OUTLET_LOCATION,
  GEOFENCE_CONFIG,
  loadStoredOutletLocation,
  saveStoredOutletLocation,
} from '../constants/location';
import { reverseGeocodeCoords } from '../services/routing';

const AdminProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const { isOffline } = useNetwork();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // States pengaturan titik outlet laundry
  const [outletModalVisible, setOutletModalVisible] = useState(false);
  const [outletForm, setOutletForm] = useState({
    title: OUTLET_LOCATION.title || 'Outlet Laundry',
    address: OUTLET_LOCATION.address || '',
    latitude: OUTLET_LOCATION.latitude,
    longitude: OUTLET_LOCATION.longitude,
  });
  const [outletRadius, setOutletRadius] = useState(GEOFENCE_CONFIG.RADIUS_METERS);
  const [isLocatingOutlet, setIsLocatingOutlet] = useState(false);
  const [isSavingOutlet, setIsSavingOutlet] = useState(false);

  useEffect(() => {
    loadStoredOutletLocation().then((loc) => {
      setOutletForm({
        title: loc.title || 'Outlet Laundry',
        address: loc.address || '',
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
      setOutletRadius(GEOFENCE_CONFIG.RADIUS_METERS);
    });
  }, []);

  const handleMapOutletChange = async (coords) => {
    setOutletForm((prev) => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
    try {
      const fullAddress = await reverseGeocodeCoords(coords);
      if (fullAddress) {
        setOutletForm((prev) => ({ ...prev, address: fullAddress }));
      }
    } catch (_e) {
      // ignore
    }
  };

  const handleUseCurrentGpsForOutlet = async () => {
    try {
      setIsLocatingOutlet(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const msg = 'Izin akses lokasi tidak diizinkan. Anda tetap dapat menggeser penanda merah pada peta.';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Izin Lokasi', msg);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: parseFloat(loc.coords.latitude.toFixed(6)),
        longitude: parseFloat(loc.coords.longitude.toFixed(6)),
      };
      setOutletForm((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));

      const fullAddress = await reverseGeocodeCoords(coords);
      if (fullAddress) {
        setOutletForm((prev) => ({ ...prev, address: fullAddress }));
      }
    } catch (err) {
      const msg = 'Gagal mendeteksi lokasi GPS toko. Silakan tentukan titik langsung pada peta.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Informasi Lokasi', msg);
    } finally {
      setIsLocatingOutlet(false);
    }
  };

  const handleSaveOutletLocation = async () => {
    try {
      setIsSavingOutlet(true);
      await saveStoredOutletLocation(
        {
          latitude: outletForm.latitude,
          longitude: outletForm.longitude,
          title: outletForm.title,
          address: outletForm.address,
        },
        outletRadius
      );
      const msg = 'Titik lokasi outlet dan batas area jangkauan layanan laundry berhasil diperbarui.';
      if (Platform.OS === 'web') {
        window.alert(`Sukses: ${msg}`);
      } else {
        Alert.alert('Sukses', msg);
      }
      setOutletModalVisible(false);
    } catch (err) {
      const msg = 'Gagal menyimpan perubahan lokasi outlet.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Gagal', msg);
    } finally {
      setIsSavingOutlet(false);
    }
  };

  const handleResetToDefaultOutlet = () => {
    setOutletForm({
      title: DEFAULT_OUTLET_LOCATION.title || 'Outlet Laundry',
      address: DEFAULT_OUTLET_LOCATION.address || '',
      latitude: DEFAULT_OUTLET_LOCATION.latitude,
      longitude: DEFAULT_OUTLET_LOCATION.longitude,
    });
    setOutletRadius(5000);
  };

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigation.navigate('ProfileTab');
    }
  }, [user]);

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

          {/* Section: Lokasi & Jangkauan Outlet Laundry */}
          <Text style={styles.sectionHeading}>LOKASI OUTLET & AREA JANGKAUAN</Text>
          <View style={styles.outletCard}>
            <View style={styles.outletCardHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.outletCardTitle}>{outletForm.title || 'Outlet Laundry'}</Text>
                <Text style={styles.outletCardSubtitle}>{outletForm.address || 'Alamat belum diatur'}</Text>
              </View>
              <View style={styles.outletRadiusBadge}>
                <Text style={styles.outletRadiusBadgeText}>Radius: {Math.round(outletRadius / 1000)} km</Text>
              </View>
            </View>

            <View style={styles.outletCoordsRow}>
              <Text style={styles.outletCoordsText}>
                Lintang: {Number(outletForm.latitude).toFixed(6)} • Bujur: {Number(outletForm.longitude).toFixed(6)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.outletEditBtn}
              onPress={() => setOutletModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.outletEditBtnText}>Ubah Titik Lokasi & Radius Geofence</Text>
            </TouchableOpacity>
          </View>

          {/* Section: Pengaturan & Sistem */}
          <Text style={styles.sectionHeading}>INFORMASI & SISTEM</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                const info = `ShoeFresh Admin Center v1.0.0\nBackend URL: ${BASE_SERVER_URL}\nStatus Mock: ${USE_FORCE_MOCK ? 'Aktif' : 'Non-Aktif'
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

      {/* Modal Pengaturan Titik Lokasi Outlet */}
      <Modal
        visible={outletModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOutletModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isDesktop && styles.desktopModalBox]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.modalTitle}>Pengaturan Titik Outlet Laundry</Text>
                <Text style={styles.modalSub}>
                  Geser penanda merah pada peta atau gunakan GPS untuk menetapkan lokasi toko
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setOutletModalVisible(false)}
              >
                <Text style={styles.modalCloseBtnText}>Tutup</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Peta Interaktif Leaflet Penentuan Titik Outlet */}
              <View style={styles.modalMapWrapper}>
                <RouteMapView
                  customerLocation={{ latitude: outletForm.latitude, longitude: outletForm.longitude }}
                  outletLocation={{ latitude: outletForm.latitude, longitude: outletForm.longitude }}
                  isOutletDraggable={true}
                  hideCustomerMarker={true}
                  centerOn="outlet"
                  showGeofence={true}
                  geofenceRadiusMeters={outletRadius}
                  onOutletLocationChange={handleMapOutletChange}
                  height={240}
                />
              </View>

              {/* Tombol Deteksi GPS Toko */}
              <TouchableOpacity
                style={styles.modalGpsBtn}
                onPress={handleUseCurrentGpsForOutlet}
                disabled={isLocatingOutlet}
                activeOpacity={0.8}
              >
                {isLocatingOutlet ? (
                  <ActivityIndicator size="small" color="#236B38" style={{ marginRight: 6 }} />
                ) : null}
                <Text style={styles.modalGpsBtnText}>
                  {isLocatingOutlet
                    ? 'Mendeteksi Posisi Toko...'
                    : 'Gunakan Posisi GPS Saat Ini Sebagai Titik Toko'}
                </Text>
              </TouchableOpacity>

              {/* Form Input Detail Outlet */}
              <Text style={styles.modalFieldLabel}>Nama / Label Outlet</Text>
              <TextInput
                style={styles.modalTextInput}
                value={outletForm.title}
                onChangeText={(text) => setOutletForm((prev) => ({ ...prev, title: text }))}
                placeholder="Contoh: Workshop ShoeFresh Sudirman"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.modalFieldLabel}>Alamat Lengkap Toko</Text>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 60 }]}
                value={outletForm.address}
                onChangeText={(text) => setOutletForm((prev) => ({ ...prev, address: text }))}
                multiline
                placeholder="Alamat lengkap toko laundry..."
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.modalCoordsRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.modalFieldLabel}>Latitude (Lintang)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={String(outletForm.latitude)}
                    onChangeText={(val) => {
                      const num = parseFloat(val);
                      if (!isNaN(num)) setOutletForm((prev) => ({ ...prev, latitude: num }));
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={styles.modalFieldLabel}>Longitude (Bujur)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={String(outletForm.longitude)}
                    onChangeText={(val) => {
                      const num = parseFloat(val);
                      if (!isNaN(num)) setOutletForm((prev) => ({ ...prev, longitude: num }));
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Pilihan Radius Jangkauan Geofence */}
              <Text style={styles.modalFieldLabel}>Batas Radius Jangkauan Layanan (Geofence)</Text>
              <View style={styles.radiusOptionsRow}>
                {[
                  { label: '3 km', meters: 3000 },
                  { label: '5 km (Standar)', meters: 5000 },
                  { label: '10 km', meters: 10000 },
                  { label: '15 km', meters: 15000 },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.meters}
                    style={[
                      styles.radiusOptionBtn,
                      outletRadius === opt.meters && styles.radiusOptionBtnActive,
                    ]}
                    onPress={() => setOutletRadius(opt.meters)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.radiusOptionText,
                        outletRadius === opt.meters && styles.radiusOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.saveOutletBtn}
                onPress={handleSaveOutletLocation}
                disabled={isSavingOutlet}
                activeOpacity={0.85}
              >
                {isSavingOutlet ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveOutletBtnText}>Simpan Titik Lokasi Outlet</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetOutletBtn}
                onPress={handleResetToDefaultOutlet}
                activeOpacity={0.8}
              >
                <Text style={styles.resetOutletBtnText}>Kembalikan ke Koordinat Standar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  outletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  outletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  outletCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  outletCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  outletRadiusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  outletRadiusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  outletCoordsRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  outletCoordsText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  outletEditBtn: {
    backgroundColor: '#236B38',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outletEditBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
    overflow: 'hidden',
  },
  desktopModalBox: {
    maxWidth: 620,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  modalCloseBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalMapWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  modalGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  modalGpsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
    marginTop: 8,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  modalCoordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radiusOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  radiusOptionBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  radiusOptionBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  radiusOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  radiusOptionTextActive: {
    color: '#15803D',
    fontWeight: '800',
  },
  saveOutletBtn: {
    backgroundColor: '#236B38',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveOutletBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  resetOutletBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  resetOutletBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default AdminProfileScreen;
