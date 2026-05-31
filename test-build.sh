#!/bin/bash
set -euo pipefail

# ============================================================
# test-build.sh — Build & Smoke Test untuk YADM
# Menjalankan build, lalu melakukan pengujian cepat.
# ============================================================

echo "=============================================="
echo "  🧪 YADM Build & Smoke Test"
echo "=============================================="
echo ""

# --- 1. Cek prasyarat ---
echo "🔍 Memeriksa prasyarat..."
for cmd in node pnpm zip curl lsof; do
	if ! command -v "$cmd" &>/dev/null; then
		echo "❌ $cmd tidak ditemukan. Install dulu!"
		exit 1
	fi
done
echo "   ✓ Semua prasyarat terpenuhi"
echo ""

# --- 2. Build ---
echo "📦 Menjalankan build..."
BUILD_START=$(date +%s%N)
if ! bash build.sh; then
	echo "❌ BUILD GAGAL!"
	exit 1
fi
BUILD_END=$(date +%s%N)
BUILD_DURATION_MS=$(( (BUILD_END - BUILD_START) / 1000000 ))
echo "   ✓ Build selesai dalam ${BUILD_DURATION_MS}ms"
echo ""

# --- 3. Cek hasil ZIP ---
echo "📂 Memeriksa hasil ZIP..."
ZIP_COUNT=$(ls -1 dist/*.zip 2>/dev/null | wc -l)
if [ "$ZIP_COUNT" -lt 2 ]; then
	echo "❌ Kurang dari 2 ZIP ditemukan di dist/"
	ls -la dist/ 2>/dev/null || echo "     (folder dist/ kosong)"
	exit 1
fi
echo "   ✓ ${ZIP_COUNT} ZIP ditemukan"
for zip in dist/*.zip; do
	SIZE=$(du -h "$zip" | cut -f1)
	echo "      • $(basename "$zip") (${SIZE})"
done
echo ""

# --- 4. Ekstrak ZIP Linux untuk smoke test ---
echo "🔧 Mengekstrak ZIP Linux untuk smoke test..."
TEST_DIR="/tmp/yadm-smoke-test-$$"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
unzip -q dist/*-linux-*.zip -d "$TEST_DIR"
echo "   ✓ Diekstrak ke $TEST_DIR"
echo ""

# --- 5. Verifikasi struktur folder ---
echo "📋 Memeriksa struktur folder..."
MISSING=0
for dir in build data static/uploads static/sounds; do
	if [ ! -d "$TEST_DIR/$dir" ]; then
		echo "   ❌ Folder $dir tidak ditemukan!"
		MISSING=1
	fi
done
for file in data/settings.json; do
	# settings.json mungkin tidak ada karena gitignored — tolerir
	if [ -f "$TEST_DIR/$file" ]; then
		echo "   ✓ $file"
	fi
done
if [ ! -f "$TEST_DIR/start.sh" ]; then
	echo "   ❌ start.sh tidak ditemukan!"
	MISSING=1
fi
if [ "$MISSING" -eq 1 ]; then
	echo "❌ Struktur folder tidak valid!"
	exit 1
fi
echo "   ✓ Struktur folder valid"
echo ""

# --- 6. Smoke test: jalankan server ---
echo "🚀 Menjalankan server untuk smoke test..."
cd "$TEST_DIR"

# Pastikan port 3000 tidak dipakai
if lsof -ti:3000 &>/dev/null; then
	echo "   ⚠️  Port 3000 sudah dipakai. Mencoba mematikannya..."
	lsof -ti:3000 | xargs kill 2>/dev/null || true
	sleep 1
fi

PORT=3000 HOST=0.0.0.0 node build &
SERVER_PID=$!
echo "   PID: $SERVER_PID"

# Tunggu server siap (max 15 detik)
echo "   Menunggu server siap..."
SERVER_READY=false
for i in $(seq 1 15); do
	if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200\|302"; then
		SERVER_READY=true
		echo "   ✓ Server siap setelah ${i}s"
		break
	fi
	sleep 1
done

if [ "$SERVER_READY" != true ]; then
	echo "❌ Server tidak merespon setelah 15 detik!"
	kill "$SERVER_PID" 2>/dev/null || true
	exit 1
fi
echo ""

# --- 7. Test endpoint ---
echo "🔬 Menjalankan smoke test endpoint..."
PASS=0
FAIL=0

function test_endpoint() {
	local name="$1"
	local url="$2"
	local expect="$3"
	local status
	status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)
	if echo "$status" | grep -qE "$expect"; then
		echo "   ✓ $name → $status"
		PASS=$((PASS + 1))
	else
		echo "   ❌ $name → $status (expected: $expect)"
		FAIL=$((FAIL + 1))
	fi
}

test_endpoint "Halaman utama" "http://localhost:3000/" "200"
test_endpoint "Halaman admin" "http://localhost:3000/admin" "200"
test_endpoint "Halaman kas" "http://localhost:3000/kas" "200"
test_endpoint "API settings (tanpa auth)" "http://localhost:3000/api/settings" "200"
test_endpoint "API status" "http://localhost:3000/api/status" "200|401"
test_endpoint "API events (SSE)" "http://localhost:3000/api/events" "200"

# Test 404
test_endpoint "Error 404" "http://localhost:3000/halaman-tidak-ada" "404"

# Test POST without auth (harus 401)
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/settings -H "Content-Type: application/json" -d '{}' 2>/dev/null || true)
if [ "$AUTH_STATUS" = "401" ]; then
	echo "   ✓ Auth protection → 401"
	PASS=$((PASS + 1))
else
	echo "   ❌ Auth protection → $AUTH_STATUS (expected: 401)"
	FAIL=$((FAIL + 1))
fi

echo ""

# --- 8. Cek console/error log ---
echo "📝 Memeriksa log server..."
# Tunggu sebentar biar ada log
sleep 2

# Cek apakah server masih jalan
if ! kill -0 "$SERVER_PID" 2>/dev/null; then
	echo "❌ Server mati sebelum waktunya!"
	FAIL=$((FAIL + 1))
fi
echo ""

# --- 9. Matikan server ---
echo "🛑 Menghentikan server..."
kill "$SERVER_PID" 2>/dev/null || true
sleep 1
if kill -0 "$SERVER_PID" 2>/dev/null; then
	kill -9 "$SERVER_PID" 2>/dev/null || true
fi
echo ""

# --- 10. Bersihkan ---
echo "🧹 Membersihkan..."
rm -rf "$TEST_DIR"
echo ""

# --- 11. Laporan ---
echo "=============================================="
echo "  📊 HASIL SMOKE TEST"
echo "=============================================="
echo ""
echo "   ✅ Pass: $PASS"
echo "   ❌ Fail: $FAIL"
echo "   ⏱  Build: ${BUILD_DURATION_MS}ms"
echo ""

if [ "$FAIL" -gt 0 ]; then
	echo "❌ ADA YANG GAGAL! Periksa log di atas."
	exit 1
else
	echo "🎉 Semua test lulus! ZIP siap di release."
	echo ""
	echo "📁 dist/"
	for zip in dist/*.zip; do
		echo "   • $(basename "$zip") ($(du -h "$zip" | cut -f1))"
	done
	echo ""
	exit 0
fi
