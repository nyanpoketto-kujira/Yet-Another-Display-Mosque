import { browser } from '$app/environment';

class SoundManager {
	#ctx: AudioContext | null = null;
	#ready = false;

	init() {
		if (!browser || this.#ctx) return;
		try {
			this.#ctx = new AudioContext();
			if (this.#ctx.state === 'suspended') {
				this.#ctx.resume().then(() => {
					this.#ready = true;
				});
			} else {
				this.#ready = true;
			}
		} catch {
			// Audio not available
		}
	}

	unlock() {
		if (!this.#ctx) this.init();
		if (this.#ready) return;
		if (this.#ctx?.state === 'suspended') {
			this.#ctx.resume().then(() => {
				this.#ready = true;
			});
		}
	}

	get ready() {
		return this.#ready;
	}

	async play(url: string) {
		if (!this.#ctx || this.#ctx.state !== 'running') return;
		try {
			const resp = await fetch(url);
			const buf = await resp.arrayBuffer();
			const decoded = await this.#ctx.decodeAudioData(buf);
			const source = this.#ctx.createBufferSource();
			source.buffer = decoded;
			source.connect(this.#ctx.destination);
			source.start();
			source.onended = () => {
				source.disconnect();
			};
			setTimeout(() => {
				// Allow garbage collection
			}, decoded.duration * 1000 + 1000);
		} catch {
			try {
				const a = new Audio(url);
				await a.play();
			} catch {
				// silent
			}
		}
	}
}

export const soundManager = new SoundManager();
