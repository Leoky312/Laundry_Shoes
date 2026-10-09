const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/jsonDatabase');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Generate JWT Token Helper
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'laundry_shoes_super_secret_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * POST /api/auth/register
 * Pendaftaran akun customer baru
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validasi input wajib
    if (!name || !email || !password) {
      return errorResponse(res, 'Nama, email, dan password wajib diisi!', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password minimal harus 6 karakter.', 400);
    }

    // Periksa apakah email sudah terdaftar
    const existingUser = db.findFirst('users', (u) => u.email === email.toLowerCase().trim());

    if (existingUser) {
      return errorResponse(res, 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user baru di database (role default: CUSTOMER)
    const newUserRaw = db.create('users', {
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || null,
      address: address || null,
      role: 'CUSTOMER',
      avatar: null,
    });
    
    const { password: _p, ...newUser } = newUserRaw;

    // Buat JWT token langsung agar user langsung login setelah register
    const token = generateToken(newUser);

    return successResponse(
      res,
      'Registrasi akun berhasil!',
      {
        user: newUser,
        token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Otentikasi login pengguna (Admin maupun Customer)
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email dan password wajib diisi!', 400);
    }

    // Cari user berdasarkan email
    const user = db.findFirst('users', (u) => u.email === email.toLowerCase().trim());

    if (!user) {
      return errorResponse(res, 'Email atau password yang Anda masukkan salah.', 401);
    }

    // Verifikasi password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Email atau password yang Anda masukkan salah.', 401);
    }

    // Generate JWT token
    const token = generateToken(user);

    // Hapus password dari object response
    const { password: _, ...userData } = user;

    return successResponse(res, 'Login berhasil!', {
      user: userData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Mendapatkan profil data user yang sedang login saat ini
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user sudah dipasang oleh authMiddleware.authenticate
    return successResponse(res, 'Data profil berhasil diambil.', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Memperbarui data profil pengguna & foto profil (avatar)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // Jika ada upload avatar baru
    if (req.file) {
      // Simpan URL gambar relatif yang bisa diakses via static express
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUserRaw = db.update('users', userId, updateData);
    if (!updatedUserRaw) {
      return errorResponse(res, 'User tidak ditemukan.', 404);
    }
    const { password: _p, ...updatedUser } = updatedUserRaw;

    return successResponse(res, 'Profil berhasil diperbarui!', updatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
