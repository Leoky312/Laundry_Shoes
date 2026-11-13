/**
 * SHOE CARE & EXTERNAL API SERVICE
 * Menangani komunikasi data eksternal, cuaca pengeringan, tips, dan validasi Promise
 */

import {
  ShoeProduct,
  ExternalProductsApiResponse,
  ShoeCareGuide,
  WeatherDryingStatus,
  ExpressAvailabilityResult,
} from '../types/shoeCare';

export const shoeCareService = {
  // =========================================================================
  // 1. PRE-BUILT ASYNC & INTERFACE: Mengambil Rekomendasi Sepatu dari External API
  // =========================================================================
  /**
   * Custom Async Function yang memanggil pre-built async function fetch().
   * Mengambil data produk eksternal (DummyJSON) dan memasukkannya ke
   * dalam array object bertipe Interface `ShoeProduct`.
   */
  async fetchExternalShoeRecommendations(): Promise<ShoeProduct[]> {
    try {
      // Pre-built Async Function: fetch()
      const response = await fetch('https://dummyjson.com/products/category/mens-shoes');

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      // Memasukkan hasil json ke dalam Object bertipe Interface ExternalProductsApiResponse
      const jsonResponse: ExternalProductsApiResponse = await response.json();

      // Transformasi ke Object bertipe Interface ShoeProduct
      const shoeList: ShoeProduct[] = jsonResponse.products.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        price: item.price,
        rating: item.rating,
        stock: item.stock,
        brand: item.brand || 'Sneaker Premium',
        thumbnail: item.thumbnail,
        images: item.images || [],
      }));

      return shoeList;
    } catch (error: any) {
      console.warn('[shoeCareService.fetchExternalShoeRecommendations] Gagal mengambil data eksternal:', error.message);
      throw error;
    }
  },

  // =========================================================================
  // 2. LIVE WEATHER FORECAST UNTUK PENJEMURAN SEPATU (Open-Meteo API)
  // =========================================================================
  /**
   * Mengambil kondisi cuaca live untuk estimasi waktu penjemuran sepatu di workshop.
   */
  async fetchDryingWeather(city: string = 'Malang'): Promise<WeatherDryingStatus> {
    try {
      const url =
        'https://api.open-meteo.com/v1/forecast?latitude=-7.98&longitude=112.63&current=temperature_2m,relative_humidity_2m,weather_code';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Gagal menghubungi Open-Meteo Server');
      }

      const weatherData = await response.json();
      const current = weatherData.current || {};
      const temp = current.temperature_2m ?? 28;
      const code = current.weather_code ?? 0;
      const humidity = current.relative_humidity_2m ?? 65;
      const isRaining = code >= 51;

      let condition: WeatherDryingStatus['dryingCondition'] = 'Sangat Baik';
      let estTime = '3 - 4 Jam (Panas Alami)';
      let description = 'Cerah Berawan';

      if (isRaining) {
        condition = 'Hujan / Lembab';
        estTime = '12 - 24 Jam (Pengering UV / Mesin Blower)';
        description = 'Hujan / Gerimis';
      } else if (temp < 25) {
        condition = 'Cukup';
        estTime = '6 - 8 Jam';
        description = 'Sejuk Berawan';
      }

      const result: WeatherDryingStatus = {
        city,
        temperature: temp,
        weatherCode: code,
        weatherDescription: description,
        dryingCondition: condition,
        estimatedDryingTime: estTime,
        isRaining,
        humidity,
      };

      return result;
    } catch {
      // Fallback data jika koneksi internet sedang offline
      return {
        city,
        temperature: 28,
        weatherCode: 1,
        weatherDescription: 'Cerah Berawan (Koneksi Offline)',
        dryingCondition: 'Sangat Baik',
        estimatedDryingTime: '4 - 5 Jam',
        isRaining: false,
        humidity: 60,
      };
    }
  },

  // =========================================================================
  // 3. IMPLEMENTASI .THEN() & .CATCH() CHAINING: Panduan Perawatan Sepatu
  // =========================================================================
  /**
   * Menggunakan pola .then() dan .catch() secara eksplisit
   * untuk memproses data panduan perawatan sepatu.
   */
  fetchShoeCareGuidesWithThen(): Promise<ShoeCareGuide[]> {
    return fetch('https://dummyjson.com/posts?limit=3')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Gagal memuat panduan eksternal`);
        }
        return res.json();
      })
      .then((jsonData: any) => {
        const indonesianGuides = [
          {
            title: 'Panduan Cuci Sneakers Canvas & Knit',
            content:
              'Gunakan sikat berbulu halus (soft brush) dan sabun khusus sepatu berbahan alami. Hindari merendam sneaker di dalam deterjen agar sol lem tidak mengelupas dan warna kain tidak kusam.',
            category: 'cleaning' as const,
            suitableFor: 'Sneakers Canvas & Knit',
          },
          {
            title: 'Perawatan Sepatu Kulit & Leather Asli',
            content:
              'Bersihkan debu dan kotoran dengan kain microfiber lembap, lalu aplikasikan leather conditioner secara rutin agar tekstur kulit tetap lentur, berkilau alami, dan terhindar dari retak.',
            category: 'protection' as const,
            suitableFor: 'Kulit / Leather Asli',
          },
          {
            title: 'Tips Khusus Bahan Suede & Nubuck',
            content:
              'Gunakan sikat khusus suede (crepe brush) dengan gerakan searah. Hindari kontak langsung dengan air dan gunakan semprotan waterproof repellent untuk perlindungan ekstra dari noda cairan.',
            category: 'storage' as const,
            suitableFor: 'Suede & Nubuck',
          },
        ];

        const guides: ShoeCareGuide[] = (jsonData.posts || []).map((post: any, index: number) => {
          const guideItem = indonesianGuides[index % indonesianGuides.length];
          return {
            id: post.id || index + 1,
            title: guideItem.title,
            content: guideItem.content,
            category: guideItem.category,
            suitableFor: guideItem.suitableFor,
            likes: post.reactions?.likes || 25,
          };
        });
        return guides;
      })
      .catch((err) => {
        console.warn('[fetchShoeCareGuidesWithThen] Fallback ke panduan lokal:', err.message);
        return [
          {
            id: 1,
            title: 'Panduan Cuci Sneakers Canvas & Knit',
            content:
              'Gunakan sikat berbulu halus (soft brush) dan sabun khusus sepatu berbahan alami. Hindari merendam sneaker di dalam deterjen agar sol lem tidak mengelupas dan warna kain tidak kusam.',
            category: 'cleaning',
            suitableFor: 'Sneakers Canvas & Knit',
            likes: 48,
          },
          {
            id: 2,
            title: 'Perawatan Sepatu Kulit & Leather Asli',
            content:
              'Bersihkan debu dan kotoran dengan kain microfiber lembap, lalu aplikasikan leather conditioner secara rutin agar tekstur kulit tetap lentur, berkilau alami, dan terhindar dari retak.',
            category: 'protection',
            suitableFor: 'Kulit / Leather Asli',
            likes: 56,
          },
          {
            id: 3,
            title: 'Tips Khusus Bahan Suede & Nubuck',
            content:
              'Gunakan sikat khusus suede (crepe brush) dengan gerakan searah. Hindari kontak langsung dengan air dan gunakan semprotan waterproof repellent untuk perlindungan ekstra dari noda cairan.',
            category: 'storage',
            suitableFor: 'Suede & Nubuck',
            likes: 34,
          },
        ] as ShoeCareGuide[];
      });
  },

  // =========================================================================
  // 4. IMPLEMENTASI EKSPLISIT .RESOLVE() DAN .REJECT()
  // =========================================================================
  /**
   * Pengecekan Ketersediaan Slot Express (Pengerjaan Kilat 24 Jam):
   * - Jika bahan adalah Canvas, Mesh, atau Leather Sintetis -> RESOLVE dengan detail estimasi.
   * - Jika bahan adalah Suede, Nubuck, atau Leather Asli -> REJECT dengan penjelasan alasan teknis.
   *
   * @param material - jenis material sepatu yang dipilih pelanggan
   */
  checkExpressAvailability(material: string): Promise<ExpressAvailabilityResult> {
    return new Promise<ExpressAvailabilityResult>((resolve, reject) => {
      console.log(`[Promise Constructor] Memeriksa kelayakan express untuk bahan: ${material}...`);

      setTimeout(() => {
        const normalized = material.trim().toLowerCase();

        // Bahan yang aman untuk Express Laundry (Proses cepat tanpa risiko luntur/rusak)
        const expressSafeMaterials = ['canvas', 'mesh', 'rubber', 'synthetic leather', 'nylon'];

        if (expressSafeMaterials.includes(normalized)) {
          // MEMANGGIL RESOLVE() JIKA SYARAT TERPENUHI
          resolve({
            material: material,
            isAvailable: true,
            estimatedHours: 24,
            serviceNotes: `Material ${material} aman untuk treatment kilat dengan blower suhu rendah. Kuota express hari ini tersedia.`,
            checkedAt: new Date().toLocaleTimeString('id-ID'),
          });
        } else {
          // MEMANGGIL REJECT() JIKA BAHAN BERISIKO DAN PERLU WAKTU LEBIH LAMA
          reject(
            new Error(
              `Material ${material} memerlukan teknik deep-treatment reguler (min. 3 hari) agar serat dan kelembutan bahan tidak rusak!`
            )
          );
        }
      }, 1000);
    });
  },
};

export default shoeCareService;
