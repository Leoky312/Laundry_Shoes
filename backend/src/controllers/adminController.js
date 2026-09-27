const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/admin/dashboard
 * Ringkasan statistik operasional, pesanan, dan keuangan untuk Admin Dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      inProcessOrders,
      completedOrders,
      totalCustomers,
      recentOrders,
      paidPayments,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'MENUNGGU' } }),
      prisma.order.count({
        where: {
          status: { in: ['DIPROSES', 'DICUCI', 'DRYING', 'FINISHING'] },
        },
      }),
      prisma.order.count({ where: { status: 'SELESAI' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, avatar: true } },
          payment: { select: { paymentStatus: true } },
        },
      }),
      prisma.payment.aggregate({
        where: { paymentStatus: 'SUDAH_DIBAYAR' },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = paidPayments._sum.amount ? parseFloat(paidPayments._sum.amount) : 0;

    return successResponse(res, 'Statistik admin dashboard berhasil diambil.', {
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        inProcessOrders,
        completedOrders,
        totalCustomers,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders
 * Mengambil semua pesanan dengan opsi filter status & pencarian
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { phone: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        orderItems: { include: { service: true } },
        payment: true,
        tracking: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, 'Seluruh pesanan berhasil diambil.', orders);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/status
 * Mengubah status pesanan dan mencatat riwayat ke tabel OrderTracking
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    const { status, description } = req.body;

    const validStatuses = [
      'MENUNGGU',
      'DIPROSES',
      'DICUCI',
      'DRYING',
      'FINISHING',
      'SELESAI',
      'DIBATALKAN',
    ];

    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, `Status tidak valid. Pilihan: ${validStatuses.join(', ')}`, 400);
    }

    // Default status description mapping
    const defaultDescriptions = {
      MENUNGGU: 'Pesanan menunggu penjemputan atau verifikasi.',
      DIPROSES: 'Sepatu telah diterima di workshop dan dijadwalkan pengerjaan.',
      DICUCI: 'Sepatu sedang dalam tahap pencucian mendalam sesuai treatment.',
      DRYING: 'Pencucian selesai, sepatu sedang dalam proses pengeringan khusus anti-rusak.',
      FINISHING: 'Sepatu dalam tahap quality control, pewangi, dan pengemasan rapi.',
      SELESAI: 'Sepatu telah bersih wangi dan siap diambil atau dikirim kembali ke alamat Anda!',
      DIBATALKAN: 'Pesanan dibatalkan.',
    };

    const finalDescription = description || defaultDescriptions[status];

    // Jalankan pembaruan status dan penambahan log pelacakan dalam satu transaksi
    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          deliveryDate: status === 'SELESAI' ? new Date() : undefined,
        },
      });

      const trackingLog = await tx.orderTracking.create({
        data: {
          orderId,
          status,
          description: finalDescription,
          updatedBy: req.user.name || 'Admin',
        },
      });

      return { updatedOrder, trackingLog };
    });

    return successResponse(res, `Status pesanan berhasil diubah menjadi '${status}'!`, result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/verify-payment
 * Admin memverifikasi bukti pembayaran
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    const { paymentStatus } = req.body; // 'SUDAH_DIBAYAR' atau 'GAGAL'

    if (!paymentStatus || !['SUDAH_DIBAYAR', 'GAGAL', 'MENUNGGU_PEMBAYARAN'].includes(paymentStatus)) {
      return errorResponse(res, 'Status pembayaran tidak valid.', 400);
    }

    const updatedPayment = await prisma.payment.update({
      where: { orderId },
      data: {
        paymentStatus,
        paidAt: paymentStatus === 'SUDAH_DIBAYAR' ? new Date() : null,
      },
    });

    return successResponse(res, 'Status pembayaran berhasil diverifikasi.', updatedPayment);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/orders/:id/gallery
 * Admin mengunggah foto proses atau foto hasil akhir laundry sepatu
 */
const uploadOrderGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    const { type, caption } = req.body;

    if (!req.file && !req.body.imageUrl) {
      return errorResponse(res, 'File foto sepatu wajib diunggah!', 400);
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    const galleryType = type || 'SESUDAH';

    const gallery = await prisma.gallery.create({
      data: {
        orderId,
        type: galleryType,
        imageUrl,
        caption: caption || `Foto ${galleryType.toLowerCase()} pengerjaan laundry`,
      },
    });

    return successResponse(res, 'Foto sepatu berhasil ditambahkan ke galeri pesanan!', gallery, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/customers
 * Mengambil daftar seluruh pelanggan beserta jumlah pesanan & total pembelanjaan
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatar: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCustomers = customers.map((c) => {
      const orderCount = c.orders.length;
      const totalSpent = c.orders.reduce((acc, curr) => acc + parseFloat(curr.totalAmount), 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        avatar: c.avatar,
        registeredAt: c.createdAt,
        totalOrders: orderCount,
        totalSpent,
      };
    });

    return successResponse(res, 'Daftar pelanggan berhasil diambil.', formattedCustomers);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/customers/:id
 * Menghapus akun pelanggan (Admin Only)
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);

    const user = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!user || user.role !== 'CUSTOMER') {
      return errorResponse(res, 'Pelanggan tidak ditemukan.', 404);
    }

    await prisma.user.delete({
      where: { id: customerId },
    });

    return successResponse(res, `Akun pelanggan '${user.name}' berhasil dihapus.`);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/reports
 * Laporan pendapatan dan rincian performa layanan
 */
const getRevenueReport = async (req, res, next) => {
  try {
    // 1. Ambil seluruh pesanan yang sudah dibayar
    const paidOrders = await prisma.order.findMany({
      where: {
        payment: { paymentStatus: 'SUDAH_DIBAYAR' },
      },
      include: {
        payment: true,
        orderItems: {
          include: { service: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalIncome = paidOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

    // 2. Breakdown pendapatan berdasarkan jenis layanan
    const serviceBreakdownMap = {};
    for (const order of paidOrders) {
      for (const item of order.orderItems) {
        const sName = item.service.name;
        if (!serviceBreakdownMap[sName]) {
          serviceBreakdownMap[sName] = {
            serviceName: sName,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        serviceBreakdownMap[sName].totalQuantity += item.quantity;
        serviceBreakdownMap[sName].totalRevenue += parseFloat(item.price) * item.quantity;
      }
    }

    const serviceBreakdown = Object.values(serviceBreakdownMap).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    return successResponse(res, 'Laporan pendapatan berhasil di-generate.', {
      summary: {
        totalPaidOrders: paidOrders.length,
        totalIncome,
      },
      serviceBreakdown,
      transactions: paidOrders.map((o) => ({
        orderNumber: o.orderNumber,
        date: o.createdAt,
        totalAmount: parseFloat(o.totalAmount),
        paymentMethod: o.payment?.paymentMethod,
        itemsCount: o.orderItems.length,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  verifyPayment,
  uploadOrderGallery,
  getAllCustomers,
  deleteCustomer,
  getRevenueReport,
};
