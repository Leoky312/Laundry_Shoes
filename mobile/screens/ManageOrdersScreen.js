import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/colors';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import api from '../services/api';

const STATUS_FILTERS = ['SEMUA', 'MENUNGGU', 'DIPROSES', 'DICUCI', 'DRYING', 'FINISHING', 'SELESAI'];

const ManageOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('SEMUA');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status Change Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [selectedFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url =
        selectedFilter === 'SEMUA'
          ? '/admin/orders'
          : `/admin/orders?status=${selectedFilter}`;
      const res = await api.get(url);
      if (res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.log('Error admin orders:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatRupiah = (val) => {
    return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeOrder) return;
    try {
      setUpdating(true);
      await api.patch(`/admin/orders/${activeOrder.id}/status`, {
        status: newStatus,
      });
      setModalVisible(false);
      Alert.alert('Sukses', `Status berhasil diubah menjadi ${newStatus}`);
      fetchOrders();
    } catch (err) {
      Alert.alert('Gagal Update Status', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadResultPhoto = async (orderId) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        const formData = new FormData();
        const uriParts = photo.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('image', {
          uri: photo.uri,
          name: `result_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
        formData.append('type', 'SESUDAH');
        formData.append('caption', 'Foto hasil akhir laundry sepatu');

        await api.post(`/admin/orders/${orderId}/gallery`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        Alert.alert('Sukses', 'Foto hasil laundry berhasil diunggah ke galeri!');
        fetchOrders();
      }
    } catch (e) {
      Alert.alert('Gagal Upload Foto', e.message);
    }
  };

  const renderItem = ({ item }) => {
    const customer = item.user;
    const firstItem = item.orderItems?.[0];

    return (
      <Card style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.customerName}>
              {customer?.name} ({customer?.phone || 'No Telp -'})
            </Text>
          </View>
          <Badge status={item.status} />
        </View>

        <View style={styles.divider} />

        <View style={styles.itemRow}>
          <Text style={styles.shoeBrand}>{firstItem?.shoeBrand || 'Sepatu'}</Text>
          <Text style={styles.priceText}>{formatRupiah(item.totalAmount)}</Text>
        </View>
        <Text style={styles.treatmentName}>
          Treatment: {firstItem?.service?.name || '-'}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtnChangeStatus}
            onPress={() => {
              setActiveOrder(item);
              setModalVisible(true);
            }}
          >
            <Ionicons name="create-outline" size={16} color={Colors.white} />
            <Text style={styles.actionBtnText}>Ubah Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnPhoto}
            onPress={() => handleUploadResultPhoto(item.id)}
          >
            <Ionicons name="camera-outline" size={16} color={Colors.secondary} />
            <Text style={styles.actionBtnPhotoText}>Upload Hasil</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manajemen Pesanan</Text>
        <Text style={styles.subtitle}>Pantau & update status pengerjaan seluruh pesanan</Text>
      </View>

      {/* Horizontal Filter Tabs */}
      <View style={styles.filterScrollContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Tidak ada pesanan pada status ini.</Text>
            </View>
          }
        />
      )}

      {/* Modal Ubah Status */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ubah Status Pesanan</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalOrderInfo}>{activeOrder?.orderNumber}</Text>

            <View style={styles.statusButtonsContainer}>
              {['MENUNGGU', 'DIPROSES', 'DICUCI', 'DRYING', 'FINISHING', 'SELESAI', 'DIBATALKAN'].map(
                (st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusSelectBtn,
                      activeOrder?.status === st && styles.statusSelectBtnActive,
                    ]}
                    onPress={() => handleUpdateStatus(st)}
                    disabled={updating}
                  >
                    <Text
                      style={[
                        styles.statusSelectText,
                        activeOrder?.status === st && styles.statusSelectTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  filterScrollContainer: {
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  filterTextActive: {
    color: Colors.white,
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  orderCard: {
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.secondary,
  },
  customerName: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shoeBrand: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  treatmentName: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtnChangeStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnPhoto: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnPhotoText: {
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: Colors.textMuted,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.secondary,
  },
  modalOrderInfo: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 16,
  },
  statusButtonsContainer: {
    gap: 8,
  },
  statusSelectBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statusSelectBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  statusSelectText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  statusSelectTextActive: {
    color: Colors.primaryDark,
  },
});

export default ManageOrdersScreen;
