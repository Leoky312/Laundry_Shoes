import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../constants/theme';
import GlobalStyles from '../constants/styles';
import { useCart } from '../context/CartContext';
import { CartItem } from '../constants/data';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    total,
    formatRupiah,
  } = useCart();

  // Custom function for rendering cart items
  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartCard}>
      <View style={styles.thumbnailBox}>
        <Image source={item.image} style={styles.thumbnail} resizeMode="contain" />
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.priceFormatted}</Text>

        <View style={styles.stepperContainer}>
          <View style={GlobalStyles.stepper}>
            <TouchableOpacity
              style={GlobalStyles.stepperBtn}
              onPress={() => updateQuantity(item.id, -1)}
              activeOpacity={0.7}
            >
              <Text style={GlobalStyles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={GlobalStyles.stepperValue}>{item.quantity}</Text>
            <TouchableOpacity
              style={GlobalStyles.stepperBtn}
              onPress={() => updateQuantity(item.id, 1)}
              activeOpacity={0.7}
            >
              <Text style={GlobalStyles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.trashBtn}
        onPress={() => removeItem(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color={Theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
      <ScreenHeader title="Keranjang" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color={Theme.colors.border} />
            <Text style={styles.emptyText}>Keranjang belanja kosong</Text>
          </View>
        ) : (
          items.map(renderCartItem)
        )}
      </ScrollView>

      {/* Ringkasan Biaya Card & Checkout Button */}
      {items.length > 0 && (
        <View style={styles.summaryFooter}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatRupiah(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ongkir</Text>
              <Text style={styles.summaryValue}>{formatRupiah(deliveryFee)}</Text>
            </View>

            <View style={GlobalStyles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
            </View>
          </View>

          <PrimaryButton
            title="Lanjut ke Checkout"
            onPress={() => router.push('/checkout')}
            style={styles.checkoutBtn}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  cartCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadow.card,
  },
  thumbnailBox: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  thumbnail: {
    width: '90%',
    height: '90%',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    marginBottom: 8,
  },
  stepperContainer: {
    alignSelf: 'flex-start',
  },
  trashBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginTop: 12,
  },
  summaryFooter: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    ...Theme.shadow.tabBar,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  checkoutBtn: {
    marginTop: 4,
  },
});
