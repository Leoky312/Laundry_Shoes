const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Helper untuk membuat kode pesanan unik (Contoh: ORD-20260926-8492)
 */
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
};

/**
 * POST /api/orders
 * Customer membuat pesanan baru
 */
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { pickupDate, notes, items, paymentMethod } = req.body;

    // Parse items jika dikirim dalam bentuk form-data string
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        return errorResponse(res, 'Format data items sepatu tidak valid JSON.', 400);
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 'Pesanan harus memiliki minimal 1 pasang sepatu/layanan.', 400);
    }

    // 1. Ambil data layanan dari database untuk menghitung total biaya yang valid
    const serviceIds = items.map((it) => parseInt(it.serviceId));
    const dbServices = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true },
    });

    if (dbServices.length === 0) {
      return errorResponse(res, 'Layanan yang dipilih tidak valid atau sudah tidak aktif.', 400);
    }

    const serviceMap = new Map(dbServices.map((s) => [s.id, s]));

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const sId = parseInt(item.serviceId);
      const s = serviceMap.get(sId);
      if (!s) {
        return errorResponse(res, `Layanan dengan ID ${sId} tidak ditemukan.`, 400);
      }

      const qty = parseInt(item.quantity) || 1;
      const itemPrice = parseFloat(s.price);
      calculatedTotal += itemPrice * qty;

      validatedItems.push({
        serviceId: sId,
        shoeBrand: item.shoeBrand || 'Sepatu',
        shoeColor: item.shoeColor || null,
        shoeSize: item.shoeSize || null,
        notes: item.notes || null,
        price: itemPrice,
        quantity: qty,
      });
    }

    const orderNumber = generateOrderNumber();
    const method = paymentMethod || 'TRANSFER_BANK';

    // 2. Transaksi Database Prisma: Order + Items + Payment + Tracking + Gallery Awal
    const result = await prisma.$transaction(async (tx) => {
      // Buat Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          pickupDate: pickupDate ? new Date(pickupDate) : null,
          status: 'MENUNGGU',
          totalAmount: calculatedTotal,
          notes: notes || null,
          orderItems: {
            create: validatedItems,
          },
          payment: {
            create: {
              paymentMethod: method,
              paymentStatus: 'MENUNGGU_PEMBAYARAN',
              amount: calculatedTotal,
            },
          },
          tracking: {
            create: {
              status: 'MENUNGGU',
              description: 'Pesanan berhasil dibuat. Menunggu konfirmasi dan jadwal jemput sepatu.',
              updatedBy: 'Sistem',
            },
          },
        },
        include: {
          orderItems: {
            include: { service: true },
          },
          payment: true,
          tracking: true,
        },
      });

      // Jika ada file foto sepatu awal yang diunggah saat booking
      if (req.file) {
        const photoUrl = `/uploads/${req.file.filename}`;
        await tx.gallery.create({
          data: {
            orderId: newOrder.id,
            type: 'SEBELUM',
            imageUrl: photoUrl,
            caption: 'Foto kondisi sepatu saat pemesanan',
          },
        });
      }

      return newOrder;
    });

    return successResponse(res, 'Pesanan berhasil dibuat!', result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/my-orders
 * Mengambil daftar riwayat pesanan milik customer yang sedang login
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            service: {
              select: { id: true, name: true, image: true, duration: true },
            },
          },
        },
        payment: true,
        tracking: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Ambil status terakhir
        },
        galleries: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, 'Riwayat pesanan berhasil diambil.', orders);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Mengambil detail lengkap satu pesanan
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, address: true, avatar: true },
        },
        orderItems: {
          include: { service: true },
        },
        payment: true,
        tracking: {
          orderBy: { createdAt: 'asc' },
        },
        galleries: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return errorResponse(res, 'Pesanan tidak ditemukan.', 404);
    }

    // Customer hanya bisa melihat pesanannya sendiri; Admin bisa melihat semua
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki izin melihat pesanan ini.', 403);
    }

    return successResponse(res, 'Detail pesanan berhasil diambil.', order);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:id/payment
 * Customer mengunggah bukti pembayaran
 */
const submitPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    const { paymentMethod } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return errorResponse(res, 'Pesanan tidak ditemukan.', 404);
    }

    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki hak untuk pesanan ini.', 403);
    }

    if (!req.file && !req.body.paymentProof) {
      return errorResponse(res, 'Bukti pembayaran wajib diunggah!', 400);
    }

    const proofUrl = req.file ? `/uploads/${req.file.filename}` : req.body.paymentProof;

    const updatedPayment = await prisma.payment.upsert({
      where: { orderId },
      update: {
        paymentProof: proofUrl,
        paymentMethod: paymentMethod || order.payment?.paymentMethod || 'TRANSFER_BANK',
        paymentStatus: 'SUDAH_DIBAYAR',
        paidAt: new Date(),
      },
      create: {
        orderId,
        paymentMethod: paymentMethod || 'TRANSFER_BANK',
        paymentStatus: 'SUDAH_DIBAYAR',
        amount: order.totalAmount,
        paymentProof: proofUrl,
        paidAt: new Date(),
      },
    });

    return successResponse(res, 'Bukti transfer berhasil diunggah!', updatedPayment);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tracking/:orderNumber
 * Lacak status pengerjaan sepatu secara real-time via nomor order (Bisa publik/customer)
 */
const trackByOrderNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: {
          include: {
            service: { select: { name: true, duration: true } },
          },
        },
        payment: {
          select: { paymentMethod: true, paymentStatus: true, amount: true },
        },
        tracking: {
          orderBy: { createdAt: 'asc' },
        },
        galleries: true,
      },
    });

    if (!order) {
      return errorResponse(res, `Pesanan dengan nomor '${orderNumber}' tidak ditemukan.`, 404);
    }

    return successResponse(res, 'Status pelacakan pesanan berhasil ditemukan.', order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  submitPayment,
  trackByOrderNumber,
};
