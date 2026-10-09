const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Seluruh route di bawah ini diproteksi khusus ADMIN
router.use(authenticate, authorize('ADMIN'));

// 1. Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// 2. Orders Management
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);
router.patch('/orders/:id/verify-payment', adminController.verifyPayment);
router.post('/orders/:id/gallery', upload.single('image'), adminController.uploadOrderGallery);
router.delete('/orders/:id', adminController.deleteCancelledOrder);

// 3. Customers Management
router.get('/customers', adminController.getAllCustomers);
router.delete('/customers/:id', adminController.deleteCustomer);

// 4. Financial & Revenue Report
router.get('/reports', adminController.getRevenueReport);

module.exports = router;
