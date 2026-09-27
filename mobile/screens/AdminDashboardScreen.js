import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
              <Text style={styles.adminRoleText}>ADMIN</Text>
            </View>
            <Text style={styles.adminHelloText} numberOfLines={1}>
              Halo, {user?.name?.split(' ')[0] || 'Admin'}
            </Text>
          </View>
          <Text style={styles.adminTitle}>Control Center</Text>
          <Text style={styles.adminSub}>Kelola antrian pengerjaan & pendapatan toko</Text>
        </View>

        <TouchableOpacity
          style={styles.adminAvatarBtn}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Ionicons name="person-circle-outline" size={38} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Revenue Highlight Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>Total Pendapatan Terverifikasi</Text>
        <Text style={styles.revenueValue}>{formatRupiah(stats?.totalRevenue)}</Text>
        <View style={styles.revenueFooter}>
          <Ionicons name="trending-up" size={16} color="#34D399" />
          <Text style={styles.revenueFooterText}>Semua transaksi yang sudah dibayar lunas</Text>
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
        <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.viewAllText}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        recentOrders.map((order) => (
          <Card
            key={order.id}
            style={styles.recentOrderCard}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.recentHeader}>
              <View>
                <Text style={styles.recentCustName}>{order.user?.name || 'Customer'}</Text>
                <Text style={styles.recentOrderNo}>{order.orderNumber}</Text>
              </View>
              <Badge status={order.status} />
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
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  adminRoleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminRoleText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  adminHelloText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  adminTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.secondary,
  },
  adminSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  adminAvatarBtn: {
    padding: 2,
  },
  revenueCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  revenueLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  revenueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  revenueFooterText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 12,
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statCount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
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
    color: Colors.secondary,
  },
  viewAllText: {
    fontSize: 13,
    color: Colors.primary,
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
    color: Colors.secondary,
  },
  recentOrderNo: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  recentDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  recentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
});

export default AdminDashboardScreen;
