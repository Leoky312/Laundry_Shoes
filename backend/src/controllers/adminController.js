const db = require('../utils/jsonDatabase');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getDashboardStats = async (req, res, next) => {
  try {
    const orders = db.findMany('orders');
    const users = db.findMany('users', (u) => u.role === 'CUSTOMER');

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'MENUNGGU').length;
    const inProcessOrders = orders.filter(o => ['DIPROSES', 'DICUCI', 'DRYING', 'FINISHING'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'SELESAI').length;
    const cancelledOrders = orders.filter(o => o.status === 'DIBATALKAN').length;
    const totalCustomers = users.length;

    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentOrders = sortedOrders.slice(0, 5);

    let totalRevenue = 0;
    orders.forEach(o => {
      if (o.payment && o.payment.paymentStatus === 'SUDAH_DIBAYAR') {
        totalRevenue += parseFloat(o.payment.amount || o.totalAmount);
      }
    });

    return successResponse(res, 'Statistik admin dashboard berhasil diambil.', {
      stats: { totalRevenue, totalOrders, pendingOrders, inProcessOrders, completedOrders, cancelledOrders, totalCustomers },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let orders = db.findMany('orders');

    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      orders = orders.filter(o => 
        (o.orderNumber && o.orderNumber.toLowerCase().includes(lowerSearch)) ||
        (o.user && o.user.name && o.user.name.toLowerCase().includes(lowerSearch)) ||
        (o.user && o.user.phone && o.user.phone.toLowerCase().includes(lowerSearch))
      );
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return successResponse(res, 'Seluruh pesanan berhasil diambil.', orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;
    const validStatuses = ['MENUNGGU', 'DIPROSES', 'DICUCI', 'DRYING', 'FINISHING', 'SELESAI', 'DIBATALKAN'];

    if (!status || !validStatuses.includes(status)) return errorResponse(res, `Status tidak valid. Pilihan: ${validStatuses.join(', ')}`, 400);

    const order = db.findUnique('orders', id);
    if (!order) return errorResponse(res, 'Pesanan tidak ditemukan.', 404);

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
    const trackingId = order.tracking && order.tracking.length > 0 ? Math.max(...order.tracking.map(t => t.id)) + 1 : 1;
    
    if (!order.tracking) order.tracking = [];
    order.tracking.push({
      id: trackingId,
      status,
      description: finalDescription,
      updatedBy: req.user.name || 'Admin',
      createdAt: new Date().toISOString()
    });

    const updateData = { status, tracking: order.tracking };
    if (status === 'SELESAI') updateData.deliveryDate = new Date().toISOString();

    const updatedOrder = db.update('orders', id, updateData);
    return successResponse(res, `Status pesanan berhasil diubah menjadi '${status}'!`, { updatedOrder, trackingLog: order.tracking[order.tracking.length - 1] });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    if (!paymentStatus || !['SUDAH_DIBAYAR', 'GAGAL', 'MENUNGGU_PEMBAYARAN'].includes(paymentStatus)) return errorResponse(res, 'Status pembayaran tidak valid.', 400);

    const order = db.findUnique('orders', id);
    if (!order) return errorResponse(res, 'Pesanan tidak ditemukan.', 404);

    if (!order.payment) order.payment = {};
    order.payment.paymentStatus = paymentStatus;
    if (paymentStatus === 'SUDAH_DIBAYAR') order.payment.paidAt = new Date().toISOString();

    const updatedOrder = db.update('orders', id, { payment: order.payment });
    return successResponse(res, 'Status pembayaran berhasil diverifikasi.', updatedOrder.payment);
  } catch (error) {
    next(error);
  }
};

const uploadOrderGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, caption } = req.body;

    if (!req.file && !req.body.imageUrl) return errorResponse(res, 'File foto sepatu wajib diunggah!', 400);

    const order = db.findUnique('orders', id);
    if (!order) return errorResponse(res, 'Pesanan tidak ditemukan.', 404);

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    const galleryType = type || 'SESUDAH';

    if (!order.galleries) order.galleries = [];
    const galleryId = order.galleries.length > 0 ? Math.max(...order.galleries.map(g => g.id)) + 1 : 1;
    const newGallery = {
      id: galleryId,
      type: galleryType,
      imageUrl,
      caption: caption || `Foto ${galleryType.toLowerCase()} pengerjaan laundry`,
      createdAt: new Date().toISOString()
    };
    order.galleries.push(newGallery);

    db.update('orders', id, { galleries: order.galleries });
    return successResponse(res, 'Foto sepatu berhasil ditambahkan ke galeri pesanan!', newGallery, 201);
  } catch (error) {
    next(error);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    const users = db.findMany('users', (u) => u.role === 'CUSTOMER');
    const allOrders = db.findMany('orders');

    const formattedCustomers = users.map((c) => {
      const cOrders = allOrders.filter(o => o.userId === c.id);
      const totalSpent = cOrders.reduce((acc, curr) => acc + parseFloat(curr.totalAmount), 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        avatar: c.avatar,
        registeredAt: c.createdAt,
        totalOrders: cOrders.length,
        totalSpent,
      };
    });

    formattedCustomers.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
    return successResponse(res, 'Daftar pelanggan berhasil diambil.', formattedCustomers);
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = db.findUnique('users', id);
    if (!user || user.role !== 'CUSTOMER') return errorResponse(res, 'Pelanggan tidak ditemukan.', 404);

    db.delete('users', id);
    return successResponse(res, `Akun pelanggan '${user.name}' berhasil dihapus.`);
  } catch (error) {
    next(error);
  }
};

const getRevenueReport = async (req, res, next) => {
  try {
    const allOrders = db.findMany('orders');
    const paidOrders = allOrders.filter(o => o.payment && o.payment.paymentStatus === 'SUDAH_DIBAYAR');

    const totalIncome = paidOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const serviceBreakdownMap = {};

    for (const order of paidOrders) {
      if (order.orderItems) {
        for (const item of order.orderItems) {
          const sName = item.service ? item.service.name : 'Unknown';
          if (!serviceBreakdownMap[sName]) {
            serviceBreakdownMap[sName] = { serviceName: sName, totalQuantity: 0, totalRevenue: 0 };
          }
          serviceBreakdownMap[sName].totalQuantity += item.quantity;
          serviceBreakdownMap[sName].totalRevenue += parseFloat(item.price) * item.quantity;
        }
      }
    }

    const serviceBreakdown = Object.values(serviceBreakdownMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return successResponse(res, 'Laporan pendapatan berhasil di-generate.', {
      summary: { totalPaidOrders: paidOrders.length, totalIncome },
      serviceBreakdown,
      transactions: paidOrders.map((o) => ({
        orderNumber: o.orderNumber,
        date: o.createdAt,
        totalAmount: parseFloat(o.totalAmount),
        paymentMethod: o.payment?.paymentMethod,
        itemsCount: o.orderItems?.length || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const deleteCancelledOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = db.findUnique('orders', id);
    if (!order) return errorResponse(res, 'Pesanan tidak ditemukan.', 404);
    if (order.status !== 'DIBATALKAN') return errorResponse(res, 'Hanya pesanan yang sudah dibatalkan yang dapat dihapus dari sistem.', 400);

    db.delete('orders', id);
    return successResponse(res, `Pesanan #${order.orderNumber} yang telah dibatalkan berhasil dihapus permanen.`);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getAllOrders, updateOrderStatus, verifyPayment, uploadOrderGallery, deleteCancelledOrder, getAllCustomers, deleteCustomer, getRevenueReport };
