import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';

const GITHUB_OWNER = 'nyanpoketto-kujira';
const GITHUB_REPO = 'Yet-Another-Display-Mosque';

// POST: Download & apply update
export const POST = async ({ request }) => {
	try {
		const { version, zipUrl: providedUrl } = await request.json();

		if (!version || typeof version !== 'string') {
			return json({ error: 'Versi tidak valid' }, { status: 400 });
		}

		const runtimeDir = process.cwd();
		const buildDir = path.join(runtimeDir, 'build');
		const dataDir = path.join(runtimeDir, 'data');
		const staticDir = path.join(runtimeDir, 'static');

		// Verifikasi folder runtime
		if (!fs.existsSync(buildDir)) {
			return json({ error: 'Folder build tidak ditemukan. Pastikan menjalankan dari folder runner.' }, { status: 400 });
		}
		if (!fs.existsSync(dataDir)) {
			return json({ error: 'Folder data tidak ditemukan.' }, { status: 400 });
		}

		// Tentukan URL ZIP
		const zipUrl = providedUrl || `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${version}/yadm-${version}-linux-x64.zip`;

		const tag = version.replace(/[^a-zA-Z0-9._-]/g, '_');
		const zipPath = path.join(runtimeDir, `.update-${tag}.zip`);
		const extractDir = path.join(runtimeDir, `.update-${tag}`);
		const backupDir = path.join(runtimeDir, `.backup-${tag}`);
		const applyScript = path.join(runtimeDir, `.apply-${tag}.sh`);

		// Bersihkan sisa sebelumnya
		for (const p of [zipPath, extractDir, backupDir, applyScript]) {
			if (fs.existsSync(p)) {
				fs.rmSync(p, { recursive: true, force: true });
			}
		}

		// 1. Download ZIP
		console.log(`[Update] Download ${zipUrl}...`);
		const response = await fetch(zipUrl);
		if (!response.ok) {
			throw new Error(`Gagal download (${response.status} ${response.statusText})`);
		}
		const buffer = Buffer.from(await response.arrayBuffer());
		fs.writeFileSync(zipPath, buffer);
		console.log(`[Update] Download selesai (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);

		// 2. Extract
		fs.mkdirSync(extractDir, { recursive: true });
		execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, { stdio: 'pipe', timeout: 30000 });

		// 3. Normalize struktur ZIP (mungkin ter-nest 1 level)
		function findBuildDir(dir: string): string | null {
			const candidate = path.join(dir, 'build');
			if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return dir;
			const items = fs.readdirSync(dir);
			for (const item of items) {
				const full = path.join(dir, item);
				if (fs.statSync(full).isDirectory()) {
					const nested = path.join(full, 'build');
					if (fs.existsSync(nested) && fs.statSync(nested).isDirectory()) {
						// Move contents up
						fs.cpSync(full, dir, { recursive: true });
						fs.rmSync(full, { recursive: true, force: true });
						return dir;
					}
				}
			}
			return null;
		}

		if (!findBuildDir(extractDir)) {
			throw new Error('Struktur ZIP tidak valid: folder build/ tidak ditemukan');
		}

		if (!fs.existsSync(path.join(extractDir, 'build'))) {
			throw new Error('Gagal normalisasi: build/ masih tidak ditemukan');
		}

		// 4. Backup data + uploads
		fs.mkdirSync(backupDir, { recursive: true });
		if (fs.existsSync(path.join(dataDir, 'settings.json'))) {
			fs.copyFileSync(path.join(dataDir, 'settings.json'), path.join(backupDir, 'settings.json'));
		}
		const uploadsDir = path.join(staticDir, 'uploads');
		if (fs.existsSync(uploadsDir)) {
			fs.cpSync(uploadsDir, path.join(backupDir, 'uploads'), { recursive: true });
		}

		// 5. Buat apply script dengan semua path di-escaped
		const esc = (s: string) => s.replace(/'/g, "'\\''");

		const script = `#!/bin/bash
set -e
echo "⏳ Menunggu server selesai mengirim respons..."
sleep 3

echo "🔍 Mencari server di port 3000..."
PID=$(lsof -ti:3000 2>/dev/null || true)
if [ -n "$PID" ]; then
	echo "   Menghentikan server (PID: $PID)..."
	kill "$PID" 2>/dev/null || true
	sleep 2
	if kill -0 "$PID" 2>/dev/null; then
		echo "   Force kill..."
		kill -9 "$PID" 2>/dev/null || true
	fi
fi

echo "📂 Memasang build ${version}..."
rm -rf '${esc(buildDir)}'
mv '${esc(path.join(extractDir, 'build'))}' '${esc(buildDir)}'

echo "⚙️  Mengembalikan data pengaturan..."
if [ -f '${esc(path.join(backupDir, 'settings.json'))}' ]; then
	cp '${esc(path.join(backupDir, 'settings.json'))}' '${esc(path.join(dataDir, 'settings.json'))}'
fi
if [ -d '${esc(path.join(backupDir, 'uploads'))}' ]; then
	mkdir -p '${esc(uploadsDir)}'
	cp -r '${esc(path.join(backupDir, 'uploads'))}/.' '${esc(uploadsDir)}/'
fi

echo "🧹 Membersihkan berkas sementara..."
rm -rf '${esc(extractDir)}' '${esc(backupDir)}' '${esc(zipPath)}' '${esc(applyScript)}'

echo "🚀 Memulai ulang server..."
cd '${esc(runtimeDir)}'
exec node build
`;

		fs.writeFileSync(applyScript, script, { mode: 0o755 });
		console.log(`[Update] Script siap: ${applyScript}`);

		// 6. Spawn apply script (detached, supaya tetap jalan setelah server mati)
		const child = spawn(applyScript, [], {
			detached: true,
			stdio: 'ignore',
			env: { ...process.env }
		});
		child.unref();

		console.log(`[Update] Update ${version} dimulai, server akan restart...`);

		return json({
			success: true,
			message: `Update ${version} berhasil. Server akan restart otomatis dalam beberapa detik.`,
			version
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('[Update] Gagal:', msg);
		// Bersihkan file sementara kalau gagal
		try {
			const tag = (typeof e === 'object' && e !== null ? 'unknown' : 'unknown');
			// Can't easily get tag here, skip cleanup on error
		} catch {}
		return json({ error: 'Gagal mengunduh update: ' + msg }, { status: 500 });
	}
};
