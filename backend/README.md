# 👟 ShoeFresh Backend — Integrasi WhatsApp Cloud API (Meta)

> **Tugas Anggota 1:** Fondasi Integrasi Notifikasi Otomatis WhatsApp Menggunakan WhatsApp Cloud API Resmi dari Meta untuk Aplikasi Laundry Sepatu **ShoeFresh**.

---

## 📌 1. Ikhtisar & Arsitektur Fitur

Fitur ini menyediakan backend server khusus untuk menghubungkan aplikasi **ShoeFresh** (React Native / Expo) dengan **WhatsApp Cloud API** resmi dari Meta. Ketika status pesanan laundry sepatu diperbarui (misalnya dari *MENUNGGU* ke *DIPROSES*, *DICUCI*, atau *SELESAI*), sistem dapat secara otomatis mengirimkan notifikasi resmi ke nomor WhatsApp pelanggan.

```
+------------------------------------+
|   ShoeFresh Mobile App (Client)    |
|   (React Native, Expo, TypeScript) |
+------------------------------------+
                  |
                  | HTTP POST /api/whatsapp/send-order-status
                  v
+------------------------------------+
|       ShoeFresh Express Backend    |
|   - Token aman di backend/.env     |
|   - Normalisasi nomor (E.164)      |
|   - Format pesan ShoeFresh         |
|   - Window 24 Jam (Text/Template)  |
+------------------------------------+
                  |
                  | HTTPS POST (Bearer Token via native fetch())
                  v
+------------------------------------+
|    Meta WhatsApp Cloud API         |
|    (graph.facebook.com/v21.0)      |
+------------------------------------+
                  |
                  | Notifikasi Resmi WhatsApp
                  v
+------------------------------------+
|     WhatsApp Smartphone Pelanggan  |
+------------------------------------+
```

### 🔒 Keamanan (Security First)
Sesuai instruksi dan praktik standar industri:
- **JANGAN PERNAH** menaruh Access Token atau rahasia Meta di sisi aplikasi React Native / client.
- Seluruh Access Token (`WHATSAPP_ACCESS_TOKEN`), Phone Number ID (`WHATSAPP_PHONE_NUMBER_ID`), dan WABA ID disimpan secara aman di file `.env` pada backend.

---

## 📁 2. Struktur File yang Telah Dibuat

```
Laundry_Shoes-DEMO-MODUL-2/
├── backend/
│   ├── .env                       <- File konfigurasi lokal aktif
│   ├── .env.example               <- Template konfigurasi kredensial Meta
│   ├── package.json               <- Dependensi backend (Express, CORS, Dotenv, TypeScript)
│   ├── tsconfig.json              <- Konfigurasi kompilasi TypeScript backend
│   ├── test-whatsapp.js           <- Skrip uji coba fungsi WhatsApp di terminal
│   ├── test-endpoints.js          <- Skrip uji coba seluruh HTTP REST endpoint
│   ├── README.md                  <- Dokumentasi lengkap fitur ini
│   └── src/
│       ├── server.js              <- Express server utama (Port 5000)
│       ├── server.ts              <- Versi TypeScript dari Express server
│       ├── routes/
│       │   ├── whatsappRoutes.js  <- Endpoint routing /api/whatsapp
│       │   └── whatsappRoutes.ts  <- Versi TypeScript dari routing
│       ├── services/
│       │   ├── whatsappApi.js     <- Service inti pengiriman pesan via fetch()
│       │   └── whatsappApi.ts     <- Versi TypeScript dari WhatsApp service
│       └── types/
│           └── whatsapp.ts        <- Interface TypeScript resmi Meta & ShoeFresh
└── src/
    ├── services/
    │   └── whatsappService.ts     <- Service sisi React Native untuk memanggil backend
    └── types/
        └── whatsapp.ts            <- Interface TypeScript untuk aplikasi mobile
```

---

## 🛠️ 3. Panduan Setup Akun Meta WhatsApp Cloud API

Ikuti langkah-langkah berikut untuk mendapatkan kredensial asli dari Meta:

### Langkah 1: Buat Akun & Aplikasi di Meta for Developers
1. Kunjungi portal resmi: [https://developers.facebook.com/](https://developers.facebook.com/)
2. Masuk menggunakan akun Facebook Anda.
3. Klik **My Apps** (Aplikasi Saya) -> **Create App** (Buat Aplikasi).
4. Pilih tipe aplikasi: **Other** -> lalu pilih **Business**.
5. Masukkan nama aplikasi (misal: `ShoeFresh Notifier`) dan email kontak Anda.

### Langkah 2: Tambahkan Produk WhatsApp
1. Di halaman Dashboard Aplikasi, gulir ke bawah ke bagian **Add products to your app**.
2. Temukan kartu **WhatsApp** dan klik **Set up** (Siapkan).
3. Anda akan diarahkan ke halaman **WhatsApp -> API Setup**.

### Langkah 3: Ambil Kredensial untuk `.env`
Di halaman **API Setup**, Anda akan melihat informasi penting:
1. **Temporary access token**: Salin nilai token ini ke `WHATSAPP_ACCESS_TOKEN` di `.env` (berlaku 24 jam untuk pengujian).
   > *Untuk token permanen di lingkungan produksi:* Masuk ke **Meta Business Manager -> Users -> System Users**, buat System User, tambahkan asset WhatsApp Account, dan generate token dengan permission: `whatsapp_business_messaging` dan `whatsapp_business_management`.
2. **Phone number ID**: Salin nomor ID ini ke `WHATSAPP_PHONE_NUMBER_ID` di `.env`.
3. **WhatsApp Business Account ID**: Salin ke `WHATSAPP_BUSINESS_ACCOUNT_ID` di `.env`.

### Langkah 4: Tambahkan Nomor Penerima Uji Coba (Sandbox)
Saat menggunakan nomor uji coba Meta (Sandbox):
1. Pada menu **To**, klik dropdown dan pilih **Manage phone number list**.
2. Masukkan nomor WhatsApp pribadi Anda (misal: `081234567890`).
3. Meta akan mengirimkan kode verifikasi 5 digit ke WhatsApp Anda.
4. Masukkan kode tersebut. Sekarang nomor Anda siap menerima pesan uji coba dari Meta!

---

## 📜 4. Kebijakan 24-Hour Customer Service Window & Template Meta

Sesuai aturan resmi WhatsApp Cloud API Meta:
1. **Dalam Jendela 24 Jam (Customer Service Window):**
   - Jika pelanggan mengirim pesan atau membalas pesan WhatsApp dalam 24 jam terakhir, bisnis bebas mengirimkan notifikasi berupa **Pesan Teks Biasa (Regular Text)**.
2. **Di Luar Jendela 24 Jam (Business-Initiated Notification):**
   - Jika sudah lewat 24 jam sejak interaksi terakhir pelanggan, Meta **mewajibkan** penggunaan **Pesan Template yang telah disetujui (Approved Message Template)**.
   - Mengirim pesan teks biasa di luar jendela 24 jam akan ditolak Meta dengan kode error `131047`.

### Struktur Template Pesan ShoeFresh di WhatsApp Manager
Anda dapat mendaftarkan template berikut di **WhatsApp Business Manager -> Message Templates**:

- **Template Name:** `shoefresh_order_status_update`
- **Category:** `UTILITY`
- **Language:** `Indonesian (id)`
- **Header:** *(None)*
- **Body:**
  ```text
  Halo, Kak {{1}}!
  Pesanan laundry sepatu kamu di ShoeFresh sekarang sedang {{4}}.

  Detail pesanan:
  • Nomor pesanan: {{2}}
  • Layanan: {{3}}
  • Status: {{4}}

  Terima kasih telah menggunakan ShoeFresh!
  ```
- **Keterangan Parameter:**
  - `{{1}}` : Nama Pelanggan (contoh: *Andi*)
  - `{{2}}` : Nomor Pesanan (contoh: *SF001*)
  - `{{3}}` : Nama Layanan (contoh: *Deep Cleaning*)
  - `{{4}}` : Status Pesanan (contoh: *Diproses*)

---

## 🚀 5. Dokumentasi REST API Backend

Base URL Backend: `http://localhost:5000`

### 1. Cek Status Konfigurasi WhatsApp
- **Endpoint:** `GET /api/whatsapp/status`
- **Deskripsi:** Mengetahui apakah kredensial Meta sudah terpasang atau sedang berjalan dalam mode simulasi.
- **Contoh Respons:**
  ```json
  {
    "success": true,
    "message": "Status konfigurasi WhatsApp Cloud API berhasil diambil.",
    "data": {
      "isConfigured": true,
      "simulationMode": false,
      "apiVersion": "v21.0",
      "apiUrl": "https://graph.facebook.com",
      "phoneNumberIdMasked": "1055****3321",
      "defaultTemplate": "shoefresh_order_status_update",
      "defaultLanguage": "id"
    }
  }
  ```

---

### 2. Preview Format Pesan Notifikasi
- **Endpoint:** `POST /api/whatsapp/preview`
- **Request Body:**
  ```json
  {
    "customerName": "Andi",
    "orderNumber": "SF001",
    "serviceName": "Deep Cleaning",
    "status": "Diproses"
  }
  ```
- **Contoh Respons:**
  ```json
  {
    "success": true,
    "message": "Preview pesan berhasil digenerate.",
    "data": {
      "previewText": "Halo, Kak Andi!\nPesanan laundry sepatu kamu di ShoeFresh sekarang sedang diproses.\n\nDetail pesanan:\n• Nomor pesanan: SF001\n• Layanan: Deep Cleaning\n• Status: Diproses\n\nTerima kasih telah menggunakan ShoeFresh!"
    }
  }
  ```

---

### 3. Kirim Notifikasi Status Pesanan (Rekomendasi Utama)
- **Endpoint:** `POST /api/whatsapp/send-order-status`
- **Request Body (Mode Teks - Dalam Window 24 Jam):**
  ```json
  {
    "to": "081234567890",
    "customerName": "Andi",
    "orderNumber": "SF001",
    "serviceName": "Deep Cleaning",
    "status": "Diproses",
    "useTemplate": false
  }
  ```
- **Request Body (Mode Template - Di Luar Window 24 Jam):**
  ```json
  {
    "to": "081234567890",
    "customerName": "Andi",
    "orderNumber": "SF001",
    "serviceName": "Deep Cleaning",
    "status": "Diproses",
    "useTemplate": true,
    "templateName": "shoefresh_order_status_update"
  }
  ```
- **Contoh Respons Sukses (HTTP 200):**
  ```json
  {
    "success": true,
    "isSimulated": false,
    "message": "Pesan WhatsApp resmi berhasil dikirim ke Meta Cloud API.",
    "data": {
      "messaging_product": "whatsapp",
      "contacts": [
        {
          "input": "6281234567890",
          "wa_id": "6281234567890"
        }
      ],
      "messages": [
        {
          "id": "wamid.HBgLMTc5NDQ5Njk3MzY4NHVmaXc0bWQ="
        }
      ]
    }
  }
  ```

---

### 4. Kirim Pesan Teks Bebas
- **Endpoint:** `POST /api/whatsapp/send`
- **Request Body:**
  ```json
  {
    "to": "081234567890",
    "message": "Halo dari ShoeFresh! Sepatu Anda siap diantar kurir kami.",
    "previewUrl": false
  }
  ```

---

### 5. Kirim Pesan Template Meta
- **Endpoint:** `POST /api/whatsapp/send-template`
- **Request Body:**
  ```json
  {
    "to": "081234567890",
    "templateName": "shoefresh_order_status_update",
    "languageCode": "id",
    "parameters": ["Andi", "SF001", "Deep Cleaning", "Diproses"]
  }
  ```

---

## 🧪 6. Cara Menjalankan Backend & Menguji Coba

### 1. Instalasi Dependensi Backend
Buka terminal dan jalankan:
```bash
cd backend
npm install
```

### 2. Jalankan Uji Coba Cepat (Terminal Test Script)
Anda dapat langsung memverifikasi logika WhatsApp tanpa menyalakan server Express:
```bash
node test-whatsapp.js
```
Skrip ini akan menguji:
1. Pembacaan status konfigurasi `.env`.
2. Normalisasi nomor telepon dari berbagai format lokal ke E.164 (`62...`).
3. Pemformatan teks notifikasi status pesanan ShoeFresh.
4. Simulasi / eksekusi pengiriman pesan teks resmi.
5. Simulasi / eksekusi pengiriman template Meta.
6. Pemanggilan fungsi `sendOrderStatusNotification()`.

### 3. Jalankan Uji Coba Endpoint HTTP
```bash
node test-endpoints.js
```
Skrip ini akan menguji seluruh REST endpoint pada server Express dan memastikan response code `200` dan penanganan error `400` bekerja dengan baik.

### 4. Menyalakan Server Backend
```bash
npm start
# atau dengan auto-reload saat file berubah:
npm run dev
```
Server akan aktif di: `http://localhost:5000`

---

## 💡 7. Mode Simulasi Cerdas (Offline / Evaluator Demo Mode)

Untuk kemudahan pengujian oleh Dosen / Penguji / Reviewer yang belum memiliki akun Meta Developers atau belum mengisi token:
- Jika `WHATSAPP_ACCESS_TOKEN` atau `WHATSAPP_PHONE_NUMBER_ID` masih bernilai placeholder (`YOUR_...`), backend **tidak akan crash**.
- Backend secara otomatis beralih ke **Mode Simulasi Demo**.
- Pesan yang dikirim akan dicetak secara rapi ke log terminal backend lengkap dengan nomor tujuan, isi teks/parameter template, dan menghasilkan mock ID `wamid...` resmi.
- Begitu kredensial asli dimasukkan ke file `backend/.env`, backend secara otomatis langsung mengirim pesan nyata ke WhatsApp Cloud API Meta tanpa perlu mengubah kode apa pun!
