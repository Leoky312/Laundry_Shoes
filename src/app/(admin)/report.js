import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import api from '@/services/api';
import logoImg from '@/assets/logo.png';

const ReportScreen = () => {
  const router = useRouter();
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

  const averageTransaction =
    summary.totalPaidOrders > 0
      ? Math.round(summary.totalIncome / summary.totalPaidOrders)
      : 0;

  const maxServiceRevenue =
    breakdown.length > 0 ? Math.max(...breakdown.map((b) => b.totalRevenue || 1)) : 1;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Branded Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={logoImg} style={styles.logoSmall} resizeMode="contain" />
          <Text style={styles.brandSmall}>ShoeFresh</Text>
          <View style={styles.reportTag}>
            <Text style={styles.reportTagText}>FINANCE</Text>
          </View>
        </View>
        <Text style={styles.title}>Laporan Keuangan</Text>
        <Text style={styles.subtitle}>Rekapitulasi omset laundry sepatu dan performa layanan</Text>
      </View>

      {/* Main Income Banner */}
      <View style={styles.incomeCard}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <View style={styles.incomeBadgeRow}>
          <View style={styles.incomeBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#4ADE80" />
            <Text style={styles.incomeBadgeText}>PENDAPATAN TERVERIFIKASI</Text>
          </View>
          <View style={styles.incomePeriodBadge}>
            <Text style={styles.incomePeriodText}>Semua Waktu</Text>
          </View>
        </View>

        <Text style={styles.incomeValue}>{formatRupiah(summary.totalIncome)}</Text>

        <View style={styles.incomeMetaRow}>
          <View style={styles.incomeMetaItem}>
            <Ionicons name="receipt-outline" size={15} color="#93C5FD" />
            <Text style={styles.incomeMetaText}>{summary.totalPaidOrders} Transaksi Lunas</Text>
          </View>
          <View style={styles.incomeMetaDivider} />
          <View style={styles.incomeMetaItem}>
            <Ionicons name="calculator-outline" size={15} color="#86EFAC" />
            <Text style={styles.incomeMetaText}>Rata-rata: {formatRupiah(averageTransaction)}</Text>
          </View>
        </View>
      </View>

      {/* Breakdown by Service Section */}
      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>Performa Layanan Terlaris</Text>
        <Text style={styles.sectionSubtext}>Berdasarkan total omset</Text>
      </View>

      <View style={styles.breakdownCard}>
        {breakdown.length > 0 ? (
          breakdown.map((item, idx) => {
            const percentage = Math.round((item.totalRevenue / maxServiceRevenue) * 100);

            return (
              <View key={item.serviceName} style={styles.breakdownItem}>
                <View style={styles.breakdownItemHeader}>
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.serviceRank,
                        idx === 0 && { backgroundColor: '#FEF3C7' },
                        idx === 1 && { backgroundColor: '#E0E7FF' },
                        idx === 2 && { backgroundColor: '#FCE7F3' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankNum,
                          idx === 0 && { color: '#B45309' },
                          idx === 1 && { color: '#4338CA' },
                          idx === 2 && { color: '#BE185D' },
                        ]}
                      >
                        #{idx + 1}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.breakdownServiceName}>{item.serviceName}</Text>
                      <Text style={styles.breakdownQty}>{item.totalQuantity} Pasang Sepatu Selesai</Text>
                    </View>
                  </View>
                  <Text style={styles.breakdownRevenue}>{formatRupiah(item.totalRevenue)}</Text>
                </View>

                {/* Visual Progress Bar */}
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyBreakdown}>
            <Ionicons name="bar-chart-outline" size={32} color="#9CA3AF" />
            <Text style={styles.emptyText}>Belum ada data pengerjaan layanan terbayar.</Text>
          </View>
        )}
      </View>

      {/* Transactions List Section */}
      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>Riwayat Transaksi Terverifikasi</Text>
        <Text style={styles.sectionSubtext}>{transactions.length} pembayaran</Text>
      </View>

      {transactions.length > 0 ? (
        transactions.map((tx) => (
          <View key={tx.orderNumber} style={styles.txCard}>
            <View style={styles.txHeader}>
              <View style={styles.txOrderRow}>
                <Ionicons name="receipt-outline" size={14} color={Colors.primary} />
                <Text style={styles.txOrderNo}>#{tx.orderNumber}</Text>
              </View>
              <Text style={styles.txAmount}>+{formatRupiah(tx.totalAmount)}</Text>
            </View>

            <View style={styles.txDivider} />

            <View style={styles.txFooter}>
              <View style={styles.txDateBox}>
                <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                <Text style={styles.txDate}>
                  {new Date(tx.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <View style={styles.methodBadge}>
                <Text style={styles.methodText}>{tx.paymentMethod || 'TRANSFER'}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="file-tray-outline" size={36} color="#9CA3AF" />
          <Text style={styles.emptyText}>Belum ada transaksi pembayaran lunas.</Text>
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 40,
    maxWidth: 850,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 18,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
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
  reportTag: {
    backgroundColor: '#EAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C3E6CB',
  },
  reportTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
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
  incomeCard: {
    backgroundColor: '#132A1B',
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#132A1B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  decorCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  decorCircle2: {
    position: 'absolute',
    right: 70,
    bottom: -40,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(35, 107, 56, 0.25)',
  },
  incomeBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  incomeBadgeText: {
    color: '#D8F3DC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  incomePeriodBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  incomePeriodText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  incomeValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  incomeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    gap: 12,
  },
  incomeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  incomeMetaDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  incomeMetaText: {
    color: '#D8F3DC',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#132A1B',
  },
  sectionSubtext: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  breakdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceRank: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  breakdownServiceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#132A1B',
  },
  breakdownQty: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  breakdownRevenue: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  emptyBreakdown: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txOrderNo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#132A1B',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#16A34A',
  },
  txDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  txDate: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  methodBadge: {
    backgroundColor: '#EAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C3E6CB',
  },
  methodText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
});

export default ReportScreen;
