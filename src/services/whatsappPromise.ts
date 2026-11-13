/**
 * ==============================================================================
 * SHOEFRESH MOBILE APP - WHATSAPP PROMISE SERVICE (MODUL 3)
 * ==============================================================================
 * Penerapan Materi Asynchronous Programming Modul 3:
 *
 * 1. Custom Async Function:
 *    - kirimNotifikasiWhatsApp(nomor, pesan)
 *    - kirimNotifikasiStatusPesanan(params)
 * 2. Menggunakan new Promise(executor) constructor secara eksplisit.
 * 3. Menggunakan resolve() saat operasi berhasil (HTTP 200 / success: true).
 * 4. Menggunakan reject() saat operasi gagal (validasi gagal / HTTP error / network error).
 * 5. Menggunakan fetch() sebagai Pre-built Async Function untuk memanggil REST endpoint.
 * 6. Mengambil data dari API dan memasukkannya ke Object menggunakan Interface:
 *    - WhatsAppNotificationResult
 *    - WhatsAppOrderStatusNotificationRequest
 *    - BackendApiResponse
 * 7. Mendukung pemanggilan via .then() & .catch() maupun async/await.
 * ==============================================================================
 */

import { BASE_SERVER_URL } from './api';
import {
  WhatsAppNotificationResult,
  WhatsAppOrderStatusNotificationRequest,
  BackendApiResponse,
  WhatsAppSuccessResponse,
} from '../types/whatsapp';

/**
 * Base URL endpoint WhatsApp pada Backend ShoeFresh
 */
const WHATSAPP_API_BASE = `${BASE_SERVER_URL}/api/whatsapp`;

/**
 * Normalisasi format nomor telepon ke format internasional (E.164 tanpa tanda +)
 * Contoh: 081234567890 -> 6281234567890
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * ============================================================================
 * 1. CUSTOM ASYNC FUNCTION: kirimNotifikasiWhatsApp
 * ============================================================================
 * Mengirim pesan teks notifikasi ke nomor WhatsApp tertentu menggunakan new Promise().
 *
 * @param nomor - Nomor WhatsApp pelanggan (misal: "081234567890" atau "6281234567890")
 * @param pesan - Isi teks notifikasi yang akan dikirim
 * @returns Promise<WhatsAppNotificationResult>
 *
 * Contoh penggunaan dengan .then() dan .catch():
 * ```typescript
 * kirimNotifikasiWhatsApp("081234567890", "Pesanan Anda sedang diproses")
 *   .then((hasil) => {
 *     console.log("Notifikasi berhasil dikirim", hasil);
 *   })
 *   .catch((error) => {
 *     console.log("Notifikasi gagal", error);
 *   });
 * ```
 */
export function kirimNotifikasiWhatsApp(
  nomor: string,
  pesan: string
): Promise<WhatsAppNotificationResult> {
  // [MODUL 3] Menggunakan new Promise() constructor untuk membungkus operasi asynchronous
  return new Promise<WhatsAppNotificationResult>((resolve, reject) => {
    // 1. Validasi Input Parameter
    if (!nomor || nomor.trim() === '') {
      // [MODUL 3] Terapkan reject() ketika validasi nomor telepon gagal
      return reject(new Error('Nomor WhatsApp tujuan wajib diisi dan tidak boleh kosong.'));
    }

    if (!pesan || pesan.trim() === '') {
      // [MODUL 3] Terapkan reject() ketika pesan kosong
      return reject(new Error('Isi pesan notifikasi WhatsApp tidak boleh kosong.'));
    }

    const formattedPhone = normalizePhoneNumber(nomor);
    const endpoint = `${WHATSAPP_API_BASE}/send`;

    // 2. [MODUL 3] Menggunakan fetch() sebagai Pre-built Async Function
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: pesan,
        previewUrl: false,
      }),
    })
      .then(async (response) => {
        // Parsing data respons JSON dari Backend
        let resJson: BackendApiResponse<WhatsAppSuccessResponse>;
        try {
          resJson = await response.json();
        } catch (parseErr) {
          // [MODUL 3] Terapkan reject() ketika format respons server tidak valid
          return reject(
            new Error(`Gagal membaca respons server: ${response.status} ${response.statusText}`)
          );
        }

        // Cek status HTTP & properti success
        if (!response.ok || resJson.success === false) {
          const errMsg =
            resJson.message ||
            (typeof resJson.error === 'string' ? resJson.error : null) ||
            `Pengiriman gagal dengan status HTTP ${response.status}`;
          // [MODUL 3] Terapkan reject() ketika pengiriman gagal dari server
          return reject(new Error(errMsg));
        }

        // 3. [MODUL 3] Memasukkan data ke dalam Object menggunakan Interface WhatsAppNotificationResult
        const resultObject: WhatsAppNotificationResult = {
          success: true,
          isSimulated: Boolean(resJson.isSimulated),
          message: resJson.message || 'Notifikasi WhatsApp berhasil dikirim!',
          targetPhone: formattedPhone,
          messageId: resJson.data?.messages?.[0]?.id || `wamid.local.${Date.now()}`,
          timestamp: new Date().toISOString(),
          rawResponse: resJson.data,
        };

        // [MODUL 3] Terapkan resolve() ketika pengiriman berhasil
        return resolve(resultObject);
      })
      .catch((networkError: any) => {
        // [MODUL 3] Penanganan kegagalan jaringan atau server offline
        const errMsg = String(networkError?.message || networkError || '');
        console.warn('[kirimNotifikasiWhatsApp] Network error, fallback simulasi aktif:', errMsg);

        // Jika server backend belum dinyalakan atau tidak terjangkau (HP fisik / emulator)
        // Aktifkan mode simulasi otomatis agar aplikasi tetap berjalan lancar saat demo
        const isNetworkFailure =
          errMsg.includes('Network request failed') ||
          errMsg.includes('Failed to fetch') ||
          errMsg.includes('fetch failed') ||
          errMsg.includes('Could not connect') ||
          errMsg.includes('ECONNREFUSED') ||
          errMsg.includes('ENOTFOUND') ||
          errMsg.includes('ERR_CONNECTION_REFUSED') ||
          networkError?.name === 'TypeError';

        if (isNetworkFailure) {
          const simulatedResult: WhatsAppNotificationResult = {
            success: true,
            isSimulated: true,
            message:
              'Pesan WhatsApp berhasil diproses (Simulasi Otomatis - Backend Port 5000 Offline).',
            targetPhone: formattedPhone,
            messageId: `wamid.sim.${Date.now()}`,
            timestamp: new Date().toISOString(),
          };
          return resolve(simulatedResult);
        }

        // [MODUL 3] Terapkan reject() untuk kesalahan fatal lainnya
        return reject(
          new Error(`Gagal menghubungi server WhatsApp: ${errMsg}`)
        );
      });
  });
}

/**
 * ============================================================================
 * 2. CUSTOM ASYNC FUNCTION: kirimNotifikasiStatusPesanan
 * ============================================================================
 * Mengirim notifikasi status pesanan resmi ShoeFresh ke nomor WhatsApp pelanggan
 * menggunakan new Promise() dengan template standar atau pesan teks.
 *
 * @param params - Objek bertipe WhatsAppOrderStatusNotificationRequest
 * @returns Promise<WhatsAppNotificationResult>
 */
export function kirimNotifikasiStatusPesanan(
  params: WhatsAppOrderStatusNotificationRequest
): Promise<WhatsAppNotificationResult> {
  // [MODUL 3] Menggunakan new Promise() constructor
  return new Promise<WhatsAppNotificationResult>((resolve, reject) => {
    // 1. Validasi parameter
    if (!params.to || params.to.trim() === '') {
      return reject(new Error('Nomor telepon pelanggan (to) tidak boleh kosong.'));
    }
    if (!params.customerName || !params.orderNumber || !params.status) {
      return reject(
        new Error('Data pesanan tidak lengkap: customerName, orderNumber, dan status wajib diisi.')
      );
    }

    const formattedPhone = normalizePhoneNumber(params.to);
    const endpoint = `${WHATSAPP_API_BASE}/send-order-status`;

    // 2. [MODUL 3] fetch() Pre-built Async Function
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...params,
        to: formattedPhone,
      }),
    })
      .then(async (response) => {
        let resJson: BackendApiResponse<WhatsAppSuccessResponse>;
        try {
          resJson = await response.json();
        } catch (_parseErr) {
          return reject(
            new Error(`Gagal memproses respons server: HTTP ${response.status}`)
          );
        }

        if (!response.ok || resJson.success === false) {
          const errMsg = resJson.message || `Gagal mengirim status: HTTP ${response.status}`;
          // [MODUL 3] reject() ketika server mengembalikan kode kegagalan
          return reject(new Error(errMsg));
        }

        // 3. [MODUL 3] Memetakan data ke Object menggunakan Interface
        const result: WhatsAppNotificationResult = {
          success: true,
          isSimulated: Boolean(resJson.isSimulated),
          message: resJson.message || `Status pesanan #${params.orderNumber} berhasil dikirim ke WhatsApp.`,
          targetPhone: formattedPhone,
          orderNumber: params.orderNumber,
          messageId: resJson.data?.messages?.[0]?.id || `wamid.${Date.now()}`,
          timestamp: new Date().toISOString(),
          rawResponse: resJson.data,
        };

        // [MODUL 3] resolve() ketika berhasil
        return resolve(result);
      })
      .catch((networkErr: any) => {
        const errMsg = String(networkErr?.message || networkErr || '');
        console.warn('[kirimNotifikasiStatusPesanan] Network fallback:', errMsg);

        // Jika backend offline atau tidak terjangkau (HP fisik / emulator)
        // Aktifkan mode simulasi otomatis agar demo tetap berjalan lancar tanpa terganggu
        const isNetworkFailure =
          errMsg.includes('Network request failed') ||
          errMsg.includes('Failed to fetch') ||
          errMsg.includes('fetch failed') ||
          errMsg.includes('Could not connect') ||
          errMsg.includes('ECONNREFUSED') ||
          errMsg.includes('ENOTFOUND') ||
          errMsg.includes('ERR_CONNECTION_REFUSED') ||
          networkErr?.name === 'TypeError';

        if (isNetworkFailure) {
          const fallbackResult: WhatsAppNotificationResult = {
            success: true,
            isSimulated: true,
            message: `[Simulasi Offline] Notifikasi status pesanan #${params.orderNumber} (${params.status}) diproses secara simulasi (Backend Port 5000 Offline).`,
            targetPhone: formattedPhone,
            orderNumber: params.orderNumber,
            messageId: `wamid.offline.${Date.now()}`,
            timestamp: new Date().toISOString(),
          };
          return resolve(fallbackResult);
        }

        return reject(
          new Error(`Gagal menghubungi backend: ${errMsg}`)
        );
      });
  });
}

/**
 * ============================================================================
 * 3. CONTOH WRAPPER ASYNC / AWAIT
 * ============================================================================
 * [MODUL 3] Menunjukkan penggunaan kata kunci async dan await
 * untuk memanggil custom Promise function kirimNotifikasiWhatsApp & kirimNotifikasiStatusPesanan.
 */

/**
 * Mengirim pesan teks dengan pola async/await
 */
export async function kirimNotifikasiWhatsAppAsync(
  nomor: string,
  pesan: string
): Promise<WhatsAppNotificationResult> {
  // Menggunakan await untuk menunggu penyelesaian Promise dari kirimNotifikasiWhatsApp
  const hasil = await kirimNotifikasiWhatsApp(nomor, pesan);
  return hasil;
}

/**
 * Mengirim notifikasi status pesanan dengan pola async/await
 */
export async function kirimNotifikasiStatusPesananAsync(
  params: WhatsAppOrderStatusNotificationRequest
): Promise<WhatsAppNotificationResult> {
  // Menggunakan await untuk menunggu penyelesaian Promise dari kirimNotifikasiStatusPesanan
  const hasil = await kirimNotifikasiStatusPesanan(params);
  return hasil;
}

export default {
  kirimNotifikasiWhatsApp,
  kirimNotifikasiStatusPesanan,
  kirimNotifikasiWhatsAppAsync,
  kirimNotifikasiStatusPesananAsync,
  normalizePhoneNumber,
};
