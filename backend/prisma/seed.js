const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database Laundry Shoes...');

  // 1. Bersihkan data lama jika ada (urutan penghapusan sesuai foreign key)
  await prisma.gallery.deleteMany();
  await prisma.orderTracking.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Data lama berhasil dibersihkan.');

  // 2. Hash Password untuk Admin dan Customer
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const customerPassword = await bcrypt.hash('customer123', salt);

  // 3. Buat User: Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Shoes',
      email: 'admin@laundryshoes.com',
      password: adminPassword,
      phone: '081234567890',
      address: 'Workshop Laundry Shoes, Jl. Sudirman No. 88, Jakarta',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    },
  });

  // 4. Buat User: Customer Demo
  const customer = await prisma.user.create({
    data: {
      name: 'Rian Pratama',
      email: 'customer@gmail.com',
      password: customerPassword,
      phone: '089876543210',
      address: 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan',
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    },
  });

  console.log(`👤 User Admin dibuat: ${admin.email} (password: admin123)`);
  console.log(`👤 User Customer dibuat: ${customer.email} (password: customer123)`);

  // 5. Buat 6 Layanan Laundry Sepatu Utama
  const servicesData = [
    {
      name: 'Deep Cleaning',
      description: 'Pembersihan mendalam dan menyeluruh pada seluruh bagian sepatu (upper, midsole, outsole, insole, dan tali) untuk noda membandel.',
      duration: '2 - 3 Hari',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
      isActive: true,
    },
    {
      name: 'Express Cleaning 1 Day',
      description: 'Pembersihan cepat bagian luar (upper dan midsole) untuk mengangkat debu dan kotoran ringan harian. Selesai dalam hitungan jam.',
      duration: '1 Hari',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
      isActive: true,
    },
    // {
    //   name: 'Repaint',
    //   description: 'Pewarnaan ulang sepatu yang telah pudar atau ingin ganti warna dengan cat khusus leather/canvas berkualitas tinggi dan tahan lama.',
    //   duration: '3 - 5 Hari',
    //   price: 120000,
    //   image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    //   isActive: true,
    // },
    {
      name: 'Unyellowing',
      description: 'Treatment khusus menghilangkan oksidasi warna kuning membandel pada midsole sepatu putih agar kembali cerah seperti baru.',
      duration: '2 - 3 Hari',
      price: 60000,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
      isActive: true,
    },
    {
      name: 'Whitening',
      description: 'Perawatan ekstra khusus untuk sepatu kanvas/leather warna putih cerah dengan formula pencerah anti-kusam.',
      duration: '2 Hari',
      price: 60000,
      image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&auto=format&fit=crop&q=80',
      isActive: true,
    },
    {
      name: 'Waterproof',
      description: 'Pelapisan nano spray pelindung hydrophobic untuk mencegah air, minyak, kopi, dan lumpur meresap ke bahan sepatu.',
      duration: '1 Hari',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&auto=format&fit=crop&q=80',
      isActive: true,
    },
  ];

  const createdServices = [];
  for (const s of servicesData) {
    const created = await prisma.service.create({ data: s });
    createdServices.push(created);
  }
  console.log(`👞 ${createdServices.length} Layanan Laundry berhasil ditambahkan.`);

  // 6. Buat 1 Contoh Pesanan (Order) untuk simulasi awal
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20260926-001',
      userId: customer.id,
      pickupDate: new Date(Date.now() + 86400000), // Besok
      deliveryDate: new Date(Date.now() + 86400000 * 3), // 3 hari lagi
      status: 'DIPROSES',
      totalAmount: 115000,
      notes: 'Tolong midsole kanan yang ada noda kopi dibersihkan ekstra ya mas.',
      orderItems: {
        create: [
          {
            serviceId: createdServices[0].id, // Deep Cleaning
            shoeBrand: 'Nike Air Jordan 1 Low',
            shoeColor: 'Chicago (Red/White)',
            shoeSize: '42',
            price: 50000,
            quantity: 1,
            notes: 'Noda debu tebal di sol',
          },
          {
            serviceId: createdServices[2].id, // Unyellowing
            shoeBrand: 'Adidas Stan Smith',
            shoeColor: 'White/Green',
            shoeSize: '41',
            price: 65000,
            quantity: 1,
            notes: 'Midsole sudah menguning',
          },
        ],
      },
      payment: {
        create: {
          paymentMethod: 'TRANSFER_BANK',
          paymentStatus: 'SUDAH_DIBAYAR',
          amount: 115000,
          paidAt: new Date(),
        },
      },
      tracking: {
        create: [
          {
            status: 'MENUNGGU',
            description: 'Pesanan dibuat oleh customer dan menunggu konfirmasi tim laundry.',
            updatedBy: 'Sistem',
          },
          {
            status: 'DIPROSES',
            description: 'Sepatu telah diterima di workshop dan dijadwalkan untuk treatment.',
            updatedBy: 'Admin Shoes',
          },
        ],
      },
      galleries: {
        create: [
          {
            type: 'SEBELUM',
            imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
            caption: 'Kondisi sepatu sebelum pencucian',
          },
        ],
      },
    },
  });

  console.log(`📦 Contoh pesanan dibuat dengan nomor: ${sampleOrder.orderNumber}`);
  console.log('✅ Seeding database selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
