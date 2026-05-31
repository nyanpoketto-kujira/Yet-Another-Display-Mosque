import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'static/uploads');

// Magic bytes untuk validasi file
function detectMimeType(buffer: Buffer): string | null {
	// JPEG: starts with FF D8
	if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg';
	// PNG: starts with 89 50 4E 47
	if (
		buffer[0] === 0x89 && buffer[1] === 0x50 &&
		buffer[2] === 0x4E && buffer[3] === 0x47
	) return 'image/png';
	// WebP: RIFF...WEBP (bytes 0-3 = RIFF, bytes 8-11 = WEBP)
	if (
		buffer[0] === 0x52 && buffer[1] === 0x49 &&
		buffer[2] === 0x46 && buffer[3] === 0x46 &&
		buffer[8] === 0x57 && buffer[9] === 0x45 &&
		buffer[10] === 0x42 && buffer[11] === 0x50
	) return 'image/webp';
	return null;
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const POST = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) return json({ error: 'Gak ada file bray!' }, { status: 400 });

		// Validasi ekstensi
		const ext = path.extname(file.name).toLowerCase();
		if (!ALLOWED_EXTENSIONS.includes(ext)) {
			return json({ error: 'Maaf, cuma boleh upload gambar (JPG/PNG/WEBP)' }, { status: 400 });
		}

		// Validasi ukuran
		if (file.size > 5 * 1024 * 1024) {
			return json({ error: 'Kegedean bray! Maksimal 5MB aja.' }, { status: 400 });
		}

		// Validasi magic bytes
		const buffer = Buffer.from(await file.arrayBuffer());
		const detectedMime = detectMimeType(buffer);
		if (!detectedMime) {
			return json({ error: 'File bukan gambar yang valid' }, { status: 400 });
		}

		fs.mkdirSync(UPLOAD_DIR, { recursive: true });

		// Map detected MIME ke ekstensi yang aman
		const extMap: Record<string, string> = {
			'image/jpeg': '.jpg',
			'image/png': '.png',
			'image/webp': '.webp'
		};
		const safeExt = extMap[detectedMime] || ext;
		const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
		const filePath = path.join(UPLOAD_DIR, fileName);

		fs.writeFileSync(filePath, buffer);

		return json({ fileName: `/uploads/${fileName}` });
	} catch (e) {
		console.error('Gagal upload:', e);
		return json({ error: 'Gagal simpen file' }, { status: 500 });
	}
};

export const DELETE = async ({ request }) => {
	try {
		const { fileName } = await request.json();
		if (!fileName || typeof fileName !== 'string') {
			return json({ error: 'Nama file diperlukan' }, { status: 400 });
		}

		// Path traversal protection: normalize & verify path stays within uploads
		const normalized = path.normalize(fileName).replace(/^(\.\.(\/|\\|$))+/g, '');
		const fullPath = path.resolve(path.join(process.cwd(), 'static', normalized));
		const uploadDir = path.resolve(UPLOAD_DIR);

		if (!fullPath.startsWith(uploadDir)) {
			return json({ error: 'Akses ditolak' }, { status: 403 });
		}

		if (fs.existsSync(fullPath)) {
			fs.unlinkSync(fullPath);
		}
		return json({ success: true });
	} catch (e) {
		console.error('Gagal hapus file:', e);
		return json({ error: 'Gagal hapus file' }, { status: 500 });
	}
};
