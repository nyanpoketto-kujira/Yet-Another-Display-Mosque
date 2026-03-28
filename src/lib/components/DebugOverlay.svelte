<script lang="ts">
	import { prayerService } from '$lib/prayer.svelte';
	import { settings } from '$lib/settings.svelte';
	import { X, Play, RefreshCw, Timer, Zap, Clock, ShieldCheck, Beaker } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	let { onClose } = $props();

	function jumpTo(targetTime: Date, offsetMinutes: number = 0) {
		const target = new Date(targetTime.getTime() + offsetMinutes * 60000);
		const now = new Date();
		prayerService.setTimeOffset(target.getTime() - now.getTime());
	}

	function simulateFriday() {
		const now = new Date();
		const day = now.getDay();
		const diff = (5 - day + 7) % 7;
		prayerService.setTimeOffset(diff * 24 * 60 * 60 * 1000);
	}

	const prayers = $derived([
		{ name: 'Subuh', time: prayerService.prayerTimes.fajr },
		{ name: 'Syuruq', time: prayerService.prayerTimes.sunrise },
		{ name: 'Dhuha', time: prayerService.prayerTimes.dhuha },
		{ name: 'Dzuhur', time: prayerService.prayerTimes.dhuhr },
		{ name: 'Ashar', time: prayerService.prayerTimes.asr },
		{ name: 'Maghrib', time: prayerService.prayerTimes.maghrib },
		{ name: 'Isya', time: prayerService.prayerTimes.isha }
	]);
</script>

<div
	class="fixed top-6 right-6 z-[999] w-80 max-h-[90vh] overflow-y-auto no-scrollbar rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 text-white shadow-2xl backdrop-blur-2xl"
	transition:slide={{ axis: 'y' }}
>
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Zap class="h-5 w-5 fill-yellow-400 text-yellow-400" />
			<h2 class="text-sm font-black tracking-tighter uppercase">YADM Debugger</h2>
		</div>
		<button onclick={onClose} class="rounded-full p-2 transition-colors hover:bg-white/10">
			<X class="h-4 w-4" />
		</button>
	</div>

	<div class="space-y-4">
		<!-- Info Waktu -->
		<div class="rounded-2xl border border-white/5 bg-black/40 p-4">
			<p class="mb-1 text-[9px] font-black tracking-widest text-slate-500 uppercase">
				Waktu Simulasi
			</p>
			<p class="font-mono text-2xl font-black text-emerald-400 tabular-nums">
				{prayerService.currentTime.toLocaleTimeString('id-ID')}
			</p>
			<div class="mt-2 flex items-center gap-2">
				<ShieldCheck class="h-3 w-3 {prayerService.isFriday ? 'text-purple-400' : 'text-slate-600'}" />
				<span class="text-[9px] font-black uppercase {prayerService.isFriday ? 'text-purple-400' : 'text-slate-600'}">
					{prayerService.isFriday ? 'Mode Hari Jumat' : 'Hari Biasa'}
				</span>
			</div>
		</div>

		<!-- Tombol Kontrol Utama -->
		<div class="grid grid-cols-2 gap-2">
			<button
				onclick={() => prayerService.resetDebug()}
				class="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-600/20 p-3 text-[10px] font-bold tracking-widest text-rose-400 uppercase transition-all hover:bg-rose-600 hover:text-white"
			>
				<RefreshCw class="h-4 w-4" /> Reset
			</button>
			<button
				onclick={simulateFriday}
				class="flex items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-600/20 p-3 text-[10px] font-bold tracking-widest text-purple-400 uppercase transition-all hover:bg-purple-600 hover:text-white"
			>
				<Beaker class="h-4 w-4" /> Ke Jumat
			</button>
		</div>

		<div class="my-2 h-px bg-white/5"></div>

		<!-- Force Mode (QA) -->
		<div class="space-y-2">
			<p class="text-[10px] font-black tracking-widest text-slate-500 uppercase">Force Mode Overlay</p>
			<div class="grid grid-cols-2 gap-2">
				<button
					onclick={() => prayerService.setDebugMode('khutbah', 60)}
					class="rounded-lg bg-purple-600/40 p-2 text-[9px] font-bold uppercase transition-all hover:bg-purple-600"
				>
					Mode Khutbah
				</button>
				<button
					onclick={() => prayerService.setDebugMode('sholat')}
					class="rounded-lg bg-slate-700/60 p-2 text-[9px] font-bold uppercase transition-all hover:bg-slate-700"
				>
					Mode Sholat
				</button>
			</div>
		</div>

		<div class="my-2 h-px bg-white/5"></div>

		<!-- Daftar Sholat -->
		<div class="space-y-3">
			<p
				class="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase"
			>
				<Clock class="h-3 w-3" /> Quick Jump
			</p>

			{#each prayers as p}
				<div class="grid grid-cols-1 gap-2 rounded-2xl border border-white/5 bg-white/5 p-3">
					<div class="mb-1 flex items-center justify-between">
						<span class="text-[10px] font-black text-white/60 uppercase">
							{prayerService.isFriday && p.name === 'Dzuhur' ? "Jum'at" : p.name}
						</span>
						<span class="font-mono text-[10px] opacity-40"
							>{p.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span
						>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<button
							onclick={() => jumpTo(p.time, -2)}
							class="rounded-lg bg-blue-600/20 p-2 text-[9px] font-bold tracking-tighter uppercase transition-all hover:bg-blue-600"
						>
							-2m (Preadzan)
						</button>
						<button
							onclick={() => jumpTo(p.time, 1)}
							class="rounded-lg bg-emerald-600/20 p-2 text-[9px] font-bold tracking-tighter uppercase transition-all hover:bg-emerald-600"
						>
							{prayerService.isFriday && p.name === 'Dzuhur' ? '+1m (Khutbah)' : '+1m (Adzan)'}
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar { display: none; }
	.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
