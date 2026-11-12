/**
 * ==============================================================================
 * SHOEFRESH BACKEND - WHATSAPP CLOUD API ROUTES (TypeScript Version)
 * ==============================================================================
 */

import { Router, Request, Response } from 'express';
import {
  sendTextMessage,
  sendTemplateMessage,
  sendOrderStatusNotification,
  formatOrderStatusMessage,
  getWhatsAppConfig,
  isPlaceholderCredential,
} from '../services/whatsappApi';
import {
  SendWhatsAppTextDto,
  SendWhatsAppTemplateDto,
  SendOrderStatusNotificationDto,
  BackendApiResponse,
} from '../types/whatsapp';

const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  const config = getWhatsAppConfig();
  const hasPhoneId = Boolean(config.phoneNumberId) && !isPlaceholderCredential(config.phoneNumberId);
  const hasToken = Boolean(config.accessToken) && !isPlaceholderCredential(config.accessToken);

  const response: BackendApiResponse = {
    success: true,
    message: 'Status konfigurasi WhatsApp Cloud API berhasil diambil.',
    data: {
      isConfigured: hasPhoneId && hasToken,
      simulationMode: process.env.WHATSAPP_SIMULATION_MODE === 'true' || !hasPhoneId || !hasToken,
      apiVersion: config.apiVersion,
      apiUrl: config.apiUrl,
      phoneNumberIdMasked: config.phoneNumberId
        ? `${config.phoneNumberId.slice(0, 4)}****${config.phoneNumberId.slice(-4)}`
        : 'BELUM_DIATUR',
      defaultTemplate: config.defaultTemplateName,
    },
  };
  return res.status(200).json(response);
});

router.post('/preview', (req: Request, res: Response) => {
  const { customerName, orderNumber, serviceName, status } = req.body;
  const formatted = formatOrderStatusMessage({
    customerName,
    orderNumber,
    serviceName,
    status,
  });

  return res.status(200).json({
    success: true,
    message: 'Preview pesan berhasil digenerate.',
    data: { previewText: formatted },
  });
});

router.post('/send', async (req: Request<{}, {}, SendWhatsAppTextDto>, res: Response) => {
  try {
    const { to, message, previewUrl } = req.body;
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "to" dan "message" wajib disertakan.',
      });
    }

    const result = await sendTextMessage(to, message, previewUrl);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message,
      error: err.metaError || null,
    });
  }
});

router.post('/send-order-status', async (req: Request<{}, {}, SendOrderStatusNotificationDto>, res: Response) => {
  try {
    const { to, customerName, orderNumber, serviceName, status, useTemplate, templateName, languageCode } = req.body;

    if (!to || !customerName || !orderNumber || !serviceName || !status) {
      return res.status(400).json({
        success: false,
        message: 'Data pesanan tidak lengkap: to, customerName, orderNumber, serviceName, status wajib diisi.',
      });
    }

    const result = await sendOrderStatusNotification({
      to,
      customerName,
      orderNumber,
      serviceName,
      status,
      useTemplate,
      templateName,
      languageCode,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message,
      error: err.metaError || null,
    });
  }
});

router.post('/send-template', async (req: Request<{}, {}, SendWhatsAppTemplateDto>, res: Response) => {
  try {
    const { to, templateName, languageCode, parameters, components } = req.body;
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "to" wajib diisi.',
      });
    }

    const result = await sendTemplateMessage({
      to,
      templateName,
      languageCode,
      parameters,
      components,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message,
      error: err.metaError || null,
    });
  }
});

export default router;
