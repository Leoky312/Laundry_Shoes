import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/theme';
import GlobalStyles from '../constants/styles';
import { PAYMENT_METHODS, PaymentOption } from '../constants/data';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';

export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('dana');
  const [note, setNote] = useState('');

  const handleOrder = () => {
    router.replace('/order/SF123456' as any);
  };

  // Custom function for rendering payment options
  const renderPaymentOption = (method: PaymentOption) => {
    const isSelected = selectedMethod === method.id;

    return (
      <TouchableOpacity
        key={method.id}
        style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
        activeOpacity={0.8}
        onPress={() => setSelectedMethod(method.id)}
      >
        {/* Radio Circle */}
        <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
          {isSelected && <View style={styles.radioInnerDot} />}
        </View>

        {/* Payment Icon */}
        <View style={styles.paymentIconBox}>
          {method.id === 'dana' ? (
            <View style={styles.danaLogoBox}>
              <Ionicons name="videocam" size={14} color={Theme.colors.white} />
            </View>
          ) : (
            <Ionicons
              name={method.icon as any}
              size={20}
              color={Theme.colors.text}
            />
          )}
        </View>

        {/* Method Name */}
        <Text style={styles.paymentName}>{method.name}</Text>

        {/* Right Indicator: checkmark for DANA, chevron for others */}
        {isSelected ? (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={Theme.colors.danaBlue}
            style={styles.rightIndicator}
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Theme.colors.textSecondary}
            style={styles.rightIndicator}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
      <ScreenHeader title="Checkout" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Alamat Pengiriman */}
        <Text style={styles.sectionHeaderTitle}>Alamat Pengiriman</Text>
        <View style={styles.addressCard}>
          <View style={styles.addressTopRow}>
            <View style={styles.addressUserRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={Theme.colors.text}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.addressUserName}>Fatir</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.changeLink}>Ubah</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.addressDetail}>
            Jl. Melati No. 12, Kec. Lowokwaru{'\n'}Malang, Jawa Timur
          </Text>
        </View>

        {/* Section: Pilih Metode Pembayaran */}
        <Text style={styles.sectionHeaderTitle}>Pilih Metode Pembayaran</Text>
        <View style={styles.paymentList}>
          {PAYMENT_METHODS.map(renderPaymentOption)}
        </View>

        {/* Section: Catatan (Opsional) */}
        <Text style={styles.sectionHeaderTitle}>Catatan (Opsional)</Text>
        <View style={styles.noteCard}>
          <TextInput
            style={styles.noteInput}
            placeholder="Contoh: Sepatu warna putih, tolong hati-hati"
            placeholderTextColor={Theme.colors.textSecondary}
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
          />
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={GlobalStyles.bottomBar}>
        <PrimaryButton
          title="Pesan Sekarang"
          onPress={handleOrder}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 10,
    marginTop: 12,
  },
  addressCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    padding: 16,
    marginBottom: 10,
    ...Theme.shadow.card,
  },
  addressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  changeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  addressDetail: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 24,
  },
  paymentList: {
    marginBottom: 10,
  },
  paymentCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    ...Theme.shadow.card,
  },
  paymentCardSelected: {
    borderColor: Theme.colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleActive: {
    borderColor: Theme.colors.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary,
  },
  paymentIconBox: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  danaLogoBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Theme.colors.danaBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  rightIndicator: {
    marginLeft: 8,
  },
  noteCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    padding: 12,
    ...Theme.shadow.card,
  },
  noteInput: {
    height: 70,
    fontSize: 13,
    color: Theme.colors.text,
    textAlignVertical: 'top',
  },
});
