#!/usr/bin/env bash
# TB Conformal Triage - Linux Offline Launcher
echo "====================================================================="
echo "   TB CONFORMAL TRIAGE & CLINICAL SCREENING WORKSTATION (OFFLINE)    "
echo "   Investigational SaMD Kelas B - BioMedCLIP Distilled Model v11     "
echo "====================================================================="
echo ""
echo "[1/2] Menyiapkan server lokal offline di komputer ini..."

PORT=8080
SERVER_PID=""

cleanup() {
    if [ -n "$SERVER_PID" ]; then
        kill "$SERVER_PID" 2>/dev/null
    fi
}
trap cleanup EXIT INT TERM

if command -v node >/dev/null 2>&1 && [ -f "./server.js" ]; then
    echo "Node.js terdeteksi. Menjalankan server lokal via server.js di port ${PORT}..."
    node server.js &
    SERVER_PID=$!
elif command -v python3 >/dev/null 2>&1; then
    echo "Python3 terdeteksi. Menjalankan server lokal offline di port ${PORT}..."
    python3 -m http.server $PORT >/dev/null 2>&1 &
    SERVER_PID=$!
elif command -v python >/dev/null 2>&1; then
    echo "Python terdeteksi. Menjalankan server lokal offline di port ${PORT}..."
    python -m http.server $PORT >/dev/null 2>&1 &
    SERVER_PID=$!
fi

if [ -n "$SERVER_PID" ]; then
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
    echo "PERINGATAN: Node.js atau Python3 tidak ditemukan di sistem ini."
    echo "Kebijakan keamanan peramban modern memblokir AI WebAssembly dan Service Worker melalui file:// langsung."
    echo "Mohon pasang Node.js atau Python3 untuk menjalankan workstation klinis ini."
    echo "Mencoba membuka index.html langsung..."
    xdg-open index.html 2>/dev/null || sensible-browser index.html 2>/dev/null
fi
