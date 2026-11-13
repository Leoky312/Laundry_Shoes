/**
 * INTERFACE DEFINITIONS - SHOE CARE & EXTERNAL SERVICES
 * Digunakan untuk pemetaan data External API ke dalam typed Object
 */

// Generic API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Interface untuk Data Rekomendasi Produk Sepatu (dari External API DummyJSON)
export interface ShoeProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images?: string[];
}

// Interface untuk Respon Raw DummyJSON
export interface ExternalProductsApiResponse {
  products: ShoeProduct[];
  total: number;
  skip: number;
  limit: number;
}

// Interface untuk Panduan & Tips Perawatan Sepatu
export interface ShoeCareGuide {
  id: number;
  title: string;
  content: string;
  category: 'cleaning' | 'drying' | 'storage' | 'protection';
  suitableFor: string;
  likes: number;
}

// Interface untuk Cuaca & Kondisi Penjemuran Sepatu (Live Open-Meteo Weather API)
export interface WeatherDryingStatus {
  city: string;
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  dryingCondition: 'Sangat Baik' | 'Cukup' | 'Hujan / Lembab';
  estimatedDryingTime: string;
  isRaining: boolean;
  humidity?: number;
}

// Interface untuk Hasil Pengecekan Ketersediaan Layanan Kilat
export interface ExpressAvailabilityResult {
  material: string;
  isAvailable: boolean;
  estimatedHours: number;
  serviceNotes: string;
  checkedAt: string;
}
