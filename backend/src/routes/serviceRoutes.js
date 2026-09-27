const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Endpoint publik
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Endpoint Admin Only
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  upload.single('image'),
  serviceController.createService
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  upload.single('image'),
  serviceController.updateService
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  serviceController.deleteService
);

module.exports = router;
