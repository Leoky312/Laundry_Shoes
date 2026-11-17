import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import PhotoPickerModal from '../components/PhotoPickerModal';
import RouteMapView from '../components/RouteMapView';
import {
  OUTLET_LOCATION,
  DEFAULT_CUSTOMER_LOCATION,
  calculateDeliveryFee,
  GEOFENCE_CONFIG,
  loadStoredOutletLocation,
  subscribeOutletLocation,
} from '../constants/location';
import {
  getRoadRoute,
  checkGeofenceStatus,
  reverseGeocodeCoords,
} from '../services/routing';

const BookingScreen = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const { cart, getSubtotal, clearCart } = useCart();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [address, setAddress] = useState(
    user?.address || 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan'
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [shoeBrand, setShoeBrand] = useState('Nike Air Jordan 1');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('DANA'); // 'DANA' | 'TRANSFER_BANK' | 'COD'
  const [loading, setLoading] = useState(false);

  // Map & Route states
  const [outletCoords, setOutletCoords] = useState(OUTLET_LOCATION);
  const [geofenceRadius, setGeofenceRadius] = useState(GEOFENCE_CONFIG.RADIUS_METERS);
  const [customerCoords, setCustomerCoords] = useState(() => {
    if (user?.latitude && user?.longitude) {
      return { latitude: user.latitude, longitude: user.longitude };
    }
    return DEFAULT_CUSTOMER_LOCATION;
  });
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Target 2 & 3: Geofence status state
  const [geofenceResult, setGeofenceResult] = useState(() =>
    checkGeofenceStatus(
      user?.latitude && user?.longitude
        ? { latitude: user.latitude, longitude: user.longitude }
        : DEFAULT_CUSTOMER_LOCATION,
      OUTLET_LOCATION,
      GEOFENCE_CONFIG.RADIUS_METERS
    )
  );

  // Sinkronisasi profil user jika telah memiliki alamat/titik tersimpan
  useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }
    if (user?.latitude && user?.longitude) {
      setCustomerCoords({ latitude: user.latitude, longitude: user.longitude });
    }
  }, [user]);

  // Sinkronisasi outlet dinamis saat load dan saat admin mengubah titik
  useEffect(() => {
    loadStoredOutletLocation().then((loc) => {
      setOutletCoords({ ...loc });
      setGeofenceRadius(GEOFENCE_CONFIG.RADIUS_METERS);
      setGeofenceResult(
        checkGeofenceStatus(customerCoords, loc, GEOFENCE_CONFIG.RADIUS_METERS)
      );
    });

    const unsubscribe = subscribeOutletLocation((newLoc, radius) => {
      setOutletCoords({ ...newLoc });
      setGeofenceRadius(radius);
      setGeofenceResult(
        checkGeofenceStatus(customerCoords, newLoc, radius)
      );
    });
    return unsubscribe;
  }, [customerCoords]);

  // Photo sensor states
  const [shoePhoto, setShoePhoto] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoTarget, setPhotoTarget] = useState('shoe'); // 'shoe' | 'payment'

  // Hitung jarak dan ongkos kirim dinamis
  const distanceKm = routeData?.distanceKm || 2;
  const deliveryFee = calculateDeliveryFee(distanceKm);
  const subtotal = getSubtotal();
  const grandTotal = subtotal + deliveryFee;

  useEffect(() => {
    let isMounted = true;
    const loadRoute = async () => {
      setRouteLoading(true);
      try {
        const result = await getRoadRoute(outletCoords, customerCoords);
        if (isMounted) setRouteData(result);
      } catch (err) {
        console.warn('Gagal memuat rute jalan:', err);
      } finally {
        if (isMounted) setRouteLoading(false);
      }
    };
    loadRoute();
    return () => {
      isMounted = false;
    };
  }, [customerCoords, outletCoords]);

  const handleUseCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const msg =
          'Izin akses lokasi tidak diizinkan. Anda tetap dapat menggeser penanda pada peta untuk menentukan titik jemput.';
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

      // Target 1: Alamat diperoleh dari koordinat (Reverse Geocoding)
      const fullAddress = await reverseGeocodeCoords(newCoords);
      if (fullAddress) {
        setAddress(fullAddress);
      }

      // Target 3: Event deteksi masuk/keluar area aktif saat tombol lokasi ditekan
      const geoStatus = checkGeofenceStatus(
        newCoords,
        outletCoords,
        geofenceRadius
      );
      setGeofenceResult(geoStatus);

      // Target 4: Feedback dialog/notifikasi formal (Cross-Platform Mobile & Web)
      const feedbackTitle = 'Informasi Jangkauan Layanan';
      const feedbackMsg = geoStatus.isInside
        ? 'Anda berada di dalam area jangkauan layanan laundry.'
        : 'Lokasi Anda berada di luar area jangkauan layanan.';

      if (Platform.OS === 'web') {
        window.alert(feedbackTitle + ':\n' + feedbackMsg);
      } else {
        Alert.alert(feedbackTitle, feedbackMsg);
      }
    } catch (err) {
      console.log('Location error:', err?.message);
      const msg = 'Gagal mendeteksi koordinat saat ini. Silakan ketuk titik langsung pada peta.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Informasi Lokasi', msg);
    } finally {
      setIsLocating(false);
    }
  };

  const handleLocationChange = async (coords) => {
    setCustomerCoords(coords);

    // Target 3: Event deteksi masuk/keluar area aktif saat penanda digeser
    const geoStatus = checkGeofenceStatus(
      coords,
      outletCoords,
      geofenceRadius
    );
    setGeofenceResult(geoStatus);

    // Target 1: Alamat diperoleh dari pergeseran koordinat (Reverse Geocoding)
    try {
      const fullAddress = await reverseGeocodeCoords(coords);
      if (fullAddress) {
        setAddress(fullAddress);
      }
    } catch (_e) {
      // ignore
    }
  };

  const formatRupiah = (val) => {
        return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
      };

      const openCameraPicker = (target) => {
        setPhotoTarget(target);
        setPhotoModalVisible(true);
      };

      const handleImageSelected = (uri) => {
        if (photoTarget === 'shoe') {
          setShoePhoto(uri);
        } else {
          setPaymentProof(uri);
        }
      };

      const handleBooking = async () => {
        if (cart.length === 0) {
          if (Platform.OS === 'web') {
            window.alert('Keranjang kosong!');
          } else {
            Alert.alert('Gagal', 'Keranjang kosong!');
          }
          return;
        }

        // Target 4: Konfirmasi formal jika lokasi berada di luar batas geofence
        if (!geofenceResult.isInside) {
          const confirmMsg =
            'Konfirmasi Jangkauan Layanan:\n\nLokasi Anda berada di luar area jangkauan layanan standar (5 km). Jarak penjemputan adalah ' +
            geofenceResult.distanceKm +
            ' km.\n\nApakah Anda ingin tetap melanjutkan pemesanan?';

          let proceed = false;
          if (Platform.OS === 'web') {
            proceed = window.confirm(confirmMsg);
          } else {
            proceed = await new Promise((resolve) => {
              Alert.alert(
                'Konfirmasi Jangkauan Layanan',
                'Lokasi Anda berada di luar area jangkauan layanan standar (5 km). Jarak penjemputan adalah ' +
                geofenceResult.distanceKm +
                ' km. Apakah Anda ingin tetap melanjutkan pemesanan?',
                [
                  { text: 'Batal', style: 'cancel', onPress: () => resolve(false) },
                  { text: 'Lanjutkan', onPress: () => resolve(true) },
                ]
              );
            });
          }
          if (!proceed) return;
        }

        try {
          setLoading(true);

          const items = cart.map((c) => ({
            serviceId: c.service.id,
            shoeBrand: shoeBrand || 'Sneakers',
            shoeColor: 'Bebas',
            shoeSize: '42',
            notes: notes,
            quantity: c.quantity,
          }));

          const formData = new FormData();
          formData.append('items', JSON.stringify(items));
          formData.append('paymentMethod', paymentMethod);
          formData.append('notes', notes);
          formData.append('shoeBrand', shoeBrand || 'Sneakers');
          formData.append('pickupDate', new Date(Date.now() + 86400000).toISOString());
          formData.append('address', address);
          formData.append('pickupAddress', address);
          formData.append('pickupLatitude', String(customerCoords.latitude));
          formData.append('pickupLongitude', String(customerCoords.longitude));
          formData.append('distanceKm', String(distanceKm));
          formData.append('deliveryFee', String(deliveryFee));
          if (user?.id) {
            formData.append('userId', String(user.id));
          }

          if (shoePhoto) {
            formData.append('shoePhoto', shoePhoto);
          }
          if (paymentProof) {
            formData.append('paymentProof', paymentProof);
          }

          const res = await api.post('/orders', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (res.data) {
            clearCart();
            if (user?.id && (!user.address || !user.latitude)) {
              updateProfile({
                address: address,
                latitude: customerCoords.latitude,
                longitude: customerCoords.longitude,
              }).catch(() => {});
            }
            navigation.navigate('MainTabs', { screen: 'HistoryTab' });
          }
        } catch (error) {
          const errMsg = error.response?.data?.message || error.message;
          if (Platform.OS === 'web') {
            window.alert(`Gagal Membuat Pesanan: ${errMsg}`);
          } else {
            Alert.alert('Gagal Membuat Pesanan', errMsg);
          }
        } finally {
          setLoading(false);
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
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back" size={22} color="#132A1B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Section 1: Alamat Pengiriman & Peta Jalan */}
              <Text style={styles.sectionTitle}>Alamat & Lokasi Penjemputan</Text>
              <View style={styles.addressCard}>
                <View style={styles.addressIconBox}>
                  <Ionicons name="location" size={22} color="#236B38" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.addressNameRow}>
                    <Text style={styles.addressName}>{user?.name || 'Pelanggan'}</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setIsEditingAddress(!isEditingAddress)}
                    >
                      <Text style={styles.ubahLink}>
                        {isEditingAddress ? 'Simpan' : 'Ubah Teks'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {isEditingAddress ? (
                    <TextInput
                      style={styles.addressTextInput}
                      value={address}
                      onChangeText={setAddress}
                      multiline
                      placeholder="Ketik alamat penjemputan lengkap..."
                    />
                  ) : (
                    <Text style={styles.addressText}>{address}</Text>
                  )}
                </View>
              </View>

              {/* Tombol Deteksi Lokasi GPS */}
              <TouchableOpacity
                style={styles.locationGpsBtn}
                onPress={handleUseCurrentLocation}
                disabled={isLocating}
                activeOpacity={0.8}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color="#236B38" style={{ marginRight: 6 }} />
                ) : null}
                <Text style={styles.locationGpsBtnText}>
                  {isLocating ? 'Mendeteksi Posisi...' : 'Gunakan Lokasi Saat Ini'}
                </Text>
              </TouchableOpacity>

              {/* Peta Rute Jalan Raya (OSRM + Leaflet + OpenStreetMap) */}
              <View style={styles.mapWrapper}>
                <RouteMapView
                  customerLocation={customerCoords}
                  outletLocation={outletCoords}
                  routeCoordinates={routeData?.coordinates || []}
                  isDraggable={true}
                  onLocationChange={handleLocationChange}
                  distanceKm={distanceKm}
                  durationMinutes={routeData?.durationMinutes}
                  isLoading={routeLoading}
                  height={250}
                  showGeofence={true}
                  geofenceRadiusMeters={geofenceRadius}
                />
              </View>

              {/* Target 4: Banner Feedback Informasi Geofence */}
              <View
                style={[
                  styles.geofenceBanner,
                  geofenceResult.isInside
                    ? styles.geofenceBannerInside
                    : styles.geofenceBannerOutside,
                ]}
              >
                <View style={styles.geofenceBannerHeader}>
                  <Text
                    style={[
                      styles.geofenceBannerTitle,
                      geofenceResult.isInside
                        ? styles.geofenceTextInside
                        : styles.geofenceTextOutside,
                    ]}
                  >
                    {geofenceResult.isInside
                      ? 'STATUS JANGKAUAN: DALAM AREA LAYANAN'
                      : 'STATUS JANGKAUAN: DILUAR AREA LAYANAN'}
                  </Text>
                  <View
                    style={[
                      styles.geofenceBadge,
                      geofenceResult.isInside
                        ? styles.geofenceBadgeInside
                        : styles.geofenceBadgeOutside,
                    ]}
                  >
                    <Text
                      style={[
                        styles.geofenceBadgeText,
                        geofenceResult.isInside
                          ? styles.geofenceTextInside
                          : styles.geofenceTextOutside,
                      ]}
                    >
                      {geofenceResult.isInside ? 'TERJANGKAU' : 'DILUAR RADIUS'}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.geofenceBannerDesc,
                    geofenceResult.isInside
                      ? styles.geofenceTextInside
                      : styles.geofenceTextOutside,
                  ]}
                >
                  {geofenceResult.message}
                </Text>
                <Text style={styles.geofenceBannerDetail}>
                  Jarak penjemputan: {geofenceResult.distanceKm} km (Batas radius: {Math.round(geofenceRadius / 1000)} km)
                </Text>
              </View>

              {/* Section 2: Info & Foto Sepatu yang Akan Dicuci */}
              <Text style={styles.sectionTitle}>Dokumentasi Sepatu</Text>
              <View style={styles.cardContainer}>
                <Text style={styles.inputSubLabel}>Merk & Model Sepatu</Text>
                <TextInput
                  style={styles.textInputField}
                  placeholder="Contoh: Nike Air Jordan 1 / Adidas Samba"
                  placeholderTextColor="#9CA3AF"
                  value={shoeBrand}
                  onChangeText={setShoeBrand}
                />

                <Text style={[styles.inputSubLabel, { marginTop: 14 }]}>
                  Foto Kondisi Sepatu (Gunakan Kamera)
                </Text>
                <Text style={styles.fieldHint}>
                  Potret sepatu Anda dengan kamera untuk mencatat kondisi awal (noda/sol) sebelum dicuci.
                </Text>

                {shoePhoto ? (
                  <View style={styles.photoPreviewWrapper}>
                    <Image source={{ uri: shoePhoto }} style={styles.photoPreviewImg} resizeMode="cover" />
                    <View style={styles.photoActionRow}>
                      <View style={styles.attachedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                        <Text style={styles.attachedBadgeText}>Foto Terlampir</Text>
                      </View>
                      <View style={styles.photoBtnGroup}>
                        <TouchableOpacity
                          style={styles.retakeBtn}
                          onPress={() => openCameraPicker('shoe')}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="camera-outline" size={14} color="#236B38" />
                          <Text style={styles.retakeBtnText}>Foto Ulang</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deletePhotoBtn}
                          onPress={() => setShoePhoto(null)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="trash-outline" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.dashedPhotoBox}
                    onPress={() => openCameraPicker('shoe')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cameraIconCircle}>
                      <Ionicons name="camera" size={24} color="#236B38" />
                    </View>
                    <Text style={styles.dashedBoxTitle}>Ambil Foto Sepatu dengan Kamera</Text>
                    <Text style={styles.dashedBoxSub}>Ketuk untuk buka kamera ponsel atau galeri</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Section 3: Pilih Metode Pembayaran */}
              <Text style={styles.sectionTitle}>Pilih Metode Pembayaran</Text>
              <View style={styles.paymentMethodsCard}>
                {/* DANA */}
                <TouchableOpacity
                  style={[styles.paymentRow, paymentMethod === 'DANA' && styles.paymentRowActive]}
                  onPress={() => setPaymentMethod('DANA')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentLeft}>
                    <View style={[styles.paymentIconBox, { backgroundColor: '#E0F2FE' }]}>
                      <Ionicons name="wallet-outline" size={20} color="#0284C7" />
                    </View>
                    <Text style={styles.paymentLabel}>DANA</Text>
                  </View>
                  <View style={[styles.radioCircle, paymentMethod === 'DANA' && styles.radioActive]}>
                    {paymentMethod === 'DANA' && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>

                {/* Transfer Bank */}
                <TouchableOpacity
                  style={[styles.paymentRow, paymentMethod === 'TRANSFER_BANK' && styles.paymentRowActive]}
                  onPress={() => setPaymentMethod('TRANSFER_BANK')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentLeft}>
                    <View style={[styles.paymentIconBox, { backgroundColor: '#F3F4F6' }]}>
                      <Ionicons name="business-outline" size={20} color="#374151" />
                    </View>
                    <Text style={styles.paymentLabel}>Transfer Bank</Text>
                  </View>
                  <View style={[styles.radioCircle, paymentMethod === 'TRANSFER_BANK' && styles.radioActive]}>
                    {paymentMethod === 'TRANSFER_BANK' && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>

                {/* COD */}
                <TouchableOpacity
                  style={[styles.paymentRow, paymentMethod === 'COD' && styles.paymentRowActive]}
                  onPress={() => setPaymentMethod('COD')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentLeft}>
                    <View style={[styles.paymentIconBox, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="cash-outline" size={20} color="#D97706" />
                    </View>
                    <Text style={styles.paymentLabel}>COD (Bayar di Tempat)</Text>
                  </View>
                  <View style={[styles.radioCircle, paymentMethod === 'COD' && styles.radioActive]}>
                    {paymentMethod === 'COD' && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Sub-Card: Detail Transfer Bank & Bukti Transfer jika memilih TRANSFER_BANK */}
              {paymentMethod === 'TRANSFER_BANK' && (
                <View style={styles.bankTransferSection}>
                  <View style={styles.bankHeaderRow}>
                    <View style={styles.bankBadge}>
                      <Text style={styles.bankBadgeText}>BCA</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bankTitle}>Bank Central Asia (BCA)</Text>
                      <Text style={styles.bankNumber}>816-092-8812</Text>
                      <Text style={styles.bankOwner}>a/n ShoeFresh Laundry Indonesia</Text>
                    </View>
                  </View>

                  <View style={styles.bankDivider} />

                  <Text style={styles.proofSectionTitle}>Foto Bukti Transfer Bank</Text>
                  <Text style={styles.proofSectionDesc}>
                    Gunakan kamera HP untuk memotret struk ATM / tangkapan layar m-banking.
                  </Text>

                  {paymentProof ? (
                    <View style={styles.photoPreviewWrapper}>
                      <Image source={{ uri: paymentProof }} style={styles.proofPreviewImg} resizeMode="contain" />
                      <View style={styles.photoActionRow}>
                        <View style={styles.attachedBadge}>
                          <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                          <Text style={styles.attachedBadgeText}>Struk Terlampir</Text>
                        </View>
                        <View style={styles.photoBtnGroup}>
                          <TouchableOpacity
                            style={styles.retakeBtn}
                            onPress={() => openCameraPicker('payment')}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="camera-outline" size={14} color="#236B38" />
                            <Text style={styles.retakeBtnText}>Ganti</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deletePhotoBtn}
                            onPress={() => setPaymentProof(null)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="trash-outline" size={14} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.dashedPhotoBox, { backgroundColor: '#F0FDF4' }]}
                      onPress={() => openCameraPicker('payment')}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.cameraIconCircle, { backgroundColor: '#DCFCE7' }]}>
                        <Ionicons name="camera" size={24} color="#16A34A" />
                      </View>
                      <Text style={styles.dashedBoxTitle}>Foto Bukti Transfer dengan Kamera</Text>
                      <Text style={styles.dashedBoxSub}>Jepret struk ATM atau upload gambar m-banking</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Section 4: Catatan (Opsional) */}
              <Text style={styles.sectionTitle}>Catatan (Opsional)</Text>
              <View style={styles.notesCard}>
                <TextInput
                  placeholder="Contoh: Sepatu warna putih, tolong hati-hati"
                  placeholderTextColor="#9CA3AF"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  style={styles.notesInput}
                />
              </View>

              {/* Section 5: Ringkasan Biaya */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryVal}>{formatRupiah(subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ongkir ({distanceKm} km)</Text>
                  <Text style={styles.summaryVal}>{formatRupiah(deliveryFee)}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalVal}>{formatRupiah(grandTotal)}</Text>
                </View>
              </View>

              {/* Action Button */}
              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleBooking}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Pesan Sekarang</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Modal Foto Sensor Kamera / Galeri */}
          <PhotoPickerModal
            visible={photoModalVisible}
            onClose={() => setPhotoModalVisible(false)}
            onImageSelected={handleImageSelected}
            title={
              photoTarget === 'shoe'
                ? 'Foto Sepatu yang Akan Dicuci'
                : 'Foto Bukti Pembayaran Transfer'
            }
            description={
              photoTarget === 'shoe'
                ? 'Potret kondisi fisik sepatu Anda sebelum dicuci untuk dokumentasi.'
                : 'Potret struk transfer ATM atau tangkapan layar m-banking.'
            }
          />
    </View>
  );
};

const styles = StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
      },
      scrollContent: {
        paddingBottom: 40,
      },
      desktopScrollContent: {
        paddingVertical: 30,
      },
      mainContainer: {
        width: '100%',
        paddingHorizontal: 20,
      },
      desktopContainer: {
        maxWidth: 760,
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
      sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#132A1B',
        marginBottom: 10,
        marginTop: 18,
      },
      addressCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        gap: 12,
      },
      addressIconBox: {
        marginTop: 2,
      },
      addressNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
      },
      addressName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#132A1B',
      },
      ubahLink: {
        fontSize: 13,
        fontWeight: '700',
        color: '#236B38',
      },
      addressText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
      },
      addressTextInput: {
        fontSize: 13,
        color: '#132A1B',
        borderWidth: 1,
        borderColor: '#C3E6CB',
        borderRadius: 8,
        padding: 8,
        backgroundColor: '#F8FAF8',
        marginTop: 4,
      },
      locationGpsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EAF5EC',
        borderWidth: 1,
        borderColor: '#A3D9B1',
        borderRadius: 10,
        paddingVertical: 10,
        marginTop: 10,
      },
      locationGpsBtnText: {
        color: '#1B5E20',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.2,
      },
      mapWrapper: {
        marginTop: 12,
        borderRadius: 14,
        overflow: 'hidden',
      },
      paymentMethodsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
      },
      paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      },
      paymentRowActive: {
        backgroundColor: '#F8FAF9',
      },
      paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
      paymentIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      paymentLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
      },
      radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
      },
      radioActive: {
        borderColor: '#236B38',
      },
      radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#236B38',
      },
      notesCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 14,
      },
      notesInput: {
        fontSize: 13,
        color: '#1F2937',
        minHeight: 60,
        textAlignVertical: 'top',
      },
      summaryCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        marginTop: 20,
      },
      summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 4,
      },
      summaryLabel: {
        fontSize: 13,
        color: '#6B7280',
      },
      summaryVal: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
      },
      summaryDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 10,
      },
      totalLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: '#132A1B',
      },
      totalVal: {
        fontSize: 16,
        fontWeight: '800',
        color: '#236B38',
      },
      buttonWrapper: {
        marginTop: 24,
      },
      submitBtn: {
        backgroundColor: '#236B38',
        borderRadius: 28,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
      },
      submitBtnText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
      },
      cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
      },
      inputSubLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 6,
      },
      textInputField: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 13,
        color: '#111827',
      },
      fieldHint: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 18,
      },
      dashedPhotoBox: {
        borderWidth: 1.5,
        borderColor: '#86EFAC',
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: '#F0FDF4',
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
      },
      cameraIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
      },
      dashedBoxTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#132A1B',
        marginBottom: 4,
      },
      dashedBoxSub: {
        fontSize: 12,
        color: '#4B5563',
      },
      photoPreviewWrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
      },
      photoPreviewImg: {
        width: '100%',
        height: 180,
      },
      proofPreviewImg: {
        width: '100%',
        height: 160,
        backgroundColor: '#F3F4F6',
      },
      photoActionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
      },
      attachedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#DCFCE7',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
      },
      attachedBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#15803D',
      },
      photoBtnGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      },
      retakeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#EAF5EC',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
      },
      retakeBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#236B38',
      },
      deletePhotoBtn: {
        backgroundColor: '#FEE2E2',
        padding: 6,
        borderRadius: 12,
      },
      bankTransferSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        marginTop: 12,
      },
      bankHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
      bankBadge: {
        backgroundColor: '#1E40AF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
      },
      bankBadgeText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 0.5,
      },
      bankTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
      },
      bankNumber: {
        fontSize: 16,
        fontWeight: '800',
        color: '#236B38',
        marginTop: 2,
        letterSpacing: 0.5,
      },
      bankOwner: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 1,
      },
      bankDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 14,
      },
      proofSectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
      },
      proofSectionDesc: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 18,
      },
      geofenceBanner: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        marginTop: 10,
        marginBottom: 6,
      },
      geofenceBannerInside: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
      },
      geofenceBannerOutside: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
      },
      geofenceBannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
      },
      geofenceBannerTitle: {
        fontSize: 12,
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
        paddingHorizontal: 8,
        paddingVertical: 3,
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
        letterSpacing: 0.5,
      },
      geofenceBannerDesc: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
        marginBottom: 4,
      },
      geofenceBannerDetail: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
  },
});

export default BookingScreen;
