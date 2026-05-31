# 🕋 Al-Ye'AnDiMo (Alhamdulillah It's Yet Another Display Mosque)

**Bahasa Indonesia** | [English](README.en.md)

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-Svelte_5-orange.svg)
[![Demo](https://img.shields.io/badge/demo-live-success.svg)](https://al-yeandimo-demo.vercel.app/)

> **🚀 COBA VERSI DEMO NYA DI SINI:** [al-yeandimo-demo.vercel.app](https://al-yeandimo-demo.vercel.app/)

> **⚠️ DISCLAIMER:** Ini bukan "Yet Another Dotfiles Manager". Kami nggak ngurusin `.bashrc` lu, kami ngurusin biar jamaah nggak telat sholat. Al-Ye'AnDiMo adalah solusi display informasi masjid yang estetik, modern, dan gampang diurus.

**Al-Ye'AnDiMo** adalah sistem display informasi masjid "vibe-centric" yang dirancang khusus untuk layar 1080p. Dibangun dengan teknologi terbaru demi kemaslahatan umat.

## ✨ Fitur Utama

- 🕋 **Jadwal Sholat Otomatis**: Kalkulasi presisi berdasarkan koordinat lokasi (Lat/Lng).
- ⚡ **Real-time Sync (SSE)**: Perubahan di Panel Admin langsung muncul di layar tanpa _refresh_.
- 🎨 **Tema Dinamis**: Pilihan tema (Modern, Classic, Ocean, Sunset, dll) yang menyesuaikan suasana.
- 🖼️ **Slideshow Background**: Unggah foto kegiatan masjid atau pemandangan dengan mudah.
- 💰 **Manajemen Kas (BETA)**: Pencatatan pemasukan & pengeluaran yang transparan (Dapat dicoba di build terbaru).
- 📜 **Informasi & Teks Berjalan**: Sampaikan pengumuman atau hadits dengan gaya elegan.
- 🕌 **Mode Jum'at**: Tampilan khusus untuk nama Khathib dan durasi khutbah.
- 🔄 **Auto-Update via Panel Admin**: Update versi langsung dari tab About tanpa perlu SSH/terminal.

## 📸 Galeri Tampilan

<details>
<summary><b>✨ Klik untuk melihat galeri tampilan (Main Display & Admin Panel)</b></summary>

### 📺 Main Display (Tampilan TV)

Tampilan utama yang elegan dan informatif untuk jamaah di masjid.

|            Tampilan Utama             |             Mode Azan              |
| :-----------------------------------: | :--------------------------------: |
| ![Main Display](img/main-display.png) | ![Azan](img/main-display-azan.png) |
|           _Dashboard Utama_           |     _Pemberitahuan Waktu Azan_     |

|              Mode Iqomah               |              Mode Shalat               |
| :------------------------------------: | :------------------------------------: |
| ![Iqomah](img/main-display-iqomah.png) | ![Shalat](img/main-display-shalat.png) |
|         _Hitung Mundur Iqomah_         |        _Layar Instruksi Shalat_        |

|             Mode Jum'at              |               Mode Khutbah               |
| :----------------------------------: | :--------------------------------------: |
| ![Jumat](img/main-display-jumat.png) | ![Khutbah](img/main-display-khutbah.png) |
|       _Info Khathib & Muazin_        |          _Timer Khutbah Jum'at_          |

### 📱 Panel Admin (Pengaturan)

Kelola semua konten display dengan mudah melalui HP atau PC.

|            Desktop (Admin)            |            Mobile (Admin)             |
| :-----------------------------------: | :-----------------------------------: |
| ![Admin PC](img/admin-pc-general.png) | ![Admin HP](img/admin-hp-general.jpg) |
|       _Pengaturan via Desktop_        |           _Responsif di HP_           |

|        Manajemen Kas         |         Layar Terkunci         |
| :--------------------------: | :----------------------------: |
| ![Kas](img/admin-pc-kas.png) | ![Lock](img/admin-pc-lock.png) |
|   _Transparansi Dana Umat_   |     _Keamanan Akses Panel_     |

</details>

## 🆕 Apa yang Baru di v1.1.0

- **🔄 Auto-Update**: Update versi langsung dari Panel Admin → tab About. Tidak perlu SSH/terminal lagi.
- **🔒 Keamanan CSP**: Content Security Policy diperkuat untuk proteksi XSS.
- **⚡ Proses update aman**: Backup data & upload otomatis sebelum update, restore jika ada masalah.
- **📱 Deteksi versi pintar**: Perbandingan semver numeric — tahu persis apakah versi Anda terbaru.

> 🚀 **v1.1.0 adalah rilis dengan fitur auto-update. Mulai sekarang, update bisa dilakukan oleh siapapun, bahkan tanpa pengalaman teknis.**

## 🛠️ Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (Runes)
- **Meta-framework**: [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **Communication**: Server-Sent Events (SSE)

## 🚀 Panduan Instalasi & Pengaturan

Untuk pengurus masjid yang ingin memasang sistem ini di layar display, silakan baca panduan lengkapnya di:

👉 **[PANDUAN INSTALASI & SETUP (MOSQUE_INSTALL.md)](MOSQUE_INSTALL.md)**

## 📦 Download & Instalasi

### Pengguna Baru?
1. Download file ZIP dari **[halaman Releases](https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases)** sesuai OS Anda
2. Ekstrak dan jalankan `start.sh` (Linux) atau `start.bat` (Windows)
3. Buka `http://localhost:3000` di browser

👉 Lihat panduan lengkap → **[INSTALL.md](INSTALL.md)** (cara pasang di Android TV, Linux, Windows)

### Update ke Versi Baru

#### 🆕 v1.1.0+ — Auto-Update via Panel Admin (Termudah)
1. Buka Panel Admin → tab **About**
2. Klik **"Periksa Update"**
3. Jika ada versi baru, klik **"Update & Restart"**
4. Server akan otomatis download, backup data, dan restart

#### v1.0.6 ke bawah — Script Manual
Hanya untuk yang masih pakai versi lawas:
```bash
cd folder-yadm
bash scripts/update.sh
```

### Build dari Source (untuk developer)
1. Clone repo: `git clone https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque.git`
2. Install deps: `pnpm install`
3. Build: `bash build.sh`
4. Hasil ZIP ada di folder `dist/`

## 🏗️ Struktur Folder (Saat Berjalan)

```
├── build/                  # Hasil build SvelteKit (siap jalan)
├── data/
│   └── settings.json       # Data pengaturan (backup otomatis)
├── static/
│   └── uploads/            # Background gambar
├── scripts/
│   ├── install-termux.sh   # Installer Android TV
│   └── update.sh           # Update manual (pre-v1.1.0)
├── yadm.service            # Auto-start Linux (systemd)
├── start.sh / start.bat    # Script menjalankan server
├── INSTALL.md              # Panduan instalasi lengkap
└── README.md               # File ini
```

## 🔒 Keamanan
- Semua aksi admin (POST/DELETE) dilindungi Bearer token
- Password tidak dikirim ke client (disimpan server-side)
- Upload gambar divalidasi magic bytes (hanya JPEG/PNG/WebP)
- Path traversal dicegah
- Atomic write (tmp → rename) — data aman walau listrik padam
- Error boundary — tidak ada blank screen
- Content Security Policy (CSP) — perlindungan dari serangan XSS
- Auto-Update dilindungi Bearer token (sama dengan aksi admin lainnya)

## ⚡ Performa
- **3 level mode grafis**: Penuh / Ringan / Minimal (untuk Android TV box 1-2GB RAM)
- Setelan ada di Panel Admin → tab Umum → Mode Tampilan
- Mode Minimal: tanpa blur, shadow, animasi. Hanya teks & warna solid.

## 📝 Lisensi
Proyek ini berada di bawah lisensi MIT. Silakan gunakan dan modifikasi untuk kemaslahatan umat.

---

Dibuat dengan ❤️ oleh [nyanpoketto-kujira](https://github.com/nyanpoketto-kujira)
