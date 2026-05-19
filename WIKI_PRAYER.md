# 🕌 Logika Jadwal Sholat (Prayer Logic)

Bagian ini menjelaskan bagaimana YADM menghitung jadwal sholat dan mengelola transisi mode display.

## 🧮 Algoritma Perhitungan

YADM menggunakan library [adhan-js](https://github.com/batoulapps/adhan-js) dengan konfigurasi berikut:

- **Metode Kalkulasi**: `CalculationMethod.Singapore()` (Sesuai standar MABIMS yang digunakan di Indonesia, Malaysia, Brunei, dan Singapura).
- **Koordinat**: Diambil dari `settings.lat` dan `settings.lng`.
- **Koreksi Waktu (Offset)**: Memberikan fleksibilitas bagi pengurus masjid jika jadwal display sedikit berbeda dengan jadwal lokal resmi (misal: Bimas Islam). Offset dapat diatur per waktu sholat (dalam menit).

## 🕒 Mode Display (Transisi Layar)

Layar utama (`Main Display`) secara otomatis berpindah mode berdasarkan waktu sholat saat ini:

| Mode          | Kondisi Pemicu                                         | Tampilan                                  |
| :------------ | :----------------------------------------------------- | :---------------------------------------- |
| **Normal**    | Waktu di luar jadwal sholat/pre-adzan.                 | Slideshow, Jadwal Sholat, Info Kas.       |
| **Pre-Adzan** | `Settings.preAdzanDuration` menit sebelum Adzan.       | Countdown besar menuju waktu sholat.      |
| **Iqomah**    | Setelah Adzan hingga `Settings.iqomah` menit.          | Hitung mundur Iqomah (siap-siap sholat).  |
| **Sholat**    | Setelah Iqomah hingga `Settings.sholatDuration` menit. | Layar instruksi (HP Mati, Luruskan Shaf). |
| **Khutbah**   | Khusus hari Jum'at saat Adzan Dzuhur.                  | Nama Khathib dan Timer durasi khutbah.    |

## 📅 Kalender Hijriah

Konversi tanggal Hijriah dilakukan secara dinamis menggunakan library `moment-hijri`. Hal ini memungkinkan penyesuaian tanggal Islam secara akurat tanpa perlu update manual tiap hari.

## 🛠️ Debug & QA (Mode Simulasi)

Developer dapat memicu mode simulasi untuk mengecek tampilan tanpa harus menunggu waktu sholat tiba:

1. Masuk ke Panel Admin.
2. Gunakan **Debug Overlay** (jika diaktifkan di development) untuk mengganti mode atau mempercepat waktu.
3. Gunakan properti `drift` di `settings.json` untuk menyesuaikan jam display dengan jam server jika terjadi sinkronisasi yang buruk.
