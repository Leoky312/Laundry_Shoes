/**
 * TypeScript Interfaces untuk WhatsApp Cloud API (Meta) & ShoeFresh Backend
 * Sesuai dokumentasi resmi Meta Graph API:
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */

/**
 * Status pesanan standar ShoeFresh
 */
export type ShoeFreshOrderStatus =
  | 'MENUNGGU'
  | 'DIPROSES'
  | 'DICUCI'
  | 'DRYING'
  | 'FINISHING'
  | 'SELESAI'
  | 'DIBATALKAN'
  | string;

/**
 * Konfigurasi kredensial WhatsApp Cloud API
 */
export interface WhatsAppConfig {
  apiUrl: string;
  apiVersion: string;
  phoneNumberId: string;
  accessToken: string;
  businessAccountId?: string;
  defaultTemplateName?: string;
}

// ============================================================================
// META WHATSAPP CLOUD API - REQUEST PAYLOADS
// ============================================================================

/**
 * Payload untuk pesan teks biasa (digunakan dalam customer service window 24 jam)
 */
export interface WhatsAppTextMessagePayload {
  messaging_product: 'whatsapp';
  recipient_type?: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

/**
 * Parameter dinamis pada komponen template Meta
 */
export interface WhatsAppTemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  [key: string]: any;
}

/**
 * Komponen template (header, body, buttons)
 */
export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button';
  sub_type?: 'quick_reply' | 'url';
  index?: string | number;
  parameters: WhatsAppTemplateParameter[];
}

/**
 * Payload untuk pesan template Meta (digunakan di luar window 24 jam)
 */
export interface WhatsAppTemplatePayload {
  messaging_product: 'whatsapp';
  recipient_type?: 'individual';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string; // contoh: "id" atau "en_US"
    };
    components?: WhatsAppTemplateComponent[];
  };
}

/**
 * Gabungan seluruh tipe payload pesan WhatsApp Cloud API
 */
export type WhatsAppMessagePayload =
  | WhatsAppTextMessagePayload
  | WhatsAppTemplatePayload;

// ============================================================================
// META WHATSAPP CLOUD API - RESPONSE SCHEMAS
// ============================================================================

export interface WhatsAppContact {
  input: string;
  wa_id: string;
}

export interface WhatsAppMessageIdItem {
  id: string; // contoh: "wamid.HBgLM..."
  message_status?: 'accepted' | 'held_for_quality_assessment';
}

/**
 * Respons sukses dari Meta Graph API (HTTP 200)
 */
export interface WhatsAppSuccessResponse {
  messaging_product: 'whatsapp';
  contacts: WhatsAppContact[];
  messages: WhatsAppMessageIdItem[];
}

/**
 * Detail objek error dari Meta Graph API
 */
export interface WhatsAppApiErrorDetail {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  error_user_title?: string;
  error_user_msg?: string;
  fbtrace_id?: string;
  error_data?: {
    messaging_product?: string;
    details?: string;
  };
}

/**
 * Respons gagal dari Meta Graph API (HTTP 4xx / 5xx)
 */
export interface WhatsAppErrorResponse {
  error: WhatsAppApiErrorDetail;
}

// ============================================================================
// BACKEND SHOEFRESH DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Body request untuk endpoint: POST /api/whatsapp/send
 */
export interface SendWhatsAppTextDto {
  to: string;
  message: string;
  previewUrl?: boolean;
}

/**
 * Body request untuk endpoint: POST /api/whatsapp/send-template
 */
export interface SendWhatsAppTemplateDto {
  to: string;
  templateName?: string;
  languageCode?: string;
  parameters?: string[];
  components?: WhatsAppTemplateComponent[];
}

/**
 * Parameter untuk pengiriman notifikasi status pesanan ShoeFresh
 * Endpoint: POST /api/whatsapp/send-order-status
 */
export interface SendOrderStatusNotificationDto {
  to: string;
  customerName: string;
  orderNumber: string;
  serviceName: string;
  status: ShoeFreshOrderStatus;
  notes?: string;
  /**
   * Set true jika pesan dikirim di luar jendela 24 jam customer service
   * sehingga menggunakan template Meta yang disetujui.
   */
  useTemplate?: boolean;
  templateName?: string;
  languageCode?: string;
}

/**
 * Struktur respons standar REST API Backend ShoeFresh
 */
export interface BackendApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | WhatsAppApiErrorDetail | any;
  isSimulated?: boolean;
}
