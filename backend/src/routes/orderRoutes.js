const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Endpoint Customer Terproteksi
router.post('/', authenticate, upload.single('shoePhoto'), orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.post('/:id/payment', authenticate, upload.single('paymentProof'), orderController.submitPayment);

module.exports = router;
