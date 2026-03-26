# 🕋 Yet Another Display Mosque (YADM)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-Svelte_5-orange.svg)

**YADM** adalah sistem display informasi masjid modern yang dirancang khusus untuk layar 1080p. Dengan fokus pada estetika "vibe-centric" dan kemudahan pengelolaan via Panel Admin yang intuitif.

## ✨ Fitur Utama

- 🕋 **Jadwal Sholat Otomatis**: Kalkulasi presisi berdasarkan koordinat lokasi (Lat/Lng).
- ⚡ **Real-time Sync (SSE)**: Perubahan di Panel Admin langsung muncul di layar tanpa *refresh*.
- 🎨 **Tema Dinamis**: Pilihan tema (Modern, Classic, Ocean, Sunset, dll) yang menyesuaikan suasana.
- 🖼️ **Slideshow Background**: Unggah foto kegiatan masjid atau pemandangan dengan mudah.
- 💰 **Manajemen Kas**: Pencatatan pemasukan & pengeluaran yang transparan.
- 📜 **Informasi & Teks Berjalan**: Sampaikan pengumuman atau hadits dengan gaya elegan.
- 🕌 **Mode Jum'at**: Tampilan khusus untuk nama Khathib dan durasi khutbah.

## 📸 Galeri Tampilan

<details>
<summary><b>✨ Klik untuk melihat galeri tampilan (Main Display & Admin Panel)</b></summary>

### 📺 Main Display (Tampilan TV)
Tampilan utama yang elegan dan informatif untuk jamaah di masjid.

| Tampilan Utama | Mode Azan |
| :---: | :---: |
| ![Main Display](img/main-display.png) | ![Azan](img/main-display-azan.png) |
| *Dashboard Utama* | *Pemberitahuan Waktu Azan* |

| Mode Iqomah | Mode Shalat |
| :---: | :---: |
| ![Iqomah](img/main-display-iqomah.png) | ![Shalat](img/main-display-shalat.png) |
| *Hitung Mundur Iqomah* | *Layar Instruksi Shalat* |

| Mode Jum'at | Mode Khutbah |
| :---: | :---: |
| ![Jumat](img/main-display-jumat.png) | ![Khutbah](img/main-display-khutbah.png) |
| *Info Khathib & Muazin* | *Timer Khutbah Jum'at* |

### 📱 Panel Admin (Pengaturan)
Kelola semua konten display dengan mudah melalui HP atau PC.

| Desktop (Admin) | Mobile (Admin) |
| :---: | :---: |
| ![Admin PC](img/admin-pc-general.png) | ![Admin HP](img/admin-hp-general.jpg) |
| *Pengaturan via Desktop* | *Responsif di HP* |

| Manajemen Kas | Layar Terkunci |
| :---: | :---: |
| ![Kas](img/admin-pc-kas.png) | ![Lock](img/admin-pc-lock.png) |
| *Transparansi Dana Umat* | *Keamanan Akses Panel* |

</details>

## 🛠️ Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (Runes)
- **Meta-framework**: [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **Communication**: Server-Sent Events (SSE)

## 🚀 Panduan Instalasi & Pengaturan

Untuk pengurus masjid yang ingin memasang sistem ini di layar display, silakan baca panduan lengkapnya di:

👉 **[PANDUAN INSTALASI & SETUP (MOSQUE_INSTALL.md)](MOSQUE_INSTALL.md)**

## 📦 Download Rilisan Siap Pakai

Jika Anda tidak ingin melakukan build dari source code, Anda bisa mengunduh paket runner yang sudah jadi untuk Linux atau Windows di halaman **[Releases](https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases)**.

## 🛠️ Pengembangan (Untuk Developer)

1. **Clone Repository**
   ```bash
   git clone https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque.git
   cd Yet-Another-Display-Mosque
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Jalankan Mode Development**
   ```bash
   pnpm dev
   ```

4. **Build Paket Runner**
   ```bash
   bash build.sh
   ```

## 📝 Lisensi

Proyek ini berada di bawah lisensi MIT. Silakan gunakan dan modifikasi untuk kemaslahatan umat.

---
Dibuat dengan ❤️ oleh [nyanpoketto-kujira](https://github.com/nyanpoketto-kujira)
