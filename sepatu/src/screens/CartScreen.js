import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const CartScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { cart, updateQuantity, removeFromCart, getSubtotal } = useCart();

  const subtotal = getSubtotal();
  const deliveryFee = 10000;
  const grandTotal = subtotal + deliveryFee;

  const formatRupiah = (val) => {
    return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
  };

  const getServiceThumbnail = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('tas') || lower.includes('bag')) {
      return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&fit=crop';
    }
    if (lower.includes('repair') || lower.includes('unyellowing')) {
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&fit=crop';
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]}
      >
        <View style={[styles.mainContainer, isDesktop && styles.desktopContainer]}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#132A1B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Keranjang</Text>
            <View style={{ width: 40 }} />
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={60} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Keranjang Kosong</Text>
              <Text style={styles.emptySub}>Belum ada layanan yang ditambahkan ke keranjang.</Text>
            </View>
          ) : (
            <>
              {/* Cart Items */}
              <View style={styles.itemsContainer}>
                {cart.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <Image
                      source={{ uri: item.service.image || getServiceThumbnail(item.service.name) }}
                      style={styles.itemThumb}
                      resizeMode="cover"
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.service.name}</Text>
                      <Text style={styles.itemPrice}>{formatRupiah(item.service.price)}</Text>

                      <View style={styles.itemActions}>
                        <View style={styles.stepper}>
                          <TouchableOpacity
                            style={styles.stepBtn}
                            onPress={() => updateQuantity(item.id, -1)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="remove" size={14} color="#374151" />
                          </TouchableOpacity>
                          <Text style={styles.stepQty}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.stepBtn}
                            onPress={() => updateQuantity(item.id, 1)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="add" size={14} color="#374151" />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => removeFromCart(item.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={18} color="#4B5563" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Summary Section */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryVal}>{formatRupiah(subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ongkir</Text>
                  <Text style={styles.summaryVal}>{formatRupiah(deliveryFee)}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalVal}>{formatRupiah(grandTotal)}</Text>
                </View>

                {/* Checkout Button */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={() => navigation.navigate('Booking')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitBtnText}>Lanjut ke Checkout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  desktopScrollContent: {
    paddingVertical: 30,
  },
  mainContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  desktopContainer: {
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FAFAFA',
  },
  topHeader: {
    paddingTop: Platform.OS === 'web' ? 14 : 50,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#132A1B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#132A1B',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  itemsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 12,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  itemThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EAF5EC',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#132A1B',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#236B38',
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    fontSize: 14,
    fontWeight: '700',
    color: '#132A1B',
    minWidth: 16,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#132A1B',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#132A1B',
  },
  submitBtn: {
    backgroundColor: '#327341',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CartScreen;
