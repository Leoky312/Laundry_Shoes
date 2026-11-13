/**
 * ==============================================================================
 * SHOEFRESH MOBILE APP - WHATSAPP TYPES & INTERFACES (MODUL 3)
 * ==============================================================================
 * Penerapan Materi Modul 3:
 * "Mengambil data dari External API dan memasukkannya ke dalam Object menggunakan Interface"
 *
 * File ini mendefinisikan struktur data / interface untuk:
 * 1. Permintaan (Request) notifikasi WhatsApp.
 * 2. Respons (Response) dari WhatsApp Cloud API via Backend ShoeFresh.
 * 3. State notifikasi pada UI (loading, success, error).
 * ==============================================================================
 */

// Ekspor semua tipe dasar dari backend Anggota 1
export * from '../../backend/src/types/whatsapp';

import {
  ShoeFreshOrderStatus,
  WhatsAppSuccessResponse,
  WhatsAppApiErrorDetail,
} from '../../backend/src/types/whatsapp';

/**
 * Interface data permintaan pengiriman pesan teks bebas
 * Digunakan pada fungsi kirimNotifikasiWhatsApp(nomor, pesan)
 */
export interface WhatsAppNotificationRequest {
  nomor: string;
  pesan: string;
}

/**
 * Interface data permintaan notifikasi status pesanan resmi ShoeFresh
 * Mengikuti format yang dibutuhkan endpoint POST /api/whatsapp/send-order-status
 */
export interface WhatsAppOrderStatusNotificationRequest {
  to: string;
  customerName: string;
  orderNumber: string;
  serviceName: string;
  status: ShoeFreshOrderStatus;
  notes?: string;
  useTemplate?: boolean;
  templateName?: string;
  languageCode?: string;
}

/**
 * Interface hasil akhir notifikasi yang dikembalikan oleh Promise (resolve / reject)
 * Memetakan respons JSON dari API ke dalam Object bertipe spesifik (Modul 3 Kriteria Penilaian)
 */
export interface WhatsAppNotificationResult {
  success: boolean;
  isSimulated?: boolean;
  message: string;
  targetPhone: string;
  orderNumber?: string;
  messageId?: string;
  timestamp: string;
  rawResponse?: WhatsAppSuccessResponse;
  errorDetail?: string | WhatsAppApiErrorDetail;
}

/**
 * Interface untuk pengelolaan state komponen Notifikasi di sisi UI (React Component)
 */
export interface WhatsAppNotificationState {
  isLoading: boolean;
  isSuccess: boolean | null;
  statusMessage: string;
  resultData: WhatsAppNotificationResult | null;
  error: Error | null;
}

/**
 * Interface Props untuk komponen WhatsAppNotification.tsx
 */
export interface WhatsAppNotificationProps {
  visible: boolean;
  order: any;
  onClose: () => void;
  onSuccess?: (result: WhatsAppNotificationResult) => void;
  onError?: (error: Error) => void;
}
