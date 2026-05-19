import fs from 'fs';
import path from 'path';
import { error } from '@sveltejs/kit';

const UPLOAD_DIR = path.join(process.cwd(), 'static/uploads');

export const GET = async ({ params }) => {
	const requestedPath = params.path;
	if (!requestedPath) error(404, 'Not found');

	const safePath = path.normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, '');
	const filePath = path.join(UPLOAD_DIR, safePath);

	if (!filePath.startsWith(UPLOAD_DIR)) error(403, 'Forbidden');
	if (!fs.existsSync(filePath)) error(404, 'Not found');

	const ext = path.extname(filePath).toLowerCase();
	const mimeMap: Record<string, string> = {
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.png': 'image/png',
		'.webp': 'image/webp'
	};
	const contentType = mimeMap[ext] || 'application/octet-stream';

	const buffer = fs.readFileSync(filePath);
	return new Response(buffer, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
