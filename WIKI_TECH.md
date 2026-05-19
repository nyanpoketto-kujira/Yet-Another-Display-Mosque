# 🏗️ Ringkasan Teknis (Technical Overview)

Bagian ini menjelaskan arsitektur sistem dan bagaimana komponen-komponen utama saling berinteraksi.

## 📡 Sinkronisasi Real-Time (SSE)

YADM menggunakan **Server-Sent Events (SSE)** untuk menjaga sinkronisasi antara **Panel Admin** dan **Main Display**. Berbeda dengan _polling_ atau _websocket_, SSE lebih ringan dan searah (Server ke Client), sangat cocok untuk display pasif seperti TV Masjid.

- **Endpoint**: `/api/events`
- **Mekanisme**:
  1. Saat pengaturan diubah di `/admin`, admin memanggil `POST /api/settings`.
  2. Server memperbarui `data/settings.json` dan memicu `events.ts`.
  3. `events.ts` mengirimkan payload `"reload"` ke semua Main Display yang terhubung.
  4. Main Display menerima event dan memanggil `settings.load()` untuk memperbarui state tanpa refresh halaman.

## 🔋 State Management (Svelte 5 Runes)

Sistem ini sepenuhnya menggunakan **Svelte 5 Runes** (`$state`, `$derived`, `$effect`) untuk manajemen state:

- **SettingsStore**: (`src/lib/settings.svelte.ts`) Mengelola konfigurasi aplikasi (lat/lng, tema, teks berjalan). Data disimpan secara persisten di disk (JSON).
- **PrayerService**: (`src/lib/prayer.svelte.ts`) Mengelola waktu saat ini, perhitungan jadwal sholat (melalui `adhan`), dan transisi mode display.

## 💾 Persistensi Data

Semua pengaturan disimpan dalam format JSON di folder `data/settings.json`.

- **Upload Gambar**: Aset gambar latar belakang disimpan di folder `static/uploads/` dan didaftarkan di dalam array `backgrounds` di `settings.json`.
- **Manajemen Kas**: Transaksi kas disimpan sebagai array objek di dalam `settings.json` untuk kemudahan backup (cukup salin satu file).

## 🎨 Tema & Gaya (TailwindCSS)

Tampilan visual dikontrol melalui class Tailwind yang dinamis:

- Variabel `vibe` di `PrayerService` menentukan warna gradasi latar belakang berdasarkan waktu (Subuh, Pagi, Siang, dll).
- Tema besar (`vibe`, `modern`, `classic`, dll) mengubah struktur layout dan font secara keseluruhan di `+layout.svelte`.
