/**
 * ==============================================================================
 * SHOEFRESH BACKEND - WHATSAPP CLOUD API SERVICE (TypeScript Version)
 * ==============================================================================
 */

import {
  WhatsAppConfig,
  WhatsAppTextMessagePayload,
  WhatsAppTemplatePayload,
  WhatsAppMessagePayload,
  WhatsAppSuccessResponse,
  WhatsAppErrorResponse,
  SendOrderStatusNotificationDto,
  BackendApiResponse,
  ShoeFreshOrderStatus,
  WhatsAppTemplateComponent,
} from '../types/whatsapp';

export const getWhatsAppConfig = (): WhatsAppConfig => {
  return {
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com',
    apiVersion: process.env.META_API_VERSION || 'v21.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    defaultTemplateName: process.env.WHATSAPP_TEMPLATE_NAME || 'shoefresh_order_status_update',
  };
};

export const isPlaceholderCredential = (value?: string): boolean => {
  if (!value) return true;
  const upper = value.toUpperCase();
  return (
    upper.includes('YOUR_') ||
    upper === 'YOUR_PHONE_NUMBER_ID' ||
    upper === 'YOUR_META_PERMANENT_OR_TEMPORARY_ACCESS_TOKEN' ||
    upper === 'YOUR_WHATSAPP_BUSINESS_ACCOUNT_ID'
  );
};

export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) {
    throw new Error('Nomor telepon WhatsApp tidak boleh kosong.');
  }

  let cleaned = String(phone).replace(/[^0-9]/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  if (cleaned.length < 9 || cleaned.length > 16) {
    throw new Error(`Nomor telepon tidak valid: "${phone}". Panjang harus antara 10 - 16 digit.`);
  }

  return cleaned;
};

export const formatStatusDisplay = (status: ShoeFreshOrderStatus): { label: string; inSentence: string } => {
  const map: Record<string, { label: string; inSentence: string }> = {
    MENUNGGU: { label: 'Menunggu', inSentence: 'menunggu konfirmasi' },
    DIPROSES: { label: 'Diproses', inSentence: 'sedang diproses' },
    DICUCI: { label: 'Dicuci', inSentence: 'sedang dalam proses pencucian' },
    DRYING: { label: 'Drying', inSentence: 'sedang dalam proses pengeringan' },
    FINISHING: { label: 'Finishing', inSentence: 'dalam tahap finishing dan pengecekan' },
    SELESAI: { label: 'Selesai', inSentence: 'telah selesai dan siap diambil/diantar' },
    DIBATALKAN: { label: 'Dibatalkan', inSentence: 'telah dibatalkan' },
  };

  const upper = String(status || '').toUpperCase();
  if (map[upper]) return map[upper];

  return {
    label: String(status || 'Diproses'),
    inSentence: `berstatus ${status || 'diproses'}`,
  };
};

export const formatOrderStatusMessage = ({
  customerName,
  orderNumber,
  serviceName,
  status,
}: {
  customerName?: string;
  orderNumber?: string;
  serviceName?: string;
  status?: ShoeFreshOrderStatus;
}): string => {
  const name = customerName || 'Pelanggan';
  const orderNo = orderNumber || 'SF001';
  const service = serviceName || 'Laundry Sepatu';
  const statusInfo = formatStatusDisplay(status || 'DIPROSES');

  return (
    `Halo, Kak ${name}!\n` +
    `Pesanan laundry sepatu kamu di ShoeFresh sekarang sedang ${statusInfo.label.toLowerCase()}.\n\n` +
    `Detail pesanan:\n` +
    `• Nomor pesanan: ${orderNo}\n` +
    `• Layanan: ${service}\n` +
    `• Status: ${statusInfo.label}\n\n` +
    `Terima kasih telah menggunakan ShoeFresh!`
  );
};

export const sendWhatsAppRequest = async (
  payload: WhatsAppMessagePayload
): Promise<BackendApiResponse<WhatsAppSuccessResponse>> => {
  const config = getWhatsAppConfig();
  const simulationMode =
    process.env.WHATSAPP_SIMULATION_MODE === 'true' ||
    isPlaceholderCredential(config.accessToken) ||
    isPlaceholderCredential(config.phoneNumberId);

  if (simulationMode) {
    const mockWamid = `wamid.HBgL${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    console.log('[Simulasi WhatsApp Cloud API]', payload);

    return {
      success: true,
      isSimulated: true,
      message: 'Pesan WhatsApp berhasil diproses (Mode Simulasi Demo / Placeholder Credential).',
      data: {
        messaging_product: 'whatsapp',
        contacts: [{ input: payload.to, wa_id: payload.to }],
        messages: [{ id: mockWamid, message_status: 'accepted' }],
      },
    };
  }

  const url = `${config.apiUrl}/${config.apiVersion}/${config.phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseData = (await response.json().catch(() => ({}))) as WhatsAppSuccessResponse & WhatsAppErrorResponse;

  if (!response.ok) {
    const metaError = responseData?.error || {
      message: `HTTP ${response.status} ${response.statusText}`,
      code: response.status,
      type: 'OAuthException',
    };
    const err: any = new Error(metaError.message);
    err.status = response.status;
    err.metaError = metaError;
    throw err;
  }

  return {
    success: true,
    isSimulated: false,
    message: 'Pesan WhatsApp resmi berhasil dikirim ke Meta Cloud API.',
    data: responseData,
  };
};

export const sendTextMessage = async (
  to: string,
  body: string,
  previewUrl = false
): Promise<BackendApiResponse<WhatsAppSuccessResponse>> => {
  const normalizedPhone = normalizePhoneNumber(to);
  const payload: WhatsAppTextMessagePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedPhone,
    type: 'text',
    text: {
      preview_url: previewUrl,
      body: String(body).trim(),
    },
  };

  return await sendWhatsAppRequest(payload);
};

export const sendTemplateMessage = async ({
  to,
  templateName,
  languageCode = 'id',
  parameters = [],
  components,
}: {
  to: string;
  templateName?: string;
  languageCode?: string;
  parameters?: string[];
  components?: WhatsAppTemplateComponent[];
}): Promise<BackendApiResponse<WhatsAppSuccessResponse>> => {
  const config = getWhatsAppConfig();
  const normalizedPhone = normalizePhoneNumber(to);
  const selectedTemplate = templateName || config.defaultTemplateName || 'shoefresh_order_status_update';

  let templateComponents = components;
  if (!templateComponents && selectedTemplate !== 'hello_world' && parameters.length > 0) {
    templateComponents = [
      {
        type: 'body',
        parameters: parameters.map((param) => ({
          type: 'text',
          text: String(param),
        })),
      },
    ];
  }

  const payload: WhatsAppTemplatePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedPhone,
    type: 'template',
    template: {
      name: selectedTemplate,
      language: {
        code: languageCode,
      },
    },
  };

  if (templateComponents && templateComponents.length > 0) {
    payload.template.components = templateComponents;
  }

  return await sendWhatsAppRequest(payload);
};

export const sendOrderStatusNotification = async (
  params: SendOrderStatusNotificationDto
): Promise<BackendApiResponse<WhatsAppSuccessResponse>> => {
  const { to, customerName, orderNumber, serviceName, status, useTemplate, templateName, languageCode } = params;
  const statusInfo = formatStatusDisplay(status);

  if (useTemplate) {
    return await sendTemplateMessage({
      to,
      templateName,
      languageCode: languageCode || 'id',
      parameters: [customerName || 'Pelanggan', orderNumber || 'SF001', serviceName || 'Laundry Sepatu', statusInfo.label],
    });
  }

  const messageText = formatOrderStatusMessage({
    customerName,
    orderNumber,
    serviceName,
    status,
  });

  return await sendTextMessage(to, messageText);
};
