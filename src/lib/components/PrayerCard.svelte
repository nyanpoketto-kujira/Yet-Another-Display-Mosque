<script lang="ts">
	import { settings } from '$lib/settings.svelte';
	import { prayerService } from '$lib/prayer.svelte';
	import { Clock } from 'lucide-svelte';

	interface Props {
		name: string;
		time: Date;
		isActive?: boolean;
	}

	let { name, time, isActive = false }: Props = $props();

	function formatTime(date: Date) {
		return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
	}

	const themeClasses = $derived.by(() => {
		if (!isActive) return 'border-white/10 bg-white/5 text-white/90 backdrop-blur-lg hover:bg-white/10';

		switch (settings.value.theme) {
			case 'modern':
				return 'scale-105 border-slate-500/50 bg-slate-600/40 text-white shadow-[0_0_50px_rgba(100,116,139,0.3)] backdrop-blur-2xl';
			case 'classic':
				return 'scale-105 border-emerald-400/50 bg-emerald-600/40 text-emerald-50 shadow-[0_0_50px_rgba(16,185,129,0.3)] backdrop-blur-2xl';
			case 'ocean':
				return 'scale-105 border-cyan-400/50 bg-cyan-600/40 text-white shadow-[0_0_50px_rgba(6,182,212,0.3)] backdrop-blur-2xl';
			case 'sunset':
				return 'scale-105 border-orange-400/50 bg-orange-600/40 text-white shadow-[0_0_50px_rgba(249,115,22,0.3)] backdrop-blur-2xl';
			default: // vibe
				return 'scale-105 border-blue-400/50 bg-blue-600/40 text-white shadow-[0_0_50px_rgba(59,130,246,0.3)] backdrop-blur-2xl';
		}
	});
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center rounded-[2.5vh] border p-[1vh] transition-all duration-700 {themeClasses}"
>
	<span class="mb-[0.2vh] text-[clamp(0.8rem,1.8vh,1.5rem)] font-black tracking-[0.2em] uppercase opacity-60"
		>{name}</span
	>
	<span class="text-[clamp(2rem,5.5vh,7rem)] font-black tabular-nums drop-shadow-md">{formatTime(time)}</span
	>
</div>
