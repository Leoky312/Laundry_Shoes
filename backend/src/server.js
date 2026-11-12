/**
 * ==============================================================================
 * SHOEFRESH REST API & WHATSAPP CLOUD API BACKEND SERVER
 * ==============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const whatsappRoutes = require('./routes/whatsappRoutes');
const whatsappService = require('./services/whatsappApi');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Helper untuk membaca file JSON data bawaan ShoeFresh secara aman
const getDataFilePath = (filename) => {
  const localDataPath = path.join(__dirname, '../../src/data', filename);
  if (fs.existsSync(localDataPath)) return localDataPath;
  return null;
};

const readJsonData = (filename, fallback = []) => {
  const p = getDataFilePath(filename);
  if (!p) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.warn(`Gagal membaca ${filename}:`, e.message);
    return fallback;
  }
};

// ==============================================================================
// 1. WHATSAPP CLOUD API ROUTER (UTAMA - TUGAS ANGGOTA 1)
// ==============================================================================
app.use('/api/whatsapp', whatsappRoutes);

// ==============================================================================
// 2. ENDPOINT DASAR & HEALTH CHECK
// ==============================================================================
app.get('/', (req, res) => {
  res.json({
    app: 'ShoeFresh Backend API',
    status: 'ONLINE',
    version: '1.0.0',
    whatsappIntegration: 'Meta WhatsApp Cloud API',
    endpoints: {
      whatsappStatus: 'GET /api/whatsapp/status',
      sendWhatsAppText: 'POST /api/whatsapp/send',
      sendOrderStatusNotification: 'POST /api/whatsapp/send-order-status',
      sendWhatsAppTemplate: 'POST /api/whatsapp/send-template',
      previewMessage: 'POST /api/whatsapp/preview',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ==============================================================================
// 3. SHOEFRESH REST API INTEGRASI (Layanan, Pesanan, Admin)
// ==============================================================================

// GET /api/services
app.get('/api/services', (req, res) => {
  const services = readJsonData('services.json', []);
  return res.json({
    success: true,
    message: 'Daftar layanan berhasil diambil.',
    data: services.filter((s) => s.isActive !== false),
  });
});

// GET /api/orders/my-orders
app.get('/api/orders/my-orders', (req, res) => {
  const orders = readJsonData('orders.json', []);
  return res.json({
    success: true,
    message: 'Daftar pesanan berhasil diambil.',
    data: orders,
  });
});

// GET /api/admin/orders
app.get('/api/admin/orders', (req, res) => {
  const orders = readJsonData('orders.json', []);
  const users = readJsonData('users.json', []);
  const statusFilter = req.query.status;

  // Gabungkan info user ke dalam order
  const populated = orders.map((o) => {
    const user =
      o.user ||
      (o.customerPhone ? { name: o.customerName || 'Pelanggan', phone: o.customerPhone, address: o.address } : null) ||
      users.find((u) => u.id === o.userId) || {
        name: 'Pelanggan',
        phone: '081234567890',
      };
    return { ...o, user };
  });

  let filtered = populated;
  if (statusFilter && statusFilter !== 'SEMUA' && statusFilter !== 'ALL') {
    filtered = populated.filter((o) => o.status === statusFilter);
  }

  return res.json({
    success: true,
    message: 'Daftar pesanan admin berhasil diambil.',
    data: filtered,
  });
});

// PATCH /api/admin/orders/:id/status
// Otomatis mengirimkan notifikasi WhatsApp saat status pesanan diubah oleh Admin!
app.patch('/api/admin/orders/:id/status', async (req, res) => {
  const orderId = req.params.id;
  const { status, notes, notifyWhatsApp = true } = req.body;

  const orders = readJsonData('orders.json', []);
  const users = readJsonData('users.json', []);

  const order = orders.find((o) => String(o.id) === String(orderId));
  if (!order) {
    return res.status(404).json({
      success: false,
      message: `Pesanan dengan ID #${orderId} tidak ditemukan.`,
    });
  }

  const user = users.find((u) => u.id === order.userId);
  const prevStatus = order.status;
  order.status = status;

  let waResult = null;
  // Kirim notifikasi WhatsApp otomatis jika diminta & nomor telepon tersedia
  if (notifyWhatsApp && user && user.phone) {
    try {
      const serviceName = order.orderItems?.[0]?.service?.name || 'Laundry Sepatu';
      waResult = await whatsappService.sendOrderStatusNotification({
        to: user.phone,
        customerName: user.name,
        orderNumber: order.orderNumber,
        serviceName,
        status,
        useTemplate: false, // Default text, akan fallback ke template jika di luar 24 jam
      });
      console.log(`[WhatsApp Auto-Notify] Notifikasi perubahan status dikirim ke ${user.name} (${user.phone})`);
    } catch (waErr) {
      console.warn(`[WhatsApp Auto-Notify Warning] Gagal kirim WA ke pelanggan: ${waErr.message}`);
      waResult = { success: false, error: waErr.message };
    }
  }

  return res.json({
    success: true,
    message: `Status pesanan #${order.orderNumber} berhasil diubah dari ${prevStatus} menjadi ${status}.`,
    data: {
      order,
      whatsAppNotification: waResult,
    },
  });
});

// PUT fallback untuk update status
app.put('/api/admin/orders/:id/status', (req, res) => {
  return app._router.handle({ ...req, method: 'PATCH' }, res);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan pada backend ShoeFresh.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Jalankan Server
const server = app.listen(PORT, () => {
  const waConfig = whatsappService.getWhatsAppConfigStatus();
  console.log('\n================================================================');
  console.log(`👟 SHOEFRESH BACKEND REST API RUNNING ON PORT ${PORT}`);
  console.log('================================================================');
  console.log(`📡 URL Server        : http://localhost:${PORT}`);
  console.log(`📲 WhatsApp Status   : ${waConfig.isConfigured ? '🟢 TERKONFIGURASI' : '🟡 MODE SIMULASI / PLACEHOLDER'}`);
  console.log(`   - Graph API Version : ${waConfig.apiVersion}`);
  console.log(`   - Phone Number ID   : ${waConfig.phoneNumberIdMasked}`);
  console.log(`   - Default Template  : ${waConfig.defaultTemplate}`);
  console.log('----------------------------------------------------------------');
  console.log('📋 ENDPOINT WHATSAPP CLOUD API:');
  console.log(` • GET  http://localhost:${PORT}/api/whatsapp/status`);
  console.log(` • POST http://localhost:${PORT}/api/whatsapp/preview`);
  console.log(` • POST http://localhost:${PORT}/api/whatsapp/send`);
  console.log(` • POST http://localhost:${PORT}/api/whatsapp/send-order-status`);
  console.log(` • POST http://localhost:${PORT}/api/whatsapp/send-template`);
  console.log('================================================================\n');
});

module.exports = { app, server };
