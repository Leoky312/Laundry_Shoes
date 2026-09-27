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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import api, { getImageUrl } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greetingText}>Halo, {user?.name?.split(' ')[0] || 'Sneakerhead'} 👋</Text>
          <Text style={styles.headerSub}>Sepatu apa yang mau dibersihkan hari ini?</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          {user?.avatar ? (
            <Image source={{ uri: getImageUrl(user.avatar) }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={20} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Hero Banner Promo */}
      <View style={styles.heroBanner}>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeText}>✨ SPESIAL DISKON 20%</Text>
        </View>
        <Text style={styles.bannerTitle}>Rawat Sepatumu{'\n'}Seperti Baru Lagi!</Text>
        <Text style={styles.bannerDesc}>Gratis penjemputan dan pengantaran area terdekat.</Text>
        <TouchableOpacity
          style={styles.bannerCta}
          onPress={() => services.length > 0 && navigation.navigate('Booking', { service: services[0] })}
          activeOpacity={0.8}
        >
          <Text style={styles.bannerCtaText}>Pesan Sekarang</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Services Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pilihan Layanan</Text>
        <Text style={styles.serviceCount}>{services.length} Treatment Tersedia</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 30 }} />
      ) : (
        <View style={styles.servicesGrid}>
          {services.map((item) => (
            <Card
              key={item.id}
              style={styles.serviceCard}
              onPress={() => navigation.navigate('DetailService', { serviceId: item.id })}
            >
              <Image
                source={{
                  uri: item.image || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
                }}
                style={styles.serviceImg}
              />
              <View style={styles.serviceInfo}>
                <View style={styles.serviceDurationBadge}>
                  <Ionicons name="time-outline" size={12} color={Colors.primary} />
                  <Text style={styles.serviceDurationText}>{item.duration}</Text>
                </View>
                <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.servicePrice}>{formatRupiah(item.price)}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.secondary,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 44,
    height: 44,
  },
  heroBanner: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  bannerBadgeText: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '700',
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
  },
  bannerDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  bannerCtaText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
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
    color: Colors.secondary,
  },
  serviceCount: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  serviceImg: {
    width: '100%',
    height: 110,
    backgroundColor: Colors.surfaceAlt,
  },
  serviceInfo: {
    padding: 12,
  },
  serviceDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  serviceDurationText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 6,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
});

export default HomeScreen;
