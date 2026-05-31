#!/bin/bash
set -e

# ============================================
# Al-Ye'AnDiMo — Installer untuk Android TV
# ============================================

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Al-Ye'AnDiMo — Instalasi Android   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# Cek Termux
if [ ! -d "/data/data/com.termux" ] && [ ! -d "/data/data/com.termux.fdroid" ]; then
    echo -e "${RED}❌ Bukan di Termux!${NC}"
    echo "Script ini khusus untuk Android TV via Termux."
    echo "Download Termux dari F-Droid: https://f-droid.org/packages/com.termux/"
    exit 1
fi

echo -e "${YELLOW}📦 Menginstall Node.js...${NC}"
pkg update -y
pkg install nodejs -y
echo -e "${GREEN}✅ Node.js $(node -v) terinstall${NC}"

# Buat folder
YADM_DIR="$HOME/yadm"
BACKUP_DIR="$YADM_DIR/backup"
mkdir -p "$YADM_DIR" "$BACKUP_DIR"
echo -e "${GREEN}✅ Folder $YADM_DIR siap${NC}"

# Download rilis terbaru (GANTI URL_INI dengan URL release sebenarnya)
RELEASE_URL="https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases/latest/download/yadm-android.zip"
RELEASE_FILE="$YADM_DIR/release.zip"

echo -e "${YELLOW}⬇️  Mendownload rilis terbaru...${NC}"
if curl -L --fail -o "$RELEASE_FILE" "$RELEASE_URL"; then
    echo -e "${GREEN}✅ Download selesai${NC}"
else
    echo -e "${RED}❌ Gagal download. Cek URL: ${RELEASE_URL}${NC}"
    echo "Ganti URL_RELEASE di script ini dengan URL release yang benar."
    exit 1
fi

# Ekstrak
echo -e "${YELLOW}📂 Mengekstrak...${NC}"
unzip -o "$RELEASE_FILE" -d "$YADM_DIR/build"
rm -f "$RELEASE_FILE"
echo -e "${GREEN}✅ Ekstrak selesai${NC}"

# Buat start.sh
cat > "$YADM_DIR/start.sh" << 'SCRIPT'
#!/bin/bash
cd ~/yadm
export PORT=3000
export HOST=0.0.0.0
echo "🚀 Al-Ye'AnDiMo mulai..."
node build
SCRIPT
chmod +x "$YADM_DIR/start.sh"

# Auto-start via Termux:Boot (kalau tersedia)
BOOT_DIR="$HOME/.termux/boot"
if [ -d "$HOME/.termux" ]; then
    mkdir -p "$BOOT_DIR"
    cat > "$BOOT_DIR/yadm.sh" << 'BOOT'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/yadm
export PORT=3000
export HOST=0.0.0.0
node build &
BOOT
    chmod +x "$BOOT_DIR/yadm.sh"
    echo -e "${GREEN}✅ Auto-start diaktifkan (Termux:Boot)${NC}"
else
    echo -e "${YELLOW}⚠️  Auto-start tidak diaktifkan."
    echo -e "   Install Termux:Boot dari F-Droid untuk auto-start.${NC}"
fi

# Cari IP Address
IP=$(ip -4 addr show 2>/dev/null | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1)
if [ -z "$IP" ]; then
    IP=$(ifconfig 2>/dev/null | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1)
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        INSTALASI SELESAI! 🎉         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "Jalankan display dengan:"
echo -e "  ${BLUE}cd ~/yadm && bash start.sh${NC}"
echo ""
if [ -n "$IP" ]; then
    echo -e "Setelah jalan, buka Panel Admin di browser:"
    echo -e "  ${BLUE}http://$IP:3000/admin${NC}"
    echo -e "  Password: ${YELLOW}vibe-masjid${NC}"
fi
echo ""
echo -e "Untuk menghentikan: tekan ${YELLOW}Ctrl+C${NC}"
