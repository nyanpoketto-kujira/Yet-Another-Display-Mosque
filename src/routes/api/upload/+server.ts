import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'static/uploads');

export const POST = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) return json({ error: 'Gak ada file bray!' }, { status: 400 });

		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			return json({ error: 'Maaf, cuma boleh upload gambar (JPG/PNG/WEBP)' }, { status: 400 });
		}
		if (file.size > 5 * 1024 * 1024) {
			return json({ error: 'Kegedean bray! Maksimal 5MB aja.' }, { status: 400 });
		}

		fs.mkdirSync(UPLOAD_DIR, { recursive: true });

		const ext = path.extname(file.name);
		const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
		const filePath = path.join(UPLOAD_DIR, fileName);

		const buffer = Buffer.from(await file.arrayBuffer());
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
		const filePath = path.join(process.cwd(), 'static', fileName);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
		return json({ success: true });
	} catch (e) {
		console.error('Gagal hapus file:', e);
		return json({ error: 'Gagal hapus file' }, { status: 500 });
	}
};
