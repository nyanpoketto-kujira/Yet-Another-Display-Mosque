# 🕌 Panduan Instalasi Al-Ye'AnDiMo

Panduan lengkap memasang display masjid di berbagai perangkat.

## 📋 Daftar Isi

- [Quick Start (3 Menit)](#quick-start-3-menit)
- [Android TV (Termux)](#android-tv-termux)
- [Linux (systemd)](#linux-systemd)
- [Windows](#windows)
- [Setup Autorun & Mode Kiosk](#setup-autorun--mode-kiosk)
- [Pintasan Keyboard](#pintasan-keyboard)
- [Pengaturan Display (Panel Admin)](#pengaturan-display-panel-admin)
- [Update ke Versi Baru](#update-ke-versi-baru)
- [Troubleshooting](#troubleshooting)
- [Lisensi](#lisensi)

---

## Quick Start (3 Menit)

Cara tercepat untuk menjalankan YADM di PC/Laptop.

### Yang Dibutuhkan

- PC/Laptop dengan **Windows 10/11** atau **Linux**
- Koneksi internet
- [Node.js v20+](https://nodejs.org/) (download & install dulu jika belum ada)

### Langkah 1 — Download

1. Buka halaman [Releases](https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases)
2. Download ZIP sesuai OS Anda:
   - **Linux**: `yadm-*-linux-x64.zip`
   - **Windows**: `yadm-*-windows-x64.zip`

### Langkah 2 — Ekstrak

Ekstrak ZIP ke folder yang mudah diakses:

- **Windows**: `C:\yadm\`
- **Linux**: `~/yadm/`

### Langkah 3 — Jalankan

- **Windows**: Klik dua kali `start.bat`
- **Linux**: Buka terminal, jalankan `./start.sh`

### Langkah 4 — Buka di Browser

- Display utama: `http://localhost:3000`
- Panel Admin: `http://localhost:3000/admin`
- Password default: `vibe-masjid`

**Selesai! 🎉** Lanjut ke [Pengaturan Display](#pengaturan-display-panel-admin) untuk mengatur jadwal sholat dan konten.

---

## Android TV (Termux)

**Cocok untuk:** Mibox, Xiaomi TV Stick, Android TV box lainnya.

### Yang Dibutuhkan

- Android TV box dengan koneksi internet
- Remote atau keyboard USB
- Aplikasi Termux dari F-Droid (bukan Play Store!)
- Aplikasi Termux:Boot (opsional, untuk auto-start)

### Langkah 1 — Install Termux

1. Buka browser di Android TV
2. Download Termux dari F-Droid:
   
   https://f-droid.org/packages/com.termux/
3. Klik "Download APK" dan install
4. Buka aplikasi Termux

### Langkah 2 — Install Aplikasi

Copy paste perintah ini ke Termux (tekan dan tahan untuk paste):

```bash
curl -sL https://raw.githubusercontent.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/main/scripts/install-termux.sh | bash
```

Program akan otomatis menginstall semua yang dibutuhkan.

### Langkah 3 — Jalankan

Setelah selesai, jalankan:

```bash
cd ~/yadm && bash start.sh
```

### Langkah 4 — Akses dari Perangkat Lain

1. Catat alamat IP Android TV (cek di pengaturan jaringan)
2. Buka browser di HP/laptop yang terhubung WiFi yang sama
3. Display utama: `http://[IP]:3000`
4. Panel Admin: `http://[IP]:3000/admin`
5. Password: `vibe-masjid`

### (Opsional) Auto-start Setiap Kali TV Menyala

1. Install aplikasi **Termux:Boot** dari F-Droid
2. Buka Termux:Boot sekali (nanti akan otomatis)
3. Selesai — setiap kali TV dinyalakan, YADM akan jalan sendiri

---

## Linux (systemd)

**Cocok untuk:** PC Linux, Raspberry Pi, NUC, VPS.

### Langkah 1 — Install Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs

# Arch Linux
sudo pacman -S nodejs-lts-iron

# Raspberry Pi OS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs
```

### Langkah 2 — Download & Ekstrak

```bash
mkdir ~/yadm && cd ~/yadm
# Download ZIP dari halaman Releases, lalu:
unzip yadm-*-linux-x64.zip
```

### Langkah 3 — Jalankan

```bash
cd ~/yadm
bash start.sh
```

### (Opsional) Auto-start dengan systemd

```bash
sudo cp yadm.service /etc/systemd/system/
sudo systemctl enable yadm.service
sudo systemctl start yadm.service
```

---

## Windows

**Cocok untuk:** PC/Laptop Windows.

### Langkah 1 — Install Node.js

Download dan install Node.js dari https://nodejs.org (versi 22 LTS)

### Langkah 2 — Download & Ekstrak

Download file `yadm-*-windows-x64.zip` dari halaman Releases, ekstrak ke folder `C:\yadm\`

### Langkah 3 — Jalankan

Double klik `start.bat` di folder `C:\yadm\`

### Langkah 4 — Buka di Browser

- Display utama: `http://localhost:3000`
- Panel Admin: `http://localhost:3000/admin`
- Password: `vibe-masjid`

---

## Setup Autorun & Mode Kiosk

Agar sistem benar-benar otomatis — komputer langsung membuka browser Fullscreen (Kiosk) saat menyala.

### 🪟 Di Windows

1. **Matikan Power Saving**: Buka `Power & Sleep Settings` → Atur **Screen** dan **Sleep** ke **Never**
2. **Buat Shortcut Kiosk**:
   - Cari Chrome/Edge di Start Menu → Klik kanan → Open file location
   - Klik kanan icon Chrome → **Send to Desktop (create shortcut)**
   - Di Desktop, klik kanan shortcut tersebut → **Properties**
   - Di kolom **Target**, tambahkan di paling ujung:
     ` --kiosk --edge-kiosk-type=fullscreen http://localhost:3000`
3. **Autorun**: Tekan `Win+R` → Ketik `shell:startup` → Pindahkan shortcut tadi ke folder yang terbuka

### 🐧 Di Linux

Di Linux kita butuh dua tahap: server di background + browser otomatis di desktop.

#### 1. Jalankan Server di Background (Systemd)

```bash
sudo nano /etc/systemd/system/yadm.service
```

Isi dengan (Sesuaikan `User` dan `WorkingDirectory`):

```ini
[Unit]
Description=YADM Server
After=network.target

[Service]
Type=simple
User=NAMA_USER_ANDA
WorkingDirectory=/home/NAMA_USER_ANDA/YADM
ExecStart=/home/NAMA_USER_ANDA/YADM/start.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

Aktifkan:

```bash
sudo systemctl enable yadm && sudo systemctl start yadm
```

#### 2. Jalankan Browser Otomatis (XDG Autostart)

```bash
mkdir -p ~/.config/autostart
nano ~/.config/autostart/yadm-browser.desktop
```

Isi dengan:

```ini
[Desktop Entry]
Type=Application
Name=YADM Browser
Exec=chromium-browser --kiosk --incognito http://localhost:3000
# Jika pake Chrome, ganti chromium-browser jadi google-chrome
X-GNOME-Autostart-enabled=true
```

#### 3. Tips Tambahan

- **Sembunyikan Kursor**: `sudo apt install unclutter` lalu tambahkan `@unclutter -idle 0.1 -root` di startup
- **Matikan Screen Sleep**: Tambahkan di `.xinitrc` atau autostart:
  ```bash
  xset s off
  xset -dpms
  xset s noblank
  ```

---

## ⌨️ Pintasan Keyboard

Saat dalam Mode Kiosk (Fullscreen), Anda tidak akan melihat tombol close atau taskbar.

| Perintah | Windows | Linux |
| :------- | :------ | :---- |
| **Keluar dari Fullscreen** | `F11` | `F11` |
| **Tutup Browser** | `Alt + F4` | `Ctrl + W` |
| **Task Manager (jika hang)** | `Ctrl + Shift + Esc` | `Ctrl + Alt + T` |
| **Refresh Tampilan** | `Ctrl + R` | `Ctrl + R` |
| **Buka Panel Admin** | Ketik `/admin` di ujung URL | - |

---

## ⚙️ Pengaturan Display (Panel Admin)

1. Buka browser, akses `http://localhost:3000/admin`
2. **Kata Sandi Default**: `vibe-masjid` — segera ganti di tab **Umum**
3. Atur **Koordinat Lokasi (Lat/Lng)** agar jadwal sholat akurat (cek di Google Maps)
4. Atur **Koreksi Waktu** jika jam display berbeda dengan jam masjid
5. Upload **Background Gambar** di tab **Tampilan**
6. Atur **Teks Berjalan** untuk pengumuman atau hadits

---

## 🔄 Update ke Versi Baru

### 🆕 v1.1.0+ — Auto-Update via Panel Admin (Termudah)

**Tanpa SSH, tanpa terminal, tanpa download manual.**

1. Buka Panel Admin → tab **About**
2. Klik **"Periksa Update"**
3. Jika ada versi baru, klik **"Update & Restart"**

**Proses otomatis yang terjadi:**
- ✅ Download ZIP versi baru dari GitHub
- ✅ Backup data pengaturan & gambar upload
- ✅ Pasang build baru
- ✅ Pulihkan data (setting & uploads tetap aman)
- ✅ Restart server

Tunggu ~8 detik, halaman akan reload otomatis. Selesai! 🎉

### v1.0.6 ke bawah — Script Manual (Untuk Versi Lawas)

Jika masih menggunakan YADM **sebelum 1.1.0**, update manual dulu:

```bash
cd ~/yadm
bash scripts/update.sh
```

**Atau lakukan manual:**
1. Backup folder `data/` dan `static/uploads/`
2. Download ZIP versi baru dari [Releases](https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases)
3. Ekstrak ZIP, copy folder `build/` yang baru
4. Restore `data/settings.json` dan `static/uploads/`
5. Restart aplikasi

> **Rekomendasi**: Update dulu ke v1.1.0 (manual sekali). Selanjutnya bisa pakai auto-update.

---

## 🛠️ Troubleshooting

### Jadwal sholat tidak muncul/salah?

- Pastikan koneksi internet tersedia (dibutuhkan saat pertama set koordinat)
- Cek Lat/Lng di Panel Admin → tab Umum → Koordinat Lokasi
- Cek jam sistem komputer (harus sesuai WIB/WITA/WIT)

### Layar putih/blank?

Jalankan ulang aplikasi. Kalau masih error, cek console browser (F12) atau lihat pesan error di terminal.

### Port 3000 sudah dipakai?

Edit `start.sh` atau `start.bat`, ganti `PORT=3000` jadi `PORT=8080` atau port lain.

### Password admin lupa?

Buka file `data/settings.json`, cari `adminPassword`, ganti nilainya, lalu restart server.

### Tidak bisa akses dari HP?

- Pastikan TV dan HP dalam jaringan WiFi yang sama
- Cek IP address: di Termux ketik `ip addr show`, di Linux `ip a`
- Pastikan tidak ada firewall yang memblokir port 3000

### Halaman 500 Internal Error?

- Cek terminal tempat YADM berjalan — ada pesan error?
- Pastikan folder `data/` dan file `settings.json` ada
- Pastikan Node.js versi 20 ke atas

### Background tidak muncul setelah upload?

- Refresh halaman atau cek Panel Admin → tab Tampilan
- Pastikan ukuran file tidak terlalu besar (disarankan di bawah 2MB)

### Update gagal / error?

- Pastikan server punya koneksi internet untuk download ZIP
- Cek folder `data/` dan `static/uploads/` masih ada (backup otomatis dibuat sebelum update)
- Coba refresh halaman admin, lalu coba lagi
- Jika terus gagal, lakukan update manual (download ZIP dari Releases)

---

## 📝 Lisensi

MIT — Silakan gunakan dan sebarkan untuk kemaslahatan umat.
