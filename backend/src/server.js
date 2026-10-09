const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middlewares Dasar
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 2. Static File Serving (Untuk akses foto sepatu dan bukti pembayaran)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 3. Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Laundry Shoes Backend REST API',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// 4. Daftarkan Routes Utama
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin', adminRoutes);

// 5. Handling 404 Not Found & Global Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// 6. Jalankan Server jika dieksekusi langsung
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('==================================================');
    console.log(`🚀 Laundry Shoes API Server aktif!`);
    console.log(`📡 URL Lokal:    http://localhost:${PORT}`);
    console.log(`🛡️  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`👟 Services API: http://localhost:${PORT}/api/services`);
    console.log(`📦 Orders API:   http://localhost:${PORT}/api/orders`);
    console.log(`🔍 Tracking API: http://localhost:${PORT}/api/tracking/:orderNumber`);
    console.log(`👑 Admin API:    http://localhost:${PORT}/api/admin`);
    console.log('==================================================');
  });
}

module.exports = app;
