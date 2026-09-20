@echo off
cd /d "%~dp0"
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

where powershell >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Python tidak ditemukan. Menjalankan server lokal via PowerShell bawaan Windows...
    start /B powershell -WindowStyle Hidden -ExecutionPolicy Bypass -Command "$l = New-Object System.Net.HttpListener; $l.Prefixes.Add('http://localhost:8080/'); $l.Start(); $m = @{'.html'='text/html';'.css'='text/css';'.js'='text/javascript';'.wasm'='application/wasm';'.json'='application/json';'.png'='image/png'}; while ($l.IsListening) { $c = $l.GetContext(); try { $q = $c.Request; $s = $c.Response; $p = '.' + $q.RawUrl.Split('?')[0]; if ($p -eq './') { $p = './index.html' }; if (Test-Path $p -PathType Leaf) { $e = [IO.Path]::GetExtension($p); if ($m.ContainsKey($e)) { $s.ContentType = $m[$e] }; $b = [IO.File]::ReadAllBytes($p); $s.ContentLength64 = $b.Length; $s.OutputStream.Write($b, 0, $b.Length) } else { $s.StatusCode = 404 } } catch {} finally { try { $c.Response.Close() } catch {} } }"
    timeout /t 2 >nul
    echo [2/2] Membuka workstation di browser...
    start http://localhost:8080/index.html
    goto selesai
)

echo Menjalankan file index.html langsung di browser...
echo [PETUNJUK] Disarankan membukanya via Microsoft Edge atau Google Chrome.
start index.html

:selesai
echo.
echo Workstation siap digunakan 100% offline tanpa internet!
echo Jangan tutup jendela ini selama workstation sedang digunakan.
echo =====================================================================
pause
