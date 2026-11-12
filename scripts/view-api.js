const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../src/data');

const services = JSON.parse(fs.readFileSync(path.join(dataDir, 'services.json'), 'utf8'));
const orders = JSON.parse(fs.readFileSync(path.join(dataDir, 'orders.json'), 'utf8'));
const users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'));

console.log('\n================================================================');
console.log('👟 SHOEFRESH REST API & MOCK DATA VIEWER (TERMINAL)');
console.log('================================================================\n');

// 1. Akun Pengguna
console.log('👥 [1] AKUN PENGGUNA TERDAFTAR (USERS)');
console.table(
  users.map((u) => ({
    ID: u.id,
    Nama: u.name,
    Email: u.email,
    Role: u.role,
    No_HP: u.phone,
  }))
);

// 2. Katalog Layanan
console.log('\n✨ [2] KATALOG LAYANAN LAUNDRY SEPATU (SERVICES)');
console.table(
  services.map((s) => ({
    ID: s.id,
    Nama_Layanan: s.name,
    Durasi: s.duration,
    Harga: `Rp ${parseInt(s.price).toLocaleString('id-ID')}`,
    Status: s.isActive ? 'Aktif' : 'Nonaktif',
  }))
);

// 3. Pesanan
console.log('\n📦 [3] DAFTAR PESANAN & STATUS PENGERJAAN (ORDERS)');
console.table(
  orders.map((o) => ({
    Nomor_Order: o.orderNumber,
    User_ID: o.userId,
    Status_Order: o.status,
    Status_Bayar: o.payment?.paymentStatus || 'BELUM',
    Total_Biaya: `Rp ${parseInt(o.totalAmount).toLocaleString('id-ID')}`,
    Sepatu: o.orderItems?.map((it) => `${it.shoeBrand} (${it.shoeColor || '-'})`).join(', '),
  }))
);

// 4. Contoh Timeline Tracking
const sampleOrder = orders.find((o) => o.status === 'SELESAI') || orders[0];
console.log(`\n📍 [4] CONTOH TIMELINE TRACKING (${sampleOrder.orderNumber})`);
sampleOrder.tracking.forEach((t, idx) => {
  console.log(`   ${idx + 1}. [${t.status}] ${t.description} (by: ${t.updatedBy})`);
});

console.log('\n================================================================');
console.log('📡 ENDPOINT REST API UNTUK DIAKSES:');
console.log(' - GET  http://localhost:5000/api/services');
console.log(' - POST http://localhost:5000/api/auth/login');
console.log(' - GET  http://localhost:5000/api/orders/my-orders');
console.log(' - GET  http://localhost:5000/api/tracking/:orderNumber');
console.log(' - GET  http://localhost:5000/api/admin/dashboard');
console.log('================================================================\n');
