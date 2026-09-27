import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Button from '../components/Button';
import Card from '../components/Card';
import api from '../services/api';

const DetailServiceScreen = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [serviceId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/services/${serviceId}`);
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

  if (loading || !service) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                service.image ||
                'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
            }}
            style={styles.image}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Content Details */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.servicePrice}>{formatRupiah(service.price)}</Text>
          </View>

          {/* Quick Info Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.badgeItem}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.badgeText}>Estimasi: {service.duration}</Text>
            </View>
            <View style={styles.badgeItem}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.success} />
              <Text style={[styles.badgeText, { color: Colors.success }]}>Garansi Bersih</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeading}>Deskripsi Treatment</Text>
          <Text style={styles.description}>{service.description}</Text>

          {/* Treatment Steps Overview */}
          <Text style={styles.sectionHeading}>Alur Perawatan</Text>
          <Card style={styles.stepCard}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumText}>1</Text></View>
              <Text style={styles.stepText}>Inspeksi bahan dan pencatatan kondisi sepatu.</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumText}>2</Text></View>
              <Text style={styles.stepText}>Pembersihan mendalam dengan formula khusus anti-rusak.</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumText}>3</Text></View>
              <Text style={styles.stepText}>Pengeringan tanpa paparan matahari langsung (UV safe).</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumText}>4</Text></View>
              <Text style={styles.stepText}>Pemberian antibakteri, parfum khusus, & quality check.</Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total Biaya</Text>
          <Text style={styles.totalPrice}>{formatRupiah(service.price)}</Text>
        </View>
        <Button
          title="Booking Sekarang"
          onPress={() => navigation.navigate('Booking', { service })}
          style={styles.bookBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceAlt,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.secondary,
    flex: 1,
    marginRight: 10,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  stepCard: {
    marginTop: 8,
    marginBottom: 40,
    padding: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepText: {
    fontSize: 13,
    color: Colors.secondary,
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  bookBtn: {
    paddingHorizontal: 24,
  },
});

export default DetailServiceScreen;
