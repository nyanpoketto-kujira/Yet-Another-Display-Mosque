import { json } from '@sveltejs/kit';
import { readSettings, writeSettings } from '$lib/server/settings-api';
import { eventManager } from '$lib/server/events';

const MAX_STRING_LENGTHS: Record<string, number> = {
	runningText: 5000,
	bigInfo: 2000,
	fridayKhatib: 300,
	preAdzanDuration: 99,
	sholatDuration: 999,
	bgSlideshowDuration: 9999,
	infoSlideshowDuration: 9999,
	fridayKhutbahDuration: 999
};

function sanitizeSettings(data: Record<string, unknown>) {
	const allowedFields = [
		'lat', 'lng', 'offsets', 'iqomah', 'drift', 'cash', 'runningText',
		'bigInfo', 'infos', 'preAdzanDuration', 'sholatDuration',
		'bgSlideshowDuration', 'infoSlideshowDuration', 'transactions',
		'backgrounds', 'fridayKhatib', 'fridayKhutbahDuration',
		'hideTransactionAmount', 'theme', 'sound', 'performanceMode'
	];
	const sanitized: Record<string, unknown> = {};
	for (const key of allowedFields) {
		if (key in data) sanitized[key] = data[key];
	}
	return sanitized;
}

function validateFieldLengths(data: Record<string, unknown>): string | null {
	for (const [key, maxLen] of Object.entries(MAX_STRING_LENGTHS)) {
		if (typeof data[key] === 'string' && (data[key] as string).length > maxLen) {
			return `${key} terlalu panjang (maks ${maxLen} karakter)`;
		}
	}
	return null;
}

// GET: Ambil data settings (TANPA adminPassword!)
export const GET = async () => {
	const data = readSettings();
	if (!data) return json({ error: 'Gagal muat data' }, { status: 500 });
	// Jangan kirim adminPassword ke client
	const { adminPassword, ...safeData } = data;
	return json(safeData);
};

// POST: Update data settings
export const POST = async ({ request }) => {
	try {
		const body = await request.json();
		const currentData = readSettings() || {};

		// Validasi koordinat
		if (body.lat !== undefined && (typeof body.lat !== 'number' || body.lat < -90 || body.lat > 90)) {
			return json({ error: 'Latitude tidak valid' }, { status: 400 });
		}
		if (body.lng !== undefined && (typeof body.lng !== 'number' || body.lng < -180 || body.lng > 180)) {
			return json({ error: 'Longitude tidak valid' }, { status: 400 });
		}

		// Validasi panjang string
		const lengthError = validateFieldLengths(body);
		if (lengthError) {
			return json({ error: lengthError }, { status: 400 });
		}

		const newData = { ...currentData, ...sanitizeSettings(body) };

		// Validasi password: tolak kosong (agar admin tidak terkunci)
		if (body.adminPassword !== undefined) {
			if (typeof body.adminPassword !== 'string' || body.adminPassword.trim() === '') {
				return json({ error: 'Kata sandi tidak boleh kosong' }, { status: 400 });
			}
			if (body.adminPassword.length > 128) {
				return json({ error: 'Kata sandi terlalu panjang (maks 128 karakter)' }, { status: 400 });
			}
			newData.adminPassword = body.adminPassword;
		}

		writeSettings(newData);

		eventManager.publish('update');

		return json({ success: true });
	} catch (e) {
		console.error('Gagal simpan settings.json:', e);
		return json({ error: 'Gagal simpan data' }, { status: 500 });
	}
};
