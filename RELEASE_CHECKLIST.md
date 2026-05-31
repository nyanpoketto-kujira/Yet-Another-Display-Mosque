# 🚀 Rilis v1.1.0 — Checklist untuk AI dengan akses terminal

Semua file sudah ready di working directory. Tinggal jalanin perintah di bawah urut.

---

## 1. Commit

```bash
cd /home/nyanpoketto/project/vibe-mosque-display

git add .
git commit -m "feat: auto-update system, CSP hardening, and documentation overhaul

- Add POST /api/update endpoint for automatic updates from GitHub Releases
- Add 'Update & Restart' button in Admin -> About tab
- Add test-build.sh for build verification + smoke tests
- Add CSP headers (X-Content-Type-Options, frame-ancestors, script-src)
- Fix version comparison: switch from string equality to numeric semver
- Clean up old ZIP artifacts and update .gitignore
- Update all documentation (README, INSTALL, INSTALL, WIKI)
- Remove old yadm-linux.zip and yadm-windows.zip from git tracking"
```

## 2. Tag

```bash
git tag -a v1.1.0 -m "v1.1.0 — Auto-Update & Security"
```

## 3. Push ke GitHub

```bash
git push origin master --tags
```

## 4. Build ZIP (buat diupload ke Release)

```bash
bash build.sh
```

Hasil: `dist/yadm-v1.1.0-linux-x64.zip` dan `dist/yadm-v1.1.0-windows-x64.zip`

## 5. Buat GitHub Release (pake gh CLI)

```bash
# Create the release
gh release create v1.1.0 \
  --title "v1.1.0 — Auto-Update & Security" \
  --notes "**Bismillah! Rilis v1.1.0 — Auto-Update, Keamanan CSP, dan Perbaikan Lainnya**

Alhamdulillah, rilis besar dengan fitur auto-update yang memungkinkan pengurus masjid memperbarui sistem langsung dari Panel Admin tanpa perlu SSH atau terminal.

### Fitur Baru 🆕
- **Auto-Update via Panel Admin**: Update versi langsung dari tab About — download ZIP, backup data, restart server, semua otomatis.
- **Perbandingan Versi Pintar**: Sekarang pake semver numeric, jadi \`v1.1.0\` nggak dianggap lebih lama dari \`v1.0.6\`.
- **Content Security Policy (CSP)**: Header keamanan diperkuat untuk proteksi XSS.
- **Status API**: Endpoint \`/api/status\` untuk monitoring kesehatan server.

### Perbaikan & Perubahan 🔧
- Perbaikan perbandingan versi di update checker — dulu string equality, sekarang numeric semver.
- Penambahan \`test-build.sh\` — build verification + smoke test 7 endpoint otomatis.
- Dokumentasi diperbarui: README (ID/EN), INSTALL, INSTALL, WIKI.
- Project dibersihkan: 8 file ZIP lama (~28 MB) dihapus, .gitignore diperkuat.

### Cara Update
**v1.1.0+ (pengguna baru)**: Download ZIP dari halaman Releases, ekstrak, jalankan \`start.sh\`.

**Pengguna lama**: Buka Panel Admin → tab **About** → **Periksa Update** → **Update & Restart**.

**Pre-v1.1.0**: \`bash scripts/update.sh\` atau download manual dari Releases.

---

_Jazakallahu Khairan. Semoga bermanfaat untuk umat._ 🕋✨" \
  dist/yadm-v1.1.0-linux-x64.zip \
  dist/yadm-v1.1.0-windows-x64.zip
```

## 6. Verifikasi

Cek halaman Release: https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases/tag/v1.1.0

## Rollback (kalo error)

```bash
git tag -d v1.1.0
git push origin --delete v1.1.0
```

---

## File yang berubah (14 file)

| File | Perubahan |
|------|-----------|
| `package.json` | version → 1.1.0 |
| `build.sh` | VERSION → v1.1.0 |
| `src/hooks.server.ts` | +CSP headers |
| `src/routes/api/update/+server.ts` | **BARU** — auto-update endpoint |
| `test-build.sh` | **BARU** — build + smoke test |
| `src/routes/admin/+page.svelte` | +About tab update, semver fix, v1.1.0 |
| `.gitignore` | +auto-update, backup, log patterns |
| `README.md` | v1.1.0 docs |
| `README.en.md` | v1.1.0 docs |
| `INSTALL.md` | restruktur update section |
| `INSTALL.md` | +auto-update langkah 5 |
| `scripts/update.sh` | +banner pre-1.1.0 |
| `WIKI_HOME.md` | fix broken links |
| `WIKI_PRAYER.md` | moment-hijri → Intl.DateTimeFormat |
