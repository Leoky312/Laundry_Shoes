/**
 * LAUNDRY SHOES APP — Test Koneksi Backend
 * Jalankan: node test-connection.js
 * Pastikan backend server sedang berjalan!
 */
const http = require('http');

const BACKEND_IP = '192.168.100.8';
const BACKEND_PORT = 5000;

console.log('================================================');
console.log('🔗 TEST KONEKSI MOBILE → BACKEND');
console.log('================================================\n');

function request(path) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: BACKEND_IP,
      port: BACKEND_PORT,
      path: path,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
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

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout! Server tidak merespons dalam 5 detik.`));
    });

    req.on('error', (e) => {
      if (e.code === 'ECONNREFUSED') {
        reject(new Error(`Koneksi ditolak ke ${BACKEND_IP}:${BACKEND_PORT}. Pastikan npm run dev sudah berjalan!`));
      } else {
        reject(new Error(`${e.code}: ${e.message}`));
      }
    });

    req.end();
  });
}

async function runTest() {
  try {
    // Test 1: Health Check
    const h = await request('/api/health');
    console.log(`✅ Backend ONLINE di ${BACKEND_IP}:${BACKEND_PORT}`);
    console.log(`   Status: ${h.body.status}, Service: ${h.body.service}`);

    // Test 2: Services
    const s = await request('/api/services');
    console.log(`✅ Database Terhubung — ${s.body.data.length} layanan tersedia`);

    console.log(`\n🎉 KONEKSI BERHASIL! HP Anda akan bisa mengakses server.`);
    console.log(`\n📱 Langkah selanjutnya:`);
    console.log(`   1. Jalankan: npx expo start --host 192.168.100.8 --clear`);
    console.log(`   2. Scan QR Code dengan Expo Go di HP`);
    console.log(`   3. Login menggunakan akun demo di layar Login\n`);
  } catch (err) {
    console.error(`❌ KONEKSI GAGAL: ${err.message}`);
    console.error(`\n🔧 Checklist perbaikan:`);
    console.error(`   1. Pastikan backend berjalan: cd backend && npm run dev`);
    console.error(`   2. Port 5000 sudah dibuka di Windows Firewall? (sudah dilakukan)`);
    console.error(`   3. Pastikan HP & laptop tersambung ke WiFi yang SAMA\n`);
  }
}

runTest();
