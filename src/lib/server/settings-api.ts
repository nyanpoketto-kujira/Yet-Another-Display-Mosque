import fs from 'fs';
import path from 'path';

const DATA_PATH = path.resolve('data/settings.json');

export function readSettings(): Record<string, unknown> | null {
	try {
		const data = fs.readFileSync(DATA_PATH, 'utf-8');
		return JSON.parse(data);
	} catch {
		return null;
	}
}

export function atomicWrite(filePath: string, data: unknown): void {
	const tmpPath = filePath + '.tmp';
	fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
	fs.renameSync(tmpPath, filePath);
}

export function writeSettings(data: unknown): void {
	atomicWrite(DATA_PATH, data);
	try {
		fs.copyFileSync(DATA_PATH, DATA_PATH + '.bak');
	} catch {
		// Abaikan error backup
	}
}
