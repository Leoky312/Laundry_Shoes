import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import shoeCareService from '../services/shoeCareService';
import {
  ShoeProduct,
  ShoeCareGuide,
  WeatherDryingStatus,
  ExpressAvailabilityResult,
} from '../types/shoeCare';

interface ShoeCareScreenProps {
  navigation?: any;
}

const ShoeCareScreen: React.FC<ShoeCareScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // State untuk Data External API bertipe Interface
  const [products, setProducts] = useState<ShoeProduct[]>([]);
  const [guides, setGuides] = useState<ShoeCareGuide[]>([]);
  const [weather, setWeather] = useState<WeatherDryingStatus | null>(null);

  // Loading States
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingGuides, setLoadingGuides] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // State untuk Pengecekan Express (Promise: resolve, reject, then, catch)
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Canvas');
  const [checkingExpress, setCheckingExpress] = useState(false);
  const [expressResult, setExpressResult] = useState<{
    status: 'idle' | 'success' | 'rejected';
    title: string;
    description: string;
    timestamp?: string;
  }>({
    status: 'idle',
    title: 'Pilih Bahan Sepatu Kamu',
    description: 'Sistem akan memeriksa ketersediaan mesin pengering dan kelayakan bahan.',
  });

  useEffect(() => {
    loadWeatherData();
    loadProductsData();
    loadGuidesData();
  }, []);

  // 1. Fetch Cuaca Penjemuran (Custom Async Function & Pre-built fetch)
  const loadWeatherData = async () => {
    setLoadingWeather(true);
    try {
      const data = await shoeCareService.fetchDryingWeather('Malang');
      setWeather(data);
    } catch (err: any) {
      console.log('Error weather:', err.message);
    } finally {
      setLoadingWeather(false);
    }
  };

  // 2. Fetch Rekomendasi Sepatu dari External API ke dalam Object Interface ShoeProduct
  const loadProductsData = async () => {
    setLoadingProducts(true);
    try {
      const shoeList: ShoeProduct[] = await shoeCareService.fetchExternalShoeRecommendations();
      setProducts(shoeList);
    } catch (err: any) {
      console.log('Error products:', err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  // 3. Fetch Panduan Perawatan menggunakan .then() dan .catch() Chaining
  const loadGuidesData = () => {
    setLoadingGuides(true);
    shoeCareService
      .fetchShoeCareGuidesWithThen()
      .then((data: ShoeCareGuide[]) => {
        setGuides(data);
      })
      .catch((err: Error) => {
        console.warn('Gagal memuat panduan:', err.message);
      })
      .finally(() => {
        setLoadingGuides(false);
      });
  };

  // 4. Cek Kelayakan Express Service: Menguji .resolve() dan .reject()
  const handleCheckExpress = () => {
    setCheckingExpress(true);
    setExpressResult({
      status: 'idle',
      title: 'Memeriksa Sistem...',
      description: `Menganalisis karakteristik material ${selectedMaterial}...`,
    });

    // Memanggil Promise dan mengonsumsi hasilnya dengan .then() dan .catch()
    shoeCareService
      .checkExpressAvailability(selectedMaterial)
      .then((result: ExpressAvailabilityResult) => {
        // Dijalankan saat resolve() dipanggil (bahan aman: Canvas, Mesh, dll)
        setExpressResult({
          status: 'success',
          title: '✔ Pengerjaan Kilat Disetujui!',
          description: result.serviceNotes,
          timestamp: result.checkedAt,
        });
      })
      .catch((error: Error) => {
        // Dijalankan saat reject() dipanggil (bahan sensitif: Suede, Kulit Asli)
        setExpressResult({
          status: 'rejected',
          title: '✖ Tidak Disarankan untuk Kilat',
          description: error.message,
          timestamp: new Date().toLocaleTimeString('id-ID'),
        });
      })
      .finally(() => {
        setCheckingExpress(false);
      });
  };

  const formatRupiah = (usd: number) => {
    const idr = usd * 15500;
    return 'Rp ' + Math.round(idr).toLocaleString('id-ID');
  };

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation && navigation.goBack) {
              navigation.goBack();
            } else if (navigation && navigation.navigate) {
              navigation.navigate('HomeTab');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#132A1B" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Perawatan & Cuaca</Text>
          <Text style={styles.headerSubtitle}>Estimasi penjemuran & panduan sneaker</Text>
        </View>
        <TouchableOpacity onPress={loadWeatherData} style={styles.headerRefreshBtn}>
          <Ionicons name="refresh" size={20} color="#236B38" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainWrapper, isDesktop && styles.desktopWrapper]}>
          {/* SECTION 1: STATUS CUACA PENJEMURAN (OPEN-METEO LIVE API) */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="sunny-outline" size={20} color="#236B38" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardTitle}>Status Cuaca Penjemuran Workshop</Text>
                <Text style={styles.cardSubtitle}>Prakiraan cuaca real-time dari Open-Meteo</Text>
              </View>
            </View>

            {loadingWeather ? (
              <ActivityIndicator size="small" color="#236B38" style={{ marginVertical: 18 }} />
            ) : weather ? (
              <View style={styles.weatherBox}>
                <View style={styles.weatherMainRow}>
                  <View>
                    <Text style={styles.weatherCity}>{weather.city}</Text>
                    <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
                    <Text style={styles.weatherDesc}>{weather.weatherDescription}</Text>
                  </View>
                  <View style={styles.dryingBadge}>
                    <Text style={styles.dryingBadgeLabel}>Kondisi Jemur:</Text>
                    <Text style={styles.dryingBadgeVal}>{weather.dryingCondition}</Text>
                    <Text style={styles.dryingBadgeEst}>Estimasi: {weather.estimatedDryingTime}</Text>
                  </View>
                </View>
                <View style={styles.weatherNote}>
                  <Ionicons name="information-circle-outline" size={16} color="#4B5563" />
                  <Text style={styles.weatherNoteText}>
                    Kelembaban udara: {weather.humidity ?? 65}%. Waktu pengeringan disesuaikan otomatis dengan kondisi cuaca.
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* SECTION 2: CEK KELAYAKAN EXPRESS (PROMISE: RESOLVE & REJECT) */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="timer-outline" size={20} color="#166534" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardTitle}>Cek Kelayakan Layanan Kilat (24 Jam)</Text>
                <Text style={styles.cardSubtitle}>Validasi kelayakan material & kuota mesin</Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Pilih Material Sepatu Anda:</Text>
            <View style={styles.materialPillsRow}>
              {['Canvas', 'Mesh', 'Suede', 'Leather Asli'].map((mat) => (
                <TouchableOpacity
                  key={mat}
                  style={[
                    styles.materialPill,
                    selectedMaterial === mat && styles.materialPillActive,
                  ]}
                  onPress={() => setSelectedMaterial(mat)}
                >
                  <Text
                    style={[
                      styles.materialPillText,
                      selectedMaterial === mat && styles.materialPillTextActive,
                    ]}
                  >
                    {mat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.checkButton}
              onPress={handleCheckExpress}
              disabled={checkingExpress}
              activeOpacity={0.85}
            >
              {checkingExpress ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="search" size={18} color="#FFFFFF" />
                  <Text style={styles.checkButtonText}>Cek Kelayakan Material ({selectedMaterial})</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Kotak Hasil Validasi */}
            <View
              style={[
                styles.resultCard,
                expressResult.status === 'success' && styles.resultCardSuccess,
                expressResult.status === 'rejected' && styles.resultCardRejected,
              ]}
            >
              <View style={styles.resultHeader}>
                <Text
                  style={[
                    styles.resultTitle,
                    expressResult.status === 'success' && styles.textSuccess,
                    expressResult.status === 'rejected' && styles.textRejected,
                  ]}
                >
                  {expressResult.title}
                </Text>
                {expressResult.timestamp && (
                  <Text style={styles.resultTime}>{expressResult.timestamp}</Text>
                )}
              </View>
              <Text style={styles.resultDesc}>{expressResult.description}</Text>
            </View>
          </View>

          {/* SECTION 3: PANDUAN PERAWATAN SEPATU (.THEN CHAINING) */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="book-outline" size={20} color="#236B38" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardTitle}>Panduan Perawatan Sepatu</Text>
                <Text style={styles.cardSubtitle}>Tips profesional dari workshop ShoeFresh</Text>
              </View>
            </View>

            {loadingGuides ? (
              <ActivityIndicator size="small" color="#236B38" style={{ marginVertical: 18 }} />
            ) : (
              <View style={styles.guidesList}>
                {guides.map((guide) => (
                  <View key={guide.id} style={styles.guideItem}>
                    <View style={styles.guideHeader}>
                      <Text style={styles.guideTitle}>{guide.title}</Text>
                      <View style={styles.suitableTag}>
                        <Text style={styles.suitableTagText}>{guide.suitableFor}</Text>
                      </View>
                    </View>
                    <Text style={styles.guideContent}>{guide.content}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* SECTION 4: REKOMENDASI PRODUK SEPATU (EXTERNAL API & INTERFACE) */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="pricetags-outline" size={20} color="#236B38" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardTitle}>Inspirasi Sepatu & Sneaker</Text>
              </View>
              <TouchableOpacity onPress={loadProductsData} style={{ padding: 4 }}>
                <Ionicons name="refresh" size={18} color="#236B38" />
              </TouchableOpacity>
            </View>

            {loadingProducts ? (
              <ActivityIndicator size="small" color="#236B38" style={{ marginVertical: 24 }} />
            ) : (
              <View style={styles.productsGrid}>
                {products.map((item) => (
                  <View key={item.id} style={styles.productItem}>
                    <Image
                      source={{ uri: item.thumbnail }}
                      style={styles.productThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.productDetails}>
                      <Text style={styles.productBrand}>{item.brand}</Text>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.productRatingRow}>
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text style={styles.productRatingText}>{item.rating.toFixed(1)}</Text>
                        <Text style={styles.productStockText}>• Stok {item.stock}</Text>
                      </View>
                      <Text style={styles.productPriceText}>{formatRupiah(item.price)}</Text>
                      <Text style={styles.productPriceUsd}>(${item.price})</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ShoeCareScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#132A1B',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRefreshBtn: {
    padding: 6,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  mainWrapper: {
    width: '100%',
  },
  desktopWrapper: {
    maxWidth: 900,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  weatherBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  weatherMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherCity: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: '800',
    color: '#236B38',
  },
  weatherDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  dryingBadge: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dryingBadgeLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  dryingBadgeVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#236B38',
    marginTop: 2,
  },
  dryingBadgeEst: {
    fontSize: 11,
    color: '#374151',
    marginTop: 2,
  },
  weatherNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  weatherNoteText: {
    fontSize: 11,
    color: '#4B5563',
    flex: 1,
    lineHeight: 15,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  materialPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  materialPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  materialPillActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#236B38',
  },
  materialPillText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  materialPillTextActive: {
    color: '#236B38',
    fontWeight: '700',
  },
  checkButton: {
    backgroundColor: '#236B38',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultCardSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  resultCardRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  textSuccess: {
    color: '#166534',
  },
  textRejected: {
    color: '#991B1B',
  },
  resultTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  resultDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
  guidesList: {
    gap: 10,
  },
  guideItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  suitableTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suitableTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#236B38',
  },
  guideContent: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  productItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  productThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  productDetails: {
    padding: 10,
  },
  productBrand: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  productRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 4,
  },
  productRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  productStockText: {
    fontSize: 10,
    color: '#6B7280',
  },
  productPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#236B38',
  },
  productPriceUsd: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
