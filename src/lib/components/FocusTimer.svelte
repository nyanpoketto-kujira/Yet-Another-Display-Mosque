<script lang="ts">
	import { prayerService } from '$lib/prayer.svelte';
	import { settings } from '$lib/settings.svelte';
	import { fade, scale } from 'svelte/transition';

	function formatTime(seconds: number | null) {
		if (seconds === null) return '00:00';
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	const title = $derived.by(() => {
		if (prayerService.mode === 'preadzan') return 'Menuju Azan';
		if (prayerService.mode === 'iqomah') return 'Menuju Iqomah';
		return '';
	});

	// Logic detak jantung: Makin cepet kalo udah di bawah 60 detik
	const isUrgent = $derived((prayerService.countdown || 0) < 60);
</script>

<div
	class="fixed inset-0 z-50 flex flex-col items-center justify-center {settings.value.performanceMode === 'minimal' ? 'bg-black' : 'bg-black/60 backdrop-blur-[100px]'} text-white"
	transition:fade
>
	<div
		class="text-center {isUrgent ? 'animate-heartbeat' : ''}"
		transition:scale={{ duration: 800, start: 0.5 }}
	>
		<h2 class="mb-12 text-6xl font-black tracking-[0.3em] uppercase opacity-50">{title}</h2>
		<div
			class="text-[25rem] leading-none font-black tabular-nums drop-shadow-[0_0_100px_rgba(255,255,255,0.2)] {prayerService
				.vibe.accent}"
		>
			{formatTime(prayerService.countdown)}
		</div>
		<div
			class="mt-20 max-w-4xl text-4xl leading-relaxed font-light tracking-widest italic opacity-80"
		>
			"Sesungguhnya shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang
			beriman."
		</div>
	</div>
</div>

<style>
	@keyframes heartbeat {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.8;
		}
	}
	.animate-heartbeat {
		animation: heartbeat 1s ease-in-out infinite;
	}

	:global(.perf-minimal) .animate-heartbeat {
		animation: none !important;
	}
	:global(.perf-minimal) .drop-shadow-\[0_0_100px_rgba\(255\,255\,255\,0\.2\)\] {
		filter: none !important;
	}
</style>
