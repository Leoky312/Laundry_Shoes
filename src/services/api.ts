import axios from 'axios';
import Storage from './storage';
import { Platform, NativeModules } from 'react-native';
import mockApi from './mockApi';

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
  } catch (e) {
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
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    return Promise.reject(error);
  }
);

/**
 * Router Mock REST API Fallback
 * Meniru respon REST API backend saat offline
 */
const handleMockFallback = async (method: string, url: string, data?: any, params?: any): Promise<any> => {
  const cleanUrl = url.replace(/^\/api/, '').replace(/^\//, '');
  const [pathOnly, queryString] = cleanUrl.split('?');
  const mergedParams = { ...params };

  if (queryString) {
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [k, v] = pair.split('=');
      if (k && mergedParams[decodeURIComponent(k)] === undefined) {
        mergedParams[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
      }
    }
  }

  console.log(`[Mock REST API] Fallback triggered: ${method.toUpperCase()} /${pathOnly}`, mergedParams);

  // 1. Services
  if (pathOnly === 'services' && method === 'GET') {
    return await mockApi.getServices();
  }
  if (pathOnly.startsWith('services/') && method === 'GET') {
    const id = pathOnly.split('/')[1];
    return await mockApi.getServiceDetail(id);
  }

  // 2. Auth
  if (pathOnly === 'auth/login' && method === 'POST') {
    return await mockApi.login(data?.email, data?.password);
  }
  if (pathOnly === 'auth/register' && method === 'POST') {
    return await mockApi.register(data);
  }
  if (pathOnly === 'auth/me' && method === 'GET') {
    return await mockApi.getMe();
  }
  if (pathOnly === 'auth/logout' && method === 'POST') {
    return await mockApi.logout();
  }

  // 3. Orders
  if (pathOnly === 'orders/my-orders' && method === 'GET') {
    return await mockApi.getMyOrders();
  }
  if (pathOnly === 'orders' && method === 'POST') {
    return await mockApi.createOrder(data);
  }
  if (pathOnly.startsWith('orders/') && pathOnly.endsWith('/cancel') && method === 'POST') {
    const id = pathOnly.split('/')[1];
    return await mockApi.cancelOrder(id);
  }
  if (pathOnly.startsWith('orders/') && pathOnly.endsWith('/payment-proof') && method === 'POST') {
    const id = pathOnly.split('/')[1];
    return await mockApi.uploadPaymentProof(id);
  }
  if (pathOnly.startsWith('orders/') && method === 'GET') {
    const id = pathOnly.split('/')[1];
    return await mockApi.getOrderDetail(id);
  }

  // 4. Tracking
  if (pathOnly.startsWith('tracking/') && method === 'GET') {
    const orderNumber = pathOnly.split('/')[1];
    return await mockApi.getTrackingByOrderNumber(orderNumber);
  }

  // 5. Admin
  if (pathOnly === 'admin/dashboard' && method === 'GET') {
    return await mockApi.getAdminDashboard();
  }
  if (pathOnly === 'admin/orders' && method === 'GET') {
    return await mockApi.getAdminOrders(mergedParams?.status, mergedParams?.search);
  }
  if (pathOnly.startsWith('admin/orders/') && pathOnly.endsWith('/status') && (method === 'PUT' || method === 'PATCH')) {
    const id = pathOnly.split('/')[2];
    return await mockApi.updateOrderStatus(id, data?.status, data?.notes);
  }
  if (pathOnly.startsWith('admin/orders/') && method === 'DELETE') {
    const id = pathOnly.split('/')[2];
    return await mockApi.deleteOrder(id);
  }
  if (pathOnly === 'admin/reports' && method === 'GET') {
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
      return await handleMockFallback('GET', url, null, config?.params);
    }
    try {
      return await axiosInstance.get(url, config);
    } catch (error: any) {
      // Fallback jika backend mati / tidak terhubung
      return await handleMockFallback('GET', url, null, config?.params);
    }
  },

  async post(url: string, data?: any, config?: any) {
    if (USE_FORCE_MOCK) {
      return await handleMockFallback('POST', url, data, config?.params);
    }
    try {
      return await axiosInstance.post(url, data, config);
    } catch (error: any) {
      return await handleMockFallback('POST', url, data, config?.params);
    }
  },

  async put(url: string, data?: any, config?: any) {
    if (USE_FORCE_MOCK) {
      return await handleMockFallback('PUT', url, data, config?.params);
    }
    try {
      return await axiosInstance.put(url, data, config);
    } catch (error: any) {
      return await handleMockFallback('PUT', url, data, config?.params);
    }
  },

  async patch(url: string, data?: any, config?: any) {
    if (USE_FORCE_MOCK) {
      return await handleMockFallback('PATCH', url, data, config?.params);
    }
    try {
      const axiosFn = (axiosInstance as any).patch || axiosInstance.put;
      return await axiosFn.call(axiosInstance, url, data, config);
    } catch (error: any) {
      return await handleMockFallback('PATCH', url, data, config?.params);
    }
  },

  async delete(url: string, config?: any) {
    if (USE_FORCE_MOCK) {
      return await handleMockFallback('DELETE', url, null, config?.params);
    }
    try {
      return await axiosInstance.delete(url, config);
    } catch (error: any) {
      return await handleMockFallback('DELETE', url, null, config?.params);
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
