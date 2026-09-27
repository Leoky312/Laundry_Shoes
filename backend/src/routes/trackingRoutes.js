const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Lacak status pengerjaan berdasarkan nomor pesanan (Bisa dicek tanpa login)
router.get('/:orderNumber', orderController.trackByOrderNumber);

module.exports = router;
