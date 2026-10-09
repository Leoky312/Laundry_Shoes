import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

export default function CheckoutScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backIcon}>{'<'}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.boldText}>Fatir</Text>
            <Text style={styles.linkText}>Ubah</Text>
          </View>
          <Text style={styles.addressText}>Jl. Melati No. 12, Kec. Lowokwaru{'\n'}Malang, Jawa Timur</Text>
        </View>

        <Text style={styles.sectionTitle}>Pilih Metode Pembayaran</Text>
        <View style={styles.card}>
          <PaymentMethod title="DANA" selected={true} />
          <View style={styles.divider} />
          <PaymentMethod title="Transfer Bank" selected={false} />
          <View style={styles.divider} />
          <PaymentMethod title="COD (Bayar di Tempat)" selected={false} />
        </View>

        <Text style={styles.sectionTitle}>Catatan (Opsional)</Text>
        <TextInput 
          style={styles.textArea} 
          placeholder="Contoh: Sepatu warna putih, tolong hati-hati"
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/orderTracking')}>
          <Text style={styles.buttonText}>Pesan Sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PaymentMethod = ({title, selected}: any) => (
  <View style={styles.paymentRow}>
    <View style={styles.radioOutline}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.paymentTitle}>{title}</Text>
    {selected && <Text style={styles.checkIcon}>✓</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: Colors.white, borderBottomWidth: 1, borderColor: Colors.border },
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  boldText: { fontWeight: 'bold', fontSize: 16 },
  linkText: { color: Colors.primary, fontWeight: 'bold' },
  addressText: { color: Colors.textLight, lineHeight: 22 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  radioOutline: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  paymentTitle: { flex: 1, fontSize: 16 },
  checkIcon: { color: Colors.primary, fontSize: 18, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  textArea: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, height: 100, textAlignVertical: 'top' },
  footer: { padding: 20, backgroundColor: Colors.white, borderTopWidth: 1, borderColor: Colors.border },
  button: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' }
});