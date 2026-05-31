import crypto from 'crypto';

// In-memory map of valid admin tokens → expiry timestamp
const API_TOKENS = new Map<string, number>();
const TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 jam

// Periodic cleanup token kadaluarsa (setiap 1 jam)
setInterval(() => {
	const now = Date.now();
	for (const [token, expiry] of API_TOKENS) {
		if (now > expiry) API_TOKENS.delete(token);
	}
}, 60 * 60 * 1000);

export function generateToken(seed: string): string {
	const token = crypto
		.createHash('sha256')
		.update(seed + Date.now().toString() + crypto.randomBytes(8).toString('hex'))
		.digest('hex')
		.slice(0, 32);
	API_TOKENS.set(token, Date.now() + TOKEN_TTL);
	return token;
}

export function validateToken(token: string): boolean {
	const expiry = API_TOKENS.get(token);
	if (!expiry) return false;
	if (Date.now() > expiry) {
		API_TOKENS.delete(token);
		return false;
	}
	return true;
}
