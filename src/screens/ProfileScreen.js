import React, { useState, useEffect } from 'react';
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
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';
import RouteMapView from '../components/RouteMapView';
import {
  DEFAULT_CUSTOMER_LOCATION,
  OUTLET_LOCATION,
  GEOFENCE_CONFIG,
  loadStoredOutletLocation,
  subscribeOutletLocation,
} from '../constants/location';
import { reverseGeocodeCoords, checkGeofenceStatus } from '../services/routing';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // States pengaturan alamat customer
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [outletCoords, setOutletCoords] = useState(OUTLET_LOCATION);
  const [geofenceRadius, setGeofenceRadius] = useState(GEOFENCE_CONFIG.RADIUS_METERS);
  const [customerCoords, setCustomerCoords] = useState(() => {
    if (user?.latitude && user?.longitude) {
      return { latitude: user.latitude, longitude: user.longitude };
    }
    return DEFAULT_CUSTOMER_LOCATION;
  });
  const [addressText, setAddressText] = useState(user?.address || '');
  const [isLocating, setIsLocating] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [geofenceStatus, setGeofenceStatus] = useState(() =>
    checkGeofenceStatus(
      user?.latitude && user?.longitude
        ? { latitude: user.latitude, longitude: user.longitude }
        : DEFAULT_CUSTOMER_LOCATION,
      OUTLET_LOCATION,
      GEOFENCE_CONFIG.RADIUS_METERS
    )
  );

  useEffect(() => {
    loadStoredOutletLocation().then((loc) => {
      setOutletCoords({ ...loc });
      setGeofenceRadius(GEOFENCE_CONFIG.RADIUS_METERS);
    });

    const unsubscribe = subscribeOutletLocation((newLoc, rad) => {
      setOutletCoords({ ...newLoc });
      setGeofenceRadius(rad);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      if (user.address) setAddressText(user.address);
      if (user.latitude && user.longitude) {
        const coords = { latitude: user.latitude, longitude: user.longitude };
        setCustomerCoords(coords);
        setGeofenceStatus(checkGeofenceStatus(coords, outletCoords, geofenceRadius));
      }
    }
  }, [user, outletCoords, geofenceRadius]);

  const handleLocationChange = async (coords) => {
    setCustomerCoords(coords);
    const status = checkGeofenceStatus(coords, outletCoords, geofenceRadius);
    setGeofenceStatus(status);
    try {
      const fullAddress = await reverseGeocodeCoords(coords);
      if (fullAddress) {
        setAddressText(fullAddress);
      }
    } catch (_e) {
      // ignore
    }
  };

  const handleUseCurrentGps = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const msg = 'Izin akses lokasi tidak diizinkan. Anda tetap dapat menggeser penanda biru pada peta.';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Izin Lokasi', msg);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newCoords = {
        latitude: parseFloat(loc.coords.latitude.toFixed(6)),
        longitude: parseFloat(loc.coords.longitude.toFixed(6)),
      };
      setCustomerCoords(newCoords);

      const fullAddress = await reverseGeocodeCoords(newCoords);
      if (fullAddress) {
        setAddressText(fullAddress);
      }

      const geoStat = checkGeofenceStatus(newCoords, outletCoords, geofenceRadius);
      setGeofenceStatus(geoStat);

      const feedbackTitle = 'Informasi Jangkauan Layanan';
      const feedbackMsg = geoStat.isInside
        ? 'Anda berada di dalam area jangkauan layanan laundry.'
        : 'Lokasi Anda berada di luar area jangkauan layanan.';

      if (Platform.OS === 'web') {
        window.alert(feedbackTitle + ':\n' + feedbackMsg);
      } else {
        Alert.alert(feedbackTitle, feedbackMsg);
      }
    } catch (err) {
      const msg = 'Gagal mendeteksi lokasi GPS. Silakan tentukan titik langsung pada peta.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Informasi Lokasi', msg);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressText.trim()) {
      const msg = 'Alamat lengkap penjemputan tidak boleh kosong.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Peringatan', msg);
      return;
    }

    try {
      setIsSavingAddress(true);
      const res = await updateProfile({
        address: addressText.trim(),
        latitude: customerCoords.latitude,
        longitude: customerCoords.longitude,
      });

      if (res.success) {
        const msg = 'Alamat dan koordinat penjemputan berhasil disimpan ke akun Anda.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Sukses', msg);
        }
        setAddressModalVisible(false);
      } else {
        const msg = res.message || 'Gagal menyimpan alamat.';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Gagal', msg);
      }
    } catch (err) {
      const msg = 'Terjadi kesalahan saat menyimpan alamat.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Gagal', msg);
    } finally {
      setIsSavingAddress(false);
    }
  };

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
    const performLogout = async () => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        try {
          document.activeElement?.blur?.();
        } catch (e) {
          // ignore
        }
      }
      await logout();
      if (navigation && navigation.navigate) {
        navigation.navigate('Login');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Apakah Anda yakin ingin keluar dari akun?')) {
        performLogout();
      }
    } else {
      Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  const menuItems = [
    {
      icon: 'location-outline',
      title: 'Alamat Penjemputan Saya',
      onPress: () => {
        setAddressText(user?.address || 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan');
        if (user?.latitude && user?.longitude) {
          setCustomerCoords({ latitude: user.latitude, longitude: user.longitude });
        }
        setAddressModalVisible(true);
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
      title: user?.role === 'ADMIN' ? 'Kelola Semua Pesanan' : 'Riwayat Pesanan',
      onPress: () => {
        if (user?.role === 'ADMIN') {
          navigation.navigate('ManageOrders');
        } else {
          navigation.navigate('HistoryTab');
        }
      },
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

  const handleBack = () => {
    if (user?.role === 'ADMIN') {
      navigation.navigate('Dashboard');
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

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
              onPress={handleBack}
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
            {menuItems.map((item, idx) => (
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

      {/* Modal Pengaturan Alamat Pelanggan */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isDesktop && styles.desktopModalBox]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.modalTitle}>Pengaturan Alamat Penjemputan</Text>
                <Text style={styles.modalSub}>
                  Geser penanda biru pada peta atau gunakan GPS untuk menetapkan lokasi penjemputan Anda
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setAddressModalVisible(false)}
              >
                <Text style={styles.modalCloseBtnText}>Tutup</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Peta Interaktif Leaflet Penentuan Titik Pelanggan */}
              <View style={styles.modalMapWrapper}>
                <RouteMapView
                  customerLocation={customerCoords}
                  outletLocation={outletCoords}
                  isDraggable={true}
                  onLocationChange={handleLocationChange}
                  showGeofence={true}
                  geofenceRadiusMeters={geofenceRadius}
                  height={240}
                />
              </View>

              {/* Tombol Deteksi Lokasi GPS Pelanggan */}
              <TouchableOpacity
                style={styles.modalGpsBtn}
                onPress={handleUseCurrentGps}
                disabled={isLocating}
                activeOpacity={0.8}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color="#236B38" style={{ marginRight: 6 }} />
                ) : null}
                <Text style={styles.modalGpsBtnText}>
                  {isLocating
                    ? 'Mendeteksi Posisi Anda...'
                    : 'Gunakan Posisi GPS Saat Ini'}
                </Text>
              </TouchableOpacity>

              {/* Form Input Detail Alamat */}
              <Text style={styles.modalFieldLabel}>Alamat Lengkap Penjemputan</Text>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 70 }]}
                value={addressText}
                onChangeText={setAddressText}
                multiline
                placeholder="Contoh: Jl. Melati No. 12, RT 01/RW 02, Kebayoran Baru, Jakarta Selatan"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.modalCoordsRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.modalFieldLabel}>Lintang (Latitude)</Text>
                  <Text style={styles.coordsValueBox}>{customerCoords.latitude.toFixed(6)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={styles.modalFieldLabel}>Bujur (Longitude)</Text>
                  <Text style={styles.coordsValueBox}>{customerCoords.longitude.toFixed(6)}</Text>
                </View>
              </View>

              {/* Status Jangkauan Layanan Geofence */}
              <View
                style={[
                  styles.geofenceCard,
                  geofenceStatus.isInside
                    ? styles.geofenceCardInside
                    : styles.geofenceCardOutside,
                ]}
              >
                <View style={styles.geofenceHeader}>
                  <Text
                    style={[
                      styles.geofenceTitle,
                      geofenceStatus.isInside
                        ? styles.geofenceTextInside
                        : styles.geofenceTextOutside,
                    ]}
                  >
                    {geofenceStatus.isInside
                      ? 'STATUS JANGKAUAN: DALAM AREA LAYANAN'
                      : 'STATUS JANGKAUAN: DILUAR AREA LAYANAN'}
                  </Text>
                  <View
                    style={[
                      styles.geofenceBadge,
                      geofenceStatus.isInside
                        ? styles.geofenceBadgeInside
                        : styles.geofenceBadgeOutside,
                    ]}
                  >
                    <Text
                      style={[
                        styles.geofenceBadgeText,
                        geofenceStatus.isInside
                          ? styles.geofenceTextInside
                          : styles.geofenceTextOutside,
                      ]}
                    >
                      {geofenceStatus.isInside ? 'TERJANGKAU' : 'DILUAR RADIUS'}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.geofenceDesc,
                    geofenceStatus.isInside
                      ? styles.geofenceTextInside
                      : styles.geofenceTextOutside,
                  ]}
                >
                  {geofenceStatus.message}
                </Text>
                <Text style={styles.geofenceDetail}>
                  Jarak dari outlet: {geofenceStatus.distanceKm} km (Batas jangkauan toko: {Math.round(geofenceRadius / 1000)} km)
                </Text>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.saveAddressBtn}
                onPress={handleSaveAddress}
                disabled={isSavingAddress}
                activeOpacity={0.85}
              >
                {isSavingAddress ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveAddressBtnText}>Simpan Alamat Saya</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelAddressBtn}
                onPress={() => setAddressModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelAddressBtnText}>Batal</Text>
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
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
  },
  modalCoordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coordsValueBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  geofenceCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  geofenceCardInside: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  geofenceCardOutside: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  geofenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  geofenceTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  geofenceTextInside: {
    color: '#065F46',
  },
  geofenceTextOutside: {
    color: '#991B1B',
  },
  geofenceBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  geofenceBadgeInside: {
    backgroundColor: '#D1FAE5',
  },
  geofenceBadgeOutside: {
    backgroundColor: '#FEE2E2',
  },
  geofenceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  geofenceDesc: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 2,
  },
  geofenceDetail: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  saveAddressBtn: {
    backgroundColor: '#236B38',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveAddressBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelAddressBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelAddressBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ProfileScreen;
