@echo off
title UKOM/UKT JF PKN 2026 - Aplikasi Latihan
cd /d "%~dp0app"
set "NODE_EXTRA_CA_CERTS=%~dp0zscaler-root.pem"

echo ============================================
echo   UKOM/UKT JF PKN 2026 - Aplikasi Latihan
echo ============================================
echo.
echo Menyiapkan server... tunggu sebentar, browser akan terbuka otomatis.
echo (Biarkan jendela ini terbuka selama aplikasi dipakai. Tutup jendela ini untuk menghentikan server.)
echo.

start "" /min cmd /c "ping -n 6 127.0.0.1 >nul & start http://localhost:5173"

call npm run dev

echo.
echo Server berhenti. Tutup jendela ini atau tekan tombol apa saja.
pause >nul
