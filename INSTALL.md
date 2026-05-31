# Panduan Instalasi Al-Ye'AnDiMo

Panduan lengkap memasang display masjid di berbagai perangkat.

## Daftar Isi

- [Android TV (Termux) — Paling Disarankan](#android-tv-termux)
- [Linux (systemd) — PC/Raspberry Pi](#linux-systemd)
- [Windows — PC/Laptop](#windows)
- [Update ke Versi Baru](#update-ke-versi-baru)
  - [v1.1.0+ Auto-Update via Panel Admin](#v110--auto-update-via-panel-admin-rekomendasi)
  - [v1.0.6 ke bawah Script Manual](#v106-ke-bawah--script-manual-untuk-versi-lawas)
- [Troubleshooting](#troubleshooting)

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

### Langkah 4 — Buka di Browser

1. Catat alamat IP dari layar (misal: `192.168.1.10`)
2. Buka browser di HP atau laptop yang terhubung WiFi yang sama
3. Ketik: `http://[IP]:3000` untuk display utama
4. Ketik: `http://[IP]:3000/admin` untuk panel admin
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
# Download dari halaman Releases
# https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases
unzip yadm-linux.zip
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

Download file `yadm-windows.zip` dari halaman Releases, ekstrak ke folder `C:\yadm\`

### Langkah 3 — Jalankan

Double klik `start.bat` di folder `C:\yadm\`

### Langkah 4 — Buka di Browser

Buka `http://localhost:3000` untuk display
Buka `http://localhost:3000/admin` untuk panel admin (password: `vibe-masjid`)

---

## Update ke Versi Baru

Mulai **v1.1.0**, ada dua cara update: Auto-Update via Panel Admin (termudah) atau script manual untuk versi lawas.

---

### 🆕 v1.1.0+ — Auto-Update via Panel Admin (Rekomendasi)

**Tanpa SSH, tanpa terminal, tanpa download manual.**

1. Buka browser, akses Panel Admin: `http://[IP-ANDA]:3000/admin`
2. Login dengan password admin
3. Klik tab **About**
4. Klik tombol **"Periksa Update"**
5. Jika tersedia versi baru, klik **"Update & Restart"**

**Yang terjadi di belakang layar:**
- Server akan mendownload ZIP release dari GitHub
- Backup otomatis: `data/settings.json` + `static/uploads/`
- Build lama diganti dengan yang baru
- Data dipulihkan (setting & uploads tetap aman)
- Server restart otomatis

**Tunggu ~8 detik**, halaman akan reload otomatis. Selesai! 🎉

> **Catatan**: Fitur ini hanya tersedia di **v1.1.0 ke atas**. Pastikan Anda sudah menjalankan minimal v1.1.0. Cek versi saat ini di Panel Admin → tab About.

---

### v1.0.6 ke bawah — Script Manual (Untuk Versi Lawas)

Jika Anda masih menggunakan YADM versi **sebelum 1.1.0**, gunakan script update manual:

```bash
cd ~/yadm
bash scripts/update.sh
```

**Atau lakukan manual:**

1. Backup folder `data/` dan `static/uploads/` dulu
2. Download ZIP versi baru dari halaman [Releases](https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases)
3. Ekstrak ZIP, copy folder `build/` yang baru
4. Restore `data/settings.json` dan `static/uploads/`
5. Restart aplikasi (matikan & jalankan ulang `start.sh`)

> **Rekomendasi**: Jika masih di v1.0.6, update dulu ke v1.1.0 (manual sekali). Selanjutnya bisa pakai auto-update.

---

## Troubleshooting

### Layar putih/blank

Jalankan ulang aplikasi. Kalau masih, cek console error di browser (F12).

### Port 3000 sudah dipakai

Edit `start.sh`, ganti `PORT=3000` jadi `PORT=8080` atau port lain.

### Password admin lupa

Buka file `data/settings.json`, cari `adminPassword`, ganti nilainya.

### Waktu sholat tidak sesuai

Cek setting Latitude/Longitude di Panel Admin → tab Umum → Koordinat Lokasi.

### Tidak bisa connect dari HP

Pastikan TV dan HP dalam WiFi yang sama. Cek IP address di termux dengan: `ip addr show`

---

## Lisensi

MIT — Silakan gunakan dan sebarkan untuk kemaslahatan umat.
