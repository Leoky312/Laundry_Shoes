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
import Theme from '../../constants/theme';
import GlobalStyles from '../../constants/styles';
import { SERVICES_DATA, QUICK_ACTIONS, Service, QuickAction } from '../../constants/data';
import ServiceCard from '../../components/ServiceCard';

export default function HomeScreen() {
  const router = useRouter();

  // Custom function for rendering repeated quick actions
  const renderQuickAction = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={styles.actionItem}
      activeOpacity={0.8}
      onPress={() => router.push(action.route as any)}
    >
      <View style={styles.actionIconCircle}>
        <Ionicons name={action.icon as any} size={22} color={Theme.colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{action.title}</Text>
    </TouchableOpacity>
  );

  // Custom function for rendering repeated service cards (vertical list)
  const renderServiceCard = (service: Service) => (
    <ServiceCard
      key={service.id}
      service={service}
      variant="vertical"
      onPress={() => router.push(`/service/${service.id}` as any)}
    />
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Logo kecil kiri, ikon lonceng kanan */}
        <View style={styles.topHeader}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={Theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Halo, Fatir 👋</Text>
          <Text style={styles.greetingSub}>Sepatu kamu, prioritas kami</Text>
        </View>

        {/* Green Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerHeading}>Bersih Maksimal</Text>
            <Text style={styles.bannerHeading}>Wangi Tahan Lama</Text>

            <TouchableOpacity
              style={styles.bannerBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/service/1' as any)}
            >
              <Text style={styles.bannerBtnText}>Pesan Sekarang</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bannerImageContainer}>
            <Image
              source={require('../../../assets/images/shoe-1.png')}
              style={styles.bannerShoeImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* 3 Quick Actions */}
        <View style={styles.actionsRow}>
          {QUICK_ACTIONS.map(renderQuickAction)}
        </View>

        {/* Section "Layanan Kami" */}
        <View style={GlobalStyles.sectionHeader}>
          <Text style={GlobalStyles.sectionTitle}>Layanan Kami</Text>
        </View>

        {/* Daftar Layanan (Bisa di-scroll ke bawah) */}
        <View style={styles.servicesList}>
          {SERVICES_DATA.map(renderServiceCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLogo: {
    width: 100,
    height: 40,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.card,
  },
  greetingSection: {
    marginBottom: 18,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 3,
  },
  banner: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.banner,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
    ...Theme.shadow.button,
  },
  bannerTextCol: {
    flex: 1,
    zIndex: 2,
  },
  bannerHeading: {
    color: Theme.colors.white,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  bannerBtn: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  bannerBtnText: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  bannerImageContainer: {
    width: 120,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  bannerShoeImage: {
    width: 130,
    height: 95,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    ...Theme.shadow.card,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },
  servicesList: {
    paddingTop: 4,
    paddingBottom: 16,
  },
});