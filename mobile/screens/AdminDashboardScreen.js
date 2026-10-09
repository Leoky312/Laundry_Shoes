import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import logoImg from '../assets/logo.png';

const AdminDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders || []);
      }
    } catch (err) {
      console.log('Error dashboard data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatRupiah = (val) => {
    return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
  };

  const handleNavigateOrdersWithFilter = (filterStatus) => {
    navigation.navigate('Orders', { initialFilter: filterStatus });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header with Shoefresh Logo & Admin Badge */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoRow}>
            <Image source={logoImg} style={styles.logoImg} resizeMode="contain" />
            <Text style={styles.brandTitle}>ShoeFresh</Text>
            <View style={styles.adminTag}>
              <Text style={styles.adminTagText}>ADMIN</Text>
            </View>
          </View>
          <Text style={styles.greetingText}>
            Halo, {user?.name?.split(' ')[0] || 'Admin'}
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Control Center Toko Aktif</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.adminAvatarBtn}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri:
                getImageUrl(user?.avatar) ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
            }}
            style={styles.adminAvatarImg}
          />
        </TouchableOpacity>
      </View>

      {/* Revenue Highlight Card */}
      <View style={styles.revenueCard}>
        <View style={styles.revenueDecorCircle1} />
        <View style={styles.revenueDecorCircle2} />

        <View style={styles.revenueHeaderRow}>
          <View style={styles.revenueBadge}>
            <Ionicons name="wallet-outline" size={14} color="#D8F3DC" />
            <Text style={styles.revenueBadgeText}>TOTAL OMSET BERSIH</Text>
          </View>
          <TouchableOpacity
            style={styles.revenueActionBtn}
            onPress={() => navigation.navigate('Reports')}
            activeOpacity={0.8}
          >
            <Ionicons name="bar-chart-outline" size={13} color="#FFFFFF" />
            <Text style={styles.revenueActionText}>Laporan</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.revenueValue}>{formatRupiah(stats?.totalRevenue)}</Text>

        <View style={styles.revenueFooter}>
          <View style={styles.revenueMetric}>
            <Ionicons name="checkmark-done-circle" size={16} color="#4ADE80" />
            <Text style={styles.revenueFooterText}>
              {stats?.completedOrders || 0} Pesanan Sukses Selesai
            </Text>
          </View>
          <Text style={styles.revenueTotalOrderText}>
            Total: {stats?.totalOrders || 0} Order
          </Text>
        </View>
      </View>

      {/* Quick Action Navigation Buttons */}
      <View style={styles.quickNavRow}>
        <TouchableOpacity
          style={styles.quickNavBtn}
          onPress={() => handleNavigateOrdersWithFilter('SEMUA')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickNavIconBox, { backgroundColor: '#EAF5EC' }]}>
            <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.quickNavLabel}>Semua Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickNavBtn}
          onPress={() => navigation.navigate('Services')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickNavIconBox, { backgroundColor: '#EAF5EC' }]}>
            <Ionicons name="sparkles-outline" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.quickNavLabel}>Kelola Layanan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickNavBtn}
          onPress={() => handleNavigateOrdersWithFilter('DIBATALKAN')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickNavIconBox, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="trash-bin-outline" size={18} color="#DC2626" />
          </View>
          <Text style={styles.quickNavLabel}>Dibatalkan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickNavBtn}
          onPress={() => navigation.navigate('Reports')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickNavIconBox, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="trending-up-outline" size={18} color="#7C3AED" />
          </View>
          <Text style={styles.quickNavLabel}>Statistik</Text>
        </TouchableOpacity>
      </View>

      {/* Section Title: Status Antrian */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Status Pengerjaan</Text>
        <Text style={styles.sectionSubtitle}>Klik kartu untuk memfilter daftar pesanan</Text>
      </View>

      {/* 4 Interactive Stat Cards */}
      <View style={styles.statsGrid}>
        {/* Menunggu */}
        <TouchableOpacity
          style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}
          onPress={() => handleNavigateOrdersWithFilter('MENUNGGU')}
          activeOpacity={0.85}
        >
          <View style={styles.statTopRow}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={18} color="#D97706" />
            </View>
            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
          </View>
          <Text style={styles.statCount}>{stats?.pendingOrders || 0}</Text>
          <Text style={styles.statLabel}>Menunggu Antrian</Text>
        </TouchableOpacity>

        {/* Diproses */}
        <TouchableOpacity
          style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}
          onPress={() => handleNavigateOrdersWithFilter('DIPROSES')}
          activeOpacity={0.85}
        >
          <View style={styles.statTopRow}>
            <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="sync" size={18} color="#2563EB" />
            </View>
            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
          </View>
          <Text style={styles.statCount}>{stats?.inProcessOrders || 0}</Text>
          <Text style={styles.statLabel}>Sedang Dikerjakan</Text>
        </TouchableOpacity>

        {/* Selesai */}
        <TouchableOpacity
          style={[styles.statCard, { borderLeftColor: '#10B981' }]}
          onPress={() => handleNavigateOrdersWithFilter('SELESAI')}
          activeOpacity={0.85}
        >
          <View style={styles.statTopRow}>
            <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-done" size={18} color="#059669" />
            </View>
            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
          </View>
          <Text style={styles.statCount}>{stats?.completedOrders || 0}</Text>
          <Text style={styles.statLabel}>Selesai Dicuci</Text>
        </TouchableOpacity>

        {/* Dibatalkan */}
        <TouchableOpacity
          style={[styles.statCard, { borderLeftColor: '#EF4444' }]}
          onPress={() => handleNavigateOrdersWithFilter('DIBATALKAN')}
          activeOpacity={0.85}
        >
          <View style={styles.statTopRow}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="close-circle" size={18} color="#DC2626" />
            </View>
            <View style={styles.badgeMiniDelete}>
              <Text style={styles.badgeMiniDeleteText}>Bisa Dihapus</Text>
            </View>
          </View>
          <Text style={[styles.statCount, { color: '#DC2626' }]}>
            {stats?.cancelledOrders || 0}
          </Text>
          <Text style={styles.statLabel}>Pesanan Dibatalkan</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders Section */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Pesanan Masuk Terbaru</Text>
          <Text style={styles.sectionSubtitle}>Daftar transaksi dan order teranyar</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Orders')}
          style={styles.seeAllBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>Lihat Semua</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 30 }} />
      ) : recentOrders.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="cube-outline" size={40} color={Colors.textLight} />
          <Text style={styles.emptyCardText}>Belum ada pesanan terbaru.</Text>
        </Card>
      ) : (
        recentOrders.map((order) => {
          const isCancelled = order.status === 'DIBATALKAN';
          const customerInitial = (order.user?.name || 'C').charAt(0).toUpperCase();

          return (
            <TouchableOpacity
              key={order.id}
              style={styles.recentOrderCard}
              onPress={() => navigation.navigate('Orders')}
              activeOpacity={0.85}
            >
              <View style={styles.recentCardHeader}>
                <View style={styles.customerRow}>
                  <View style={styles.customerAvatarCircle}>
                    <Text style={styles.customerAvatarInitial}>{customerInitial}</Text>
                  </View>
                  <View>
                    <Text style={styles.recentCustName}>{order.user?.name || 'Customer'}</Text>
                    <Text style={styles.recentOrderNo}>#{order.orderNumber}</Text>
                  </View>
                </View>
                <Badge status={order.status} />
              </View>

              <View style={styles.recentDivider} />

              <View style={styles.recentCardFooter}>
                <View style={styles.recentDateBox}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.recentDate}>
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.recentPriceBox}>
                  <Text style={styles.recentAmount}>{formatRupiah(order.totalAmount)}</Text>
                  <Ionicons name="chevron-forward" size={15} color="#9CA3AF" />
                </View>
              </View>

              {isCancelled && (
                <View style={styles.cancelledHintBox}>
                  <Ionicons name="information-circle" size={14} color="#DC2626" />
                  <Text style={styles.cancelledHintText}>
                    Pesanan dibatalkan — dapat dihapus dari tab Kelola Pesanan
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 30,
    maxWidth: 850,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  logoImg: {
    width: 28,
    height: 28,
  },
  brandTitle: {
    fontFamily: Platform.select({
      web: "'Poppins', 'Plus Jakarta Sans', sans-serif",
      default: undefined,
    }),
    fontSize: 19,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  adminTag: {
    backgroundColor: '#EAF5EC',
    borderWidth: 1,
    borderColor: '#C3E6CB',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  adminTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#132A1B',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52705B',
  },
  adminAvatarBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: '#D8E6DA',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  adminAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  revenueCard: {
    backgroundColor: '#132A1B',
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#132A1B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  revenueDecorCircle1: {
    position: 'absolute',
    right: -25,
    top: -25,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  revenueDecorCircle2: {
    position: 'absolute',
    right: 60,
    bottom: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(35, 107, 56, 0.25)',
  },
  revenueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  revenueBadgeText: {
    fontSize: 10,
    color: '#D8F3DC',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  revenueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  revenueActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 14,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  revenueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  revenueMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  revenueFooterText: {
    color: '#D8F3DC',
    fontSize: 11,
    fontWeight: '600',
  },
  revenueTotalOrderText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '500',
  },
  quickNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  quickNavBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickNavIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickNavLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#132A1B',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#132A1B',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMiniDelete: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeMiniDeleteText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '800',
  },
  statCount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#132A1B',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  recentOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  recentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E6CE',
  },
  customerAvatarInitial: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  recentCustName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#132A1B',
  },
  recentOrderNo: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
    fontWeight: '500',
  },
  recentDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  recentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  recentDate: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  recentPriceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  cancelledHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  cancelledHintText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyCardText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;
