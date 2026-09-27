import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Card from '../components/Card';
import Badge from '../components/Badge';
import api from '../services/api';

const HistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatRupiah = (val) => {
    return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
  };

  const renderOrderItem = ({ item }) => {
    const firstItem = item.orderItems?.[0];
    const itemCount = item.orderItems?.length || 1;

    return (
      <Card
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('OrderTracking', {
            orderId: item.id,
            orderNumber: item.orderNumber,
          })
        }
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <Badge status={item.status} />
        </View>

        <View style={styles.divider} />

        <View style={styles.itemDetail}>
          <View style={styles.shoeIconBox}>
            <Ionicons name="sparkles" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shoeName} numberOfLines={1}>
              {firstItem?.shoeBrand || 'Sepatu Sneakers'}
            </Text>
            <Text style={styles.serviceLabel}>
              {firstItem?.service?.name || 'Laundry Sepatu'}{' '}
              {itemCount > 1 ? `(+${itemCount - 1} lainnya)` : ''}
            </Text>
          </View>
          <Text style={styles.orderPrice}>{formatRupiah(item.totalAmount)}</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        <Text style={styles.headerSub}>Daftar seluruh pesanan cuci sepatu Anda</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>Belum Ada Pesanan</Text>
              <Text style={styles.emptySub}>
                Sepatu Anda masih kotor? Pilih layanan terbaik kami sekarang!
              </Text>
            </View>
          }
        />
      )}
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.secondary,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  orderDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  itemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shoeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoeName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  serviceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
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
    color: Colors.secondary,
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
});

export default HistoryScreen;
