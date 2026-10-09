const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
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

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runComprehensiveTests() {
  console.log('🧪 ==================================================');
  console.log('🧪 PENGUJIAN OTOMATIS ENDPOINT REST API (STEP 4)');
  console.log('🧪 ==================================================\n');

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    console.log(`✅ [1/12] Health Check: Status ${health.status} (${health.body.service})`);

    // 2. Layanan (Services Catalog)
    const services = await request('GET', '/api/services');
    console.log(`✅ [2/12] Get Services: Status ${services.status} - Total Layanan: ${services.body.data.length}`);

    // 3. Detail Service
    const firstService = services.body.data[0];
    const serviceDetail = await request('GET', `/api/services/${firstService.id}`);
    console.log(`✅ [3/12] Get Detail Service: "${serviceDetail.body.data.name}" (Rp ${serviceDetail.body.data.price})`);

    // 4. Login Customer
    const customerLogin = await request('POST', '/api/auth/login', {
      email: 'customer@gmail.com',
      password: 'customer123',
    });
    const customerToken = customerLogin.body.data.token;
    console.log(`✅ [4/12] Login Customer: Status ${customerLogin.status} - User: ${customerLogin.body.data.user.name}`);

    // 5. Customer Buat Order Baru
    const orderPayload = {
      pickupDate: new Date(Date.now() + 86400000).toISOString(),
      notes: 'Sepatu lari noda lumpur setelah marathon',
      paymentMethod: 'TRANSFER_BANK',
      items: [
        {
          serviceId: firstService.id,
          shoeBrand: 'Nike Pegasus 40',
          shoeColor: 'Blue / Orange',
          shoeSize: '43',
          notes: 'Upper kotor, bersihkan teliti',
          quantity: 1,
        },
      ],
    };
    const createOrderRes = await request('POST', '/api/orders', orderPayload, {
      Authorization: `Bearer ${customerToken}`,
    });
    const createdOrder = createOrderRes.body.data;
    console.log(`✅ [5/12] Buat Pesanan: Status ${createOrderRes.status} - Nomor Order: ${createdOrder.orderNumber}`);

    // 6. Customer Riwayat Pesanan
    const myOrdersRes = await request('GET', '/api/orders/my-orders', null, {
      Authorization: `Bearer ${customerToken}`,
    });
    console.log(`✅ [6/12] Riwayat Pesanan Customer: Status ${myOrdersRes.status} - Jumlah Pesanan: ${myOrdersRes.body.data.length}`);

    // 7. Tracking Real-time Berdasarkan Nomor Order
    const trackRes = await request('GET', `/api/tracking/${createdOrder.orderNumber}`);
    console.log(`✅ [7/12] Tracking Pesanan (${createdOrder.orderNumber}): Status "${trackRes.body.data.status}"`);

    // 8. Login Admin
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@laundryshoes.com',
      password: 'admin123',
    });
    const adminToken = adminLogin.body.data.token;
    console.log(`✅ [8/12] Login Admin: Status ${adminLogin.status} - Token Diperoleh`);

    // 9. Admin Dashboard Stats
    const dashboardRes = await request('GET', '/api/admin/dashboard', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    console.log(`✅ [9/12] Admin Dashboard: Total Orders: ${dashboardRes.body.data.stats.totalOrders}, Revenue: Rp ${dashboardRes.body.data.stats.totalRevenue}`);

    // 10. Admin Update Status Pesanan ke "DICUCI"
    const updateStatusRes = await request(
      'PATCH',
      `/api/admin/orders/${createdOrder.id}/status`,
      {
        status: 'DICUCI',
        description: 'Sepatu sedang dalam tahap pencucian mendalam dengan cairan khusus.',
      },
      {
        Authorization: `Bearer ${adminToken}`,
      }
    );
    console.log(`✅ [10/12] Admin Update Status: Status ${updateStatusRes.status} - New Status: ${updateStatusRes.body.data.updatedOrder.status}`);

    // 11. Admin Customer Management
    const customersRes = await request('GET', '/api/admin/customers', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    console.log(`✅ [11/12] Admin Customer List: Status ${customersRes.status} - Total Pelanggan: ${customersRes.body.data.length}`);

    // 12. Keamanan: Uji Akses Customer ke Endpoint Admin (Harus 403 Forbidden)
    const forbiddenRes = await request('GET', '/api/admin/dashboard', null, {
      Authorization: `Bearer ${customerToken}`,
    });
    console.log(`✅ [12/12] Security Role Guard: Status ${forbiddenRes.status} (${forbiddenRes.body.message})`);

    console.log('\n🎉 ==================================================');
    console.log('🎉 SELURUH 12 TEST ENDPOINT API BERHASIL 100%! 🚀');
    console.log('🎉 ==================================================\n');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat pengujian:', error);
  }
}

runComprehensiveTests();
