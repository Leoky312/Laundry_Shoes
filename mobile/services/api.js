import axios from 'axios';
import Storage from './storage';
import { Platform, NativeModules } from 'react-native';

/**
 * Auto-detect IP backend dari scriptURL Metro Bundler:
 * - Secara dinamis mengambil IP host komputer tempat Expo berjalan
 * - Tidak perlu ganti manual tiap kali pindah Wi-Fi!
 */
const getDevServerHost = () => {
  if (Platform.OS === 'web') return 'localhost';
  try {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const address = scriptURL.split('://')[1]?.split('/')[0];
      const hostname = address?.split(':')[0];
      if (hostname) {
        return hostname;
      }
    }
  } catch (e) {
    // ignore
  }
  return 'localhost';
};

export const BASE_SERVER_URL = Platform.select({
  android: `http://${getDevServerHost()}:5000`,
  ios: `http://${getDevServerHost()}:5000`,
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
