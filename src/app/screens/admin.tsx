import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>({
    totalRevenue: 2850000,
    pendingOrders: 3,
    inProcessOrders: 5,
    completedOrders: 142,
    totalCustomers: 89,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([
    {
      id: 1,
      orderNumber: 'SF-20261009-01',
      user: { name: 'Fatir' },
      status: 'DIPROSES',
      totalAmount: 70000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      orderNumber: 'SF-20261009-02',
      user: { name: 'Ahmad' },
      status: 'MENUNGGU',
      totalAmount: 25000,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3,
      orderNumber: 'SF-20261008-05',
      user: { name: 'Siti' },
      status: 'SELESAI',
      totalAmount: 45000,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/admin/dashboard');
      if (res && res.stats) {
        setStats(res.stats);
        if (res.recentOrders) {
          setRecentOrders(res.recentOrders);
        }
      }
    } catch (err: any) {
      console.log('Using default dashboard metrics:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + (parseInt(val as any || 0)).toLocaleString('id-ID');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MENUNGGU':
        return { label: 'Menunggu', bg: '#FEF3C7', text: '#D97706' };
      case 'DIPROSES':
      case 'DICUCI':
      case 'DRYING':
        return { label: 'Diproses', bg: '#DBEAFE', text: '#2563EB' };
      case 'SELESAI':
        return { label: 'Selesai', bg: '#D1FAE5', text: '#059669' };
      default:
        return { label: status, bg: '#F1F5F9', text: '#475569' };
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Admin Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.adminBadgeRow}>
            <View style={styles.adminRoleBadge}>
              <Text style={styles.adminRoleText}>ADMINISTRATOR</Text>
            </View>
            <Text style={styles.adminHelloText} numberOfLines={1}>
              Halo, {user?.name || 'Admin'}
            </Text>
          </View>
          <Text style={styles.adminTitle}>Control Center</Text>
          <Text style={styles.adminSub}>Kelola antrian pengerjaan & pendapatan toko</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Switch to Customer App Banner */}
      <TouchableOpacity
        style={styles.customerModeBanner}
        onPress={() => router.push('/(tabs)')}
        activeOpacity={0.85}
      >
        <Ionicons name="storefront" size={20} color={Colors.white} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.customerModeTitle}>Lihat Mode Pelanggan</Text>
          <Text style={styles.customerModeSub}>Buka katalog layanan & tampilan toko</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.white} />
      </TouchableOpacity>

      {/* Revenue Highlight Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>Total Pendapatan Terverifikasi</Text>
        <Text style={styles.revenueValue}>{formatRupiah(stats?.totalRevenue)}</Text>
        <View style={styles.revenueFooter}>
          <Ionicons name="trending-up" size={16} color="#34D399" />
          <Text style={styles.revenueFooterText}>Semua transaksi yang sudah diverifikasi</Text>
        </View>
      </View>

      {/* 4 Quick Stat Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={20} color="#D97706" />
          </View>
          <Text style={styles.statCount}>{stats?.pendingOrders || 0}</Text>
          <Text style={styles.statLabel}>Menunggu</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="sync" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statCount}>{stats?.inProcessOrders || 0}</Text>
          <Text style={styles.statLabel}>Diproses</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-done" size={20} color="#059669" />
          </View>
          <Text style={styles.statCount}>{stats?.completedOrders || 0}</Text>
          <Text style={styles.statLabel}>Selesai</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="people" size={20} color={Colors.secondary} />
          </View>
          <Text style={styles.statCount}>{stats?.totalCustomers || 0}</Text>
          <Text style={styles.statLabel}>Pelanggan</Text>
        </Card>
      </View>

      {/* Recent Orders Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
        <TouchableOpacity onPress={() => router.push('/screens/orderTracking')}>
          <Text style={styles.viewAllText}>Pelacakan Pesanan</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        recentOrders.map((order) => {
          const badge = getStatusBadge(order.status);
          return (
            <Card
              key={order.id}
              style={styles.recentOrderCard}
              onPress={() => router.push('/screens/orderTracking')}
            >
              <View style={styles.recentHeader}>
                <View>
                  <Text style={styles.recentCustName}>{order.user?.name || 'Pelanggan'}</Text>
                  <Text style={styles.recentOrderNo}>{order.orderNumber}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                </View>
              </View>
              <View style={styles.recentDivider} />
              <View style={styles.recentFooter}>
                <Text style={styles.recentDate}>
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.recentAmount}>{formatRupiah(order.totalAmount)}</Text>
              </View>
            </Card>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  adminRoleBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminRoleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  adminHelloText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C6B5E',
  },
  adminTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A331E',
  },
  adminSub: {
    fontSize: 12,
    color: '#5C6B5E',
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  customerModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  customerModeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  customerModeSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  revenueCard: {
    backgroundColor: '#1A331E',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
  },
  revenueLabel: {
    fontSize: 12,
    color: '#A5D2AC',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  revenueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  revenueFooterText: {
    color: '#A5D2AC',
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A331E',
  },
  statLabel: {
    fontSize: 12,
    color: '#5C6B5E',
    marginTop: 2,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A331E',
  },
  viewAllText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '700',
  },
  recentOrderCard: {
    marginBottom: 12,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentCustName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A331E',
  },
  recentOrderNo: {
    fontSize: 12,
    color: '#5C6B5E',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recentDivider: {
    height: 1,
    backgroundColor: '#E2E8E2',
    marginVertical: 10,
  },
  recentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentDate: {
    fontSize: 12,
    color: '#5C6B5E',
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2E7D32',
  },
});
