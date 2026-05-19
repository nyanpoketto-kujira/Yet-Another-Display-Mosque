# AGENTS.md — Al-Ye'AnDiMo (Vibe Mosque Display)

## Tech stack

- **Svelte 5** (Runes mode forced in `svelte.config.js`)
- **SvelteKit** with `@sveltejs/adapter-node`
- **TailwindCSS v4** (`@import 'tailwindcss'` — not `@tailwind` directives)
- **pnpm** (only-built-dependencies: esbuild)
- **Adhan** (prayer time calc, SSR noExternal) + **Lucide Svelte** (SSR noExternal)

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Vite dev server (ignores `data/` changes in watch) |
| `pnpm build` | Vite build → `build/` (Node adapter output) |
| `bash build.sh` | Full runner build: `pnpm build` → copies to `runner/linux/` and `runner/windows/` with start scripts |
| `pnpm check` | `svelte-kit sync && svelte-check` (must run together) |
| `pnpm lint` | `prettier --check . && eslint .` |
| `pnpm format` | `prettier --write .` |
| `pnpm install` | Install deps |

**No pre-commit hooks, no CI, no tests.**

## Key paths

- `data/settings.json` — single-file JSON persistence (gitignored, written server-side)
- `static/uploads/` — uploaded background images (gitignored)
- `src/lib/server/events.ts` — in-memory SSE pub/sub singleton
- `runner/linux/` / `runner/windows/` — build.sh output (portable Node runner)

## Routes

| Route | Purpose |
|---|---|
| `/` | Main display (fullscreen 1080p, bento grid) |
| `/admin` | Admin panel — default password `vibe-masjid`, auth in `sessionStorage('admin-yadm-auth')` |
| `/kas` | Cash management page |
| `/api/settings` | GET/POST JSON settings |
| `/api/upload` | POST upload / DELETE background images |
| `/api/events` | SSE endpoint (keepalive ping every 20s) |

## Architecture quirks

- **State**: Svelte 5 runes (`$state`, `$derived`, `$effect`) in `.svelte.ts` files (`prayer.svelte.ts`, `settings.svelte.ts`) — client-only (`browser` guard)
- **Real-time**: Settings `load()` on mount + SSE `/api/events` triggers `load()` on `'update'` message
- **Prayer modes**: `normal → preadzan → iqomah → sholat` (Friday adds `khutbah` mode); debug overrides via `?vibe=debug` + press `d`
- **Themes**: `vibe` (dynamic by time of day), `modern`, `classic`, `ocean`, `sunset` — CSS classes in `+page.svelte`
- **SvelteKit sync** needed after route/type changes (`pnpm prepare` or `pnpm check`)
- **Prettier**: tabs, single quotes, no trailing commas, 100 print width
- **ESLint**: `no-undef` off (TypeScript handles it)
