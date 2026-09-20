@echo off
title TB Conformal Triage - Workstation Klinis Offline
color 0A
echo =====================================================================
echo    TB CONFORMAL TRIAGE & CLINICAL SCREENING WORKSTATION (OFFLINE)
echo    Investigational SaMD Kelas B - BioMedCLIP Distilled Model v11
echo =====================================================================
echo.
echo [1/2] Menyiapkan server lokal offline di komputer ini...

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Python terdeteksi. Memulai server lokal offline di port 8080...
    start /B python -m http.server 8080 >nul 2>&1
    timeout /t 2 >nul
    echo [2/2] Membuka workstation di browser...
    start http://localhost:8080/index.html
    goto selesai
)

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Python launcher (py) terdeteksi. Memulai server port 8080...
    start /B py -m http.server 8080 >nul 2>&1
    timeout /t 2 >nul
    echo [2/2] Membuka workstation di browser...
    start http://localhost:8080/index.html
    goto selesai
)

echo Python tidak terdeteksi. Membuka file index.html langsung di browser...
echo [PETUNJUK] Untuk pengalaman PWA dan instalasi ikon desktop terbaik,
echo disarankan komputer memiliki Python atau membukanya via Microsoft Edge / Google Chrome.
start index.html

:selesai
echo.
echo Workstation siap digunakan 100% offline tanpa internet!
echo Jangan tutup jendela ini selama workstation sedang digunakan.
echo =====================================================================
pause
