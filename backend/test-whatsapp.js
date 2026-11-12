/**
 * ==============================================================================
 * SHOEFRESH - UJI COBA OTOMATIS FITUR INTEGRASI WHATSAPP CLOUD API
 * ==============================================================================
 * Jalankan script ini dari folder backend:
 *   node test-whatsapp.js
 * ==============================================================================
 */

const {
  normalizePhoneNumber,
  formatOrderStatusMessage,
  sendTextMessage,
  sendTemplateMessage,
  sendOrderStatusNotification,
  getWhatsAppConfigStatus,
} = require('./src/services/whatsappApi');

const runTests = async () => {
  console.log('\n================================================================');
  console.log('🧪 PENGUJIAN INTEGRASI WHATSAPP CLOUD API - SHOEFRESH');
  console.log('================================================================\n');

  // 1. Status Konfigurasi
  console.log('📋 [TEST 1] Mengecek Status Konfigurasi WhatsApp Cloud API:');
  const status = getWhatsAppConfigStatus();
  console.log(status);

  // 2. Normalisasi Nomor Telepon
  console.log('\n📱 [TEST 2] Normalisasi Format Nomor Telepon E.164:');
  const testNumbers = [
    '081234567890',
    '+6281234567890',
    '6281234567890',
    '0812-3456-7890',
    ' 0898 7654 3210 ',
  ];

  testNumbers.forEach((raw) => {
    const normalized = normalizePhoneNumber(raw);
    console.log(`   "${raw}"  --->  "${normalized}" (Valid: ${normalized.startsWith('62')})`);
  });

  // 3. Format Pesan Notifikasi ShoeFresh Sesuai Contoh Tugas
  console.log('\n💬 [TEST 3] Format Pesan Notifikasi Status Sesuai Ketentuan Soal:');
  const sampleMessage = formatOrderStatusMessage({
    customerName: 'Andi',
    orderNumber: 'SF001',
    serviceName: 'Deep Cleaning',
    status: 'Diproses',
  });
  console.log('--- Hasil Format Teks ---');
  console.log(sampleMessage);
  console.log('-------------------------');

  // 4. Pengujian Kirim Pesan Teks (Customer Service Window 24 Jam)
  console.log('\n🚀 [TEST 4] Simulasi / Eksekusi Pengiriman Pesan Teks WhatsApp:');
  try {
    const textResult = await sendTextMessage(
      '081234567890',
      sampleMessage
    );
    console.log('✅ Berhasil mengirim pesan teks:');
    console.log(textResult);
  } catch (err) {
    console.error('❌ Gagal mengirim pesan teks:', err.message);
  }

  // 5. Pengujian Kirim Template Meta (Outside 24-Hour Window)
  console.log('\n📋 [TEST 5] Simulasi / Eksekusi Pengiriman Pesan Template Resmi Meta:');
  try {
    const templateResult = await sendTemplateMessage({
      to: '081234567890',
      templateName: 'shoefresh_order_status_update',
      languageCode: 'id',
      parameters: ['Andi', 'SF001', 'Deep Cleaning', 'Diproses'],
    });
    console.log('✅ Berhasil mengirim pesan template:');
    console.log(templateResult);
  } catch (err) {
    console.error('❌ Gagal mengirim template:', err.message);
  }

  // 6. Pengujian Full Order Status Notification
  console.log('\n👟 [TEST 6] Pengujian Method sendOrderStatusNotification():');
  try {
    const orderStatusResult = await sendOrderStatusNotification({
      to: '089876543210',
      customerName: 'Rian Pratama',
      orderNumber: 'ORD-20261013-1001',
      serviceName: 'Deep Cleaning',
      status: 'DICUCI',
      useTemplate: false,
    });
    console.log('✅ Hasil sendOrderStatusNotification():');
    console.log(orderStatusResult);
  } catch (err) {
    console.error('❌ Gagal sendOrderStatusNotification:', err.message);
  }

  console.log('\n================================================================');
  console.log('🎉 SELURUH PENGUJIAN INTEGRASI WHATSAPP API BERHASIL DIJALANKAN!');
  console.log('================================================================\n');
};

runTests();
