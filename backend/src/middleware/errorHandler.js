const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware untuk menangani Route 404 (Not Found)
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Endpoint URL '${req.originalUrl}' tidak ditemukan pada server ini.`, 404);
};

/**
 * Global Error Handler untuk menangkap semua uncaught exception dan Prisma errors
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Server Error Log:', err);

  // Error dari Multer (Upload File)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'Ukuran file melebihi batas maksimal 5MB.', 400);
    }
    return errorResponse(res, `Kesalahan upload: ${err.message}`, 400);
  }

  // Error dari Prisma ORM (Contoh: Duplikasi Email)
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? `pada kolom: ${err.meta.target}` : '';
    return errorResponse(res, `Data duplikat telah terdaftar ${fields}.`, 409);
  }

  // Error Prisma record tidak ditemukan
  if (err.code === 'P2025') {
    return errorResponse(res, 'Data yang diminta tidak ditemukan di database.', 404);
  }

  // Custom validation error message
  if (err.message && (err.message.includes('Hanya file gambar') || err.isCustom)) {
    return errorResponse(res, err.message, 400);
  }

  // Generic 500 Internal Server Error
  return errorResponse(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan internal pada server.',
    500
  );
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
