import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import api from '@/services/api';
import { useCart } from '@/context/CartContext';

const DetailServiceScreen = ({ route, navigation }) => {
  const router = useRouter();
  const { serviceId } = route.params || {};
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart, cart } = useCart();

  useEffect(() => {
    fetchDetail();
  }, [serviceId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const targetId = serviceId || 1;
      const res = await api.get(`/services/${targetId}`);
      if (res.data) {
        setService(res.data);
      }
    } catch (err) {
      console.log('Error fetching service detail:', err.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading || !service) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#236B38" />
      </View>
    );
  }

  const advantages = [
    'Bersih maksimal',
    'Wangi tahan lama',
    'Aman untuk semua bahan',
    'Proses cepat',
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]}
      >
        <View style={[styles.mainContainer, isDesktop && styles.desktopContainer]}>
          {/* Top Header Buttons */}
          <View style={[styles.topHeader, isDesktop && styles.desktopTopHeader]}>
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#132A1B" />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={() => setIsFavorite(!isFavorite)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? '#EF4444' : '#132A1B'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={() => router.push('/cart')}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={20} color="#132A1B" />
                {cart.length > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cart.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Desktop 2-Column or Mobile Vertical */}
          <View style={isDesktop ? styles.desktopColumns : null}>
            {/* Hero Image Container */}
            <View style={[styles.heroImageBox, isDesktop && styles.desktopHeroImageBox]}>
              <Image
                source={{ uri: service.image || getServiceThumbnail(service.name) }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>

            {/* Service Details */}
            <View style={[styles.infoSection, isDesktop && styles.desktopInfoSection]}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.servicePrice}>{formatRupiah(service.price)}</Text>

              {/* Rating */}
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingText}>
                  4.8 <Text style={styles.ratingCount}>(120 ulasan)</Text>
                </Text>
              </View>

              {/* Deskripsi */}
              <Text style={styles.sectionHeading}>Deskripsi</Text>
              <Text style={styles.descriptionText}>
                {service.description ||
                  'Cuci sepatu dengan metode profesional menggunakan bahan aman dan ramah lingkungan. Cocok untuk semua jenis sepatu.'}
              </Text>

              {/* Keunggulan */}
              <Text style={styles.sectionHeading}>Keunggulan</Text>
              <View style={styles.advantagesList}>
                {advantages.map((item, idx) => (
                  <View key={idx} style={styles.advantageRow}>
                    <Ionicons name="checkmark" size={18} color="#236B38" />
                    <Text style={styles.advantageText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Desktop Inline Actions */}
              {isDesktop && (
                <View style={styles.desktopActionRow}>
                  <View style={styles.stepperContainer}>
                    <Text style={styles.stepperLabel}>Jumlah</Text>
                    <View style={styles.stepperControls}>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={16} color="#374151" />
                      </TouchableOpacity>
                      <Text style={styles.stepQty}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => setQuantity((prev) => prev + 1)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={16} color="#374151" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.submitBtnDesktop}
                    onPress={() => {
                      addToCart(service, quantity);
                      if (Platform.OS === 'web') {
                        window.alert('Berhasil ditambahkan ke keranjang!');
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.submitBtnText}>+ Keranjang</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Mobile Sticky Bottom Action Bar */}
      {!isDesktop && (
        <View style={styles.bottomBar}>
          <View style={styles.stepperContainer}>
            <Text style={styles.stepperLabel}>Jumlah</Text>
            <View style={styles.stepperControls}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={16} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.stepQty}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity((prev) => prev + 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => {
              addToCart(service, quantity);
              if (Platform.OS !== 'web') {
                router.push('/cart');
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>Tambah ke Keranjang</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  desktopScrollContent: {
    paddingBottom: 60,
    paddingTop: 30,
  },
  mainContainer: {
    width: '100%',
  },
  desktopContainer: {
    maxWidth: 1040,
    alignSelf: 'center',
    paddingHorizontal: 30,
  },
  topHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  desktopTopHeader: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    marginBottom: 20,
  },
  iconCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  desktopColumns: {
    flexDirection: 'row',
    gap: 40,
    alignItems: 'flex-start',
  },
  heroImageBox: {
    width: '100%',
    height: 320,
    backgroundColor: '#EAF5EC',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  desktopHeroImageBox: {
    flex: 1,
    height: 450,
    borderRadius: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  desktopInfoSection: {
    flex: 1.1,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#132A1B',
    marginBottom: 6,
  },
  servicePrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#236B38',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  ratingCount: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#132A1B',
    marginTop: 10,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  advantagesList: {
    gap: 8,
    marginBottom: 24,
  },
  advantageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  advantageText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  desktopActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitBtnDesktop: {
    flex: 1,
    backgroundColor: '#236B38',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepperLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#132A1B',
    marginRight: 10,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    fontSize: 15,
    fontWeight: '700',
    color: '#132A1B',
    minWidth: 20,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#236B38',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default DetailServiceScreen;
