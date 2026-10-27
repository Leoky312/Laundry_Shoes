import initialUsers from '../data/users.json';
import initialServices from '../data/services.json';
import initialOrders from '../data/orders.json';
import Storage from './storage';

// In-Memory state for mock session with local AsyncStorage persistence
let mockUsers = [...initialUsers];
let mockServices = [...initialServices];
let mockOrders = [...initialOrders];

let isOrdersLoadedFromStorage = false;

const loadOrdersFromStorage = async () => {
  if (isOrdersLoadedFromStorage) return;
  try {
    const saved = await Storage.getItem('@mock_orders');
    if (saved) {
      mockOrders = JSON.parse(saved);
    }
  } catch (_e) {
    // fallback
  } finally {
    isOrdersLoadedFromStorage = true;
  }
};

const saveOrdersToStorage = async () => {
  try {
    await Storage.setItem('@mock_orders', JSON.stringify(mockOrders));
  } catch (_e) {
    // fallback
  }
};

const base64UrlEncode = (str: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  const utf8Str = unescape(encodeURIComponent(str));
  for (let i = 0; i < utf8Str.length; i += 3) {
    const b1 = utf8Str.charCodeAt(i);
    const b2 = i + 1 < utf8Str.length ? utf8Str.charCodeAt(i + 1) : NaN;
    const b3 = i + 2 < utf8Str.length ? utf8Str.charCodeAt(i + 2) : NaN;

    const e1 = b1 >> 2;
    const e2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4);
    const e3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6);
    const e4 = isNaN(b3) ? 64 : b3 & 63;

    output += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }
  return output.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const generateMockJwt = (user: any): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // Aktif 7 hari
  };
  const hB64 = base64UrlEncode(JSON.stringify(header));
  const pB64 = base64UrlEncode(JSON.stringify(payload));
  const sB64 = base64UrlEncode(`shoefresh_signature_${user.id}_${now}`);
  return `${hB64}.${pB64}.${sB64}`;
};

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // 1. SERVICES
  async getServices(includeAll = false) {
    await delay();
    return {
      success: true,
      message: 'Daftar layanan berhasil diambil (Mock).',
      data: includeAll ? [...mockServices] : mockServices.filter((s) => s.isActive !== false),
    };
  },

  async getServiceDetail(id: number | string) {
    await delay();
    const service = mockServices.find((s) => String(s.id) === String(id));
    if (!service) throw new Error('Layanan tidak ditemukan.');
    return { success: true, data: service };
  },

  async createService(data: any) {
    await delay();
    const newService = {
      id: Date.now(),
      name: data.name,
      description: data.description || '',
      duration: data.duration || '1 - 2 Hari',
      price: String(data.price || 0),
      image: data.image || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockServices.push(newService);
    return { success: true, message: 'Layanan baru berhasil ditambahkan.', data: newService };
  },

  async updateService(id: number | string, data: any) {
    await delay();
    const index = mockServices.findIndex((s) => String(s.id) === String(id));
    if (index === -1) throw new Error('Layanan tidak ditemukan.');
    mockServices[index] = {
      ...mockServices[index],
      ...data,
      price: data.price !== undefined ? String(data.price) : mockServices[index].price,
      updatedAt: new Date().toISOString(),
    };
    return { success: true, message: 'Layanan berhasil diperbarui.', data: mockServices[index] };
  },

  async deleteService(id: number | string) {
    await delay();
    const index = mockServices.findIndex((s) => String(s.id) === String(id));
    if (index === -1) throw new Error('Layanan tidak ditemukan.');
    const removed = mockServices.splice(index, 1)[0];
    return { success: true, message: 'Layanan berhasil dihapus.', data: removed };
  },

  // 2. AUTH
  async login(email: string, password: string) {
    await delay();
    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      throw new Error('Email atau password salah.');
    }

    // Support both raw mock passwords (customer123/admin123) and demo bypass
    if (user.password !== password && password !== 'customer123' && password !== 'admin123') {
      throw new Error('Password yang dimasukkan tidak sesuai.');
    }

    const token = generateMockJwt(user);
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).password;

    return {
      success: true,
      message: 'Login berhasil (Mock API).',
      data: {
        token,
        user: userWithoutPassword,
      },
    };
  },

  async register(data: { name: string; email: string; password: string; phone?: string; address?: string }) {
    await delay();
    const exists = mockUsers.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      throw new Error('Email sudah terdaftar. Silakan gunakan email lain.');
    }

    const newUser = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || '',
      address: data.address || '',
      role: 'CUSTOMER' as const,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    const token = generateMockJwt(newUser);
    const safeUser = { ...newUser };
    delete (safeUser as any).password;

    return {
      success: true,
      message: 'Registrasi berhasil (Mock API).',
      data: {
        token,
        user: safeUser,
      },
    };
  },

  async getMe(userId?: number) {
    await delay();
    const user = mockUsers.find((u) => u.id === userId) || mockUsers[1];
    const safeUser = { ...user };
    delete (safeUser as any).password;
    return { success: true, data: safeUser };
  },

  async logout() {
    await delay(100);
    return {
      success: true,
      message: 'Berhasil keluar (Logout berhasil).',
      data: null,
    };
  },

  // 3. ORDERS
  async getMyOrders(userId?: number) {
    await delay();
    await loadOrdersFromStorage();
    let targetUserId = userId;
    if (!targetUserId) {
      try {
        const storedUser = await Storage.getItem('@auth_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          targetUserId = u.id;
        }
      } catch (_e) {
        // fallback
      }
    }
    targetUserId = targetUserId || 9;
    const orders = mockOrders.filter((o) => o.userId === targetUserId);
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, data: orders };
  },

  async getOrderDetail(idOrNumber: string | number) {
    await delay();
    await loadOrdersFromStorage();
    const order = mockOrders.find(
      (o) => String(o.id) === String(idOrNumber) || o.orderNumber === String(idOrNumber)
    );
    if (!order) throw new Error('Pesanan tidak ditemukan.');
    return { success: true, data: order };
  },

  async createOrder(orderPayload: any, userId?: number) {
    await delay();
    await loadOrdersFromStorage();
    let targetUserId = userId;
    if (!targetUserId && orderPayload && typeof (orderPayload as any).get === 'function') {
      const formUserId = (orderPayload as any).get('userId');
      if (formUserId) targetUserId = Number(formUserId);
    }
    if (!targetUserId && orderPayload?.userId) {
      targetUserId = Number(orderPayload.userId);
    }
    if (!targetUserId) {
      try {
        const storedUser = await Storage.getItem('@auth_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          targetUserId = u.id;
        }
      } catch (_e) {
        // fallback
      }
    }
    targetUserId = targetUserId || 9;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    let payload = orderPayload;
    if (orderPayload && typeof (orderPayload as any).get === 'function') {
      try {
        const rawItems = (orderPayload as any).get('items');
        payload = {
          items: typeof rawItems === 'string' ? JSON.parse(rawItems) : rawItems,
          paymentMethod: (orderPayload as any).get('paymentMethod'),
          notes: (orderPayload as any).get('notes'),
          pickupDate: (orderPayload as any).get('pickupDate'),
          shoePhoto: (orderPayload as any).get('shoePhoto'),
          paymentProof: (orderPayload as any).get('paymentProof'),
        };
      } catch (_e) {
        // fallback
      }
    }

    const items = (payload.items || []).map((item: any, idx: number) => {
      const s = mockServices.find((svc) => String(svc.id) === String(item.serviceId)) || mockServices[0];
      return {
        id: Date.now() + idx,
        serviceId: s.id,
        service: s,
        shoeBrand: item.shoeBrand || 'Sneakers',
        shoeColor: item.shoeColor || 'White',
        shoeSize: item.shoeSize || '42',
        notes: item.notes || '',
        price: parseFloat(String(s.price)),
        quantity: item.quantity || 1,
      };
    });

    const totalAmount = items.reduce(
      (acc: number, item: any) => acc + item.price * (item.quantity || 1),
      0
    );

    const hasProof = !!payload.paymentProof;
    const isCod = payload.paymentMethod === 'COD';

    const newOrder = {
      id: Date.now(),
      orderNumber,
      userId: targetUserId,
      pickupDate: payload.pickupDate || now.toISOString(),
      deliveryDate: null,
      status: 'MENUNGGU',
      totalAmount,
      notes: payload.notes || '',
      shoePhoto: payload.shoePhoto || null,
      orderItems: items,
      payment: {
        id: Date.now(),
        paymentMethod: payload.paymentMethod || 'QRIS',
        paymentStatus: hasProof ? 'MENUNGGU_VERIFIKASI' : (isCod ? 'BAYAR_DI_TEMPAT' : 'MENUNGGU_PEMBAYARAN'),
        amount: totalAmount,
        paymentProof: payload.paymentProof || null,
        paidAt: hasProof ? now.toISOString() : null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      tracking: [
        {
          id: Date.now(),
          status: 'MENUNGGU',
          description: 'Pesanan dibuat. Menunggu konfirmasi kurir jemput.',
          updatedBy: 'Sistem',
          createdAt: now.toISOString(),
        },
      ],
      galleries: payload.shoePhoto
        ? [
            {
              id: Date.now(),
              type: 'BEFORE',
              imageUrl: payload.shoePhoto,
              caption: 'Foto Sepatu Sebelum Dicuci',
              createdAt: now.toISOString(),
            },
          ]
        : [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    mockOrders.unshift(newOrder);
    await saveOrdersToStorage();
    return {
      success: true,
      message: 'Pesanan berhasil dibuat (Mock API).',
      data: newOrder,
    };
  },

  async cancelOrder(orderId: number | string) {
    await delay();
    await loadOrdersFromStorage();
    const order = mockOrders.find((o) => String(o.id) === String(orderId));
    if (!order) throw new Error('Pesanan tidak ditemukan.');
    order.status = 'DIBATALKAN';
    order.tracking.push({
      id: Date.now(),
      status: 'DIBATALKAN',
      description: 'Pesanan dibatalkan oleh pengguna.',
      updatedBy: 'Customer',
      createdAt: new Date().toISOString(),
    });
    await saveOrdersToStorage();
    return { success: true, message: 'Pesanan berhasil dibatalkan.', data: order };
  },

  async uploadPaymentProof(orderId: number | string, proofUrl = 'https://images.unsplash.com/photo-1554415707-9e49017aed81?w=500&auto=format&fit=crop') {
    await delay();
    await loadOrdersFromStorage();
    const order = mockOrders.find((o) => String(o.id) === String(orderId));
    if (!order) throw new Error('Pesanan tidak ditemukan.');
    if (order.payment) {
      order.payment.paymentProof = proofUrl;
      order.payment.paymentStatus = 'MENUNGGU_VERIFIKASI';
      order.payment.paidAt = new Date().toISOString();
    }
    await saveOrdersToStorage();
    return { success: true, message: 'Bukti pembayaran berhasil diunggah (Mock).', data: order };
  },

  // 4. PUBLIC TRACKING
  async getTrackingByOrderNumber(orderNumber: string) {
    await delay();
    await loadOrdersFromStorage();
    const order = mockOrders.find((o) => o.orderNumber === orderNumber);
    if (!order) throw new Error('Nomor resi pesanan tidak ditemukan.');
    return { success: true, data: order };
  },

  // 5. ADMIN
  async getAdminDashboard() {
    await delay();
    await loadOrdersFromStorage();
    const totalOrders = mockOrders.length;
    const pendingOrders = mockOrders.filter((o) => o.status === 'MENUNGGU').length;
    const inProcessOrders = mockOrders.filter((o) =>
      ['DIPROSES', 'DICUCI', 'DRYING', 'FINISHING'].includes(o.status)
    ).length;
    const completedOrders = mockOrders.filter((o) => o.status === 'SELESAI').length;
    const cancelledOrders = mockOrders.filter((o) => o.status === 'DIBATALKAN').length;
    const totalCustomers = mockUsers.filter((u) => u.role === 'CUSTOMER').length;

    let totalRevenue = 0;
    mockOrders.forEach((o) => {
      if (o.payment && o.payment.paymentStatus === 'SUDAH_DIBAYAR') {
        totalRevenue += parseFloat(String(o.payment.amount || o.totalAmount));
      }
    });

    const recentOrders = [...mockOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalOrders,
          pendingOrders,
          inProcessOrders,
          completedOrders,
          cancelledOrders,
          totalCustomers,
        },
        recentOrders,
      },
    };
  },

  async getAdminOrders(status?: string, search?: string) {
    await delay();
    await loadOrdersFromStorage();
    let orders = [...mockOrders];
    if (status && status !== 'ALL') {
      orders = orders.filter((o) => o.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.notes && o.notes.toLowerCase().includes(q))
      );
    }
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, data: orders };
  },

  async updateOrderStatus(orderId: number | string, newStatus: string, description?: string) {
    await delay();
    await loadOrdersFromStorage();
    const order = mockOrders.find((o) => String(o.id) === String(orderId));
    if (!order) throw new Error('Pesanan tidak ditemukan.');
    order.status = newStatus;
    order.tracking.push({
      id: Date.now(),
      status: newStatus,
      description: description || `Status pesanan diubah menjadi ${newStatus}.`,
      updatedBy: 'Admin Shoes',
      createdAt: new Date().toISOString(),
    });
    await saveOrdersToStorage();
    return { success: true, message: `Status order diperbarui ke ${newStatus}.`, data: order };
  },

  async deleteAdminOrder(orderId: number | string) {
    await delay();
    await loadOrdersFromStorage();
    const index = mockOrders.findIndex((o) => String(o.id) === String(orderId));
    if (index === -1) throw new Error('Pesanan tidak ditemukan.');
    const removed = mockOrders.splice(index, 1)[0];
    await saveOrdersToStorage();
    return { success: true, message: 'Pesanan berhasil dihapus permanen.', data: removed };
  },

  async getReports() {
    await delay();
    await loadOrdersFromStorage();
    let totalRevenue = 0;
    let totalPaidOrders = 0;
    const statusCounts: Record<string, number> = {};
    const serviceBreakdownMap: Record<string, { serviceName: string; totalQuantity: number; totalRevenue: number }> = {};
    const transactions: any[] = [];

    mockOrders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      const isPaid =
        (o.payment && (o.payment.paymentStatus === 'SUDAH_DIBAYAR' || o.payment.paidAt)) ||
        o.status === 'SELESAI';
      const amount = parseFloat(String(o.payment?.amount || o.totalAmount || 0));

      if (isPaid) {
        totalRevenue += amount;
        totalPaidOrders += 1;

        transactions.push({
          orderNumber: o.orderNumber,
          totalAmount: amount,
          date: o.payment?.paidAt || o.createdAt,
          paymentMethod: o.payment?.paymentMethod || 'QRIS',
        });

        (o.orderItems || []).forEach((item: any) => {
          const sName = item.service?.name || 'Laundry Sepatu';
          const qty = Number(item.quantity) || 1;
          const rev = (Number(item.price) || 0) * qty;
          if (!serviceBreakdownMap[sName]) {
            serviceBreakdownMap[sName] = {
              serviceName: sName,
              totalQuantity: 0,
              totalRevenue: 0,
            };
          }
          serviceBreakdownMap[sName].totalQuantity += qty;
          serviceBreakdownMap[sName].totalRevenue += rev;
        });
      }
    });

    const serviceBreakdown = Object.values(serviceBreakdownMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      success: true,
      data: {
        summary: {
          totalIncome: totalRevenue,
          totalPaidOrders,
        },
        serviceBreakdown,
        transactions,
        totalOrders: mockOrders.length,
        totalRevenue,
        statusCounts,
        orders: mockOrders,
      },
    };
  },
};

export default mockApi;
