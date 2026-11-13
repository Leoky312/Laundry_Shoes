/**
 * ==============================================================================
 * SHOEFRESH - WHATSAPP NOTIFICATION COMPONENT (MODUL 3)
 * ==============================================================================
 * Komponen Modal Dialog untuk mengirim notifikasi status pesanan pelanggan via
 * WhatsApp Cloud API Meta menggunakan Custom Promise & Asynchronous Function.
 *
 * Fitur:
 * 1. Menampilkan detail pesanan & nomor tujuan WhatsApp pelanggan.
 * 2. Preview teks pesan resmi ShoeFresh secara interaktif.
 * 3. Indikator Loading (ActivityIndicator) saat proses kirim asynchronous berlangsung.
 * 4. Pencegahan Pengiriman Ganda (Double-submit prevention via disabled state).
 * 5. Tampilan Pesan Status Berhasil (Success Banner) atau Gagal (Error Banner).
 * 6. Penerapan .then() dan .catch() secara eksplisit sesuai Modul 3.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Badge from './Badge';
import {
  WhatsAppNotificationProps,
  WhatsAppNotificationResult,
  WhatsAppOrderStatusNotificationRequest,
} from '../types/whatsapp';
import {
  kirimNotifikasiStatusPesanan,
  kirimNotifikasiWhatsApp,
  normalizePhoneNumber,
} from '../services/whatsappPromise';

export const WhatsAppNotification: React.FC<WhatsAppNotificationProps> = ({
  visible,
  order,
  onClose,
  onSuccess,
  onError,
}) => {
  // State untuk melacak proses asynchronous
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useTemplate, setUseTemplate] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [resultData, setResultData] = useState<WhatsAppNotificationResult | null>(null);

  // Reset state setiap kali modal dibuka / order berganti
  useEffect(() => {
    if (visible) {
      setIsLoading(false);
      setStatusMessage(null);
      setIsSuccess(null);
      setResultData(null);
    }
  }, [visible, order]);

  if (!order) return null;

  // Ekstraksi data pelanggan & pesanan
  const customerName =
    order?.user?.name || order?.customerName || 'Pelanggan ShoeFresh';
  const rawPhone =
    order?.user?.phone || order?.customerPhone || '081234567890';
  const customerPhone = normalizePhoneNumber(rawPhone);
  const customerAddress = order?.user?.address || order?.address || '';
  const orderNumber = order?.orderNumber || 'SF-000';
  const serviceName =
    order?.orderItems?.[0]?.service?.name || 'Deep Cleaning Treatment';
  const orderStatus = order?.status || 'DIPROSES';

  // Format pesan preview ShoeFresh
  const previewMessage =
    `Halo, Kak ${customerName}!\n` +
    `Pesanan laundry sepatu kamu di ShoeFresh sekarang sedang ${orderStatus.toLowerCase()}.\n\n` +
    `Detail pesanan:\n` +
    `• Nomor pesanan: ${orderNumber}\n` +
    `• Layanan: ${serviceName}\n` +
    `• Status: ${orderStatus}\n\n` +
    `Terima kasih telah mempercayakan sepatu Anda di ShoeFresh! 👟✨`;

  /**
   * [MODUL 3] HANDLER PENGIRIMAN NOTIFIKASI MENGGUNAKAN .then() DAN .catch()
   * Memanggil Custom Async Function kirimNotifikasiStatusPesanan() yang membungkus new Promise()
   */
  const handleKirimNotifikasi = () => {
    // 1. Cegah pengiriman ganda (anti double-click)
    if (isLoading) return;

    setIsLoading(true);
    setStatusMessage('Menghubungkan ke WhatsApp Cloud API backend...');
    setIsSuccess(null);

    const payload: WhatsAppOrderStatusNotificationRequest = {
      to: customerPhone,
      customerName,
      orderNumber,
      serviceName,
      status: orderStatus,
      useTemplate,
    };

    console.log('[WhatsAppNotification] Memulai pengiriman dengan Promise...');

    // 2. [MODUL 3] Memanggil Custom Async Function & Menangani dengan .then() dan .catch()
    kirimNotifikasiStatusPesanan(payload)
      .then((hasil: WhatsAppNotificationResult) => {
        // [MODUL 3] Blok .then() dieksekusi saat Promise di-resolve
        console.log('[WhatsAppNotification] .then() terpanggil - Sukses:', hasil);
        setIsSuccess(true);
        setResultData(hasil);

        const bannerMsg = hasil.isSimulated
          ? `[Mode Simulasi API] Notifikasi berhasil diproses untuk ${customerName} (${customerPhone}).`
          : `Notifikasi WhatsApp resmi berhasil terkirim ke ${customerName} (${customerPhone})!`;

        setStatusMessage(bannerMsg);

        if (onSuccess) {
          onSuccess(hasil);
        }
      })
      .catch((error: Error) => {
        // [MODUL 3] Blok .catch() dieksekusi saat Promise di-reject
        console.error('[WhatsAppNotification] .catch() terpanggil - Gagal:', error.message);
        setIsSuccess(false);
        setStatusMessage(error.message || 'Gagal mengirim notifikasi WhatsApp.');

        if (onError) {
          onError(error);
        }
      })
      .finally(() => {
        // Mengembalikan state loading ke false setelah proses selesai
        setIsLoading(false);
      });
  };

  /**
   * [MODUL 3] CONTOH ALTERNATIF: PENGIRIMAN DENGAN async / await
   * Dapat dipanggil untuk mengirim pesan teks kustom langsung
   */
  const handleKirimPesanTeksAsync = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setStatusMessage('Mengirim notifikasi teks via async/await...');
      setIsSuccess(null);

      // [MODUL 3] Menggunakan await pada custom async function
      const hasil: WhatsAppNotificationResult = await kirimNotifikasiWhatsApp(
        customerPhone,
        previewMessage
      );

      console.log('[WhatsAppNotification] async/await berhasil:', hasil);
      setIsSuccess(true);
      setResultData(hasil);
      setStatusMessage(hasil.message || 'Notifikasi WhatsApp teks berhasil dikirim.');

      if (onSuccess) {
        onSuccess(hasil);
      }
    } catch (err: any) {
      console.error('[WhatsAppNotification] async/await try/catch gagal:', err.message);
      setIsSuccess(false);
      setStatusMessage(err.message || 'Gagal mengirim pesan teks WhatsApp.');

      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="logo-whatsapp" size={22} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.title}>Notifikasi WhatsApp Meta</Text>
                <Text style={styles.subTitle}>Order #{orderNumber}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isLoading}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Status Pesanan & Pelanggan */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pelanggan:</Text>
                <Text style={styles.infoValue}>
                  {customerName} ({customerPhone})
                </Text>
              </View>
              {customerAddress ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Alamat:</Text>
                  <Text style={[styles.infoValue, { maxWidth: '65%' }]} numberOfLines={2}>
                    {customerAddress}
                  </Text>
                </View>
              ) : null}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Layanan:</Text>
                <Text style={styles.infoValue}>{serviceName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status Saat Ini:</Text>
                <Badge status={orderStatus} />
              </View>
            </View>

            {/* Preview Pesan WhatsApp */}
            <Text style={styles.sectionHeader}>Preview Pesan WhatsApp:</Text>
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{previewMessage}</Text>
            </View>

            {/* Toggle Template Meta (24-Hour Customer Service Window) */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setUseTemplate(!useTemplate)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons
                name={useTemplate ? 'checkbox' : 'square-outline'}
                size={22}
                color={useTemplate ? Colors.primary : '#6B7280'}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>
                  Gunakan Template Meta (Di Luar 24 Jam)
                </Text>
                <Text style={styles.toggleDesc}>
                  Pilih opsi ini bila pelanggan tidak merespons dalam 24 jam terakhir.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Status Banner (Hasil Berhasil / Gagal) */}
            {statusMessage ? (
              <View
                style={[
                  styles.statusBanner,
                  isSuccess === true
                    ? styles.statusSuccess
                    : isSuccess === false
                    ? styles.statusError
                    : styles.statusLoading,
                ]}
              >
                <Ionicons
                  name={
                    isSuccess === true
                      ? 'checkmark-circle'
                      : isSuccess === false
                      ? 'alert-circle'
                      : 'information-circle'
                  }
                  size={20}
                  color={
                    isSuccess === true
                      ? '#16A34A'
                      : isSuccess === false
                      ? '#DC2626'
                      : Colors.primary
                  }
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.statusBannerText,
                      {
                        color:
                          isSuccess === true
                            ? '#16A34A'
                            : isSuccess === false
                            ? '#DC2626'
                            : Colors.text,
                      },
                    ]}
                  >
                    {statusMessage}
                  </Text>
                  {resultData?.messageId ? (
                    <Text style={styles.statusIdText}>
                      ID: {resultData.messageId}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Tutup</Text>
            </TouchableOpacity>

            {/* Tombol Utama: Kirim Notifikasi via Promise & .then()/.catch() */}
            <TouchableOpacity
              style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]}
              onPress={handleKirimNotifikasi}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.sendBtnText}>Mengirim...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Ionicons name="paper-plane" size={15} color="#FFFFFF" />
                  <Text style={styles.sendBtnText}>Kirim WhatsApp (.then)</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    marginTop: 14,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 14,
    marginBottom: 6,
  },
  messageBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  messageText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  toggleDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  statusError: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  statusLoading: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  statusIdText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  sendBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default WhatsAppNotification;
