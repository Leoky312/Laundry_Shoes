const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Endpoint publik (tidak perlu token)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Endpoint terproteksi (wajib login & bawa Bearer Token)
router.get('/me', authenticate, authController.getProfile);
router.put('/profile', authenticate, upload.single('avatar'), authController.updateProfile);

module.exports = router;
