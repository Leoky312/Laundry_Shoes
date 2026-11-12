/**
 * ==============================================================================
 * SHOEFRESH MOBILE APP - WHATSAPP NOTIFICATION SERVICE
 * ==============================================================================
 * Service sisi React Native / Expo untuk berinteraksi dengan Backend
 * WhatsApp Cloud API.
 *
 * PENTING:
 * Token dan kredensial Meta TIDAK PERNAH disimpan di sisi mobile client.
 * Seluruh pengiriman diproses melalui server backend ShoeFresh.
 * ==============================================================================
 */

import { BASE_SERVER_URL } from './api';
import {
  SendOrderStatusNotificationDto,
  SendWhatsAppTextDto,
  BackendApiResponse,
  WhatsAppSuccessResponse,
} from '../types/whatsapp';

const WHATSAPP_API_BASE = `${BASE_SERVER_URL}/api/whatsapp`;

export const whatsappService = {
  /**
   * Cek status koneksi dan konfigurasi WhatsApp Cloud API pada server backend
   */
  async checkStatus(): Promise<BackendApiResponse> {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      // Mengambil data dari API dan memasukkannya ke Object menggunakan Interface BackendApiResponse
      const data: BackendApiResponse = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: 'Backend server tidak dapat dihubungi: ' + err.message,
      };
    }
  },

  /**
   * Mengirim notifikasi perubahan status pesanan ke nomor WhatsApp pelanggan
   *
   * @param params { to, customerName, orderNumber, serviceName, status, useTemplate }
   */
  async sendOrderStatusNotification(
    params: SendOrderStatusNotificationDto
  ): Promise<BackendApiResponse<WhatsAppSuccessResponse>> {
    try {
      // 1. Mencoba menghubungi API backend ShoeFresh di port 5000
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;

      const response = await fetch(`${WHATSAPP_API_BASE}/send-order-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller ? controller.signal : undefined,
      });

      if (timeoutId) clearTimeout(timeoutId);

      // 2. Memasukkan hasil respons JSON ke dalam Object menggunakan Interface BackendApiResponse<WhatsAppSuccessResponse>
      const data: BackendApiResponse<WhatsAppSuccessResponse> = await response.json();
      return data;
    } catch (err: any) {
      console.warn(
        '[WhatsApp Service] Server backend port 5000 offline / tidak terjangkau (' +
          err.message +
          '). Mengaktifkan mode simulasi Meta Cloud API otomatis...'
      );

      // Fallback Simulasi Otomatis agar aplikasi tetap lancar diuji coba meskipun backend belum dinyalakan
      const mockWamid = `wamid.HBgL${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
      return {
        success: true,
        isSimulated: true,
        message:
          'Pesan WhatsApp berhasil diproses (Simulasi Meta Cloud API - Server Backend Offline).',
        data: {
          messaging_product: 'whatsapp',
          contacts: [{ input: params.to, wa_id: params.to }],
          messages: [{ id: mockWamid, message_status: 'accepted' }],
        },
      };
    }
  },

  /**
   * Kirim pesan teks manual via WhatsApp Cloud API
   */
  async sendMessage(
    params: SendWhatsAppTextDto
  ): Promise<BackendApiResponse<WhatsAppSuccessResponse>> {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;

      const response = await fetch(`${WHATSAPP_API_BASE}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller ? controller.signal : undefined,
      });

      if (timeoutId) clearTimeout(timeoutId);

      // Memasukkan hasil response ke dalam Object menggunakan Interface
      const data: BackendApiResponse<WhatsAppSuccessResponse> = await response.json();
      return data;
    } catch (err: any) {
      console.warn('[WhatsApp Service] Backend offline, fallback ke simulasi pesan teks.');
      const mockWamid = `wamid.HBgL${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
      return {
        success: true,
        isSimulated: true,
        message: 'Pesan teks berhasil disimulasikan (Backend Offline).',
        data: {
          messaging_product: 'whatsapp',
          contacts: [{ input: params.to, wa_id: params.to }],
          messages: [{ id: mockWamid, message_status: 'accepted' }],
        },
      };
    }
  },

  /**
   * Mendapatkan preview teks notifikasi status sebelum dikirim
   */
  async getPreviewMessage(params: {
    customerName: string;
    orderNumber: string;
    serviceName: string;
    status: string;
  }): Promise<{ success: boolean; previewText?: string; message?: string }> {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return {
        success: true,
        previewText: data?.data?.previewText,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message,
      };
    }
  },
};

export default whatsappService;
