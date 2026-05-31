#!/bin/bash
set -euo pipefail

# ============================================================
# Builder — Al-Ye'AnDiMo (Yet Another Display Mosque)
# Output: ZIP siap release di folder dist/
# ============================================================

# --- Konfigurasi ---
PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"
VERSION="v1.1.0"
DIST_DIR="dist"
BUILD_DIR="build"
RUNNER_DIR="runner"

echo "🏗️  Memulai proses build YADM ${VERSION}..."
echo ""

# --- Cek Prasyarat ---
echo "🔍 Memeriksa prasyarat..."

if ! command -v node &>/dev/null; then
	echo "❌ Node.js tidak ditemukan. Install dulu bro!"
	exit 1
fi

NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
	echo "❌ Butuh Node.js v18+. Versi sekarang: $(node -v)"
	exit 1
fi
echo "   ✓ Node.js $(node -v)"

if ! command -v pnpm &>/dev/null; then
	echo "❌ pnpm tidak ditemukan. Install dulu: npm i -g pnpm"
	exit 1
fi
echo "   ✓ pnpm $(pnpm -v)"

if ! command -v zip &>/dev/null; then
	echo "❌ zip tidak ditemukan. Install dulu: apt install zip"
	exit 1
fi
echo "   ✓ zip"
echo ""

# --- Bersihkan folder lama ---
echo "🧹  Membersihkan folder lama..."
rm -rf "$BUILD_DIR" "$RUNNER_DIR" "$DIST_DIR"
echo ""

# --- Build SvelteKit ---
echo "📦  Menjalankan pnpm build..."
pnpm build
echo ""

# --- Siapkan folder runner ---
echo "📂  Menyiapkan folder runner..."
for plat in linux windows; do
	mkdir -p "$RUNNER_DIR/$plat/data"
	mkdir -p "$RUNNER_DIR/$plat/static/uploads"
	mkdir -p "$RUNNER_DIR/$plat/static/sounds"
done

# --- Salin hasil build ---
cp -r "$BUILD_DIR" "$RUNNER_DIR/linux/"
cp -r "$BUILD_DIR" "$RUNNER_DIR/windows/"

# --- Salin data (settings) — tolerir folder kosong ---
cp -r data/. "$RUNNER_DIR/linux/data/" 2>/dev/null || true
cp -r data/. "$RUNNER_DIR/windows/data/" 2>/dev/null || true

# --- Salin static (uploads + sounds) — tolerir folder kosong ---
cp -r static/. "$RUNNER_DIR/linux/static/" 2>/dev/null || true
cp -r static/. "$RUNNER_DIR/windows/static/" 2>/dev/null || true
echo ""

# --- Buat start script Linux ---
echo "📜  Membuat start script Linux..."
cat <<SCRIPT > "$RUNNER_DIR/linux/start.sh"
#!/bin/bash
set -euo pipefail
PARENT_PATH=\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)
cd "\$PARENT_PATH"
echo "🚀  YADM ${VERSION} — Linux"
echo "    Port: ${PORT} | Host: ${HOST}"
exec node build
SCRIPT
chmod +x "$RUNNER_DIR/linux/start.sh"

# --- Buat start script Windows ---
echo "📜  Membuat start script Windows..."
cat <<SCRIPT > "$RUNNER_DIR/windows/start.bat"
@echo off
title YADM ${VERSION} - Yet Another Display Mosque
cd /d %%~dp0
echo 🚀  YADM ${VERSION} — Windows
echo     Port: ${PORT}
set PORT=${PORT}
set HOST=${HOST}
node build
pause
SCRIPT
echo ""

# --- Buat ZIP ---
echo "📦  Membuat arsip ZIP..."
mkdir -p "$DIST_DIR"

# Linux ZIP
echo "   • Linux..."
(cd "$RUNNER_DIR/linux" && zip -qr "../../$DIST_DIR/yadm-${VERSION}-linux-x64.zip" .)

# Windows ZIP
echo "   • Windows..."
(cd "$RUNNER_DIR/windows" && zip -qr "../../$DIST_DIR/yadm-${VERSION}-windows-x64.zip" .)

# --- Bersihkan folder sementara ---
echo "🧹  Membersihkan folder sementara..."
rm -rf "$BUILD_DIR" "$RUNNER_DIR"

# --- Selesai ---
echo ""
echo "✅  Selesai!"
echo "    📁 ${DIST_DIR}/"
echo "       • yadm-${VERSION}-linux-x64.zip"
echo "       • yadm-${VERSION}-windows-x64.zip"
echo ""
echo "    📦 Total size:"
du -sh "$DIST_DIR"/*.zip 2>/dev/null || true
