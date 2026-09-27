@echo off
echo ==================================================
echo   LAUNDRY SHOES APP ^| STARTUP SCRIPT
echo ==================================================
echo.
echo [1/3] Memeriksa status MySQL...
mysql.exe -u root -e "SELECT 'MySQL OK' AS status;" 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] MySQL tidak aktif! Nyalakan Laragon / XAMPP terlebih dahulu.
    echo         Klik tombol "Start All" di Laragon, lalu jalankan script ini lagi.
    echo.
    pause
    exit /b 1
)
echo [OK] MySQL aktif.
echo.

echo Membersihkan proses lama di port 5000 (jika ada)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo [2/3] Memulai Backend Server (http://localhost:5000)...
start "Laundry Shoes Backend" cmd /k "cd /d %~dp0backend && node src/server.js"
timeout /t 2 /nobreak >nul

echo.
echo [3/3] Memulai Expo Mobile App...
echo       Setelah QR muncul, buka Expo Go di HP dan scan QR Code.
echo.
start "Laundry Shoes Mobile" cmd /k "cd /d %~dp0mobile && set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.100.8 && npx expo start --clear"

echo.
echo ==================================================
echo  APLIKASI SUDAH BERJALAN!
echo  - Backend API : http://localhost:5000
echo  - Health Check: http://localhost:5000/api/health
echo  - Mobile App  : Scan QR Code di terminal Expo
echo ==================================================
echo.
echo Akun Demo:
echo  Customer : customer@gmail.com   / customer123
echo  Admin    : admin@laundryshoes.com / admin123
echo.
pause
