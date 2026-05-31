<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let countdown = $state(30);
	let interval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		interval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				location.reload();
			}
		}, 1000);

		return () => {
			if (interval) clearInterval(interval);
		};
	});

	function cobaLagi() {
		location.reload();
	}

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Kesalahan tak terduga');
	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));
</script>

{#if isAdmin}
	<div class="flex min-h-screen items-center justify-center bg-slate-950 p-8 font-sans text-white">
		<div class="w-full max-w-lg text-center">
			<div class="mb-8 text-8xl font-black text-rose-500/30">{status}</div>
			<h1 class="mb-4 text-3xl font-black tracking-widest uppercase">Terjadi Kesalahan</h1>
			<p class="mb-8 text-sm leading-relaxed text-slate-400">{message}</p>
			<div class="flex items-center justify-center gap-4">
				<button
					onclick={() => history.back()}
					class="rounded-2xl border border-slate-700 bg-slate-800 px-8 py-4 text-xs font-black tracking-widest uppercase transition-colors hover:bg-slate-700"
				>
					Kembali
				</button>
				<button
					onclick={cobaLagi}
					class="rounded-2xl bg-amber-500 px-8 py-4 text-xs font-black tracking-widest text-black uppercase transition-colors hover:bg-amber-400"
				>
					Coba Lagi
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen flex-col items-center justify-center bg-black p-8 font-sans text-white">
		<div class="text-center">
			<div class="mb-6 text-6xl font-black tracking-[0.3em] text-white/10 opacity-20 uppercase">
				Masjid
			</div>
			<h1 class="mb-4 text-5xl font-black tracking-wider">Mohon Maaf</h1>
			<p class="mb-2 text-lg font-light tracking-widest text-white/60 uppercase">
				Terjadi Gangguan
			</p>
			<div class="mb-12 mt-2 text-xs font-mono text-white/20">{status}</div>
			<button
				onclick={cobaLagi}
				class="mb-4 inline-block rounded-2xl border border-white/20 bg-white/5 px-10 py-4 text-sm font-black tracking-[0.2em] uppercase backdrop-blur-md transition-all hover:bg-white/10"
			>
				Coba Lagi
			</button>
			<p class="text-xs tracking-widest text-white/30">
				Mencoba kembali dalam <span class="font-mono text-white/50">{countdown}</span> detik
			</p>
		</div>
	</div>
{/if}
