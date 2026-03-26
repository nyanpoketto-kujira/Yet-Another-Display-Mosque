<script lang="ts">
	import { Home, Settings, Wallet, Info } from 'lucide-svelte';
	import { browser } from '$app/environment';

	// Cuma muncul kalo ada env VERCEL (kita deteksi lewat hostname atau setting)
	let isDemo = $state(false);

	if (browser) {
		isDemo = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('localhost');
	}

	let isOpen = $state(false);

	const links = [
		{ name: 'Display Utama', href: '/', icon: Home },
		{ name: 'Admin / Pengaturan', href: '/admin', icon: Settings },
		{ name: 'Laporan Kas', href: '/kas', icon: Wallet }
	];
</script>

{#if isDemo}
	<div class="fixed bottom-4 left-4 z-[9999] flex flex-col items-start gap-2 print:hidden">
		{#if isOpen}
			<div
				class="mb-2 flex flex-col gap-1 overflow-hidden rounded-xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl shadow-2xl"
			>
				<p class="px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-white/40">Demo Menu</p>
				{#each links as link}
					<a
						href={link.href}
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 active:scale-95"
					>
						<link.icon size={16} />
						{link.name}
					</a>
				{each}
				<div class="mt-2 border-t border-white/10 p-2">
					<p class="text-[10px] text-white/40 leading-tight">
						Ini adalah versi demo.<br />Data akan di-reset setiap kali app di-restart.
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
			
			<span class="absolute left-14 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100">
				Demo Info
			</span>
		</button>
	</div>
{/if}
