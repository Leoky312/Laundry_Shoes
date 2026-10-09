/**
 * Laundry Shoes App — End-to-End Integration Test
 * Menguji seluruh alur bisnis aplikasi dari perspektif mobile client
 *
 * Jalankan: node test-e2e.js
 */
const http = require('http');
const https = require('https');

const API_BASE = 'http://192.168.100.8:5000/api';

let customerToken = null;
let adminToken = null;
let createdOrderId = null;
let createdOrderNumber = null;

const results = [];

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://192.168.100.8:5000');
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 8000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.on('error', reject);

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function log(passed, label, detail = '') {
  const icon = passed ? '✅' : '❌';
  const line = `${icon} ${label}${detail ? ` — ${detail}` : ''}`;
  console.log(line);
  results.push({ passed, label });
}

async function runE2E() {
  console.log('\n🧪 ============================================');
  console.log('🧪  LAUNDRY SHOES — END-TO-END INTEGRATION TEST');
  console.log('🧪 ============================================\n');

  // ── SKENARIO 1: Koneksi & Health ──────────────────────────────────────────
  console.log('📡 Skenario 1: Koneksi & Health Check');
  try {
    const r = await request('GET', '/api/health');
    log(r.status === 200, 'Health Check', r.body.status);
  } catch (e) {
    log(false, 'Health Check', e.message);
  }

  // ── SKENARIO 2: Layanan Publik (tanpa login) ──────────────────────────────
  console.log('\n👟 Skenario 2: Katalog Layanan (Publik)');
  let services = [];
  try {
    const r = await request('GET', '/api/services');
    services = r.body.data || [];
    log(r.status === 200 && services.length === 6, 'GET /api/services', `${services.length} layanan ditemukan`);
  } catch (e) {
    log(false, 'GET /api/services', e.message);
  }

  try {
    if (services.length > 0) {
      const r = await request('GET', `/api/services/${services[0].id}`);
      log(r.status === 200, 'GET /api/services/:id', `"${r.body.data?.name}" — Rp ${r.body.data?.price}`);
    }
  } catch (e) {
    log(false, 'GET /api/services/:id', e.message);
  }

  // ── SKENARIO 3: Autentikasi Customer ─────────────────────────────────────
  console.log('\n🔐 Skenario 3: Autentikasi Customer');
  try {
    const r = await request('POST', '/api/auth/login', {
      email: 'customer@gmail.com',
      password: 'customer123',
    });
    customerToken = r.body.data?.token;
    log(r.status === 200 && !!customerToken, 'Login Customer', `User: ${r.body.data?.user?.name} (${r.body.data?.user?.role})`);
  } catch (e) {
    log(false, 'Login Customer', e.message);
  }

  try {
    const r = await request('GET', '/api/auth/me', null, customerToken);
    log(r.status === 200, 'GET /api/auth/me (profil)', `${r.body.data?.email}`);
  } catch (e) {
    log(false, 'GET /api/auth/me', e.message);
  }

  // ── SKENARIO 4: Alur Pemesanan ────────────────────────────────────────────
  console.log('\n📦 Skenario 4: Alur Pemesanan Customer');
  try {
    const payload = {
      paymentMethod: 'TRANSFER_BANK',
      pickupDate: new Date(Date.now() + 86400000).toISOString(),
      notes: 'E2E Test Order - Sepatu Training',
      items: [
        {
          serviceId: services[1]?.id || 2,
          shoeBrand: 'Adidas Ultraboost 22',
          shoeColor: 'Triple White',
          shoeSize: '41',
          notes: 'Noda ringan di upper',
          quantity: 1,
        },
      ],
    };
    const r = await request('POST', '/api/orders', payload, customerToken);
    createdOrderId = r.body.data?.id;
    createdOrderNumber = r.body.data?.orderNumber;
    log(r.status === 201 && !!createdOrderNumber, 'POST /api/orders (buat pesanan)', `No: ${createdOrderNumber}`);
  } catch (e) {
    log(false, 'POST /api/orders', e.message);
  }

  try {
    const r = await request('GET', '/api/orders/my-orders', null, customerToken);
    log(r.status === 200, 'GET /api/orders/my-orders (riwayat)', `${r.body.data?.length} pesanan`);
  } catch (e) {
    log(false, 'GET /api/orders/my-orders', e.message);
  }

  try {
    await new Promise((r) => setTimeout(r, 200)); // Jeda singkat untuk mencegah ECONNRESET
    const r = await request('GET', `/api/orders/${createdOrderId}`, null, customerToken);
    log(r.status === 200, 'GET /api/orders/:id (detail pesanan)', `Status: ${r.body.data?.status}`);
  } catch (e) {
    log(false, 'GET /api/orders/:id', e.message);
  }

  // ── SKENARIO 5: Real-time Tracking ───────────────────────────────────────
  console.log('\n🔍 Skenario 5: Real-time Tracking (Publik)');
  try {
    const r = await request('GET', `/api/tracking/${createdOrderNumber}`);
    log(r.status === 200, `GET /api/tracking/${createdOrderNumber}`, `Status: ${r.body.data?.status}, Tracking logs: ${r.body.data?.tracking?.length}`);
  } catch (e) {
    log(false, 'GET /api/tracking/:orderNumber', e.message);
  }

  // ── SKENARIO 6: Autentikasi & Dashboard Admin ─────────────────────────────
  console.log('\n👑 Skenario 6: Admin Panel');
  try {
    const r = await request('POST', '/api/auth/login', {
      email: 'admin@laundryshoes.com',
      password: 'admin123',
    });
    adminToken = r.body.data?.token;
    log(r.status === 200 && !!adminToken, 'Login Admin', `Role: ${r.body.data?.user?.role}`);
  } catch (e) {
    log(false, 'Login Admin', e.message);
  }

  try {
    const r = await request('GET', '/api/admin/dashboard', null, adminToken);
    const s = r.body.data?.stats;
    log(r.status === 200 && !!s, 'GET /api/admin/dashboard', `Total Orders: ${s?.totalOrders}, Revenue: Rp ${s?.totalRevenue}`);
  } catch (e) {
    log(false, 'GET /api/admin/dashboard', e.message);
  }

  try {
    const r = await request('GET', '/api/admin/orders', null, adminToken);
    log(r.status === 200, 'GET /api/admin/orders', `${r.body.data?.length} pesanan tampil`);
  } catch (e) {
    log(false, 'GET /api/admin/orders', e.message);
  }

  // ── SKENARIO 7: Update Status Pengerjaan ──────────────────────────────────
  console.log('\n🔄 Skenario 7: Update Status Pesanan (Admin)');
  const statusFlow = ['DIPROSES', 'DICUCI', 'DRYING', 'FINISHING', 'SELESAI'];
  for (const status of statusFlow) {
    try {
      const r = await request(
        'PATCH',
        `/api/admin/orders/${createdOrderId}/status`,
        { status },
        adminToken
      );
      log(r.status === 200, `PATCH status → ${status}`, `Order #${createdOrderId}`);
    } catch (e) {
      log(false, `PATCH status → ${status}`, e.message);
    }
  }

  // ── SKENARIO 8: Laporan & Customer Management ─────────────────────────────
  console.log('\n📊 Skenario 8: Reports & Manajemen Pelanggan');
  try {
    const r = await request('GET', '/api/admin/reports', null, adminToken);
    log(r.status === 200, 'GET /api/admin/reports', `Income: Rp ${r.body.data?.summary?.totalIncome}`);
  } catch (e) {
    log(false, 'GET /api/admin/reports', e.message);
  }

  try {
    const r = await request('GET', '/api/admin/customers', null, adminToken);
    log(r.status === 200, 'GET /api/admin/customers', `${r.body.data?.length} pelanggan`);
  } catch (e) {
    log(false, 'GET /api/admin/customers', e.message);
  }

  // ── SKENARIO 9: Role Guard Security ──────────────────────────────────────
  console.log('\n🛡️  Skenario 9: Keamanan Role Guard');
  try {
    const r = await request('GET', '/api/admin/dashboard', null, customerToken);
    log(r.status === 403, 'Customer DILARANG akses Admin Dashboard', `Status: ${r.status}`);
  } catch (e) {
    log(false, 'Role Guard test', e.message);
  }

  try {
    const r = await request('GET', '/api/auth/me', null, 'token-palsu-tidak-valid-xyz');
    log(r.status === 401, 'Token Invalid → 401 Unauthorized', `Status: ${r.status}`);
  } catch (e) {
    log(false, 'Token Invalid test', e.message);
  }

  // ── HASIL AKHIR ────────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log('\n🏁 ============================================');
  console.log(`🏁  HASIL AKHIR: ${passed}/${total} TEST LULUS`);
  if (failed === 0) {
    console.log('🎉  SEMUA TEST END-TO-END BERHASIL 100%! 🚀');
  } else {
    console.log(`⚠️   ${failed} test gagal — periksa log di atas.`);
  }
  console.log('🏁 ============================================\n');
}

runE2E().catch(console.error);
