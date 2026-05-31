#!/bin/bash
set -e

# ============================================
# Al-Ye'AnDiMo — Update Manual
# ============================================
#
# ⚠️  CATATAN PENTING:
#  Script ini untuk versi SEBELUM 1.1.0.
#  Pengguna v1.1.0+ bisa update langsung dari:
#    Panel Admin → tab About → Periksa Update

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m'

YADM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$YADM_DIR/backup-update-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Al-Ye'AnDiMo — Update Manual       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""
echo "Folder aplikasi: $YADM_DIR"
echo ""

# Validasi folder
if [ ! -f "$YADM_DIR/package.json" ] && [ ! -d "$YADM_DIR/build" ]; then
    echo -e "${RED}❌ Bukan folder YADM. Jalankan dari root proyek.${NC}"
    exit 1
fi

# Backup
echo -e "${YELLOW}📦 Backup data...${NC}"
mkdir -p "$BACKUP_DIR"
if [ -f "$YADM_DIR/data/settings.json" ]; then
    cp "$YADM_DIR/data/settings.json" "$BACKUP_DIR/"
    echo "   ✅ settings.json"
fi
if [ -f "$YADM_DIR/data/settings.json.bak" ]; then
    cp "$YADM_DIR/data/settings.json.bak" "$BACKUP_DIR/"
fi
if [ -d "$YADM_DIR/static/uploads" ] && [ "$(ls -A $YADM_DIR/static/uploads 2>/dev/null)" ]; then
    cp -r "$YADM_DIR/static/uploads" "$BACKUP_DIR/"
    echo "   ✅ Uploads ($(ls $YADM_DIR/static/uploads | wc -l) file)"
fi
echo -e "${GREEN}✅ Backup selesai → $BACKUP_DIR${NC}"
echo ""

# Download rilis baru (GANTI URL_INI)
RELEASE_URL="https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases/latest/download/yadm-update.zip"
echo -e "${YELLOW}⬇️  Download rilis terbaru...${NC}"
curl -L --fail -o /tmp/yadm-update.zip "$RELEASE_URL" || {
    echo -e "${RED}❌ Gagal download.${NC}"
    exit 1
}
echo -e "${GREEN}✅ Download selesai${NC}"

# Backup build lama
if [ -d "$YADM_DIR/build" ]; then
    mv "$YADM_DIR/build" "$BACKUP_DIR/build-old"
    echo "   Build lama dibackup"
fi

# Ekstrak
echo -e "${YELLOW}📂 Mengekstrak build baru...${NC}"
unzip -o /tmp/yadm-update.zip -d "$YADM_DIR/build"
rm -f /tmp/yadm-update.zip
echo -e "${GREEN}✅ Build baru siap${NC}"
echo ""

# Restore data
echo -e "${YELLOW}♻️  Restore data...${NC}"
if [ -f "$BACKUP_DIR/settings.json" ]; then
    cp "$BACKUP_DIR/settings.json" "$YADM_DIR/data/settings.json"
    echo "   ✅ settings.json direstore"
fi
if [ -d "$BACKUP_DIR/uploads" ]; then
    cp -r "$BACKUP_DIR/uploads/"* "$YADM_DIR/static/uploads/" 2>/dev/null || true
    echo "   ✅ Uploads direstore"
fi
echo ""

# Restart (kalau pakai systemd)
if systemctl is-active --quiet yadm.service 2>/dev/null; then
    echo -e "${YELLOW}🔄 Merestart service...${NC}"
    systemctl restart yadm.service
    echo -e "${GREEN}✅ Service di-restart${NC}"
else
    echo -e "${YELLOW}⚠️  Service systemd tidak terdeteksi.${NC}"
    echo "   Restart manual:"
    echo "     ${BLUE}cd $YADM_DIR && bash start.sh${NC}"
    echo ""
    echo "   Atau kalau pake Termux, tinggal tutup dan buka lagi."
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         UPDATE SELESAI! 🎉           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo -e "Data aman di: ${BLUE}$BACKUP_DIR${NC}"
echo ""
