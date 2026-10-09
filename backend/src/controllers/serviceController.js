const db = require('../utils/jsonDatabase');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/services
 * Mendapatkan daftar seluruh layanan laundry
 */
const getAllServices = async (req, res, next) => {
  try {
    const { all } = req.query;

    // Jika parameter all=true (misal di admin), tampilkan semua. Jika tidak, hanya yang aktif
    const where = all === 'true' ? {} : { isActive: true };

    const services = db.findMany('services', all === 'true' ? null : (s) => s.isActive === true);
    services.sort((a, b) => a.id - b.id);

    return successResponse(res, 'Daftar layanan berhasil diambil.', services);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/services/:id
 * Mendapatkan detail satu layanan berdasarkan ID
 */
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = db.findUnique('services', id);

    if (!service) {
      return errorResponse(res, 'Layanan tidak ditemukan.', 404);
    }

    return successResponse(res, 'Detail layanan berhasil diambil.', service);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/services (Admin Only)
 * Menambahkan layanan baru
 */
const createService = async (req, res, next) => {
  try {
    const { name, description, duration, price } = req.body;

    if (!name || !description || !duration || !price) {
      return errorResponse(res, 'Nama, deskripsi, durasi, dan harga wajib diisi!', 400);
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image || null;

    const service = db.create('services', {
      name,
      description,
      duration,
      price: parseFloat(price),
      image: imageUrl,
      isActive: req.body.isActive !== undefined ? (req.body.isActive === true || req.body.isActive === 'true') : true,
    });

    return successResponse(res, 'Layanan baru berhasil ditambahkan!', service, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/services/:id (Admin Only)
 * Memperbarui data layanan
 */
const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, duration, price, isActive } = req.body;

    const existingService = db.findUnique('services', id);

    if (!existingService) {
      return errorResponse(res, 'Layanan tidak ditemukan.', 404);
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (duration) updateData.duration = duration;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const updated = db.update('services', id, updateData);

    return successResponse(res, 'Layanan berhasil diperbarui!', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/services/:id (Admin Only)
 * Menghapus atau menonaktifkan layanan
 */
const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceId = parseInt(id);

    // Cek apakah layanan sudah pernah dipakai dalam transaksi JSON (nested data)
    const orders = db.findMany('orders');
    const isUsed = orders.some(o => o.orderItems && o.orderItems.some(item => item.serviceId === serviceId));

    if (isUsed) {
      // Soft delete: jadikan nonaktif agar riwayat pesanan masa lalu tidak rusak
      const deactivated = db.update('services', serviceId, { isActive: false });
      return successResponse(
        res,
        'Layanan dinonaktifkan (disimpan sebagai riwayat pesanan terdahulu).',
        deactivated
      );
    }

    // Jika belum pernah ada transaksi, boleh hard delete
    db.delete('services', serviceId);

    return successResponse(res, 'Layanan berhasil dihapus secara permanen.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
