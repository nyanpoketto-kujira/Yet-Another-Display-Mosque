import type { Handle, HandleServerError } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { validateToken, generateToken } from '$lib/server/tokens';

const DATA_PATH = path.resolve('data/settings.json');

function readAdminPassword(): string {
	try {
		const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
		return data.adminPassword || '';
	} catch {
		return '';
	}
}

function isTokenValid(token: string): boolean {
	if (validateToken(token)) return true;
	// Backward compat: raw password also works (auto-promote to real token)
	const pwd = readAdminPassword();
	if (token === pwd) {
		const newToken = generateToken(pwd);
		// Store password as valid token for this session
		return validateToken(newToken) || true;
	}
	return false;
}

export function createToken(password: string): string {
	return generateToken(password);
}

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	const method = event.request.method;

	// Protect write ops on /api/* except auth & events
	if (pathname.startsWith('/api/') && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
		if (pathname !== '/api/auth' && pathname !== '/api/events') {
			const authHeader = event.request.headers.get('authorization') || '';
			const token = authHeader.replace('Bearer ', '');
			if (!isTokenValid(token)) {
				return new Response(JSON.stringify({ error: 'Tidak punya akses bray!' }), {
					status: 401,
					headers: { 'content-type': 'application/json' }
				});
			}
		}
	}

	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self'; connect-src 'self' https://api.github.com; font-src 'self' data:; frame-ancestors 'none'"
	);

	return response;
};

export const handleError: HandleServerError = async ({ error, event }) => {
	const pathname = event.url.pathname;

	if (event.route.id !== null) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(`[500] ${pathname}: ${errorMessage}`);
	}

	return {
		message: 'Terjadi kesalahan internal. Silakan coba lagi.'
	};
};
