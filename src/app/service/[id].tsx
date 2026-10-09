import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../constants/theme';
import GlobalStyles from '../../constants/styles';
import { SERVICES_DATA, Service } from '../../constants/data';
import { useCart } from '../../context/CartContext';
import PrimaryButton from '../../components/PrimaryButton';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();

  const service: Service =
    SERVICES_DATA.find((s) => s.id === id) || SERVICES_DATA[0];

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    addToCart(service, quantity);
    router.push('/cart');
  };

  // Custom function for rendering features list
  const renderFeatureItem = (feature: string, index: number) => (
    <View key={`feat_${index}`} style={styles.featureRow}>
      <Ionicons
        name="checkmark-circle"
        size={18}
        color={Theme.colors.primary}
        style={styles.featureIcon}
      />
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Hero Image with Round Bottom Corners */}
        <View style={styles.imageWrapper}>
          <Image
            source={service.image}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Floating Back Button */}
          <SafeAreaView style={styles.headerFloatingOverlay} edges={['top']}>
            <TouchableOpacity
              style={styles.floatingRoundBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color={Theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingRoundBtn}
              onPress={() => setIsFavorite(!isFavorite)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? Theme.colors.danger : Theme.colors.text}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content Details */}
        <View style={styles.contentContainer}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.servicePrice}>{service.priceFormatted}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={Theme.colors.rating} />
            <Text style={styles.ratingText}>
              {service.rating} ({service.reviewCount} ulasan)
            </Text>
          </View>

          {/* Deskripsi */}
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.descriptionText}>{service.description}</Text>

          {/* Keunggulan */}
          <Text style={styles.sectionTitle}>Keunggulan</Text>
          <View style={styles.featuresList}>
            {(service.features || []).map(renderFeatureItem)}
          </View>

          {/* Stepper Baris Jumlah */}
          <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>Jumlah</Text>
            <View style={GlobalStyles.stepper}>
              <TouchableOpacity
                style={GlobalStyles.stepperBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                activeOpacity={0.7}
              >
                <Text style={GlobalStyles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={GlobalStyles.stepperValue}>{quantity}</Text>
              <TouchableOpacity
                style={GlobalStyles.stepperBtn}
                onPress={() => setQuantity(quantity + 1)}
                activeOpacity={0.7}
              >
                <Text style={GlobalStyles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action */}
      <View style={GlobalStyles.bottomBar}>
        <PrimaryButton
          title="Tambah ke Keranjang"
          onPress={handleAddToCart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  imageWrapper: {
    width: '100%',
    height: 280,
    backgroundColor: '#E2F0E5',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '90%',
    height: '90%',
  },
  headerFloatingOverlay: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  floatingRoundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.card,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.primary,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: Theme.colors.textSecondary,
    marginBottom: 18,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  stepperLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text,
  },
});
