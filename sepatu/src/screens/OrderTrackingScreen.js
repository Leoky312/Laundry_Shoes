import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import api from '../services/api';
import ErrorState from '../components/ErrorState';
import PhotoPickerModal from '../components/PhotoPickerModal';

const TRACKING_STEPS = [
  { key: 'MENUNGGU', label: 'Pesanan Diterima' },
  { key: 'DICUCI', label: 'Sedang Dicuci' },
  { key: 'DRYING', label: 'Proses Pengeringan' },
  { key: 'FINISHING', label: 'Proses Finishing' },
  { key: 'SELESAI', label: 'Pesanan Selesai' },
];

const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderId, orderNumber } = route.params || {};
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Upload proof modal states
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const handleUploadPaymentProof = async (uri) => {
    try {
      setUploadingProof(true);
      const res = await api.post(`/orders/${order?.id}/payment-proof`, { proofUrl: uri });
      if (res?.data) {
        setOrder(res.data);
      }
      if (Platform.OS === 'web') {
        window.alert('Bukti pembayaran berhasil diunggah!');
      } else {
        Alert.alert('Sukses', 'Bukti pembayaran berhasil diunggah!');
      }
    } catch (err) {
      const msg = err.message || 'Gagal mengunggah bukti pembayaran.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Gagal Upload', msg);
      }
    } finally {
      setUploadingProof(false);
    }
  };

  const fetchOrderDetails = useCallback(async () => {
    try {
      setError(null);
      let res;
      if (orderId) {
        res = await api.get(`/orders/${orderId}`);
      } else if (orderNumber) {
        res = await api.get(`/tracking/${orderNumber}`);
      }
      if (res?.data) {
        setOrder(res.data);
      } else {
        setError('Data pelacakan pesanan tidak ditemukan.');
      }
    } catch (err) {
      console.log('Error fetching order details:', err.message);
      setError(err.message || 'Gagal memuat status pelacakan pesanan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId, orderNumber]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const onRefresh = () => {
    setLoading(true);
    setRefreshing(true);
    fetchOrderDetails();
  };

  const performCancel = async () => {
    try {
      setCancelLoading(true);
      await api.delete(`/orders/${order.id}`);
      if (Platform.OS === 'web') {
        window.alert('Pesanan kamu berhasil dibatalkan.');
        navigation.navigate('MainTabs', { screen: 'HistoryTab' });
      } else {
        Alert.alert('Pesanan Dibatalkan', 'Pesanan kamu berhasil dibatalkan.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs', { screen: 'HistoryTab' }),
          },
        ]);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      if (Platform.OS === 'web') {
        window.alert(`Gagal Membatalkan: ${errMsg}`);
      } else {
        Alert.alert('Gagal Membatalkan', errMsg);
      }
    } finally {
      setCancelLoading(false);
    }
  };

  const cancelOrder = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Pesanan yang dibatalkan tidak dapat dikembalikan. Yakin ingin membatalkan?')) {
        performCancel();
      }
    } else {
      Alert.alert(
        'Batalkan Pesanan?',
        'Pesanan yang dibatalkan tidak dapat dikembalikan. Yakin ingin membatalkan?',
        [
          { text: 'Tidak', style: 'cancel' },
          {
            text: 'Ya, Batalkan',
            style: 'destructive',
            onPress: performCancel,
          },
        ]
      );
    }
  };

  const formatRupiah = (val) => {
    return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
  };

  const getStepIndex = (status) => {
    if (status === 'MENUNGGU') return 0;
    if (status === 'DIPROSES' || status === 'DICUCI') return 1;
    if (status === 'DRYING') return 2;
    if (status === 'FINISHING') return 3;
    if (status === 'SELESAI') return 4;
    return -1;
  };

  if (loading && !order) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#236B38" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.screen, styles.centerContainer, { paddingHorizontal: 24 }]}>
        <ErrorState
          title="Pelacakan Tidak Ditemukan"
          message={error || 'Informasi pesanan tidak ditemukan.'}
          onRetry={fetchOrderDetails}
          retryText="Coba Lagi"
        />
        <TouchableOpacity
          style={{ marginTop: 12, paddingVertical: 8, paddingHorizontal: 16 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#236B38', fontWeight: '600', fontSize: 14 }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStep = getStepIndex(order?.status);
  const firstItem = order?.orderItems?.[0];
  const isCanceled = order?.status === 'DIBATALKAN';

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
            <Text style={styles.headerTitle}>Detail Pesanan</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Top Forest Green Card */}
          <View style={styles.topCard}>
            <View style={styles.topCardHeader}>
              <Text style={styles.topCardOrderNum}>
                Pesanan #{order?.orderNumber || 'SF123456'}
              </Text>
              <View style={styles.statusPill}>
                <Ionicons
                  name={isCanceled ? 'close-circle' : 'time'}
                  size={14}
                  color={isCanceled ? '#EF4444' : '#D97706'}
                />
                <Text
                  style={[
                    styles.statusPillText,
                    { color: isCanceled ? '#B91C1C' : '#B45309' },
                  ]}
                >
                  {isCanceled
                    ? 'Dibatalkan'
                    : order?.status === 'SELESAI'
                    ? 'Selesai'
                    : 'Dalam Proses'}
                </Text>
              </View>
            </View>

            <Text style={styles.topCardSubtitle}>
              {isCanceled
                ? 'Pesanan ini telah dibatalkan.'
                : order?.status === 'SELESAI'
                ? 'Sepatu kamu sudah bersih dan siap digunakan!'
                : 'Pesanan kamu sedang dicuci.'}
            </Text>
          </View>

          {/* Timeline Steps Card */}
          <View style={styles.timelineCard}>
            {TRACKING_STEPS.map((step, idx) => {
              const isCompleted = !isCanceled && currentStep >= idx;
              const isCurrent = !isCanceled && currentStep === idx;
              const isLast = idx === TRACKING_STEPS.length - 1;

              return (
                <View key={step.key} style={styles.timelineRow}>
                  {/* Left Dot and Line */}
                  <View style={styles.timelineLeftCol}>
                    <View
                      style={[
                        styles.stepDot,
                        isCompleted ? styles.stepDotDone : styles.stepDotPending,
                      ]}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : (
                        <View style={styles.stepDotInner} />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          isCompleted && currentStep > idx
                            ? styles.timelineLineDone
                            : styles.timelineLinePending,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Step Label */}
                  <View style={styles.timelineRightCol}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCompleted && styles.stepLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.stepDate}>
                        {new Date(order?.updatedAt || order?.createdAt || '2025-01-01').toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Hubungi Kami Button */}
          <TouchableOpacity
            style={styles.contactBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.alert('Layanan Customer Service Shoefresh:\nWhatsApp: 0812-3456-7890');
              } else {
                Alert.alert('Hubungi Kami', 'Customer Service: 0812-3456-7890');
              }
            }}
          >
            <Ionicons name="call-outline" size={18} color="#236B38" />
            <Text style={styles.contactBtnText}>Hubungi Kami</Text>
          </TouchableOpacity>

          {/* Section: Detail Pesanan Item Card */}
          <Text style={styles.sectionTitle}>Detail Pesanan</Text>
          <View style={styles.orderDetailCard}>
            <Image
              source={{
                uri:
                  firstItem?.service?.image ||
                  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=200&fit=crop',
              }}
              style={styles.orderDetailThumb}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.orderDetailName}>
                {firstItem?.service?.name || 'Cuci Sepatu'}
              </Text>
              <Text style={styles.orderDetailPrice}>
                {formatRupiah(firstItem?.service?.price || order?.totalAmount)}
              </Text>
            </View>
            <Text style={styles.orderDetailQty}>x{firstItem?.quantity || 1}</Text>
          </View>

          {/* Section: Dokumentasi Foto Sepatu (Kamera) */}
          {(order?.shoePhoto || order?.galleries?.[0]?.imageUrl) && (
            <>
              <Text style={styles.sectionTitle}>Foto Sepatu (Dokumentasi)</Text>
              <View style={styles.photoCard}>
                <Image
                  source={{ uri: order?.shoePhoto || order?.galleries?.[0]?.imageUrl }}
                  style={styles.shoePhotoImg}
                  resizeMode="cover"
                />
                <View style={styles.photoBadgeRow}>
                  <Ionicons name="camera" size={14} color="#236B38" />
                  <Text style={styles.photoBadgeText}>Kondisi Sepatu Sebelum Dicuci</Text>
                </View>
              </View>
            </>
          )}

          {/* Section: Bukti Pembayaran Transfer Bank */}
          {order?.payment?.paymentMethod === 'TRANSFER_BANK' && (
            <>
              <Text style={styles.sectionTitle}>Bukti Pembayaran Transfer</Text>
              <View style={styles.transferCard}>
                {order?.payment?.paymentProof ? (
                  <View>
                    <Image
                      source={{ uri: order.payment.paymentProof }}
                      style={styles.proofImg}
                      resizeMode="contain"
                    />
                    <View style={styles.proofStatusRow}>
                      <View style={styles.proofBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                        <Text style={styles.proofBadgeText}>
                          {order?.payment?.paymentStatus === 'SUDAH_DIBAYAR'
                            ? 'Pembayaran Terverifikasi'
                            : 'Menunggu Verifikasi Admin'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.reuploadBtn}
                        onPress={() => setUploadModalVisible(true)}
                        disabled={uploadingProof}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="camera-outline" size={14} color="#236B38" />
                        <Text style={styles.reuploadBtnText}>Foto Ulang</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadPromptBox}>
                    <View style={styles.bankInfoMini}>
                      <Text style={styles.bankNameMini}>Bank BCA: 816-092-8812</Text>
                      <Text style={styles.bankOwnerMini}>a/n ShoeFresh Laundry</Text>
                    </View>
                    <Text style={styles.uploadPromptDesc}>
                      Anda belum mengunggah bukti pembayaran. Gunakan kamera HP Anda untuk memotret struk transfer sekarang.
                    </Text>
                    <TouchableOpacity
                      style={styles.cameraActionBtn}
                      onPress={() => setUploadModalVisible(true)}
                      disabled={uploadingProof}
                      activeOpacity={0.85}
                    >
                      {uploadingProof ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="camera" size={18} color="#FFFFFF" />
                          <Text style={styles.cameraActionBtnText}>Foto Bukti Transfer Sekarang</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Batalkan Pesanan (if MENUNGGU or DIPROSES) */}
          {(order?.status === 'MENUNGGU' || order?.status === 'DIPROSES') && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={cancelOrder}
              disabled={cancelLoading}
              activeOpacity={0.8}
            >
              {cancelLoading ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                  <Text style={styles.cancelBtnText}>Batalkan Pesanan</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal Foto Sensor Kamera / Galeri */}
      <PhotoPickerModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onImageSelected={handleUploadPaymentProof}
        title="Foto Bukti Pembayaran Transfer"
        description="Gunakan kamera HP untuk memotret struk transfer atau pilih dari galeri."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  desktopScrollContent: {
    paddingVertical: 20,
  },
  mainContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  desktopContainer: {
    maxWidth: 780,
    alignSelf: 'center',
    paddingHorizontal: 30,
  },
  topHeader: {
    paddingTop: Platform.OS === 'web' ? 14 : 50,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
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
  topCard: {
    backgroundColor: '#236B38',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  topCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topCardOrderNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  topCardSubtitle: {
    fontSize: 13,
    color: '#D8F3DC',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 14,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepDotDone: {
    backgroundColor: '#236B38',
  },
  stepDotPending: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  timelineLineDone: {
    backgroundColor: '#236B38',
  },
  timelineLinePending: {
    backgroundColor: '#E5E7EB',
  },
  timelineRightCol: {
    flex: 1,
    paddingTop: 2,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepLabelActive: {
    color: '#132A1B',
    fontWeight: '700',
  },
  stepDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingVertical: 12,
    marginBottom: 24,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#236B38',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#132A1B',
    marginBottom: 12,
  },
  orderDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  orderDetailThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  orderDetailName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#132A1B',
    marginBottom: 4,
  },
  orderDetailPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#236B38',
  },
  orderDetailQty: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 16,
  },
  shoePhotoImg: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  photoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  photoBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#236B38',
  },
  transferCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 16,
  },
  proofImg: {
    width: '100%',
    height: 170,
    backgroundColor: '#F3F4F6',
  },
  proofStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  proofBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  proofBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  reuploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF5EC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  reuploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#236B38',
  },
  uploadPromptBox: {
    padding: 16,
    backgroundColor: '#FFFBEB',
  },
  bankInfoMini: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  bankNameMini: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  bankOwnerMini: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  uploadPromptDesc: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 14,
  },
  cameraActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D97706',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default OrderTrackingScreen;
