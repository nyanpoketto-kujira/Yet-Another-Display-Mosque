# YADM (Yet Another Display Mosque)

A modern, vibe-centric mosque display for 1080p screens.

## Features
- **Dynamic Prayer Times**: Auto-calculating based on local coordinates.
- **SSE Real-time Updates**: Changes from the admin panel reflect instantly.
- **Scale-Independent Layout**: Uses `vh` and `clamp()` for perfect scaling.
- **Background Slideshow**: Support for custom image uploads.
- **Kas Display**: Real-time transaction history (Pemasukan/Pengeluaran).
- **Friday Mode**: Special Khathib overlay on Fridays.

## Tech Stack
- SvelteKit (Runes/Svelte 5)
- TailwindCSS
- Lucide Icons
- SSE (Server-Sent Events)

## Developing
```bash
pnpm install
pnpm dev
```