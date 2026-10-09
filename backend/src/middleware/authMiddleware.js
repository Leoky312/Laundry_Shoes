const jwt = require('jsonwebtoken');
const db = require('../utils/jsonDatabase');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware untuk memverifikasi JWT Token pada request header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Akses ditolak. Token autentikasi tidak ditemukan.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laundry_shoes_super_secret_jwt_key_2026');

    // Cek apakah user pemilik token masih aktif di database
    const userRaw = db.findUnique('users', decoded.id);

    if (!userRaw) {
      return errorResponse(res, 'User pemilik token ini sudah tidak ditemukan.', 401);
    }
    
    const { password, ...user } = userRaw;

    // Pasang user ke request object agar bisa diakses di controller berikutnya
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Sesi login telah kedaluwarsa. Silakan login kembali.', 401);
    }
    return errorResponse(res, 'Token tidak valid.', 401);
  }
};

/**
 * Middleware untuk membatasi akses berdasarkan Role (ADMIN atau CUSTOMER)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Akses dilarang. Fitur ini hanya dapat diakses oleh role: ${roles.join(', ')}`,
        403
      );
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
