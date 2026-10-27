import axios from 'axios';
import Storage from './storage';
import { Platform, NativeModules } from 'react-native';
import mockApi from './mockApi';
import parseApiError from './apiError';

/**
 * Atur ke true jika ingin selalu menggunakan Mock JSON tanpa menyalakan server backend.
 * Jika false, aplikasi akan mencoba menghubungi server backend terlebih dahulu.
 * Bila server offline / tidak terjangkau, otomatis fallback ke Mock JSON!
 */
export const USE_FORCE_MOCK = true;

const getDevServerHost = () => {
  if (Platform.OS === 'web') return 'localhost';
  try {
    const scriptURL = (NativeModules.SourceCode as any)?.scriptURL;
    if (scriptURL) {
      const address = scriptURL.split('://')[1]?.split('/')[0];
      const hostname = address?.split(':')[0];
      if (hostname) {
        return hostname;
      }
    }
  } catch (_e) {
    // ignore
  }
  return 'localhost';
};

export const BASE_SERVER_URL = Platform.select({
  android: `http://${getDevServerHost()}:5000`,
  ios: `http://${getDevServerHost()}:5000`,
  default: 'http://localhost:5000',
}) as string;

export const API_URL = `${BASE_SERVER_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
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
  (error) => Promise.reject(parseApiError(error))
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    return Promise.reject(parseApiError(error));
  }
);

/**
 * Router Mock REST API Fallback
 * Meniru respon REST API backend saat offline
 */
const handleMockFallback = async (method: string, url: string, data?: any, params?: any): Promise<any> => {
  const cleanUrl = url.replace(/^\/api/, '').replace(/^\//, '');

  console.log(`[Mock REST API] Fallback triggered: ${method.toUpperCase()} /${cleanUrl}`);

  // 1. Services
  if (cleanUrl === 'services' && method === 'GET') {
    return await mockApi.getServices();
  }
  if (cleanUrl.startsWith('services/') && method === 'GET') {
    const id = cleanUrl.split('/')[1];
    return await mockApi.getServiceDetail(id);
  }

  // 2. Auth
  if (cleanUrl === 'auth/login' && method === 'POST') {
    return await mockApi.login(data?.email, data?.password);
  }
  if (cleanUrl === 'auth/register' && method === 'POST') {
    return await mockApi.register(data);
  }
  if (cleanUrl === 'auth/me' && method === 'GET') {
    return await mockApi.getMe();
  }
  if (cleanUrl === 'auth/logout' && method === 'POST') {
    return await mockApi.logout();
  }

  // 3. Orders
  if (cleanUrl === 'orders/my-orders' && method === 'GET') {
    return await mockApi.getMyOrders();
  }
  if (cleanUrl === 'orders' && method === 'POST') {
    return await mockApi.createOrder(data);
  }
  if (cleanUrl.startsWith('orders/') && cleanUrl.endsWith('/cancel') && method === 'POST') {
    const id = cleanUrl.split('/')[1];
    return await mockApi.cancelOrder(id);
  }
  if (cleanUrl.startsWith('orders/') && cleanUrl.endsWith('/payment-proof') && method === 'POST') {
    const id = cleanUrl.split('/')[1];
    let proofUrl = data?.proofUrl || data?.uri;
    if (!proofUrl && data && typeof data.get === 'function') {
      const field = data.get('paymentProof') || data.get('image');
      if (typeof field === 'string') proofUrl = field;
      else if (field && field.uri) proofUrl = field.uri;
    }
    return await mockApi.uploadPaymentProof(id, proofUrl);
  }
  if (cleanUrl.startsWith('orders/') && method === 'GET') {
    const id = cleanUrl.split('/')[1];
    return await mockApi.getOrderDetail(id);
  }

  // 4. Tracking
  if (cleanUrl.startsWith('tracking/') && method === 'GET') {
    const orderNumber = cleanUrl.split('/')[1];
    return await mockApi.getTrackingByOrderNumber(orderNumber);
  }

  // 5. Admin
  if (cleanUrl === 'admin/dashboard' && method === 'GET') {
    return await mockApi.getAdminDashboard();
  }
  if (cleanUrl === 'admin/orders' && method === 'GET') {
    return await mockApi.getAdminOrders(params?.status, params?.search);
  }
  if (cleanUrl.startsWith('admin/orders/') && cleanUrl.endsWith('/status') && method === 'PUT') {
    const id = cleanUrl.split('/')[2];
    return await mockApi.updateOrderStatus(id, data?.status, data?.notes);
  }
  if (cleanUrl === 'admin/reports' && method === 'GET') {
    return await mockApi.getReports();
  }

  // Fallback generic empty success
  return { success: true, message: 'Mock response OK', data: null };
};

/**
 * Universal API Client:
 * Mendukung Real Backend REST API + Otomatis Fallback ke Mock JSON
 */
export const api = {
  async get(url: string, config?: any) {
    if (USE_FORCE_MOCK) {
      try {
        const res = await handleMockFallback('GET', url, null, config?.params);
        if (url.includes('services') && res?.data) {
          Storage.setItem('@cache_services', JSON.stringify(res.data)).catch(() => {});
        }
        return res;
      } catch (err: any) {
        if (url.includes('services')) {
          const cached = await Storage.getItem('@cache_services');
          if (cached) {
            return { success: true, fromCache: true, data: JSON.parse(cached) };
          }
        }
        throw parseApiError(err);
      }
    }
    try {
      const res = await axiosInstance.get(url, config);
      if (url.includes('services') && res?.data) {
        Storage.setItem('@cache_services', JSON.stringify(res.data)).catch(() => {});
      }
      return res;
    } catch (error: any) {
      // If server responded with an error (4xx/5xx), do not fallback to mock
      if (error?.response) {
        throw parseApiError(error);
      }
      // If network is offline or server unreachable, fallback to mock/cache
      try {
        const mockRes = await handleMockFallback('GET', url, null, config?.params);
        return mockRes;
      } catch (_fallbackError) {
        if (url.includes('services')) {
          const cached = await Storage.getItem('@cache_services');
          if (cached) {
            return { success: true, fromCache: true, data: JSON.parse(cached) };
          }
        }
        throw parseApiError(error);
      }
    }
  },

  async post(url: string, data?: any, config?: any) {
    if (USE_FORCE_MOCK) {
      try {
        return await handleMockFallback('POST', url, data, config?.params);
      } catch (err) {
        throw parseApiError(err);
      }
    }
    try {
      return await axiosInstance.post(url, data, config);
    } catch (error: any) {
      if (error?.response) {
        throw parseApiError(error);
      }
      try {
        return await handleMockFallback('POST', url, data, config?.params);
      } catch (_fallbackError) {
        throw parseApiError(error);
      }
    }
  },

  async put(url: string, data?: any, config?: any) {
    if (USE_FORCE_MOCK) {
      try {
        return await handleMockFallback('PUT', url, data, config?.params);
      } catch (err) {
        throw parseApiError(err);
      }
    }
    try {
      return await axiosInstance.put(url, data, config);
    } catch (error: any) {
      if (error?.response) {
        throw parseApiError(error);
      }
      try {
        return await handleMockFallback('PUT', url, data, config?.params);
      } catch (_fallbackError) {
        throw parseApiError(error);
      }
    }
  },

  async delete(url: string, config?: any) {
    if (USE_FORCE_MOCK) {
      try {
        return await handleMockFallback('DELETE', url, null, config?.params);
      } catch (err) {
        throw parseApiError(err);
      }
    }
    try {
      return await axiosInstance.delete(url, config);
    } catch (error: any) {
      if (error?.response) {
        throw parseApiError(error);
      }
      try {
        return await handleMockFallback('DELETE', url, null, config?.params);
      } catch (_fallbackError) {
        throw parseApiError(error);
      }
    }
  },
};

export const getImageUrl = (imagePath?: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${BASE_SERVER_URL}${imagePath}`;
};

export default api;
