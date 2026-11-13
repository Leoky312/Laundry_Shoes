/**
 * ==============================================================================
 * SHOEFRESH BACKEND - WHATSAPP CLOUD API SERVICE
 * ==============================================================================
 * Layanan resmi untuk integrasi dengan WhatsApp Cloud API dari Meta.
 * Menggunakan native fetch() dengan metode POST dan header Authorization.
 *
 * Dokumentasi Meta Graph API:
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 * ==============================================================================
 */

// Load environment variables (.env) dengan fallback native Node.js
try {
  require('dotenv').config();
} catch (e) {
  if (typeof process.loadEnvFile === 'function') {
    const fs = require('fs');
    const path = require('path');
    const backendEnv = path.resolve(__dirname, '../../.env');
    const localEnv = path.resolve(__dirname, '../.env');
    if (fs.existsSync(backendEnv)) {
      process.loadEnvFile(backendEnv);
    } else if (fs.existsSync(localEnv)) {
      process.loadEnvFile(localEnv);
    }
  }
}

/**
 * Membaca konfigurasi dari environment variables (.env)
 */
const getWhatsAppConfig = () => {
  return {
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com',
    apiVersion: process.env.META_API_VERSION || 'v21.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'shoefresh_order_status_update',
    defaultLanguage: process.env.WHATSAPP_DEFAULT_LANGUAGE || 'id',
    simulationMode: process.env.WHATSAPP_SIMULATION_MODE === 'true',
  };
};

/**
 * Mengecek apakah kredensial masih berupa placeholder
 */
const isPlaceholderCredential = (value) => {
  if (!value) return true;
  const upper = String(value).toUpperCase();
  return (
    upper.includes('YOUR_') ||
    upper === 'YOUR_PHONE_NUMBER_ID' ||
    upper === 'YOUR_META_PERMANENT_OR_TEMPORARY_ACCESS_TOKEN' ||
    upper === 'YOUR_WHATSAPP_BUSINESS_ACCOUNT_ID'
  );
};

/**
 * Menormalkan nomor telepon ke format E.164 (tanpa simbol '+')
 * Contoh:
 *   "081234567890"   -> "6281234567890"
 *   "+6281234567890" -> "6281234567890"
 *   "0812-3456-7890" -> "6281234567890"
 *
 * @param {string} phone
 * @returns {string}
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) {
    throw new Error('Nomor telepon WhatsApp tidak boleh kosong.');
  }

  // Hapus semua karakter non-digit
  let cleaned = String(phone).replace(/[^0-9]/g, '');

  // Jika berawalan '0', ganti dengan kode negara Indonesia '62'
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  // Validasi panjang nomor telepon standar (10 - 16 digit)
  if (cleaned.length < 9 || cleaned.length > 16) {
    throw new Error(`Nomor telepon tidak valid: "${phone}". Panjang harus antara 10 - 16 digit.`);
  }

  return cleaned;
};

/**
 * Memformat status pesanan agar enak dibaca dalam kalimat notifikasi
 * @param {string} status
 */
const formatStatusDisplay = (status) => {
  const map = {
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
    label: status || 'Diproses',
    inSentence: `berstatus ${status || 'diproses'}`,
  };
};

/**
 * Format pesan notifikasi status pesanan ShoeFresh sesuai spesifikasi:
 *
 * Halo, Kak Andi!
 * Pesanan laundry sepatu kamu di ShoeFresh sekarang sedang diproses.
 *
 * Detail pesanan:
 * • Nomor pesanan: SF001
 * • Layanan: Deep Cleaning
 * • Status: Diproses
 *
 * Terima kasih telah menggunakan ShoeFresh!
 *
 * @param {object} params
 * @returns {string}
 */
const formatOrderStatusMessage = ({ customerName, orderNumber, serviceName, status }) => {
  const name = customerName || 'Pelanggan';
  const orderNo = orderNumber || 'SF001';
  const service = serviceName || 'Laundry Sepatu';
  const statusInfo = formatStatusDisplay(status);

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

/**
 * Menerjemahkan kode error Meta Graph API ke pesan ramah bahasa Indonesia
 * @param {object} errorObj
 * @returns {string}
 */
const getFriendlyMetaErrorMessage = (errorObj) => {
  const code = errorObj?.code;
  const subcode = errorObj?.error_subcode;
  const rawMsg = errorObj?.message || 'Terjadi kesalahan dari Meta Graph API';

  switch (code) {
    case 190:
      return 'Token Akses Meta (WHATSAPP_ACCESS_TOKEN) sudah kedaluwarsa atau tidak valid. Silakan perbarui token di file .env backend.';
    case 100:
      return `Parameter API tidak valid: ${rawMsg}. Periksa format nomor telepon atau struktur template.`;
    case 131030:
      return 'Nomor penerima tidak terdaftar / tidak dapat menerima pesan WhatsApp. Jika masih menggunakan mode Sandbox/Test Meta, pastikan nomor telah ditambahkan ke daftar "To" di Meta Developer Dashboard.';
    case 131047:
      return 'Jendela layanan pelanggan 24 jam telah berakhir. Anda harus mengirimkan notifikasi menggunakan Template WhatsApp resmi yang telah disetujui Meta (Gunakan useTemplate: true).';
    case 131026:
      return 'Pesan gagal dikirim oleh Meta (Message Undeliverable). Nomor tujuan mungkin tidak aktif atau diblokir.';
    case 132000:
    case 132001:
      return `Template WhatsApp "${errorObj?.error_data?.details || ''}" tidak ditemukan atau bahasa tidak cocok di WhatsApp Business Manager.`;
    case 133004:
      return 'Server Meta melaporkan kapasitas pengiriman WhatsApp Cloud API sedang penuh atau terlimit (Rate limit).';
    default:
      return `Error Meta API [Code ${code}${subcode ? '/' + subcode : ''}]: ${rawMsg}`;
  }
};

/**
 * Fungsi inti pengiriman pesan ke Meta WhatsApp Cloud API menggunakan native fetch().
 * Menggunakan metode POST dan header Authorization Bearer Token.
 *
 * @param {object} payload - Request payload (text atau template)
 * @returns {Promise<object>}
 */
const sendWhatsAppRequest = async (payload) => {
  const config = getWhatsAppConfig();

  // Validasi konfigurasi
  const isMock =
    config.simulationMode ||
    isPlaceholderCredential(config.accessToken) ||
    isPlaceholderCredential(config.phoneNumberId);

  // Jika kredensial masih placeholder atau simulationMode aktif, lakukan simulasi
  if (isMock) {
    const mockWamid = `wamid.HBgL${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    console.log('\n--------------------------------------------------------------');
    console.log('🧪 [SIMULASI WHATSAPP CLOUD API - META]');
    console.log(`📡 URL Target : ${config.apiUrl}/${config.apiVersion}/${config.phoneNumberId || 'PHONE_ID'}/messages`);
    console.log(`📲 Penerima   : ${payload.to}`);
    console.log(`📦 Tipe Pesan : ${payload.type}`);
    if (payload.type === 'text') {
      console.log(`💬 Isi Teks   :\n${payload.text.body}`);
    } else if (payload.type === 'template') {
      console.log(`📋 Template   : ${payload.template.name} (${payload.template.language.code})`);
      console.log(`⚙️ Parameter  :`, JSON.stringify(payload.template.components, null, 2));
    }
    console.log(`🆔 Mock WAMID : ${mockWamid}`);
    console.log('--------------------------------------------------------------\n');

    return {
      success: true,
      isSimulated: true,
      message: 'Pesan WhatsApp berhasil diproses (Mode Simulasi Demo / Placeholder Credential).',
      data: {
        messaging_product: 'whatsapp',
        contacts: [
          {
            input: payload.to,
            wa_id: payload.to,
          },
        ],
        messages: [
          {
            id: mockWamid,
            message_status: 'accepted',
          },
        ],
      },
    };
  }

  // URL resmi Meta WhatsApp Cloud API Messages Endpoint
  const url = `${config.apiUrl}/${config.apiVersion}/${config.phoneNumberId}/messages`;

  console.log(`[WhatsApp API] Mengirim pesan POST ke: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => ({}));

    // Penanganan respons GAGAL dari Meta API
    if (!response.ok) {
      const metaError = responseData?.error || {
        message: `HTTP ${response.status} ${response.statusText}`,
        code: response.status,
      };

      const friendlyMessage = getFriendlyMetaErrorMessage(metaError);
      console.error('[WhatsApp API Error]', friendlyMessage, metaError);

      const error = new Error(friendlyMessage);
      error.status = response.status;
      error.metaError = metaError;
      error.fbtrace_id = metaError.fbtrace_id;
      throw error;
    }

    // Penanganan respons BERHASIL dari Meta API
    console.log('[WhatsApp API Sukses]', responseData);
    return {
      success: true,
      isSimulated: false,
      message: 'Pesan WhatsApp resmi berhasil dikirim ke Meta Cloud API.',
      data: responseData,
    };
  } catch (err) {
    if (err.metaError) {
      throw err;
    }
    // Network / Fetch error
    console.error('[WhatsApp Network Error]', err.message);
    const networkError = new Error(`Gagal terhubung ke WhatsApp Cloud API: ${err.message}`);
    networkError.status = 502;
    throw networkError;
  }
};

/**
 * 1. Mengirim pesan teks biasa (Digunakan dalam customer service window 24 jam)
 *
 * @param {string} to - Nomor WhatsApp penerima
 * @param {string} body - Teks pesan
 * @param {boolean} [previewUrl=false]
 * @returns {Promise<object>}
 */
const sendTextMessage = async (to, body, previewUrl = false) => {
  if (!body || !String(body).trim()) {
    throw new Error('Isi pesan teks tidak boleh kosong.');
  }

  const normalizedPhone = normalizePhoneNumber(to);

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedPhone,
    type: 'text',
    text: {
      preview_url: Boolean(previewUrl),
      body: String(body).trim(),
    },
  };

  return await sendWhatsAppRequest(payload);
};

/**
 * 2. Mengirim pesan template Meta yang telah disetujui
 * Digunakan jika pengiriman di luar customer service window 24 jam (sesuai aturan resmi Meta).
 *
 * @param {object} options
 * @param {string} options.to - Nomor WhatsApp penerima
 * @param {string} [options.templateName] - Nama template (default dari .env atau 'shoefresh_order_status_update')
 * @param {string} [options.languageCode] - Kode bahasa (default: 'id')
 * @param {Array<string>} [options.parameters] - Daftar teks parameter {{1}}, {{2}}, dsb.
 * @param {Array<object>} [options.components] - Komponen kustom (opsional)
 * @returns {Promise<object>}
 */
const sendTemplateMessage = async ({
  to,
  templateName,
  languageCode,
  parameters = [],
  components = null,
}) => {
  const config = getWhatsAppConfig();
  const normalizedPhone = normalizePhoneNumber(to);
  const selectedTemplate = templateName || config.templateName || 'shoefresh_order_status_update';
  const selectedLang = languageCode || config.defaultLanguage || 'id';

  let templateComponents = components;

  // Jika components tidak diberikan secara eksplisit, susun dari parameters
  if (!templateComponents && selectedTemplate !== 'hello_world') {
    if (Array.isArray(parameters) && parameters.length > 0) {
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
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedPhone,
    type: 'template',
    template: {
      name: selectedTemplate,
      language: {
        code: selectedLang,
      },
    },
  };

  if (templateComponents && templateComponents.length > 0) {
    payload.template.components = templateComponents;
  }

  return await sendWhatsAppRequest(payload);
};

/**
 * 3. Fungsi utama notifikasi status pesanan ShoeFresh
 * Secara otomatis memformat isi pesan dan mendukung mode teks maupun template resmi Meta.
 *
 * @param {object} params
 * @param {string} params.to - Nomor WhatsApp pelanggan
 * @param {string} params.customerName - Nama pelanggan
 * @param {string} params.orderNumber - Nomor pesanan (misal: "SF001")
 * @param {string} params.serviceName - Nama layanan (misal: "Deep Cleaning")
 * @param {string} params.status - Status baru pesanan (misal: "Diproses")
 * @param {boolean} [params.useTemplate=false] - Gunakan template jika di luar 24h window
 * @param {string} [params.templateName] - Nama template kustom jika useTemplate=true
 * @returns {Promise<object>}
 */
const sendOrderStatusNotification = async ({
  to,
  customerName,
  orderNumber,
  serviceName,
  status,
  useTemplate = false,
  templateName,
  languageCode,
}) => {
  const statusInfo = formatStatusDisplay(status);
  const name = customerName || 'Pelanggan';
  const orderNo = orderNumber || 'SF001';
  const service = serviceName || 'Laundry Sepatu';

  // Mode 1: Di luar window 24 jam -> Gunakan template pesan resmi Meta yang telah disetujui
  if (useTemplate) {
    const parameters = [name, orderNo, service, statusInfo.label];
    return await sendTemplateMessage({
      to,
      templateName,
      languageCode,
      parameters,
    });
  }

  // Mode 2: Dalam window 24 jam -> Kirim pesan teks dengan format lengkap ShoeFresh
  const messageText = formatOrderStatusMessage({
    customerName: name,
    orderNumber: orderNo,
    serviceName: service,
    status: statusInfo.label,
  });

  return await sendTextMessage(to, messageText);
};

/**
 * 4. Mendapatkan status konfigurasi Meta WhatsApp Cloud API di backend
 */
const getWhatsAppConfigStatus = () => {
  const config = getWhatsAppConfig();
  const hasPhoneId = Boolean(config.phoneNumberId) && !isPlaceholderCredential(config.phoneNumberId);
  const hasToken = Boolean(config.accessToken) && !isPlaceholderCredential(config.accessToken);

  return {
    isConfigured: hasPhoneId && hasToken,
    simulationMode: config.simulationMode || !hasPhoneId || !hasToken,
    apiVersion: config.apiVersion,
    apiUrl: config.apiUrl,
    phoneNumberIdMasked: config.phoneNumberId
      ? `${config.phoneNumberId.slice(0, 4)}****${config.phoneNumberId.slice(-4)}`
      : 'BELUM_DIATUR',
    defaultTemplate: config.templateName,
    defaultLanguage: config.defaultLanguage,
  };
};

module.exports = {
  getWhatsAppConfig,
  normalizePhoneNumber,
  formatStatusDisplay,
  formatOrderStatusMessage,
  sendWhatsAppRequest,
  sendTextMessage,
  sendTemplateMessage,
  sendOrderStatusNotification,
  getWhatsAppConfigStatus,
};
