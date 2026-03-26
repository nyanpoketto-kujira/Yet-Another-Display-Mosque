<script lang="ts">
	import { Home, Settings, Wallet, Info, RotateCcw } from 'lucide-svelte';
	import { browser } from '$app/environment';

	// Cuma muncul kalo ada env VERCEL (kita deteksi lewat hostname atau setting)
	let isDemo = $state(false);

	if (browser) {
		isDemo =
			window.location.hostname.includes('vercel.app') ||
			window.location.hostname.includes('localhost') ||
			window.location.hostname.includes('127.0.0.1');
	}

	let isOpen = $state(false);

	const links = [
		{ name: 'Display Utama', href: '/', icon: Home },
		{ name: 'Admin / Pengaturan', href: '/admin', icon: Settings },
		{ name: 'Laporan Kas', href: '/kas', icon: Wallet }
	];

	async function resetData() {
		if (!confirm('Yakin mau reset data demo ke awal?')) return;
		try {
			// Kita tembak API POST tapi kirim object kosong aja biar server balikin ke default
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({}) // Ngirim kosong biar server reset memorySettings
			});
			if (res.ok) {
				window.location.reload();
			}
		} catch (e) {
			alert('Gagal reset data bre!');
		}
	}
</script>

{#if isDemo}
	<div class="fixed bottom-4 left-4 z-[9999] flex flex-col items-start gap-2 print:hidden">
		{#if isOpen}
			<div
				class="mb-2 flex w-48 flex-col gap-1 overflow-hidden rounded-xl border border-white/10 bg-black/60 p-2 shadow-2xl backdrop-blur-xl"
			>
				<p class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Demo Menu</p>
				{#each links as link}
					<a
						href={link.href}
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 active:scale-95"
					>
						<link.icon size={16} />
						{link.name}
					</a>
				{each}

				<button
					onclick={resetData}
					class="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
				>
					<RotateCcw size={16} />
					Reset Data
				</button>

				<div class="mt-2 border-t border-white/10 p-2">
					<p class="text-[10px] leading-tight text-white/40">
						Ini adalah versi demo publik.<br />Data akan di-reset setiap kali server di-restart.
					</p>
				</div>
			</div>
		{/if}

		<button
			onclick={() => (isOpen = !isOpen)}
			class="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-blue-600 text-white shadow-xl transition-all hover:scale-110 active:scale-90"
		>
			{#if isOpen}
				<span class="text-xl font-bold">×</span>
			{:else}
				<Info size={24} />
			{/if}

			<span
				class="absolute left-14 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
			>
				Demo Info
			</span>
		</button>
	</div>
{/if}
