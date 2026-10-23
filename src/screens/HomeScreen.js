import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { cart } = useCart();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services');
      if (res.data) {
        setServices(res.data);
      }
    } catch (err) {
      console.log('Error fetching services:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const formatRupiah = (val) => {
    return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
  };

  const getServiceThumbnail = (name, index) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('tas') || lower.includes('bag')) {
      return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop';
    }
    if (lower.includes('repair') || lower.includes('unyellowing')) {
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Fatir';

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainContainer, isDesktop && styles.desktopContainer]}>
          {/* Top Header Bar */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.brandLogoImg}
                resizeMode="contain"
              />
              <Text style={styles.brandNameText}>ShoeFresh</Text>
            </View>

            {/* Desktop Navigation Links */}
            {isDesktop && (
              <View style={styles.desktopNavLinks}>
                <TouchableOpacity
                  style={[styles.desktopNavLink, styles.desktopNavLinkActive]}
                  onPress={() => navigation.navigate('HomeTab')}
                >
                  <Text style={[styles.desktopNavLinkText, styles.desktopNavLinkTextActive]}>
                    Beranda
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.desktopNavLink}
                  onPress={() => navigation.navigate('HistoryTab')}
                >
                  <Text style={styles.desktopNavLinkText}>Pesanan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.desktopNavLink}
                  onPress={() => navigation.navigate('ProfileTab')}
                >
                  <Text style={styles.desktopNavLinkText}>Profil</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Right Icons */}
            <View style={styles.topBarRight}>
              <TouchableOpacity
                style={styles.bellBtn}
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={20} color="#132A1B" />
                {cart.length > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cart.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
                <Ionicons name="notifications-outline" size={20} color="#132A1B" />
                <View style={styles.bellBadge} />
              </TouchableOpacity>
              {isDesktop && (
                <TouchableOpacity
                  style={styles.desktopUserBtn}
                  onPress={() => navigation.navigate('ProfileTab')}
                >
                  <Ionicons name="person-circle-outline" size={32} color="#236B38" />
                  <Text style={styles.desktopUserName}>{firstName}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greetingTitle}>Halo, {firstName} </Text>
            <Text style={styles.greetingSubtitle}>Sepatu kamu, prioritas kami</Text>
          </View>

          {/* Hero Banner Promo */}
          <View style={[styles.heroCard, isDesktop && styles.heroCardDesktop]}>
            <View style={styles.heroTextCol}>
              <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
                Bersih Maksimal{'\n'}Wangi Tahan Lama
              </Text>
              {isDesktop && (
                <Text style={styles.heroSubDesktop}>
                  Solusi laundry dan treatment sepatu premium dengan bahan ramah lingkungan.
                </Text>
              )}
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => {
                  if (services.length > 0) {
                    navigation.navigate('DetailService', { serviceId: services[0].id });
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.heroBtnText}>Pesan Sekarang</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.heroImgCol, isDesktop && styles.heroImgColDesktop]}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&fit=crop',
                }}
                style={[styles.heroSneakerImg, isDesktop && styles.heroSneakerImgDesktop]}
                resizeMode="contain"
              />
            </View>
          </View>


          {/* Section: Layanan Kami */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Layanan Kami</Text>
          </View>

          {/* Service Cards: Kotak ke Bawah (Vertical Grid) */}
          {loading && !refreshing ? (
            <ActivityIndicator size="small" color="#236B38" style={{ marginVertical: 30 }} />
          ) : (
            <View style={styles.servicesGrid}>
              {services.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.serviceBoxCard,
                    isDesktop && styles.serviceBoxCardDesktop,
                  ]}
                  onPress={() => navigation.navigate('DetailService', { serviceId: item.id })}
                  activeOpacity={0.85}
                >
                  <View style={styles.serviceBoxImgBox}>
                    <Image
                      source={{ uri: item.image || getServiceThumbnail(item.name, idx) }}
                      style={styles.serviceImg}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.serviceBoxInfo}>
                    <Text style={styles.serviceBoxName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.serviceBoxPrice}>{formatRupiah(item.price)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'web' ? 24 : 50,
    paddingBottom: 90,
  },
  mainContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  desktopContainer: {
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoImg: {
    width: 38,
    height: 38,
  },
  brandNameText: {
    fontFamily: Platform.select({
      web: "'Poppins', 'Plus Jakarta Sans', sans-serif",
      default: undefined,
    }),
    fontSize: 22,
    fontWeight: '800',
    color: '#236B38',
    letterSpacing: -0.5,
  },
  desktopNavLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  desktopNavLink: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  desktopNavLinkActive: {
    backgroundColor: '#EAF5EC',
  },
  desktopNavLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  desktopNavLinkTextActive: {
    color: '#236B38',
    fontWeight: '700',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
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
  desktopUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  desktopUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#132A1B',
  },
  greetingSection: {
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#132A1B',
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: '#236B38',
    borderRadius: 22,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 150,
    overflow: 'hidden',
    marginBottom: 28,
  },
  heroCardDesktop: {
    minHeight: 180,
    padding: 32,
  },
  heroTextCol: {
    flex: 1.2,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 12,
  },
  heroTitleDesktop: {
    fontSize: 26,
    lineHeight: 34,
  },
  heroSubDesktop: {
    fontSize: 14,
    color: '#D8F3DC',
    marginBottom: 16,
    maxWidth: 480,
  },
  heroBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#236B38',
  },
  heroImgCol: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroImgColDesktop: {
    flex: 0.9,
  },
  heroSneakerImg: {
    width: 125,
    height: 95,
  },
  heroSneakerImgDesktop: {
    width: 200,
    height: 140,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  quickActionsDesktop: {
    gap: 20,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
  },
  actionItemDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  actionIconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#EAF5EC',
    borderWidth: 1,
    borderColor: '#D8E6DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTextCol: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionSubLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#132A1B',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#236B38',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  serviceBoxCard: {
    width: '47.8%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  serviceBoxCardDesktop: {
    width: '31.6%',
  },
  serviceBoxImgBox: {
    width: '100%',
    height: 125,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    marginBottom: 10,
  },
  serviceImg: {
    width: '100%',
    height: '100%',
  },
  serviceBoxInfo: {
    alignItems: 'center',
    width: '100%',
  },
  serviceBoxName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#132A1B',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceBoxPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#236B38',
    textAlign: 'center',
  },
});

export default HomeScreen;
