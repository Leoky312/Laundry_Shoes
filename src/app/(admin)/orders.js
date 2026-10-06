import { useRouter, useLocalSearchParams } from 'expo-router';
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
  Platform,
  TextInput,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import api from '@/services/api';
import logoImg from '@/assets/logo.png';

const STATUS_FILTERS = [
  { key: 'SEMUA', label: 'Semua', icon: 'apps-outline' },
  { key: 'MENUNGGU', label: 'Menunggu', icon: 'time-outline' },
  { key: 'DIPROSES', label: 'Diproses', icon: 'sync-outline' },
  { key: 'DICUCI', label: 'Dicuci', icon: 'water-outline' },
  { key: 'DRYING', label: 'Drying', icon: 'sunny-outline' },
  { key: 'FINISHING', label: 'Finishing', icon: 'sparkles-outline' },
  { key: 'SELESAI', label: 'Selesai', icon: 'checkmark-circle-outline' },
  { key: 'DIBATALKAN', label: 'Dibatalkan', icon: 'close-circle-outline' },
];

const STATUS_OPTIONS = [
  { key: 'MENUNGGU', label: 'Menunggu', desc: 'Menunggu konfirmasi admin', color: '#D97706' },
  { key: 'DIPROSES', label: 'Diproses', desc: 'Pesanan diterima & dijadwalkan', color: '#2563EB' },
  { key: 'DICUCI', label: 'Dicuci', desc: 'Sepatu sedang dalam tahap pencucian', color: '#0284C7' },
  { key: 'DRYING', label: 'Drying', desc: 'Proses pengeringan suhu aman', color: '#EA580C' },
  { key: 'FINISHING', label: 'Finishing', desc: 'Treatment wangi, rekondisi & packing', color: '#7C3AED' },
  { key: 'SELESAI', label: 'Selesai', desc: 'Selesai & siap diambil/diantar', color: '#16A34A' },
  { key: 'DIBATALKAN', label: 'Dibatalkan', desc: 'Pesanan dibatalkan / gagal', color: '#DC2626' },
];

const ManageOrdersScreen = ({ route, navigation }) => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(route?.params?.initialFilter || 'SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status Change Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Handle route param changes
  useEffect(() => {
    if (route?.params?.initialFilter) {
      setSelectedFilter(route.params.initialFilter);
    }
  }, [route?.params?.initialFilter]);

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
      const msg = `Status pesanan #${activeOrder.orderNumber} berhasil diubah menjadi ${newStatus}`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Sukses', msg);
      }
      fetchOrders();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Gagal Update Status';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errMsg}`);
      } else {
        Alert.alert('Gagal Update Status', errMsg);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = (order) => {
    if (order.status !== 'DIBATALKAN') {
      const msg = 'Hanya pesanan yang sudah dibatalkan yang dapat dihapus.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Perhatian', msg);
      return;
    }

    const confirmMessage = `Apakah Anda yakin ingin menghapus pesanan #${order.orderNumber} yang telah dibatalkan ini secara permanen? Data pesanan akan dihapus dari database.`;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        executeDeleteOrder(order.id);
      }
    } else {
      Alert.alert(
        'Hapus Pesanan Dibatalkan',
        confirmMessage,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus Permanen',
            style: 'destructive',
            onPress: () => executeDeleteOrder(order.id),
          },
        ]
      );
    }
  };

  const executeDeleteOrder = async (orderId) => {
    try {
      setLoading(true);
      await api.delete(`/admin/orders/${orderId}`);
      const successMsg = 'Pesanan yang dibatalkan berhasil dihapus permanen.';
      if (Platform.OS === 'web') {
        window.alert(successMsg);
      } else {
        Alert.alert('Sukses', successMsg);
      }
      fetchOrders();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Gagal menghapus pesanan.';
      if (Platform.OS === 'web') {
        window.alert(`Gagal: ${errMsg}`);
      } else {
        Alert.alert('Gagal Hapus Pesanan', errMsg);
      }
    } finally {
      setLoading(false);
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

        Alert.alert('Sukses', 'Foto hasil laundry berhasil diunggah ke galeri pelanggan!');
        fetchOrders();
      }
    } catch (e) {
      Alert.alert('Gagal Upload Foto', e.message);
    }
  };

  const handleContactCustomer = (phone) => {
    if (!phone) {
      Alert.alert('Info', 'Nomor telepon pelanggan belum tersedia.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}`;
    Linking.openURL(waUrl).catch(() => {
      Linking.openURL(`tel:${phone}`);
    });
  };

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const orderNo = (order.orderNumber || '').toLowerCase();
    const custName = (order.user?.name || '').toLowerCase();
    const custPhone = (order.user?.phone || '').toLowerCase();
    const brand = (order.orderItems?.[0]?.shoeBrand || '').toLowerCase();
    const serviceName = (order.orderItems?.[0]?.service?.name || '').toLowerCase();
    return (
      orderNo.includes(query) ||
      custName.includes(query) ||
      custPhone.includes(query) ||
      brand.includes(query) ||
      serviceName.includes(query)
    );
  });

  const renderItem = ({ item }) => {
    const customer = item.user;
    const firstItem = item.orderItems?.[0];
    const isCancelled = item.status === 'DIBATALKAN';
    const isCompleted = item.status === 'SELESAI';
    const customerInitial = (customer?.name || 'C').charAt(0).toUpperCase();

    return (
      <View style={styles.orderCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.orderHeaderLeft}>
            <View style={styles.orderNumberBadge}>
              <Ionicons name="receipt-outline" size={13} color={Colors.primary} />
              <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
            </View>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Badge status={item.status} />
        </View>

        {/* Customer Information Row */}
        <View style={styles.customerBox}>
          <View style={styles.customerAvatarSmall}>
            <Text style={styles.customerAvatarText}>{customerInitial}</Text>
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{customer?.name || 'Pelanggan'}</Text>
            <Text style={styles.customerPhone}>{customer?.phone || 'No Telp Belum Diisi'}</Text>
          </View>
          {customer?.phone && (
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => handleContactCustomer(customer.phone)}
              activeOpacity={0.7}
              title="Hubungi Pelanggan"
            >
              <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
              <Text style={styles.contactBtnText}>Chat</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shoe & Service Details Box */}
        <View style={styles.serviceDetailBox}>
          <View style={styles.serviceTopRow}>
            <View style={styles.shoeBrandRow}>
              <Ionicons name="footsteps-outline" size={15} color={Colors.primary} />
              <Text style={styles.shoeBrandText}>{firstItem?.shoeBrand || 'Sepatu'}</Text>
            </View>
            <Text style={styles.priceHighlight}>{formatRupiah(item.totalAmount)}</Text>
          </View>

          <View style={styles.serviceTagRow}>
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>
                Treatment: {firstItem?.service?.name || 'Laundry Sepatu'}
              </Text>
            </View>
            {firstItem?.shoeColor && (
              <View style={styles.colorTag}>
                <Text style={styles.colorTagText}>{firstItem.shoeColor}</Text>
              </View>
            )}
          </View>

          {item.notes && (
            <View style={styles.notesRow}>
              <Ionicons name="chatbox-ellipses-outline" size={13} color="#6B7280" />
              <Text style={styles.notesText} numberOfLines={2}>
                "{item.notes}"
              </Text>
            </View>
          )}
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          {isCancelled ? (
            <>
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => {
                  setActiveOrder(item);
                  setModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={15} color={Colors.secondary} />
                <Text style={styles.actionBtnSecondaryText}>Ubah Status</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnDelete}
                onPress={() => handleDeleteOrder(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={15} color="#DC2626" />
                <Text style={styles.actionBtnDeleteText}>Hapus Pesanan</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => {
                  setActiveOrder(item);
                  setModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={15} color="#FFFFFF" />
                <Text style={styles.actionBtnPrimaryText}>Ubah Status</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtnPhoto}
                onPress={() => handleUploadResultPhoto(item.id)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={15} color={Colors.primary} />
                <Text style={styles.actionBtnPhotoText}>Upload Hasil</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainWrapper}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <Image source={logoImg} style={styles.logoSmall} resizeMode="contain" />
              <Text style={styles.brandSmall}>ShoeFresh</Text>
            </View>
            <View style={styles.orderCountPill}>
              <Text style={styles.orderCountText}>{filteredOrders.length} Pesanan</Text>
            </View>
          </View>
          <Text style={styles.title}>Kelola Pesanan</Text>
          <Text style={styles.subtitle}>Pantau antrian, perbarui progres, dan kelola order</Text>
        </View>

        {/* Live Search Input Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari #order, nama, nomor HP, jenis sepatu..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Status Filter Chips */}
        <View style={styles.filterScrollContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STATUS_FILTERS}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => {
              const isActive = selectedFilter === item.key;
              const isDeleteChip = item.key === 'DIBATALKAN';

              return (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                    isDeleteChip && !isActive && styles.filterChipDelete,
                  ]}
                  onPress={() => setSelectedFilter(item.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.icon}
                    size={14}
                    color={
                      isActive
                        ? '#FFFFFF'
                        : isDeleteChip
                        ? '#DC2626'
                        : '#52705B'
                    }
                  />
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                      isDeleteChip && !isActive && styles.filterTextDelete,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Orders List or Loader */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
            }
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="file-tray-outline" size={42} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyTitle}>Tidak ada pesanan ditemukan</Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? `Tidak ada data yang cocok dengan "${searchQuery}".`
                    : `Belum ada pesanan pada status "${selectedFilter}".`}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Modal Ubah Status */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Perbarui Status Pesanan</Text>
                <Text style={styles.modalOrderInfo}>#{activeOrder?.orderNumber}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Pilih tahapan pengerjaan laundry sepatu terkini:
            </Text>

            <View style={styles.statusButtonsContainer}>
              {STATUS_OPTIONS.map((st) => {
                const isCurrent = activeOrder?.status === st.key;

                return (
                  <TouchableOpacity
                    key={st.key}
                    style={[
                      styles.statusSelectBtn,
                      isCurrent && styles.statusSelectBtnActive,
                    ]}
                    onPress={() => handleUpdateStatus(st.key)}
                    disabled={updating}
                    activeOpacity={0.8}
                  >
                    <View style={styles.statusSelectLeft}>
                      <View
                        style={[
                          styles.statusDotLarge,
                          { backgroundColor: st.color },
                        ]}
                      />
                      <View>
                        <Text
                          style={[
                            styles.statusSelectTitle,
                            isCurrent && styles.statusSelectTitleActive,
                          ]}
                        >
                          {st.label}
                        </Text>
                        <Text style={styles.statusSelectDesc}>{st.desc}</Text>
                      </View>
                    </View>
                    {isCurrent && (
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
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
    backgroundColor: '#F8FAF8',
  },
  mainWrapper: {
    flex: 1,
    maxWidth: 850,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 45,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoSmall: {
    width: 22,
    height: 22,
  },
  brandSmall: {
    fontFamily: Platform.select({
      web: "'Poppins', 'Plus Jakarta Sans', sans-serif",
      default: undefined,
    }),
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  orderCountPill: {
    backgroundColor: '#EAF5EC',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C3E6CB',
  },
  orderCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#132A1B',
  },
  subtitle: {
    fontSize: 12,
    color: '#52705B',
    marginTop: 2,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#132A1B',
    padding: 0,
  },
  clearSearchBtn: {
    padding: 2,
  },
  filterScrollContainer: {
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipDelete: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#52705B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextDelete: {
    color: '#DC2626',
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    gap: 4,
  },
  orderNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.3,
  },
  orderDate: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  customerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    gap: 10,
    marginBottom: 12,
  },
  customerAvatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF5EC',
    borderWidth: 1,
    borderColor: '#C3E6CB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#132A1B',
  },
  customerPhone: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  contactBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  serviceDetailBox: {
    backgroundColor: '#F8FAF8',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  serviceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shoeBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shoeBrandText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#132A1B',
  },
  priceHighlight: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  serviceTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  serviceTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  colorTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  colorTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesText: {
    fontSize: 11,
    color: '#4B5563',
    fontStyle: 'italic',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnSecondaryText: {
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnPhoto: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF5EC',
    borderWidth: 1,
    borderColor: '#C3E6CB',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnPhotoText: {
    color: Colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnDelete: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnDeleteText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#132A1B',
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 260,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#132A1B',
  },
  modalOrderInfo: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
  },
  statusButtonsContainer: {
    gap: 8,
  },
  statusSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusSelectBtnActive: {
    backgroundColor: '#EAF5EC',
    borderColor: Colors.primary,
  },
  statusSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusSelectTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#132A1B',
  },
  statusSelectTitleActive: {
    color: Colors.primaryDark,
  },
  statusSelectDesc: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
});

export default ManageOrdersScreen;
