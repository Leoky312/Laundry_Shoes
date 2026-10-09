import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Pesanan</Text>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}><Text style={styles.tabTextActive}>Semua</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Diproses</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Selesai</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Dibatalkan</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <HistoryItem id="#SF123456" date="12 Jun 2025" item="Cuci Sepatu" price="Rp 25.000" status="Dalam Proses" statusColor="#f59e0b" />
        <HistoryItem id="#SF123455" date="10 Jun 2025" item="Cuci + Repair" price="Rp 45.000" status="Selesai" statusColor={Colors.primary} />
        <HistoryItem id="#SF123454" date="5 Jun 2025" item="Cuci Sepatu Premium" price="Rp 35.000" status="Selesai" statusColor={Colors.primary} />
        <HistoryItem id="#SF123453" date="1 Jun 2025" item="Cuci Sepatu" price="Rp 25.000" status="Dibatalkan" statusColor={Colors.error} />
      </ScrollView>
    </View>
  );
}

const HistoryItem = ({id, date, item, price, status, statusColor}: any) => (
  <View style={styles.historyCard}>
    <View style={styles.itemImage} />
    <View style={styles.itemInfo}>
      <Text style={styles.itemId}>{id}</Text>
      <Text style={styles.itemDate}>{date} · {item}</Text>
    </View>
    <View style={styles.rightInfo}>
      <View style={[styles.badge, {backgroundColor: statusColor + '20'}]}>
        <Text style={[styles.badgeText, {color: statusColor}]}>{status}</Text>
      </View>
      <Text style={styles.itemPrice}>{price}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 50, backgroundColor: Colors.white, alignItems: 'center', borderBottomWidth: 1, borderColor: Colors.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', padding: 16, backgroundColor: Colors.white },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textLight },
  tabTextActive: { color: Colors.white, fontWeight: 'bold' },
  content: { padding: 20 },
  historyCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  itemImage: { width: 50, height: 50, backgroundColor: Colors.card, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemId: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  itemDate: { fontSize: 12, color: Colors.textLight },
  rightInfo: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  itemPrice: { fontSize: 14, fontWeight: 'bold' }
});