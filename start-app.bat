@echo off
echo ==================================================
echo   LAUNDRY SHOES APP ^| STARTUP SCRIPT
echo ==================================================
echo.
echo [1/3] Memeriksa status Database...
mysql.exe -u root -e "SELECT 'MySQL OK' AS status;" 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [INFO] Service MySQL tidak aktif, server menggunakan Database JSON bawaan.
) ELSE (
    echo [OK] MySQL aktif.
)
echo.

echo Membersihkan proses lama di port 5000 (jika ada)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo [2/3] Memulai Backend Server (http://localhost:5000)...
start "Laundry Shoes Backend" cmd /k "cd /d %~dp0backend && node --watch src/server.js"
timeout /t 2 /nobreak >nul

echo.
echo [3/3] Memulai Expo Mobile App...
echo       Scan QR Code dengan Expo Go di HP atau tekan 'w' untuk versi Web.
echo.
start "Laundry Shoes Mobile" cmd /k "cd /d %~dp0mobile && npx expo start -c"

echo.
echo ==================================================
echo  APLIKASI SUDAH BERJALAN DI LOCALHOST!
echo  - Backend API : http://localhost:5000
echo  - Health Check: http://localhost:5000/api/health
echo  - Mobile Web  : http://localhost:8081 (atau tekan 'w' di terminal Expo)
echo  - Emulator    : Tekan 'a' (Android) di terminal Expo
echo ==================================================
echo.
echo Akun Demo:
echo  Customer : customer@gmail.com   / customer123
echo  Admin    : admin@laundryshoes.com / admin123
echo.
pause
