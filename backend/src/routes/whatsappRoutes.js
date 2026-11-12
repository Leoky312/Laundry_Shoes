/**
 * ==============================================================================
 * SHOEFRESH BACKEND - WHATSAPP CLOUD API ROUTES
 * ==============================================================================
 * Router Express untuk endpoint integrasi notifikasi WhatsApp Meta.
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappApi');

/**
 * @route   GET /api/whatsapp/status
 * @desc    Cek status konfigurasi Meta WhatsApp Cloud API pada backend
 * @access  Public / Internal
 */
router.get('/status', (req, res) => {
  try {
    const status = whatsappService.getWhatsAppConfigStatus();
    return res.status(200).json({
      success: true,
      message: 'Status konfigurasi WhatsApp Cloud API berhasil diambil.',
      data: status,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil status WhatsApp: ' + err.message,
    });
  }
});

/**
 * @route   POST /api/whatsapp/preview
 * @desc    Melihat preview format teks notifikasi pesanan ShoeFresh
 * @access  Public
 */
router.post('/preview', (req, res) => {
  try {
    const { customerName, orderNumber, serviceName, status } = req.body;
    const formatted = whatsappService.formatOrderStatusMessage({
      customerName,
      orderNumber,
      serviceName,
      status,
    });

    return res.status(200).json({
      success: true,
      message: 'Preview pesan berhasil digenerate.',
      data: {
        previewText: formatted,
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * @route   POST /api/whatsapp/send
 * @desc    Kirim pesan teks biasa ke nomor WhatsApp pelanggan (dalam jendela 24 jam)
 * @body    { to: "081234567890", message: "Halo...", previewUrl: false }
 * @access  Public / Admin
 */
router.post('/send', async (req, res) => {
  try {
    const { to, message, previewUrl } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "to" (nomor WhatsApp tujuan) wajib diisi.',
      });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "message" (isi pesan) wajib diisi.',
      });
    }

    const result = await whatsappService.sendTextMessage(to, message, previewUrl);

    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.status || 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Gagal mengirim pesan WhatsApp.',
      error: err.metaError || null,
      fbtrace_id: err.fbtrace_id || null,
    });
  }
});

/**
 * @route   POST /api/whatsapp/send-order-status
 * @desc    Kirim notifikasi perubahan status pesanan ShoeFresh
 *          Mendukung pesan teks langsung atau template Meta resmi (di luar jendela 24 jam).
 * @body    {
 *            to: "081234567890",
 *            customerName: "Andi",
 *            orderNumber: "SF001",
 *            serviceName: "Deep Cleaning",
 *            status: "Diproses",
 *            useTemplate: false
 *          }
 * @access  Public / Admin
 */
router.post('/send-order-status', async (req, res) => {
  try {
    const {
      to,
      customerName,
      orderNumber,
      serviceName,
      status,
      useTemplate = false,
      templateName,
      languageCode,
    } = req.body;

    // Validasi parameter wajib
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Nomor WhatsApp pelanggan ("to") wajib disertakan.',
      });
    }

    if (!customerName || !orderNumber || !serviceName || !status) {
      return res.status(400).json({
        success: false,
        message:
          'Data pesanan tidak lengkap. Mohon sertakan: customerName, orderNumber, serviceName, dan status.',
      });
    }

    const result = await whatsappService.sendOrderStatusNotification({
      to,
      customerName,
      orderNumber,
      serviceName,
      status,
      useTemplate: Boolean(useTemplate),
      templateName,
      languageCode,
    });

    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.status || 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Gagal mengirim notifikasi status pesanan via WhatsApp.',
      error: err.metaError || null,
      fbtrace_id: err.fbtrace_id || null,
    });
  }
});

/**
 * @route   POST /api/whatsapp/send-template
 * @desc    Kirim pesan template resmi Meta yang telah disetujui (utility/notification)
 * @body    {
 *            to: "081234567890",
 *            templateName: "shoefresh_order_status_update",
 *            languageCode: "id",
 *            parameters: ["Andi", "SF001", "Deep Cleaning", "Diproses"]
 *          }
 * @access  Public / Admin
 */
router.post('/send-template', async (req, res) => {
  try {
    const { to, templateName, languageCode, parameters, components } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "to" (nomor WhatsApp) wajib diisi.',
      });
    }

    const result = await whatsappService.sendTemplateMessage({
      to,
      templateName,
      languageCode,
      parameters,
      components,
    });

    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.status || 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Gagal mengirim pesan template WhatsApp.',
      error: err.metaError || null,
      fbtrace_id: err.fbtrace_id || null,
    });
  }
});

module.exports = router;
