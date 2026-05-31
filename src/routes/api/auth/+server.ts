import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { createToken } from '../../../hooks.server';

const DATA_PATH = path.resolve('data/settings.json');

function readAdminPassword(): string {
	try {
		const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
		return data.adminPassword || '';
	} catch {
		return '';
	}
}

// Rate limiter sederhana: maks 5 percobaan per IP per menit
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60_000; // 1 menit

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const entry = loginAttempts.get(ip);
	if (!entry || now > entry.resetAt) {
		loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
		return true;
	}
	if (entry.count >= RATE_LIMIT_MAX) {
		return false;
	}
	entry.count++;
	return true;
}

// Bersihkan entri kadaluarsa setiap 5 menit
setInterval(() => {
	const now = Date.now();
	for (const [ip, entry] of loginAttempts) {
		if (now > entry.resetAt) loginAttempts.delete(ip);
	}
}, 300_000);

export const POST = async ({ request, getClientAddress }) => {
	const ip = getClientAddress();

	if (!checkRateLimit(ip)) {
		return json({ error: 'Terlalu banyak percobaan login. Coba lagi dalam 1 menit.' }, { status: 429 });
	}

	try {
		const { password } = await request.json();
		const storedPassword = readAdminPassword();

		if (password !== storedPassword) {
			return json({ error: 'Kata sandi salah' }, { status: 401 });
		}

		const token = createToken(password);
		return json({ token });
	} catch (e) {
		console.error('Gagal login:', e);
		return json({ error: 'Gagal proses login' }, { status: 500 });
	}
};
