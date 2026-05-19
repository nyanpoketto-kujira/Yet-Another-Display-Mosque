import { eventManager } from '$lib/server/events';

export const GET = async () => {
	let interval: NodeJS.Timeout;
	let unsubscribe: () => void;

	const stream = new ReadableStream({
		start(controller) {
			// Pas ada update, kirim ke browser
			unsubscribe = eventManager.subscribe(() => {
				try {
					controller.enqueue(`data: update\n\n`);
				} catch {
					// Client udah kabur
				}
			});

			// Kirim ping tiap 20 detik biar koneksi gak drop
			interval = setInterval(() => {
				try {
					controller.enqueue(`: ping\n\n`);
				} catch {
					clearInterval(interval);
				}
			}, 20000);
		},
		cancel() {
			if (interval) clearInterval(interval);
			if (unsubscribe) unsubscribe();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
