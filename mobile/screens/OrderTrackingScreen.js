import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/colors';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import api, { getImageUrl } from '../services/api';

const ORDER_STEPS = [
  { key: 'MENUNGGU', label: 'Menunggu' },
  { key: 'DIPROSES', label: 'Diproses' },
  { key: 'DICUCI', label: 'Dicuci' },
  { key: 'DRYING', label: 'Drying' },
  { key: 'FINISHING', label: 'Finishing' },
  { key: 'SELESAI', label: 'Selesai' },
];

const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderId, orderNumber } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      let res;
      if (orderId) {
        res = await api.get(`/orders/${orderId}`);
      } else if (orderNumber) {
        res = await api.get(`/tracking/${orderNumber}`);
      }
      if (res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.log('Error fetching tracking info:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
  };

  const uploadPaymentProof = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        setUploadingProof(true);

        const formData = new FormData();
        const uriParts = photo.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('paymentProof', {
          uri: photo.uri,
          name: `proof_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });

        await api.post(`/orders/${order.id}/payment`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        Alert.alert('Sukses', 'Bukti pembayaran berhasil diunggah!');
        fetchOrderDetails();
      }
    } catch (err) {
      Alert.alert('Gagal Upload Bukti', err.message);
    } finally {
      setUploadingProof(false);
    }
  };

  const getStepIndex = (currentStatus) => {
    return ORDER_STEPS.findIndex((s) => s.key === currentStatus);
  };

  const formatRupiah = (val) => {
    return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
  };

  if (loading && !order) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const currentStepIdx = getStepIndex(order?.status);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Status Pengerjaan</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Order Identifier Card */}
        <Card style={styles.orderSummaryCard}>
          <View style={styles.orderHeaderRow}>
            <View>
              <Text style={styles.orderNumberLabel}>Nomor Pesanan</Text>
              <Text style={styles.orderNumberValue}>{order?.orderNumber}</Text>
            </View>
            <Badge status={order?.status || 'MENUNGGU'} />
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Total Pembayaran</Text>
            <Text style={styles.metaValue}>{formatRupiah(order?.totalAmount)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status Bayar</Text>
            <Text
              style={[
                styles.metaValue,
                {
                  color:
                    order?.payment?.paymentStatus === 'SUDAH_DIBAYAR'
                      ? Colors.success
                      : Colors.warning,
                },
              ]}
            >
              {order?.payment?.paymentStatus === 'SUDAH_DIBAYAR' ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}
            </Text>
          </View>
        </Card>

        {/* Horizontal Status Progress Tracker */}
        <Text style={styles.sectionTitle}>Tahapan Perawatan</Text>
        <Card style={styles.trackerCard}>
          <View style={styles.trackerLineContainer}>
            {ORDER_STEPS.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <View key={step.key} style={styles.stepCol}>
                  <View
                    style={[
                      styles.stepDot,
                      isPastOrCurrent && styles.stepDotActive,
                      isCurrent && styles.stepDotCurrent,
                    ]}
                  >
                    {isPastOrCurrent ? (
                      <Ionicons name="checkmark" size={12} color={Colors.white} />
                    ) : (
                      <Text style={styles.stepNum}>{idx + 1}</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isPastOrCurrent && styles.stepLabelActive,
                      isCurrent && { fontWeight: '800', color: Colors.primary },
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Real-time Tracking History Log */}
        <Text style={styles.sectionTitle}>Riwayat Aktivitas Pengerjaan</Text>
        <Card style={styles.historyCard}>
          {order?.tracking && order.tracking.length > 0 ? (
            order.tracking.map((item, index) => (
              <View key={item.id || index} style={styles.logItem}>
                <View style={styles.logLeft}>
                  <View style={styles.logDot} />
                  {index < order.tracking.length - 1 && <View style={styles.logLine} />}
                </View>
                <View style={styles.logRight}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logStatus}>{item.status}</Text>
                    <Text style={styles.logTime}>
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.logDesc}>{item.description}</Text>
                  <Text style={styles.logBy}>Diperbarui oleh: {item.updatedBy || 'Tim Laundry'}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Belum ada riwayat update pengerjaan.</Text>
          )}
        </Card>

        {/* Gallery / Hasil Laundry (Before - Process - After) */}
        {order?.galleries && order.galleries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Dokumentasi Sepatu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
              {order.galleries.map((img) => (
                <View key={img.id} style={styles.galleryItem}>
                  <Image source={{ uri: getImageUrl(img.imageUrl) }} style={styles.galleryImg} />
                  <View style={styles.galleryCaptionBox}>
                    <Text style={styles.galleryBadge}>{img.type}</Text>
                    <Text style={styles.galleryCaption} numberOfLines={1}>{img.caption}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Upload Proof Button if Unpaid */}
        {order?.payment?.paymentStatus !== 'SUDAH_DIBAYAR' && (
          <Button
            title="Upload Bukti Pembayaran Transfer"
            onPress={uploadPaymentProof}
            loading={uploadingProof}
            icon={<Ionicons name="cloud-upload-outline" size={18} color={Colors.white} />}
            style={styles.proofBtn}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.secondary,
  },
  orderSummaryCard: {
    marginBottom: 24,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumberLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  orderNumberValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.secondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 12,
  },
  trackerCard: {
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  trackerLineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepCol: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDotCurrent: {
    borderWidth: 3,
    borderColor: '#93C5FD',
  },
  stepNum: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: Colors.secondary,
  },
  historyCard: {
    padding: 16,
    marginBottom: 24,
  },
  logItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logLeft: {
    width: 20,
    alignItems: 'center',
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  logLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  logRight: {
    flex: 1,
    marginLeft: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  logTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  logDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  logBy: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  galleryScroll: {
    marginBottom: 24,
  },
  galleryItem: {
    width: 140,
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  galleryImg: {
    width: '100%',
    height: 110,
  },
  galleryCaptionBox: {
    padding: 8,
  },
  galleryBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  galleryCaption: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  proofBtn: {
    marginBottom: 20,
  },
});

export default OrderTrackingScreen;
