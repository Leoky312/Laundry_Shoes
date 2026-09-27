import axios from 'axios';
import Storage from './storage';
import { Platform } from 'react-native';

/**
 * Konfigurasi Base URL Backend:
 * - Android Emulator  : gunakan 10.0.2.2 (IP khusus emulator → host)
 * - iOS Simulator     : gunakan localhost
 * - HP Fisik (Expo Go): gunakan IP Wi-Fi laptop Anda!
 *   ➜ IP Wi-Fi laptop saat ini: 192.168.100.8
 *   ➜ Ganti nilai WIFI_IP jika pindah jaringan
 */
const WIFI_IP = '192.168.100.8';

export const BASE_SERVER_URL = Platform.select({
  android: `http://${WIFI_IP}:5000`,
  ios: `http://${WIFI_IP}:5000`,
  default: 'http://localhost:5000', // Web browser di PC
});

export const API_URL = `${BASE_SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Otomatis sematkan Bearer Token dari penyimpanan lokal
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await Storage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Gagal mengambil auth token dari storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tangani error 401 (Sesi kedaluwarsa)
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan saat menghubungi server.';

    if (error.response?.status === 401) {
      console.warn('Sesi telah berakhir atau token tidak sah.');
    }

    return Promise.reject(new Error(errorMsg));
  }
);

/**
 * Helper untuk memformat URL gambar dari server
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${BASE_SERVER_URL}${imagePath}`;
};

export default api;
