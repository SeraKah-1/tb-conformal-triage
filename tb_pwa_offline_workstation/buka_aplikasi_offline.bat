@echo off
setlocal
cd /d "%~dp0"
title TB Review - Local
set "HOST=127.0.0.1"
set "PORT=8080"
echo TB Review - alat penelitian. Semua hasil perlu review tenaga medis.
echo Server lokal: http://127.0.0.1:8080/index.html
where node >nul 2>nul
if errorlevel 1 (
    echo Node.js tidak ditemukan. Pasang Node.js LTS lalu jalankan file ini lagi.
    pause
    exit /b 1
)
where powershell >nul 2>nul
if errorlevel 1 (
    echo PowerShell tidak tersedia untuk memeriksa kesiapan server.
    echo Jalankan node server.js lalu buka alamat di atas setelah server siap.
    pause
    exit /b 1
)
if not exist "server.js" (
    echo server.js tidak ditemukan. Ekstrak seluruh folder aplikasi terlebih dahulu.
    pause
    exit /b 1
)
powershell -NoProfile -Command "$ErrorActionPreference='Stop'; $p=$null; try { $busy=$false; $probe=New-Object Net.Sockets.TcpClient; try { $probe.Connect('127.0.0.1',8080); $busy=$true } catch {} finally { $probe.Dispose() }; if($busy){ throw 'Port8080 sudah dipakai. Tutup server lama sebelum menjalankan launcher.' }; $p=Start-Process -FilePath (Get-Command node).Source -ArgumentList 'server.js' -WorkingDirectory (Get-Location).Path -NoNewWindow -PassThru; $ready=$false; for($i=0;$i -lt 50;$i++){ Start-Sleep -Milliseconds 200; if($p.HasExited){ throw 'Server berhenti. Periksa apakah port8080 sudah dipakai.' }; try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8080/index.html' -TimeoutSec 1; if($r.StatusCode -eq 200 -and $r.Content.Contains('drop-zone')){ $ready=$true; break } } catch {} }; if(-not $ready){ throw 'Server belum siap. Browser tidak dibuka.' }; Start-Process 'http://127.0.0.1:8080/index.html'; Write-Host 'Server siap. Tutup jendela ini untuk menghentikan server.'; $p.WaitForExit(); exit $p.ExitCode } catch { Write-Host $_.Exception.Message; exit 1 } finally { if($p -and -not $p.HasExited){ Stop-Process -Id $p.Id -ErrorAction SilentlyContinue } }"
if errorlevel 1 (
    echo Aplikasi gagal dimulai. Tidak ada browser yang dibuka oleh launcher.
    pause
    exit /b 1
)
endlocal
