import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Card from '../components/Card';
import api from '../services/api';

const ReportScreen = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reports');
      if (res.data) {
        setReport(res.data);
      }
    } catch (err) {
      console.log('Error fetching revenue report:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReport();
  };

  const formatRupiah = (val) => {
    return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const summary = report?.summary || { totalIncome: 0, totalPaidOrders: 0 };
  const breakdown = report?.serviceBreakdown || [];
  const transactions = report?.transactions || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Laporan Keuangan</Text>
        <Text style={styles.subtitle}>Rekapitulasi omset laundry sepatu dan performa layanan</Text>
      </View>

      {/* Main Income Banner */}
      <View style={styles.incomeCard}>
        <Text style={styles.incomeLabel}>Total Pendapatan Terverifikasi</Text>
        <Text style={styles.incomeValue}>{formatRupiah(summary.totalIncome)}</Text>
        <View style={styles.incomeMetaRow}>
          <View style={styles.incomeMetaItem}>
            <Ionicons name="receipt-outline" size={16} color="#93C5FD" />
            <Text style={styles.incomeMetaText}>{summary.totalPaidOrders} Transaksi Sukses</Text>
          </View>
        </View>
      </View>

      {/* Breakdown by Service */}
      <Text style={styles.sectionHeading}>Pendapatan per Jenis Layanan</Text>
      <Card style={styles.breakdownCard}>
        {breakdown.length > 0 ? (
          breakdown.map((item, idx) => (
            <View key={item.serviceName} style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={styles.serviceRank}>
                  <Text style={styles.rankNum}>#{idx + 1}</Text>
                </View>
                <View>
                  <Text style={styles.breakdownServiceName}>{item.serviceName}</Text>
                  <Text style={styles.breakdownQty}>{item.totalQuantity} Pasang Sepatu</Text>
                </View>
              </View>
              <Text style={styles.breakdownRevenue}>{formatRupiah(item.totalRevenue)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Belum ada data pengerjaan layanan terbayar.</Text>
        )}
      </Card>

      {/* Transactions List */}
      <Text style={styles.sectionHeading}>Daftar Transaksi Lunas</Text>
      {transactions.length > 0 ? (
        transactions.map((tx) => (
          <Card key={tx.orderNumber} style={styles.txCard}>
            <View style={styles.txHeader}>
              <Text style={styles.txOrderNo}>{tx.orderNumber}</Text>
              <Text style={styles.txAmount}>{formatRupiah(tx.totalAmount)}</Text>
            </View>
            <View style={styles.txDivider} />
            <View style={styles.txFooter}>
              <Text style={styles.txDate}>
                {new Date(tx.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <View style={styles.methodBadge}>
                <Text style={styles.methodText}>{tx.paymentMethod}</Text>
              </View>
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={styles.emptyText}>Belum ada transaksi pembayaran lunas.</Text>
        </Card>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 16,
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
  incomeCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
  },
  incomeLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  incomeValue: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  incomeMetaRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 12,
  },
  incomeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  incomeMetaText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 12,
    marginTop: 4,
  },
  breakdownCard: {
    padding: 16,
    marginBottom: 24,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceRank: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  breakdownServiceName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  breakdownQty: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  breakdownRevenue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  txCard: {
    marginBottom: 10,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txOrderNo: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.success,
  },
  txDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  methodBadge: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
});

export default ReportScreen;
