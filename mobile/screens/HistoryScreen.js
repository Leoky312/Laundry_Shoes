import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import api from '../services/api';

const FILTER_TABS = ['Semua', 'Diproses', 'Selesai', 'Dibatalkan'];

const HistoryScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      if (res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.log('Error fetching order history:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleCancelOrder = (orderId) => {
    const doCancel = async () => {
      try {
        setCancellingId(orderId);
        await api.delete(`/orders/${orderId}`);
        if (Platform.OS === 'web') {
          window.alert('Pesanan berhasil dibatalkan.');
        } else {
          Alert.alert('Sukses', 'Pesanan berhasil dibatalkan.');
        }
        fetchOrders();
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        if (Platform.OS === 'web') {
          window.alert(`Gagal membatalkan pesanan: ${errMsg}`);
        } else {
          Alert.alert('Gagal Membatalkan', errMsg);
        }
      } finally {
        setCancellingId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Pesanan yang dibatalkan tidak dapat dikembalikan. Yakin ingin membatalkan?')) {
        doCancel();
      }
    } else {
      Alert.alert(
        'Batalkan Pesanan?',
        'Pesanan yang dibatalkan tidak dapat dikembalikan. Yakin ingin membatalkan?',
        [
          { text: 'Tidak', style: 'cancel' },
          { text: 'Ya, Batalkan', style: 'destructive', onPress: doCancel },
        ]
      );
    }
  };

  const formatRupiah = (val) => {
    return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
  };

  const getFilteredOrders = () => {
    if (selectedFilter === 'Semua') return orders;
    if (selectedFilter === 'Diproses') {
      return orders.filter((o) =>
        ['MENUNGGU', 'DIPROSES', 'DICUCI', 'DRYING', 'FINISHING'].includes(o.status)
      );
    }
    if (selectedFilter === 'Selesai') {
      return orders.filter((o) => o.status === 'SELESAI');
    }
    if (selectedFilter === 'Dibatalkan') {
      return orders.filter((o) => o.status === 'DIBATALKAN');
    }
    return orders;
  };

  const renderBadge = (status) => {
    if (status === 'SELESAI') {
      return (
        <View style={[styles.badgePill, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.badgeText, { color: '#047857' }]}>Selesai</Text>
        </View>
      );
    }
    if (status === 'DIBATALKAN') {
      return (
        <View style={[styles.badgePill, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.badgeText, { color: '#B91C1C' }]}>Dibatalkan</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badgePill, { backgroundColor: '#FEF3C7' }]}>
        <Text style={[styles.badgeText, { color: '#B45309' }]}>
          {status === 'MENUNGGU' ? 'Menunggu' : 'Dalam Proses'}
        </Text>
      </View>
    );
  };

  const renderOrderItem = ({ item }) => {
    const firstItem = item.orderItems?.[0];
    const isCancelable = item.status === 'MENUNGGU' || item.status === 'DIPROSES';
    const isCancelling = cancellingId === item.id;

    return (
      <TouchableOpacity
        style={[styles.orderCard, isDesktop && styles.desktopOrderCard]}
        onPress={() =>
          navigation.navigate('OrderTracking', {
            orderId: item.id,
            orderNumber: item.orderNumber,
          })
        }
        activeOpacity={0.85}
      >
        <View style={styles.cardMainRow}>
          {/* Thumbnail */}
          <View style={styles.thumbnailBox}>
            <Image
              source={{
                uri:
                  firstItem?.service?.image ||
                  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=200&fit=crop',
              }}
              style={styles.thumbnailImg}
              resizeMode="cover"
            />
          </View>

          {/* Info Center */}
          <View style={styles.cardInfo}>
            <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
            <Text style={styles.orderDateService}>
              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}{' '}
              · {firstItem?.service?.name || 'Cuci Sepatu'}
            </Text>
            <Text style={styles.orderPrice}>{formatRupiah(item.totalAmount)}</Text>
          </View>

          {/* Badge Status */}
          <View style={styles.cardRightBadge}>{renderBadge(item.status)}</View>
        </View>

        {/* Action Buttons if MENUNGGU or DIPROSES */}
        {isCancelable && (
          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={(e) => {
                e.stopPropagation();
                handleCancelOrder(item.id);
              }}
              disabled={isCancelling}
              activeOpacity={0.7}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                  <Text style={styles.cancelBtnText}>Batalkan</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() =>
                navigation.navigate('OrderTracking', {
                  orderId: item.id,
                  orderNumber: item.orderNumber,
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={14} color="#236B38" />
              <Text style={styles.trackBtnText}>Lacak Pesanan</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.screen}>
      <View style={[styles.mainWrapper, isDesktop && styles.desktopMainWrapper]}>
        {/* Header */}
        <View style={[styles.topHeader, isDesktop && styles.desktopTopHeader]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#132A1B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Riwayat Pesanan</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTER_TABS}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterTabsList}
            renderItem={({ item }) => {
              const isActive = selectedFilter === item;
              return (
                <TouchableOpacity
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setSelectedFilter(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Orders List */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#236B38" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>Belum Ada Pesanan</Text>
                <Text style={styles.emptySub}>
                  Tidak ada pesanan di kategori ini. Buat pesanan baru sekarang!
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
  },
  desktopMainWrapper: {
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topHeader: {
    paddingTop: Platform.OS === 'web' ? 16 : 50,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  desktopTopHeader: {
    paddingHorizontal: 0,
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
  filterTabsContainer: {
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTabsList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterPillActive: {
    backgroundColor: '#236B38',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
  },
  desktopOrderCard: {
    padding: 18,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailBox: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    marginRight: 14,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#132A1B',
    marginBottom: 2,
  },
  orderDateService: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#132A1B',
  },
  cardRightBadge: {
    alignItems: 'flex-end',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
    gap: 4,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#236B38',
    backgroundColor: '#EAF5EC',
    gap: 4,
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#236B38',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#132A1B',
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default HistoryScreen;
