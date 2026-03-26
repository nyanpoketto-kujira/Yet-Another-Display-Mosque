import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { eventManager } from '$lib/server/events';

// Data default kalo file gak ada atau lagi di Vercel
let memorySettings: any = null;

// Kita simpen di folder data/settings.json
const DATA_PATH = path.resolve('data/settings.json');

// Helper buat baca data
const readSettings = () => {
	// Kalo di Vercel, pake yang di memori aja bre
	if (process.env.VERCEL && memorySettings) return memorySettings;

	try {
		if (fs.existsSync(DATA_PATH)) {
			const data = fs.readFileSync(DATA_PATH, 'utf-8');
			return JSON.parse(data);
		}
	} catch (e) {
		console.error('Gagal baca settings.json:', e);
	}
	return memorySettings; // Balikin memorySettings (bisa null) kalo gagal
};

// GET: Ambil data settings
export const GET = async () => {
	const data = readSettings();
	// Kalo bener-bener kosong, kasih object kosong aja biar gak error 500
	return json(data || {});
};

// POST: Update data settings
export const POST = async ({ request }) => {
	try {
		const newSettings = await request.json();
		
		// Update memori dulu
		memorySettings = newSettings;

		// Kalo BUKAN di Vercel, baru tulis ke file
		if (!process.env.VERCEL) {
			fs.writeFileSync(DATA_PATH, JSON.stringify(newSettings, null, 2));
		}

		// Teriak ke semua TV: "Woi, ada update nih!"
		eventManager.publish('update');

		return json({ success: true });
	} catch (e) {
		console.error('Gagal simpan settings:', e);
		return json({ error: 'Gagal simpan data' }, { status: 500 });
	}
};
