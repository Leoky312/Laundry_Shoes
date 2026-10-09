const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const dataDir = path.join(__dirname, 'data');

// Pastikan folder data/ ada
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

async function migrateData() {
  console.log('Mulai migrasi data dari MySQL ke JSON...');
  let report = {
    users: { fromDb: 0, toJson: 0, status: 'Berhasil' },
    services: { fromDb: 0, toJson: 0, status: 'Berhasil' },
    orders: { fromDb: 0, toJson: 0, status: 'Berhasil' },
  };

  try {
    // 1. Migrasi Users
    const users = await prisma.user.findMany();
    report.users.fromDb = users.length;
    fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
    report.users.toJson = users.length;
    console.log(`✅ Migrasi Users selesai: ${users.length} data.`);

    // 2. Migrasi Services
    const services = await prisma.service.findMany();
    report.services.fromDb = services.length;
    fs.writeFileSync(path.join(dataDir, 'services.json'), JSON.stringify(services, null, 2));
    report.services.toJson = services.length;
    console.log(`✅ Migrasi Services selesai: ${services.length} data.`);

    // 3. Migrasi Orders beserta relasi bersarangnya
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
        payment: true,
        tracking: true,
        galleries: true,
      },
    });
    report.orders.fromDb = orders.length;
    fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify(orders, null, 2));
    report.orders.toJson = orders.length;
    console.log(`✅ Migrasi Orders selesai: ${orders.length} data.`);

    console.log('\n--- Laporan Migrasi ---');
    console.table(report);
    console.log('Migrasi selesai! Data JSON tersimpan di folder backend/data/');
  } catch (error) {
    console.error('❌ Gagal melakukan migrasi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
