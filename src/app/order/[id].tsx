import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../constants/theme';
import GlobalStyles from '../../constants/styles';
import { TIMELINE_STEPS, TimelineStep } from '../../constants/data';
import ScreenHeader from '../../components/ScreenHeader';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const orderId = (id as string) || 'SF123456';

  const handleContact = () => {
    Alert.alert('Hubungi Customer Service', 'Silakan hubungi WhatsApp kami di 0812-3456-7890');
  };

  // Custom function for rendering timeline step
  const renderTimelineStep = (step: TimelineStep, index: number) => {
    const isLast = index === TIMELINE_STEPS.length - 1;

    return (
      <View key={step.id} style={styles.timelineRow}>
        {/* Left Column: Indicator & Vertical Line */}
        <View style={styles.indicatorCol}>
          {step.completed ? (
            <Ionicons name="checkmark-circle" size={22} color={Theme.colors.primary} />
          ) : (
            <View style={styles.emptyCircle} />
          )}
          {!isLast && (
            <View
              style={[
                styles.timelineLine,
                step.completed && { backgroundColor: Theme.colors.primary },
              ]}
            />
          )}
        </View>

        {/* Right Column: Step Content */}
        <View style={styles.stepContent}>
          <Text
            style={[
              styles.stepTitle,
              step.completed && styles.stepTitleCompleted,
            ]}
          >
            {step.title}
          </Text>
          {step.time ? <Text style={styles.stepTime}>{step.time}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Detail Pesanan"
        onBack={() => router.replace('/(tabs)/orders' as any)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Green Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.orderNumberTitle}>Pesanan #{orderId}</Text>
          <View style={styles.statusBadgeRow}>
            <Ionicons name="time" size={16} color={Theme.colors.white} />
            <Text style={styles.statusBadgeText}>Dalam Proses</Text>
          </View>
          <Text style={styles.statusDescription}>
            Pesanan kamu sedang dicuci.
          </Text>
        </View>

        {/* Timeline Section Card */}
        <View style={styles.timelineCard}>
          {TIMELINE_STEPS.map(renderTimelineStep)}

          {/* Outline Button: Hubungi Kami */}
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={handleContact}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={18} color={Theme.colors.primary} />
            <Text style={styles.contactBtnText}>Hubungi Kami</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Detail Pesanan Item Card */}
        <Text style={styles.sectionHeaderTitle}>Detail Pesanan</Text>
        <View style={styles.orderItemCard}>
          <View style={styles.itemThumbnailBox}>
            <Image
              source={require('../../../assets/images/shoe-1.png')}
              style={styles.itemThumbnail}
              resizeMode="contain"
            />
          </View>

          <View style={styles.itemInfoCol}>
            <Text style={styles.itemName}>Cuci Sepatu</Text>
            <Text style={styles.itemPrice}>Rp 25.000</Text>
          </View>

          <Text style={styles.itemQuantity}>x1</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  statusCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.card,
    padding: 18,
    marginBottom: 16,
    ...Theme.shadow.button,
  },
  orderNumberTitle: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  statusBadgeText: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  statusDescription: {
    color: '#E8F5E9',
    fontSize: 13,
  },
  timelineCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    padding: 18,
    marginBottom: 20,
    ...Theme.shadow.card,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  indicatorCol: {
    width: 26,
    alignItems: 'center',
  },
  emptyCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.white,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  stepTitleCompleted: {
    color: Theme.colors.text,
    fontWeight: '700',
  },
  stepTime: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  contactBtn: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: Theme.colors.white,
  },
  contactBtnText: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 10,
  },
  orderItemCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadow.card,
  },
  itemThumbnailBox: {
    width: 55,
    height: 55,
    borderRadius: 12,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemThumbnail: {
    width: '90%',
    height: '90%',
  },
  itemInfoCol: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    paddingRight: 6,
  },
});
