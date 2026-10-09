const db = require('../utils/jsonDatabase');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
};

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { pickupDate, notes, items, paymentMethod } = req.body;

    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (e) { return errorResponse(res, 'Format data items sepatu tidak valid JSON.', 400); }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 'Pesanan harus memiliki minimal 1 pasang sepatu/layanan.', 400);
    }

    const serviceIds = items.map((it) => parseInt(it.serviceId));
    const allServices = db.findMany('services', (s) => s.isActive === true);
    const dbServices = allServices.filter(s => serviceIds.includes(s.id));

    if (dbServices.length === 0) {
      return errorResponse(res, 'Layanan yang dipilih tidak valid atau sudah tidak aktif.', 400);
    }

    const serviceMap = new Map(dbServices.map((s) => [s.id, s]));
    let calculatedTotal = 0;
    const validatedItems = [];

    let tempItemId = 1;

    for (const item of items) {
      const sId = parseInt(item.serviceId);
      const s = serviceMap.get(sId);
      if (!s) return errorResponse(res, `Layanan dengan ID ${sId} tidak ditemukan.`, 400);

      const qty = parseInt(item.quantity) || 1;
      const itemPrice = parseFloat(s.price);
      calculatedTotal += itemPrice * qty;

      validatedItems.push({
        id: tempItemId++,
        serviceId: sId,
        service: s,
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
    const now = new Date().toISOString();

    const galleries = [];
    if (req.file) {
      galleries.push({
        id: 1,
        type: 'SEBELUM',
        imageUrl: `/uploads/${req.file.filename}`,
        caption: 'Foto kondisi sepatu saat pemesanan',
        createdAt: now
      });
    }

    const newOrderRaw = {
      orderNumber,
      userId,
      pickupDate: pickupDate ? new Date(pickupDate).toISOString() : null,
      deliveryDate: null,
      status: 'MENUNGGU',
      totalAmount: calculatedTotal,
      notes: notes || null,
      orderItems: validatedItems,
      payment: {
        id: 1,
        paymentMethod: method,
        paymentStatus: 'MENUNGGU_PEMBAYARAN',
        amount: calculatedTotal,
        paymentProof: null,
        paidAt: null,
        createdAt: now,
        updatedAt: now
      },
      tracking: [
        {
          id: 1,
          status: 'MENUNGGU',
          description: 'Pesanan berhasil dibuat. Menunggu konfirmasi dan jadwal jemput sepatu.',
          updatedBy: 'Sistem',
          createdAt: now
        }
      ],
      galleries
    };

    const newOrder = db.create('orders', newOrderRaw);
    return successResponse(res, 'Pesanan berhasil dibuat!', newOrder, 201);
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let orders = db.findMany('orders', (o) => o.userId === userId);
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return successResponse(res, 'Riwayat pesanan berhasil diambil.', orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = db.findUnique('orders', id);

    if (!order) {
      return errorResponse(res, 'Pesanan tidak ditemukan.', 404);
    }

    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki izin melihat pesanan ini.', 403);
    }

    return successResponse(res, 'Detail pesanan berhasil diambil.', order);
  } catch (error) {
    next(error);
  }
};

const submitPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = db.findUnique('orders', id);

    if (!order) return errorResponse(res, 'Pesanan tidak ditemukan.', 404);
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) return errorResponse(res, 'Anda tidak memiliki hak untuk pesanan ini.', 403);
    if (!req.file && !req.body.paymentProof) return errorResponse(res, 'Bukti pembayaran wajib diunggah!', 400);

    const proofUrl = req.file ? `/uploads/${req.file.filename}` : req.body.paymentProof;
    const method = req.body.paymentMethod || order.payment?.paymentMethod || 'TRANSFER_BANK';

    order.payment = {
      ...order.payment,
      paymentMethod: method,
      paymentStatus: 'SUDAH_DIBAYAR',
      paymentProof: proofUrl,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedOrder = db.update('orders', id, { payment: order.payment });
    return successResponse(res, 'Bukti transfer berhasil diunggah!', updatedOrder.payment);
  } catch (error) {
    next(error);
  }
};

const trackByOrderNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = db.findFirst('orders', (o) => o.orderNumber === orderNumber);

    if (!order) return errorResponse(res, `Pesanan dengan nomor '${orderNumber}' tidak ditemukan.`, 404);

    return successResponse(res, 'Status pelacakan pesanan berhasil ditemukan.', order);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = db.findUnique('orders', id);

    if (!order) return errorResponse(res, 'Pesanan tidak ditemukan.', 404);
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) return errorResponse(res, 'Anda tidak memiliki izin untuk membatalkan pesanan ini.', 403);
    if (order.status !== 'MENUNGGU' && order.status !== 'DIPROSES') return errorResponse(res, 'Pesanan hanya dapat dibatalkan jika sepatu belum dicuci (status Menunggu atau Diproses).', 400);

    const trackingId = order.tracking.length > 0 ? Math.max(...order.tracking.map(t => t.id)) + 1 : 1;
    order.tracking.push({
      id: trackingId,
      status: 'DIBATALKAN',
      description: 'Pesanan dibatalkan oleh pelanggan.',
      updatedBy: req.user.name || 'Pelanggan',
      createdAt: new Date().toISOString()
    });

    const updatedOrder = db.update('orders', id, { status: 'DIBATALKAN', tracking: order.tracking });
    return successResponse(res, 'Pesanan berhasil dibatalkan.', updatedOrder);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, submitPayment, trackByOrderNumber, cancelOrder };
