<script lang="ts">
	import { prayerService } from '$lib/prayer.svelte';
	import { settings } from '$lib/settings.svelte';
	import { formatRupiah, formatK } from '$lib/utils/format';
	import PrayerCard from '$lib/components/PrayerCard.svelte';
	import RunningText from '$lib/components/RunningText.svelte';
	import FocusTimer from '$lib/components/FocusTimer.svelte';
	import SholatDisplay from '$lib/components/SholatDisplay.svelte';
	import KhutbahDisplay from '$lib/components/KhutbahDisplay.svelte';
	import DebugOverlay from '$lib/components/DebugOverlay.svelte';
	import {
		Wallet,
		Calendar,
		Clock,
		Info,
		BellRing,
		TrendingUp,
		TrendingDown,
		Sparkles,
		Quote,
		Mic2
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	// Jam pake titik biar sama kayak screenshot
	function formatTime(date: Date) {
		const h = date.getHours().toString().padStart(2, '0');
		const m = date.getMinutes().toString().padStart(2, '0');
		const s = date.getSeconds().toString().padStart(2, '0');
		return `${h}.${m}.${s}`;
	}

	let showDebug = $state(false);

	const nextPrayer = $derived.by(() => {
		const pt = prayerService.prayerTimes;
		const now = prayerService.currentTime;
		if (now < pt.fajr) return { name: 'Subuh', time: pt.fajr };
		if (now < pt.sunrise) return { name: 'Syuruq', time: pt.sunrise };
		if (now < pt.dhuha) return { name: 'Dhuha', time: pt.dhuha };
		if (now < pt.dhuhr) return { name: 'Dzuhur', time: pt.dhuhr };
		if (now < pt.asr) return { name: 'Ashar', time: pt.asr };
		if (now < pt.maghrib) return { name: 'Maghrib', time: pt.maghrib };
		if (now < pt.isha) return { name: 'Isya', time: pt.isha };
		return { name: 'Subuh', time: pt.fajr };
	});

	const latestIn = $derived(
		settings.value.transactions.filter((t) => t.type === 'in').slice(0, 2)
	);
	const latestOut = $derived(
		settings.value.transactions.filter((t) => t.type === 'out').slice(0, 2)
	);

	// BACKGROUND SLIDESHOW
	let bgIndex = $state(0);
	const currentBg = $derived(
		settings.value.backgrounds.length > 0 ? settings.value.backgrounds[bgIndex] : null
	);

	// INFO SLIDESHOW (MOTD/HADITS)
	let infoIndex = $state(0);
	const activeInfos = $derived(settings.value.infos.filter((i) => i.active));
	const currentInfo = $derived(
		activeInfos.length > 0 ? activeInfos[infoIndex % activeInfos.length] : null
	);

	onMount(() => {
		settings.load();

		const handleKeyDown = (e: KeyboardEvent) => {
			const isDebugMode = new URLSearchParams(window.location.search).get('vibe') === 'debug';
			if (isDebugMode && e.key.toLowerCase() === 'd') showDebug = !showDebug;
			if (e.key === 'Escape') showDebug = false;
		};
		window.addEventListener('keydown', handleKeyDown);

		let eventSource: EventSource;
		function initSSE() {
			if (eventSource) eventSource.close();
			eventSource = new EventSource('/api/events');
			eventSource.onmessage = (e) => {
				if (e.data === 'update') settings.load();
			};
			eventSource.onerror = () => {
				setTimeout(initSSE, 5000);
			};
		}
		initSSE();

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			if (eventSource) eventSource.close();
		};
	});

	// Timer Background REAKTIF (Mati-Nyalain pas setting berubah)
	$effect(() => {
		const duration = (settings.value.bgSlideshowDuration || 60) * 1000;
		const timer = setInterval(() => {
			if (settings.value.backgrounds.length > 1) {
				bgIndex = (bgIndex + 1) % settings.value.backgrounds.length;
			}
		}, duration);
		return () => clearInterval(timer);
	});

	// Timer Info REAKTIF (Mati-Nyalain pas setting berubah)
	$effect(() => {
		const duration = (settings.value.infoSlideshowDuration || 15) * 1000;
		const timer = setInterval(() => {
			if (activeInfos.length > 1) {
				infoIndex = (infoIndex + 1) % activeInfos.length;
			}
		}, duration);
		return () => clearInterval(timer);
	});

	const bigInfoFontSize = $derived.by(() => {
		const len = settings.value.bigInfo.length;
		if (len < 20) return 'text-[10rem]';
		if (len < 50) return 'text-[7rem]';
		if (len < 100) return 'text-[5rem]';
		return 'text-[3.5rem]';
	});

	const themeConfig = $derived.by(() => {
		switch (settings.value.theme) {
			case 'modern':
				return {
					bg: 'from-slate-900 via-slate-950 to-black',
					accent: 'text-slate-400',
					clock: 'text-white',
					pill: 'border-slate-400/30 bg-slate-600/40',
					jumat: { border: 'border-slate-500/30', bg: 'bg-slate-600/20', text: 'text-slate-400' },
					info: { bg: 'bg-slate-500/20', text: 'text-slate-400' }
				};
			case 'classic':
				return {
					bg: 'from-emerald-900 via-teal-950 to-black',
					accent: 'text-emerald-400',
					clock: 'text-emerald-50',
					pill: 'border-emerald-400/30 bg-emerald-600/40',
					jumat: {
						border: 'border-emerald-500/30',
						bg: 'bg-emerald-600/20',
						text: 'text-emerald-400'
					},
					info: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' }
				};
			case 'ocean':
				return {
					bg: 'from-blue-900 via-cyan-950 to-black',
					accent: 'text-cyan-400',
					clock: 'text-white',
					pill: 'border-cyan-400/30 bg-cyan-600/40',
					jumat: { border: 'border-cyan-500/30', bg: 'bg-cyan-600/20', text: 'text-cyan-400' },
					info: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' }
				};
			case 'sunset':
				return {
					bg: 'from-rose-900 via-orange-950 to-black',
					accent: 'text-orange-400',
					clock: 'text-white',
					pill: 'border-orange-400/30 bg-orange-600/40',
					jumat: {
						border: 'border-orange-500/30',
						bg: 'bg-orange-600/20',
						text: 'text-orange-400'
					},
					info: { bg: 'bg-orange-500/20', text: 'text-orange-400' }
				};
			default: // vibe
				return {
					bg: 'from-blue-900 via-purple-950 to-black',
					accent: prayerService.vibe.accent,
					clock: 'text-white',
					pill: 'border-blue-400/30 bg-blue-600/40',
					jumat: {
						border: 'border-purple-500/30',
						bg: 'bg-purple-600/20',
						text: 'text-purple-400'
					},
					info: { bg: 'bg-blue-500/20', text: 'text-blue-400' }
				};
		}
	});
</script>

<div
	class="relative h-screen max-h-screen w-screen overflow-hidden bg-black p-[2vh] font-sans text-white"
>
	<!-- Background Layer -->
	<div class="absolute inset-0 z-0 bg-gradient-to-br {themeConfig.bg}"></div>

	<!-- Main Bento Dashboard (The 4-Row Grid) -->
	<div class="relative z-10 grid h-full w-full grid-rows-[1fr_14vh_18vh_auto] gap-[2vh] overflow-hidden">
		
		<!-- ROW 1: HEADER (Slideshow & Stats) -->
		<div class="grid h-full grid-cols-12 gap-[2vh] overflow-hidden min-h-0">
			<!-- LEFT: Slideshow -->
			<div
				class="relative col-span-8 h-full overflow-hidden rounded-[2.5vh] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-3xl"
			>
				{#if currentBg}
					{#key currentBg}
						<img
							src={currentBg}
							alt=""
							class="absolute inset-0 h-full w-full object-cover transition-all duration-[2000ms]"
							transition:fade={{ duration: 2000 }}
						/>
					{/key}
				{:else}
					<div class="flex h-full w-full items-center justify-center opacity-20">
						<Sparkles class="mr-[2vh] h-[6vh] w-[6vh]" />
						<span class="text-[4vh] font-black uppercase tracking-[0.4em]">YADM</span>
					</div>
				{/if}

				<!-- KHATHIB OVERLAY (Hanya hari Jum'at) -->
				{#if prayerService.isFriday}
					<div 
						class="absolute bottom-0 left-0 right-0 flex items-center justify-between px-[4vh] py-[1.5vh] border-t border-white/10 {themeConfig.jumat.bg} backdrop-blur-xl transition-all"
						transition:slide={{axis: 'y'}}
					>
						<div class="flex items-center gap-[2vh]">
							<div class="rounded-[1.2vh] p-[1vh] {themeConfig.jumat.bg} border border-white/10">
								<Mic2 class="h-[3vh] w-[3vh] {themeConfig.jumat.text}" />
							</div>
							<div class="flex flex-col">
								<span class="text-[1.2vh] font-black uppercase tracking-[0.4em] {themeConfig.jumat.text}/80 leading-none mb-[0.5vh]">Khathib Jum'at</span>
								<span class="text-[clamp(1.5rem,3.5vh,4.5rem)] font-black tracking-tight text-white uppercase leading-none drop-shadow-lg">{settings.value.fridayKhatib}</span>
							</div>
						</div>
						<div class="flex items-center gap-[1.5vh] opacity-60">
							<Sparkles class="h-[2.5vh] w-[2.5vh] {themeConfig.jumat.text}" />
							<span class="text-[1.8vh] font-bold italic tracking-widest text-white/90">Jum'at Berkah</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- RIGHT: Clock & Kas -->
			<div class="col-span-4 flex h-full flex-col gap-[2vh] overflow-hidden">
				<!-- Clock -->
				<div
					class="relative flex flex-[1.8] flex-col items-center justify-center overflow-hidden rounded-[2.5vh] border border-white/10 bg-white/5 p-[2vh] shadow-xl backdrop-blur-3xl"
				>
					<h2
						class="mb-[0.5vh] text-center text-[1.8vh] leading-tight font-light text-white/80 italic"
					>
						{prayerService.gregorianDate}
					</h2>
					<h3 class="text-center text-[2.2vh] font-black {themeConfig.accent}">
						{prayerService.hijriDate}
					</h3>
					<div class="mt-[1vh] flex flex-col items-center text-center">
						<div
							class="text-[clamp(5rem,10vh,12rem)] leading-none font-black tracking-tight tabular-nums {themeConfig.clock} drop-shadow-lg"
						>
							{formatTime(prayerService.currentTime).split('.').slice(0, 2).join(':')}
							<span class="text-[clamp(1.5rem,4vh,4rem)] opacity-50"
								>.{formatTime(prayerService.currentTime).split('.')[2]}</span
							>
						</div>
						<div
							class="mt-[1.5vh] flex items-center gap-[1.2vh] rounded-full border px-[2.5vh] py-[0.8vh] shadow-xl backdrop-blur-xl {themeConfig.pill}"
						>
							<BellRing class="h-[2vh] w-[2vh] animate-pulse text-white" />
							<span class="text-[1.6vh] font-bold tracking-wide whitespace-nowrap text-white">
								{nextPrayer.name}: {nextPrayer.time
									.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
									.replace(':', '.')}
							</span>
						</div>
					</div>
				</div>
				<!-- Kas -->
				<div
					class="relative flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-[2.5vh] border border-white/10 bg-white/5 p-[2vh] shadow-xl backdrop-blur-3xl"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-[1.2vh]">
							<div
								class="rounded-[1.2vh] border border-emerald-500/20 bg-emerald-500/20 p-[0.8vh] backdrop-blur-md"
							>
								<Wallet class="h-[2vh] w-[2vh] text-emerald-400" />
							</div>
							<span class="text-[2.2vh] font-black tracking-[0.2em] uppercase opacity-80">Kas</span>
						</div>
						<span class="text-[2.5vh] leading-none font-black text-emerald-400 tabular-nums"
							>{formatRupiah(settings.value.cash)}</span
						>
					</div>
					<div class="mt-[1vh] grid grid-cols-2 gap-[1.5vh] overflow-hidden">
						<div class="space-y-[0.5vh]">
							<span class="text-[1vh] font-black uppercase tracking-[0.2em] text-emerald-400/60">Pemasukan</span>
							{#each latestIn as tx}
								<div
									class="flex items-center justify-between rounded-[0.8vh] border border-white/5 bg-white/5 px-[1.2vh] py-[0.5vh] text-[1.5vh] font-bold"
								>
									<span class="truncate uppercase opacity-80">{tx.desc}</span>
									{#if !settings.value.hideTransactionAmount}<span
											class="font-black text-emerald-400">{formatK(tx.amount)}</span
										>{/if}
								</div>
							{/each}
						</div>
						<div class="space-y-[0.5vh]">
							<span class="text-[1vh] font-black uppercase tracking-[0.2em] text-rose-400/60">Pengeluaran</span>
							{#each latestOut as tx}
								<div
									class="flex items-center justify-between rounded-[0.8vh] border border-white/5 bg-white/5 px-[1.2vh] py-[0.5vh] text-[1.5vh] font-bold"
								>
									<span class="truncate uppercase opacity-80">{tx.desc}</span>
									{#if !settings.value.hideTransactionAmount}<span class="font-black text-rose-400"
											>-{formatK(tx.amount)}</span
										>{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- ROW 2: MIDDLE (Quote & Khathib) -->
		<div class="flex h-[14vh] max-h-[14vh] flex-col gap-[1.5vh] overflow-hidden">
			<!-- Quote -->
			<div
				class="relative h-full overflow-hidden rounded-[2.5vh] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-3xl"
			>
				{#if currentInfo}
					{#key currentInfo.id}
						<div
							class="absolute inset-0 flex items-center gap-[4vh] px-[4vh]"
							in:fade={{ duration: 400, delay: 400 }}
							out:fade={{ duration: 400 }}
						>
							<div class="flex flex-col items-center gap-[0.8vh]">
								<div class="rounded-[1.5vh] p-[1.5vh] {themeConfig.info.bg}">
									<Quote class="h-[3.5vh] w-[3.5vh] {themeConfig.info.text}" />
								</div>
								<span
									class="text-[1vh] font-black tracking-widest whitespace-nowrap uppercase {themeConfig
										.info.text}/60">{currentInfo.header}</span
								>
							</div>
							<div class="flex min-w-0 flex-1 flex-col justify-center">
								<p
									class="line-clamp-2 text-[clamp(1.2rem,3vh,3.5rem)] leading-tight font-bold tracking-wide text-white/90 italic"
								>
									"{currentInfo.content}"
								</p>
								<p
									class="mt-[0.5vh] text-[1.2vh] font-black tracking-widest text-slate-500 uppercase"
								>
									— {currentInfo.footer || 'Informasi'}
								</p>
							</div>
						</div>
					{/key}
				{:else}
					<div class="flex h-full w-full items-center justify-center opacity-20">
						<span class="text-[2.5vh] font-bold tracking-[0.4em] uppercase">YADM</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- ROW 3: BOTTOM CONTENT (Prayer Cards) - Fills the rest of space -->
		<div class="flex h-full min-h-0 items-stretch gap-[2vh] overflow-hidden">
			<div class="h-full min-w-0 flex-1">
				<PrayerCard
					name="Subuh"
					time={prayerService.prayerTimes.fajr}
					isActive={nextPrayer.name === 'Subuh'}
				/>
			</div>
			<div class="h-full min-w-0 flex-1">
				<PrayerCard
					name="Syuruq"
					time={prayerService.prayerTimes.sunrise}
					isActive={nextPrayer.name === 'Syuruq'}
				/>
			</div>
			<div class="h-full min-w-0 flex-1">
				<PrayerCard
					name="Dhuha"
					time={prayerService.prayerTimes.dhuha}
					isActive={nextPrayer.name === 'Dhuha'}
				/>
			</div>
			<div class="h-full min-w-0 flex-1">
				<PrayerCard
					name={prayerService.isFriday ? "Jum'at" : 'Dzuhur'}
					time={prayerService.prayerTimes.dhuhr}
					isActive={nextPrayer.name === 'Dzuhur'}
				/>
			</div>
			<div class="h-full min-w-0 flex-1">
				<PrayerCard
					name="Ashar"
					time={prayerService.prayerTimes.asr}
					isActive={nextPrayer.name === 'Ashar'}
				/>
			</div>
			<div class="h-full min-w-0 flex-1">
				<PrayerCard
					name="Maghrib"
					time={prayerService.prayerTimes.maghrib}
					isActive={nextPrayer.name === 'Maghrib'}
				/>
			</div>
			<div class="h-full min-w-0 flex-1">
				<PrayerCard
					name="Isya"
					time={prayerService.prayerTimes.isha}
					isActive={nextPrayer.name === 'Isya'}
				/>
			</div>
		</div>

		<!-- ROW 4: RUNNING TEXT (Now a full citizen of the grid) -->
		<RunningText />
	</div>

	<!-- Informasi Utama (Big Info) -->
	{#if settings.value.bigInfo}
		<div
			class="fixed inset-0 z-[200] flex items-center justify-center p-12 md:p-24"
			transition:fade
		>
			<div class="absolute inset-0 bg-black/85 backdrop-blur-3xl"></div>
			<div
				class="relative flex min-h-[50vh] w-full max-w-7xl items-center justify-center rounded-[4rem] border border-white/10 bg-white/5 p-16 shadow-2xl backdrop-blur-[80px] md:p-24"
			>
				<p
					class="{bigInfoFontSize} overflow-hidden text-center leading-[1.1] font-black break-words whitespace-pre-wrap text-white"
				>
					{settings.value.bigInfo}
				</p>
			</div>
		</div>
	{/if}

	{#if prayerService.mode === 'preadzan' || prayerService.mode === 'iqomah'}<FocusTimer />
	{:else if prayerService.mode === 'sholat'}<SholatDisplay />
	{:else if prayerService.mode === 'khutbah'}<KhutbahDisplay />
	{/if}

	{#if showDebug}<DebugOverlay onClose={() => (showDebug = false)} />{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		background: #000;
		cursor: none;
		user-select: none;
	}
</style>
