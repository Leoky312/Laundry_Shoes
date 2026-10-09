import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

export default function CartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backIcon}>{'<'}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Keranjang</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content}>
        <CartItem title="Cuci Sepatu" price="Rp 25.000" />
        <CartItem title="Cuci + Repair" price="Rp 45.000" />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>Rp 70.000</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ongkir</Text>
          <Text style={styles.summaryValue}>Rp 10.000</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rp 80.000</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/screens/checkout')}>
          <Text style={styles.checkoutText}>Lanjut ke Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CartItem = ({title, price}: any) => (
  <View style={styles.cartItem}>
    <View style={styles.itemImage} />
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemPrice}>{price}</Text>
      <View style={styles.qtyControl}>
        <TouchableOpacity><Text style={styles.qtyBtn}>-</Text></TouchableOpacity>
        <Text style={styles.qtyText}>1</Text>
        <TouchableOpacity><Text style={styles.qtyBtn}>+</Text></TouchableOpacity>
      </View>
    </View>
    <TouchableOpacity><Text style={styles.deleteIcon}>🗑️</Text></TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: Colors.white, borderBottomWidth: 1, borderColor: Colors.border },
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  cartItem: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  itemImage: { width: 60, height: 60, backgroundColor: Colors.card, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: Colors.primary, marginBottom: 8 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', width: 90, justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 },
  qtyBtn: { fontSize: 16 },
  qtyText: { fontSize: 14, fontWeight: 'bold' },
  deleteIcon: { fontSize: 20 },
  footer: { padding: 20, backgroundColor: Colors.white, borderTopWidth: 1, borderColor: Colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: Colors.textLight },
  summaryValue: { fontWeight: '500' },
  totalRow: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
  checkoutButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  checkoutText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' }
});