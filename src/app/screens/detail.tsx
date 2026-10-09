import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

export default function DetailScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imagePlaceholder}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Text>{'<'}</Text></TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Cuci Sepatu</Text>
          <Text style={styles.price}>Rp 25.000</Text>
          <Text style={styles.rating}>⭐ 4.8 (120 ulasan)</Text>
          
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.description}>Cuci sepatu dengan metode profesional menggunakan bahan aman dan ramah lingkungan. Cocok untuk semua jenis sepatu.</Text>
          
          <Text style={styles.sectionTitle}>Keunggulan</Text>
          <Text style={styles.bullet}>✓ Bersih maksimal</Text>
          <Text style={styles.bullet}>✓ Wangi tahan lama</Text>
          <Text style={styles.bullet}>✓ Aman untuk semua bahan</Text>
          <Text style={styles.bullet}>✓ Proses cepat</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.qtyRow}>
          <Text>Jumlah</Text>
          <View style={styles.qtyControl}>
            <TouchableOpacity><Text style={styles.qtyBtn}>-</Text></TouchableOpacity>
            <Text style={styles.qtyText}>1</Text>
            <TouchableOpacity><Text style={styles.qtyBtn}>+</Text></TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/screens/cart')}>
          <Text style={styles.addButtonText}>Tambah ke Keranjang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  imagePlaceholder: { height: 300, backgroundColor: Colors.card, paddingTop: 40, paddingHorizontal: 20 },
  backButton: { width: 40, height: 40, backgroundColor: Colors.white, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  price: { fontSize: 20, fontWeight: 'bold', color: Colors.primary, marginBottom: 8 },
  rating: { fontSize: 14, color: Colors.textLight, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 8, marginTop: 10 },
  description: { fontSize: 14, color: Colors.textLight, lineHeight: 22, marginBottom: 16 },
  bullet: { fontSize: 14, color: Colors.text, marginBottom: 6 },
  footer: { padding: 20, borderTopWidth: 1, borderColor: Colors.border },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  qtyBtn: { fontSize: 20, color: Colors.text, paddingHorizontal: 12 },
  qtyText: { fontSize: 16, fontWeight: 'bold' },
  addButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' }
});