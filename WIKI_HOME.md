# 🕋 YADM (Yet Another Display Mosque) Wiki

Selamat datang di Wiki teknis **YADM**. Proyek ini adalah sistem display informasi masjid modern yang dibangun dengan **Svelte 5** dan **SvelteKit**.

## 📖 Navigasi Wiki

1. [Ringkasan Teknis](./Technical-Overview.md) - Cara kerja sistem, SSE, dan state management.
2. [Dokumentasi API](./API-Documentation.md) - Endpoint yang tersedia untuk integrasi eksternal.
3. [Panduan Pengembang](./Developer-Guide.md) - Cara setup environment, build, dan berkontribusi.
4. [Logika Jadwal Sholat](./Prayer-Logic.md) - Detail kalkulasi waktu sholat dan mode display.

---

## 🚀 Visi Proyek

YADM dirancang untuk memberikan tampilan yang "vibe-centric" (estetik dan menenangkan) namun tetap fungsional dan mudah dikelola bahkan oleh orang awam melalui Panel Admin yang responsif.

### Fitur Unggulan:

- **Zero-Refresh Sync**: Menggunakan SSE (Server-Sent Events) agar perubahan di Admin langsung muncul di TV.
- **Runes Power**: Memanfaatkan Svelte 5 Runes untuk reaktivitas yang super cepat dan kode yang bersih.
- **Offline First**: Setelah koordinat diatur, sistem bisa berjalan tanpa internet (jadwal dihitung lokal).
