<script lang="ts">
	import { settings } from '$lib/settings.svelte';
	import { fade } from 'svelte/transition';
	import { Mic2, ShieldAlert } from 'lucide-svelte';
</script>

<div
	class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white"
	transition:fade
>
	<div class="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black"></div>

	<div class="relative z-10 flex flex-col items-center text-center">
		<div
			class="mb-8 rounded-full bg-purple-500/10 p-8 text-purple-400 shadow-[0_0_50px_rgba(168,85,247,0.2)]"
		>
			<Mic2 class="h-24 w-24 animate-pulse" />
		</div>

		<h1 class="mb-4 text-8xl font-black tracking-[0.2em] text-white uppercase drop-shadow-2xl">
			Sedang Khutbah
		</h1>

		<div
			class="mb-12 flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-10 py-6 backdrop-blur-xl"
		>
			<span class="text-2xl font-light text-white/60 italic">Khathib:</span>
			<span class="text-4xl font-black tracking-widest text-purple-400 uppercase">
				{settings.value.fridayKhatib}
			</span>
		</div>

		<div class="mt-12 flex flex-col items-center gap-6 opacity-40">
			<div class="flex items-center gap-4">
				<ShieldAlert class="h-8 w-8 text-rose-400" />
				<p class="text-3xl font-light tracking-[0.3em] uppercase">Mohon Nonaktifkan HP</p>
			</div>
			<p class="text-xl font-extralight tracking-widest italic">
				"Jika engkau berkata kepada temanmu pada hari Jum'at 'Diamlah!' sewaktu imam berkhutbah,
				berarti engkau telah berbuat sia-sia."
			</p>
		</div>
	</div>
</div>
