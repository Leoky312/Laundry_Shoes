# 👟 Laundry Shoes App (Full Stack Mobile App)

Aplikasi manajemen dan pemesanan layanan laundry sepatu modern berbasis **React Native (Expo)**, **Node.js (Express)**, **MySQL**, dan **Prisma ORM**.

---

## 🛠️ Tech Stack
- **Mobile Client**: React Native with Expo SDK, React Navigation, Axios / Fetch API, Lucide Icons / Vector Icons.
- **Backend API**: Node.js & Express.js (REST API, JWT Authentication, Multer for image uploads).
- **Database & ORM**: MySQL Database & Prisma ORM.
- **Design System**: Modern Minimalist (Primary: `#2563EB`, Secondary: `#0F172A`, Background: `#FFFFFF`, Success: `#10B981`, Warning: `#F59E0B`).

---

## 📁 Struktur Monorepo Project

```text
Pemrograman Mobile/
├── .gitignore
├── README.md
├── check-env.js                 # Script verifikasi environment
├── backend/                     # Server API Node.js + Express + Prisma
│   ├── prisma/                  # Schema database & migrations
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       └── utils/
└── mobile/                      # Aplikasi React Native (Expo)
    ├── assets/
    ├── components/
    ├── screens/
    ├── navigation/
    ├── services/
    ├── hooks/
    └── context/
```

---

## 🗺️ Roadmap Pengerjaan Step-by-Step

- [x] **Step 1**: Persiapan Environment dan Instalasi Tools
- [x] **Step 2**: Database Modeling & Schema Prisma (ERD, Migrasi & Seeder)
- [x] **Step 3**: Arsitektur Backend API (Setup Express, JWT Auth, & Error Handler)
- [x] **Step 4**: Pembuatan Endpoint REST API Lengkap (Services, Orders, Tracking, Payment, Admin)
- [x] **Step 5**: Setup Inisialisasi Mobile App (Expo, Navigation, Theme, State Context)
- [x] **Step 6**: Desain & Implementasi UI Layar Customer (Home, Service Detail, Booking, Tracking, History, Profile)
- [x] **Step 7**: Desain & Implementasi UI Layar Admin (Dashboard, Manage Orders, Update Tracking, Reports)
- [x] **Step 8**: Integrasi Mobile ke Backend & Testing End-to-End ✅ 21/21 Tests Passed

---

## 🚀 Cara Menjalankan Aplikasi

### Prasyarat
1. Nyalakan **Laragon** atau **XAMPP** → klik **Start All**
2. Install **Expo Go** di HP Android/iOS

### Cara Cepat (1 Klik)
Cukup klik dua kali file berikut di Windows Explorer:
👉 **`start-app.bat`** *(Otomatis menyalakan Backend & Mobile Expo)*

---

### Cara Manual (Terminal)

Buka 2 terminal terpisah di VS Code / PowerShell:

**1. Terminal 1 — Backend Server**
```bash
cd backend
npm run dev
```
> Server akan berjalan di `http://localhost:5000`

**2. Terminal 2 — Expo Mobile**
```bash
cd mobile
npx expo start -c
```

---

### Cara Membuka Aplikasi
1. **Di Browser Web (PC/Laptop)**:
   - Di terminal Expo, tekan tombol **`w`** untuk membuka di browser (`http://localhost:8081`).
2. **Di HP (Android / iOS)**:
   - Install **Expo Go** dari Google Play Store atau Apple App Store.
   - Pastikan HP dan Laptop terhubung ke jaringan Wi-Fi yang sama.
   - Scan **QR Code** yang muncul di terminal Expo menggunakan aplikasi Expo Go (atau Camera di iOS).

---

### 🔑 Akun Demo Siap Pakai
| Role | Email | Password |
|---|---|---|
| **Customer** | `customer@gmail.com` | `customer123` |
| **Admin** | `admin@laundryshoes.com` | `admin123` |

