import MockAdapter from 'axios-mock-adapter';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

import servicesData from '../data/services.json';
import usersData from '../data/users.json';
import ordersData from '../data/orders.json';

// Get correct array array based on file structure
const extractArr = (data) => Array.isArray(data) ? data : (data.data || Object.values(data)[0] || []);

const isSSR = typeof window === 'undefined';

const mock = new MockAdapter(api, { delayResponse: 300 });

// In-memory fallback for SSR
const memoryDB = {
  '@db_services': extractArr(servicesData),
  '@db_users': extractArr(usersData),
  '@db_orders': extractArr(ordersData),
  '@db_init': 'true'
};

// Initialize local DB if empty
const initDB = async () => {
  if (isSSR) return;
  try {
    const isInit = await AsyncStorage.getItem('@db_init');
    if (!isInit) {
      await AsyncStorage.setItem('@db_services', JSON.stringify(extractArr(servicesData)));
      await AsyncStorage.setItem('@db_users', JSON.stringify(extractArr(usersData)));
      await AsyncStorage.setItem('@db_orders', JSON.stringify(extractArr(ordersData)));
      await AsyncStorage.setItem('@db_init', 'true');
    }
  } catch (e) {}
};
initDB();

const getDB = async (key) => {
  if (isSSR) return memoryDB[key] || [];
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : [];
  } catch(e) {
    return memoryDB[key] || [];
  }
};

const setDB = async (key, data) => {
  if (isSSR) {
    memoryDB[key] = data;
    return;
  }
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
};

// --- Mock Endpoints ---

// GET /services
mock.onGet(/\/services(\?.*)?$/).reply(async () => {
  const services = await getDB('@db_services');
  return [200, { data: services }];
});

// GET /services/:id
mock.onGet(/\/services\/\d+/).reply(async (config) => {
  const id = parseInt(config.url.split('/').pop());
  const services = await getDB('@db_services');
  const service = services.find(s => s.id === id);
  if (service) return [200, { data: service }];
  return [404, { message: 'Not found' }];
});

// POST /auth/login
mock.onPost('/auth/login').reply(async (config) => {
  const { email, phone, password } = JSON.parse(config.data);
  const identifier = email || phone;
  const users = await getDB('@db_users');
  
  // For mock purpose, accept plain 'admin123' and 'customer123'
  const isPlainPasswordValid = (u) => 
    (u.role === 'ADMIN' && password === 'admin123') ||
    (u.role === 'CUSTOMER' && password === 'customer123');
    
  const user = users.find(u => 
    (u.phone === identifier || u.email === identifier) && 
    (u.password === password || isPlainPasswordValid(u))
  );
  
  if (user) {
    return [200, { data: { token: user.email, user } }];
  }
  return [401, { message: 'Kredensial tidak valid' }];
});

// GET /auth/me
mock.onGet('/auth/me').reply(async (config) => {
  const token = config.headers.Authorization?.replace('Bearer ', '');
  const users = await getDB('@db_users');
  const user = users.find(u => u.email === token) || users[0];
  return [200, { data: user }];
});

// GET /orders
mock.onGet(/\/orders(\?.*)?$/).reply(async (config) => {
  let orders = await getDB('@db_orders');
  
  // Check for status query param
  const urlObj = new URL(config.url, 'http://localhost');
  const statusFilter = urlObj.searchParams.get('status');
  if (statusFilter && statusFilter !== 'SEMUA') {
    orders = orders.filter(o => o.status === statusFilter);
  }
  
  return [200, { data: orders }];
});

// GET /orders/:id
mock.onGet(/\/orders\/\d+/).reply(async (config) => {
  const id = parseInt(config.url.split('/').pop());
  const orders = await getDB('@db_orders');
  const order = orders.find(o => o.id === id);
  if (order) return [200, { data: order }];
  return [404, { message: 'Order not found' }];
});

// POST /orders (Checkout)
mock.onPost('/orders').reply(async (config) => {
  const data = JSON.parse(config.data);
  const orders = await getDB('@db_orders');
  const newOrder = {
    id: Date.now(),
    ...data,
    status: 'MENUNGGU_PEMBAYARAN',
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  await setDB('@db_orders', orders);
  return [201, { data: newOrder }];
});

// GET /admin/dashboard
mock.onGet('/admin/dashboard').reply(async () => {
  const orders = await getDB('@db_orders');
  return [200, {
    data: {
      stats: {
        totalOrders: orders.length,
        revenue: orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0),
        activeOrders: orders.filter(o => o.status !== 'SELESAI').length,
        completedOrders: orders.filter(o => o.status === 'SELESAI').length,
        pendingOrders: orders.filter(o => o.status === 'MENUNGGU').length,
        inProcessOrders: orders.filter(o => o.status === 'DIPROSES').length,
        cancelledOrders: orders.filter(o => o.status === 'DIBATALKAN').length,
      },
      recentOrders: orders.slice(-5)
    }
  }];
});

// GET /admin/reports
mock.onGet('/admin/reports').reply(async () => {
  const orders = await getDB('@db_orders');
  return [200, {
    data: {
      totalRevenue: orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0),
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'SELESAI').length,
      cancelledOrders: orders.filter(o => o.status === 'DIBATALKAN').length,
    }
  }];
});

// Fallback
mock.onAny().reply(404, { message: 'Mock route not implemented' });

export default api;
