import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Theme from '../../constants/theme';
import GlobalStyles from '../../constants/styles';
import { ORDERS_DATA, Order } from '../../constants/data';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBadge from '../../components/StatusBadge';

const FILTER_TABS = ['Semua', 'Diproses', 'Selesai', 'Dibatalkan'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

export default function OrdersScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Semua');

  const filteredOrders = ORDERS_DATA.filter((order) => {
    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Diproses') return order.status === 'DALAM_PROSES';
    if (activeFilter === 'Selesai') return order.status === 'SELESAI';
    if (activeFilter === 'Dibatalkan') return order.status === 'DIBATALKAN';
    return true;
  });

  // Custom function for rendering filter chip
  const renderFilterChip = (tab: FilterTab) => {
    const isActive = activeFilter === tab;

    return (
      <TouchableOpacity
        key={tab}
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => setActiveFilter(tab)}
        activeOpacity={0.8}
      >
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
          {tab}
        </Text>
      </TouchableOpacity>
    );
  };

  // Custom function for rendering order cards
  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/order/${order.id}` as any)}
    >
      <View style={styles.thumbnailBox}>
        <Image source={order.image} style={styles.thumbnail} resizeMode="contain" />
      </View>

      <View style={styles.orderInfoCol}>
        <View style={styles.topInfoRow}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <StatusBadge status={order.status} />
        </View>

        <Text style={styles.orderSubtitle}>
          {order.date} · {order.serviceName}
        </Text>

        <View style={styles.bottomInfoRow}>
          <Text style={styles.orderPrice}>{order.priceFormatted}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
      <ScreenHeader title="Riwayat Pesanan" showBack={false} />

      {/* Filter Chips Horizontal */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map(renderFilterChip)}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada pesanan</Text>
          </View>
        ) : (
          filteredOrders.map(renderOrderCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    paddingVertical: 10,
    backgroundColor: Theme.colors.background,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: Theme.radius.badge,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: Theme.colors.white,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
  },
  orderCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadow.card,
  },
  thumbnailBox: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbnail: {
    width: '90%',
    height: '90%',
  },
  orderInfoCol: {
    flex: 1,
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  orderSubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginBottom: 6,
  },
  bottomInfoRow: {
    alignItems: 'flex-end',
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
});
