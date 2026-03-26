import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		watch: {
			// Kasih tau Vite jangan mantau folder data/ biar gak refresh pas simpan settings
			ignored: ['**/data/**']
		}
	},
	ssr: {
		noExternal: ['adhan', 'lucide-svelte']
	}
});
