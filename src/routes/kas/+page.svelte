<script lang="ts">
	import { settings } from '$lib/settings.svelte';
	import { ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		settings.load();
	});

	function back() {
		window.history.back();
	}

	// Formatter Rupiah
	function formatIDR(amount: number) {
		const formatted = new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
		return formatted.replace('Rp', 'Rp ').replace(',00', '');
	}

	const totalIn = $derived(
		settings.value.transactions.filter((t) => t.type === 'in').reduce((acc, t) => acc + t.amount, 0)
	);
	const totalOut = $derived(
		settings.value.transactions
			.filter((t) => t.type === 'out')
			.reduce((acc, t) => acc + t.amount, 0)
	);

	// Logic font size buat saldo biar gak pecah di HP
	const saldoFontSize = $derived.by(() => {
		const len = formatIDR(settings.value.cash).length;
		if (len > 15) return 'text-6xl md:text-[10rem]';
		if (len > 10) return 'text-7xl md:text-[12rem]';
		return 'text-8xl md:text-[15rem]';
	});
</script>

<div class="min-h-screen overflow-hidden bg-emerald-950 p-6 font-sans text-white md:p-12">
	<header class="mx-auto mb-12 flex max-w-6xl items-center justify-between">
		<div class="flex items-center gap-4 md:gap-6">
			<button
				onclick={back}
				class="rounded-2xl p-3 transition-all hover:bg-emerald-900 active:scale-95"
			>
				<ArrowLeft class="h-6 w-6 md:h-8 md:w-8" />
			</button>
			<h1 class="text-2xl font-black tracking-tight md:text-5xl">Kas Masjid</h1>
		</div>
		<div
			class="hidden rounded-2xl border border-emerald-800/50 bg-emerald-900/50 px-8 py-3 text-sm font-black tracking-widest text-emerald-400 uppercase md:block"
		>
			Tampilan Khusus Jamaah
		</div>
	</header>

	<main class="mx-auto flex max-w-6xl flex-col items-center gap-12">
		<!-- Main Balance Card -->
		<div
			class="relative w-full overflow-hidden rounded-[3rem] border border-emerald-500/10 bg-emerald-900/20 p-16 text-center shadow-[0_0_100px_rgba(16,185,129,0.05)] backdrop-blur-3xl md:p-24"
		>
			<div
				class="absolute -top-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-emerald-400/5 blur-[150px]"
			></div>
			<p class="mb-8 text-xs font-black tracking-[0.5em] text-emerald-400/50 uppercase md:text-sm">
				Total Saldo Kas Saat Ini
			</p>
			<h2
				class="{saldoFontSize} leading-none font-black tracking-tighter drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300"
			>
				{formatIDR(settings.value.cash).replace('Rp ', '')}
				<span class="ml-4 text-4xl font-light tracking-normal opacity-30 md:text-6xl">Rp</span>
			</h2>
		</div>

		<!-- Footer Summary Cards -->
		<div class="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
			<div
				class="flex items-center gap-6 rounded-[2rem] border border-emerald-800/30 bg-emerald-900/10 p-8 shadow-xl backdrop-blur-md"
			>
				<div class="rounded-2xl bg-emerald-500/10 p-5">
					<TrendingUp class="h-8 w-8 text-emerald-400" />
				</div>
				<div>
					<p class="text-[10px] font-black tracking-[0.2em] text-emerald-400/60 uppercase">
						Pemasukan
					</p>
					<p class="text-2xl font-black text-white">{formatIDR(totalIn)}</p>
				</div>
			</div>

			<div
				class="flex items-center gap-6 rounded-[2rem] border border-emerald-800/30 bg-emerald-900/10 p-8 shadow-xl backdrop-blur-md"
			>
				<div class="rounded-2xl bg-rose-500/10 p-5">
					<TrendingDown class="h-8 w-8 text-rose-400" />
				</div>
				<div>
					<p class="text-[10px] font-black tracking-[0.2em] text-rose-400/60 uppercase">
						Pengeluaran
					</p>
					<p class="text-2xl font-black text-white">{formatIDR(totalOut)}</p>
				</div>
			</div>

			<div
				class="flex items-center gap-6 rounded-[2rem] border border-emerald-800/30 bg-emerald-900/10 p-8 shadow-xl backdrop-blur-md"
			>
				<div class="rounded-2xl bg-blue-500/10 p-5">
					<Clock class="h-8 w-8 text-blue-400" />
				</div>
				<div>
					<p class="text-[10px] font-black tracking-[0.2em] text-blue-400/60 uppercase">
						Terakhir Update
					</p>
					<p class="text-2xl font-black text-white">
						{settings.value.transactions[0]?.date || '-'}
					</p>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #022c22;
	}
</style>
