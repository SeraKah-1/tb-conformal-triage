#!/usr/bin/env bash
# TB Conformal Triage - Linux Offline Launcher
echo "====================================================================="
echo "   TB CONFORMAL TRIAGE & CLINICAL SCREENING WORKSTATION (OFFLINE)    "
echo "   Investigational SaMD Kelas B - BioMedCLIP Distilled Model v11     "
echo "====================================================================="
echo ""
echo "[1/2] Menyiapkan server lokal offline di komputer ini..."

PORT=8080
if command -v python3 >/dev/null 2>&1; then
    python3 -m http.server $PORT >/dev/null 2>&1 &
    SERVER_PID=$!
    sleep 2
    echo "[2/2] Membuka workstation di browser default..."
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:${PORT}/index.html"
    elif command -v google-chrome >/dev/null 2>&1; then
        google-chrome "http://localhost:${PORT}/index.html" &
    elif command -v firefox >/dev/null 2>&1; then
        firefox "http://localhost:${PORT}/index.html" &
    else
        echo "Buka peramban browser Anda dan navigasikan ke: http://localhost:${PORT}/index.html"
    fi
    echo ""
    echo "Workstation berjalan offline. Tekan Ctrl+C untuk menghentikan server."
    wait $SERVER_PID
else
    echo "Python3 tidak terdeteksi. Membuka index.html langsung..."
    xdg-open index.html 2>/dev/null || sensible-browser index.html 2>/dev/null
fi
