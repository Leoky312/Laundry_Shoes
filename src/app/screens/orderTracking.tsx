import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

export default function OrderTrackingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backIcon}>{'<'}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.orderId}>Pesanan #SF123456</Text>
          <Text style={styles.statusTitle}>🕑 Dalam Proses</Text>
          <Text style={styles.statusDesc}>Pesanan kamu sedang dicuci.</Text>
        </View>

        <View style={styles.timelineCard}>
          <TimelineItem title="Pesanan Diterima" time="12 Jun 2025, 09:15" active={true} />
          <TimelineItem title="Sedang Dicuci" time="12 Jun 2025, 10:30" active={true} />
          <TimelineItem title="Proses Pengeringan" time="" active={false} />
          <TimelineItem title="Proses Finishing" time="" active={false} />
          <TimelineItem title="Pesanan Selesai" time="" active={false} isLast={true} />
          
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactText}>📞 Hubungi Kami</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Detail Pesanan</Text>
        <View style={styles.itemCard}>
          <View style={styles.itemImage} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>Cuci Sepatu</Text>
            <Text style={styles.itemPrice}>Rp 25.000</Text>
          </View>
          <Text style={styles.itemQty}>x1</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const TimelineItem = ({title, time, active, isLast}: any) => (
  <View style={styles.timelineRow}>
    <View style={styles.timelineLeft}>
      <View style={[styles.dot, active && styles.dotActive]} />
      {!isLast && <View style={[styles.line, active && styles.lineActive]} />}
    </View>
    <View style={styles.timelineRight}>
      <Text style={[styles.timelineTitle, active && styles.textActive]}>{title}</Text>
      {time ? <Text style={styles.timelineTime}>{time}</Text> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: Colors.white, borderBottomWidth: 1, borderColor: Colors.border },
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  statusCard: { backgroundColor: Colors.primary, borderRadius: 16, padding: 20, marginBottom: 20 },
  orderId: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  statusTitle: { color: Colors.white, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  statusDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  timelineCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.border, marginBottom: 24 },
  timelineRow: { flexDirection: 'row', minHeight: 60 },
  timelineLeft: { width: 30, alignItems: 'center' },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.white, zIndex: 1 },
  dotActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  line: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: -2, marginBottom: -2 },
  lineActive: { backgroundColor: Colors.primary },
  timelineRight: { flex: 1, paddingBottom: 24, paddingLeft: 12, marginTop: -2 },
  timelineTitle: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  textActive: { color: Colors.text, fontWeight: 'bold' },
  timelineTime: { fontSize: 12, color: Colors.textLight, marginTop: 4 },
  contactButton: { borderWidth: 1, borderColor: Colors.border, borderRadius: 20, padding: 12, alignItems: 'center', marginTop: 16 },
  contactText: { color: Colors.primary, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  itemCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  itemImage: { width: 50, height: 50, backgroundColor: Colors.card, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: Colors.primary },
  itemQty: { fontSize: 14, color: Colors.textLight }
});