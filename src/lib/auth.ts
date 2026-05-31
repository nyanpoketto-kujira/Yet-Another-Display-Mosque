import { browser } from '$app/environment';

const TOKEN_KEY = 'yadm-token';

function loadToken(): string | null {
	if (!browser) return null;
	return sessionStorage.getItem(TOKEN_KEY);
}

function saveToken(t: string) {
	if (browser) sessionStorage.setItem(TOKEN_KEY, t);
}

function clearToken() {
	if (browser) sessionStorage.removeItem(TOKEN_KEY);
}

let currentToken: string | null = loadToken();

export function getToken(): string | null {
	return currentToken;
}

export function isAuthenticated(): boolean {
	return currentToken !== null;
}

export async function login(password: string): Promise<boolean> {
	try {
		const res = await fetch('/api/auth', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password })
		});
		if (!res.ok) return false;
		const data = await res.json();
		currentToken = data.token;
		saveToken(data.token);
		return true;
	} catch {
		return false;
	}
}

export function logout(): void {
	currentToken = null;
	clearToken();
}
