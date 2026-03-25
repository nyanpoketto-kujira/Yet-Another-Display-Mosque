<script lang="ts">
	import { settings } from '$lib/settings.svelte';

	const themeClasses = $derived.by(() => {
		switch (settings.value.theme) {
			case 'modern':
				return 'border-slate-700/50 bg-slate-900/80';
			case 'classic':
				return 'border-emerald-700/50 bg-emerald-900/80';
			case 'ocean':
				return 'border-cyan-700/50 bg-cyan-900/80';
			case 'sunset':
				return 'border-orange-700/50 bg-orange-900/80';
			default: // vibe
				return 'border-blue-700/50 bg-blue-900/80';
		}
	});
</script>

<div
	class="w-full overflow-hidden rounded-2xl border-t py-2 text-white backdrop-blur-md {themeClasses}"
>
	<div class="animate-marquee text-2xl font-medium whitespace-nowrap">
		<span class="px-4">{settings.value.runningText}</span>
		<span class="px-4">{settings.value.runningText}</span>
		<span class="px-4">{settings.value.runningText}</span>
	</div>
</div>

<style>
	.animate-marquee {
		display: inline-block;
		animation: marquee 30s linear infinite;
	}

	@keyframes marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-33.33%);
		}
	}
</style>
