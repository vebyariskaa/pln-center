@echo off
title PLN Media Center - Scheduler System
color 0B
echo =====================================================================
echo                 PLN MEDIA CENTER SCHEDULER SYSTEM
echo =====================================================================
echo.
echo Sedang memeriksa instalasi Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan di komputer Anda!
    echo Silakan instal Node.js terlebih dahulu agar sistem ini dapat berjalan.
    echo Anda dapat mengunduhnya di: https://nodejs.org/
    echo.
    pause
    exit /b
)

echo [OK] Node.js terdeteksi.
echo.
echo Sedang memeriksa modul dependensi...
if not exist node_modules (
    echo Folder node_modules tidak ditemukan. Menjalankan "npm install" untuk mengunduh dependensi...
    call npm install
) else (
    echo [OK] Modul dependensi sudah siap.
)

echo.
echo Memulai server backend PLN Media Center...
echo Browser Anda akan terbuka otomatis dalam 2 detik ke http://localhost:3000
echo.
echo Catatan: JANGAN MENUTUP Jendela Hitam (Command Prompt) ini
echo          selama sistem pemutar video sedang berjalan.
echo =====================================================================
echo.

:: Menjalankan browser otomatis
start "" "http://localhost:3000"

:: Menjalankan server node
node server.js

pause
