<script lang="ts">
	import type { Settings, Transaction, InfoItem } from '$lib/types';
	import { settings } from '$lib/settings.svelte';
	import { soundManager } from '$lib/sound.svelte';
	import { prayerService } from '$lib/prayer.svelte';
	import { formatRupiah, parseRaw } from '$lib/utils/format';
	import { login as authLogin, logout as authLogout, getToken, isAuthenticated } from '$lib/auth';
	import {
		ArrowLeft,
		Save,
		MapPin,
		Clock,
		Wallet,
		Type,
		AlertCircle,
		Plus,
		Minus,
		Trash2,
		Lock,
		Key,
		Eye,
		EyeOff,
		LayoutDashboard,
		Settings as SettingsIcon,
		LogOut,
		Image as ImageIcon,
		Upload,
		Palette,
		CircleCheck,
		CircleX,
  RefreshCw,
  Download,
		MessageSquarePlus,
		Timer,
		Info,
		Zap,
		Cpu,
		Computer,
		Heart,
		Volume2,
		Play,
		Activity,
		Check,
		X
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let isAuthenticatedState = $state(browser && isAuthenticated());
	let passwordInput = $state('');
	let showPass = $state(false);
	let loginError = $state('');
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error' | 'info'>('success');
	let toastVisible = $state(false);
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
		if (toastTimer) clearTimeout(toastTimer);
		toastMessage = msg;
		toastType = type;
		toastVisible = true;
		toastTimer = setTimeout(() => { toastVisible = false; }, 3000);
	}

	onMount(() => {
		settings.load();
	});

	async function checkPassword() {
		loginError = '';
		const ok = await authLogin(passwordInput);
		if (ok) {
			isAuthenticatedState = true;
			passwordInput = '';
		} else {
			loginError = 'Kata sandi salah!';
			passwordInput = '';
		}
	}

	function logout() {
		authLogout();
		isAuthenticatedState = false;
	}

	function goToHome() {
		window.location.href = '/';
	}

	let activeTab = $state<'umum' | 'kas' | 'jadwal' | 'teks' | 'suara' | 'status' | 'bg' | 'about'>(
		'umum'
	);
let updateStatus = $state<'idle' | 'checking' | 'available' | 'latest' | 'error' | 'applying'>('idle');
let latestVersion = $state('');
let latestUrl = $state('');
let releaseNotes = $state('');
let updateError = $state('');

	const tabs = [
		{ id: 'umum', label: 'Umum', icon: SettingsIcon },
		{ id: 'kas', label: 'Kas', icon: Wallet },
		{ id: 'jadwal', label: 'Jadwal', icon: Clock },
		{ id: 'teks', label: 'Info', icon: Type },
		{ id: 'suara', label: 'Suara', icon: Volume2 },
		{ id: 'status', label: 'Status', icon: Activity },
		{ id: 'bg', label: 'BG', icon: ImageIcon },
		{ id: 'about', label: 'About', icon: Cpu }
	] as const;

	const prayerLabels: Record<string, string> = {
		fajr: 'Subuh',
		sunrise: 'Syuruq',
		dhuha: 'Dhuha',
		dhuhr: 'Dzuhur',
		asr: 'Ashar',
		maghrib: 'Maghrib',
		isha: 'Isya'
	};

	// Mutasi Kas Logic
	let txDesc = $state('');
	let txAmountInput = $state('');
	let txType = $state<'in' | 'out'>('in');

	function handleAmountInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const raw = parseRaw(target.value);
		txAmountInput = raw > 0 ? formatRupiah(raw) : '';
	}

	function addTransaction() {
		const amount = parseRaw(txAmountInput);
		if (!txDesc || amount <= 0) return;
		const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
		const tx: Transaction = {
			id,
			date: new Date().toLocaleDateString('id-ID', {
				day: '2-digit',
				month: 'short',
				year: 'numeric'
			}),
			desc: txDesc,
			amount,
			type: txType
		};
		const currentTxs = [tx, ...settings.value.transactions];
		const newBalance =
			tx.type === 'in'
				? Number(settings.value.cash) + amount
				: Number(settings.value.cash) - amount;
		settings.update({ transactions: currentTxs, cash: newBalance });
		txDesc = '';
		txAmountInput = '';
		showToast('Transaksi berhasil ditambahkan', 'success');
	}

	function removeTransaction(id: string) {
		if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return;
		const tx = settings.value.transactions.find((t) => t.id === id);
		if (!tx) return;
		const newBalance =
			tx.type === 'in' ? settings.value.cash - tx.amount : settings.value.cash + tx.amount;
		settings.update({
			transactions: settings.value.transactions.filter((t) => t.id !== id),
			cash: newBalance
		});
		showToast('Transaksi dihapus', 'info');
	}

	// INFO MANAGEMENT
	let newInfoHeader = $state('');
	let newInfoContent = $state('');
	let newInfoFooter = $state('');

	function addInfo() {
		if (!newInfoContent) return;
		const newInfo: InfoItem = {
			id: Math.random().toString(36).substring(2, 9),
			header: newInfoHeader || 'Informasi',
			content: newInfoContent,
			footer: newInfoFooter,
			active: true
		};
		settings.update({ infos: [newInfo, ...settings.value.infos] });
		newInfoHeader = '';
		newInfoContent = '';
		newInfoFooter = '';
		showToast('Informasi berhasil ditambahkan', 'success');
	}

	function toggleInfo(id: string) {
		const newInfos = settings.value.infos.map((info) =>
			info.id === id ? { ...info, active: !info.active } : info
		);
		settings.update({ infos: newInfos });
	}

	function deleteInfo(id: string) {
		if (!confirm('Hapus informasi ini?')) return;
		settings.update({ infos: settings.value.infos.filter((i) => i.id !== id) });
		showToast('Informasi dihapus', 'info');
	}

	// Background Management
	let isUploading = $state(false);
	async function handleUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		isUploading = true;
		const formData = new FormData();
		formData.append('file', file);
		try {
			const token = getToken();
			const headers: Record<string, string> = {};
			if (token) headers['Authorization'] = `Bearer ${token}`;
			const res = await fetch('/api/upload', { method: 'POST', body: formData, headers });
			const data = await res.json();
			if (data.fileName) {
				settings.update({ backgrounds: [...settings.value.backgrounds, data.fileName] });
				showToast('Gambar berhasil diupload', 'success');
			}
		} catch {
			showToast('Maaf, gagal mengunggah gambar.', 'error');
		} finally {
			isUploading = false;
		}
	}

	async function removeBg(path: string) {
		if (!confirm('Hapus gambar ini dari koleksi background?')) return;
		try {
			const token = getToken();
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (token) headers['Authorization'] = `Bearer ${token}`;
			await fetch('/api/upload', {
				method: 'DELETE',
				headers,
				body: JSON.stringify({ fileName: path })
			});
			settings.update({ backgrounds: settings.value.backgrounds.filter((bg) => bg !== path) });
			showToast('Gambar berhasil dihapus', 'success');
		} catch {
			showToast('Gagal menghapus gambar.', 'error');
		}
	}

	async function handleSave() {
		await settings.save();
		showToast('Alhamdulillah, semua perubahan berhasil disimpan.', 'success');
	}

	function testSound(file: string) {
		soundManager.init();
		soundManager.unlock();
		soundManager.play(file);
	}

	interface ServerStatus {
		platform: string;
		arch: string;
		cpus: number;
		loadAvg: number[];
		memory: { total: number; free: number; used: number; usagePercent: number };
		processUptime: number;
		heap: number;
	}

	let serverStatus = $state<ServerStatus | null>(null);
	let statusTimer: ReturnType<typeof setInterval> | null = null;

	async function fetchStatus() {
		try {
			const token = getToken();
			const headers: Record<string, string> = {};
			if (token) headers['Authorization'] = `Bearer ${token}`;
			const res = await fetch('/api/status', { headers });
			if (res.ok) serverStatus = await res.json();
		} catch {
			// ignore
		}
	}

	$effect(() => {
		if (activeTab === 'status') {
			fetchStatus();
			statusTimer = setInterval(fetchStatus, 5000);
			return () => {
				if (statusTimer) clearInterval(statusTimer);
			};
		}
	});

	function fmtBytes(bytes: number) {
		const units = ['B', 'KB', 'MB', 'GB'];
		let i = 0;
		let val = bytes;
		while (val >= 1024 && i < units.length - 1) {
			val /= 1024;
			i++;
		}
		return `${val.toFixed(1)} ${units[i]}`;
	}

	function fmtUptime(sec: number) {
		const d = Math.floor(sec / 86400);
		const h = Math.floor((sec % 86400) / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = Math.floor(sec % 60);
		const parts = [];
		if (d > 0) parts.push(`${d}h`);
		if (h > 0) parts.push(`${h}j`);
		if (m > 0) parts.push(`${m}m`);
		parts.push(`${s}d`);
		return parts.join(' ');
	}

	const offsetKeys = $derived(
		settings.value ? (Object.keys(settings.value.offsets) as (keyof Settings['offsets'])[]) : []
	);
	const iqomahKeys = $derived(
		settings.value ? (Object.keys(settings.value.iqomah) as (keyof Settings['iqomah'])[]) : []
	);

async function checkUpdate() {
    updateStatus = 'checking';
    updateError = '';
    try {
        const res = await fetch(
            'https://api.github.com/repos/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases/latest',
            { signal: AbortSignal.timeout(10000) }
        );
        if (!res.ok) throw new Error('Gagal hubungi GitHub');
        const data = await res.json();
        const current = 'v1.1.0';
        const latest = data.tag_name || '';
        latestVersion = latest;
        latestUrl = data.html_url || '';
        releaseNotes = data.body || '';

        // Compare versions numerically (semver, left-to-right)
        const parseVer = (v: string) => v.replace(/^v/, '').split('.').map(Number);
        const currentParts = parseVer(current);
        const latestParts = parseVer(latest);
        let isLatest = true;
        for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
            const cur = currentParts[i] ?? 0;
            const lat = latestParts[i] ?? 0;
            if (lat > cur) { isLatest = false; break; }
            if (cur > lat) { break; }
        }
        if (isLatest) {
            updateStatus = 'latest';
        } else if (latest) {
            updateStatus = 'available';
        } else {
            throw new Error('Tidak dapat membaca versi');
        }
    } catch (e) {
        updateStatus = 'error';
        updateError = e instanceof Error ? e.message : 'Koneksi gagal';
    }
}

async function applyUpdate() {
	if (!latestVersion) return;
	updateStatus = 'applying';
	try {
		const token = getToken();
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (token) headers['Authorization'] = `Bearer ${token}`;

		const res = await fetch('/api/update', {
			method: 'POST',
			headers,
			body: JSON.stringify({ version: latestVersion })
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err.error || 'Gagal memasang update');
		}
		// Server akan restart — tunggu beberapa detik lalu reload
		setTimeout(() => {
			window.location.reload();
		}, 8000);
	} catch (e) {
		updateStatus = 'available';
		const msg = e instanceof Error ? e.message : 'Gagal memasang update';
		showToast(msg, 'error');
	}
}
</script>

<div class="min-h-screen bg-slate-950 pb-32 font-sans text-slate-200">
	{#if !isAuthenticatedState}
		<div class="flex min-h-screen items-center justify-center p-4" transition:fade>
			<div
				class="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl md:p-10"
			>
				<div class="mb-6 inline-block rounded-2xl bg-blue-500/10 p-4">
					<Lock class="h-8 w-8 text-blue-400" />
				</div>
				<h1 class="mb-2 text-2xl font-black tracking-tighter text-white uppercase md:text-3xl">
					Panel Admin
				</h1>
				<div class="space-y-4 text-left">
					<div class="relative">
						<Key class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500" />
						<input
							type={showPass ? 'text' : 'password'}
							bind:value={passwordInput}
							onkeydown={(e) => e.key === 'Enter' && checkPassword()}
							placeholder="Masukkan Kata Sandi..."
							class="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 pr-12 pl-12 text-sm outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							onclick={() => (showPass = !showPass)}
							class="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 hover:text-slate-300"
						>
							{#if showPass}<EyeOff class="h-5 w-5" />{:else}<Eye class="h-5 w-5" />{/if}
						</button>
					</div>
					{#if loginError}
						<p class="text-xs font-bold text-rose-400">{loginError}</p>
					{/if}
					<button
						onclick={checkPassword}
						class="w-full rounded-xl bg-blue-600 p-4 text-center text-sm font-black tracking-widest text-white uppercase shadow-lg transition-all hover:bg-blue-500 active:scale-95"
						>MASUK SISTEM</button
					>
				</div>
			</div>
		</div>
	{:else}
		<header
			class="sticky top-0 z-40 mb-4 border-b border-slate-800 bg-slate-950/80 p-4 backdrop-blur-md md:p-6"
		>
			<div class="mx-auto flex max-w-4xl items-center justify-between">
				<div class="flex items-center gap-2 md:gap-4">
					<button onclick={goToHome} class="rounded-xl p-2 transition-colors hover:bg-slate-800"
						><ArrowLeft class="h-5 w-5 text-white" /></button
					>
					<div>
						<h1
							class="text-lg leading-none font-black tracking-tight text-white uppercase md:text-xl"
						>
							PENGURUS MASJID
						</h1>
						<p class="mt-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
							Panel Kontrol Layar
						</p>
					</div>
				</div>
				<div class="flex items-center gap-4 md:gap-8">
					<div class="hidden text-right sm:block">
						<p class="text-[10px] font-black text-slate-500 uppercase">Waktu Server</p>
						<p class="font-mono text-lg leading-none font-bold text-emerald-400">
							{prayerService.currentTime.toLocaleTimeString('id-ID')}
						</p>
					</div>
					<button
						onclick={logout}
						class="rounded-xl border border-rose-500/20 p-2 text-rose-500 hover:bg-rose-500/10"
						><LogOut class="h-5 w-5" /></button
					>
				</div>
			</div>
		</header>

		<nav class="sticky top-20 z-30 mx-auto mb-6 max-w-4xl px-4">
			<div
				class="no-scrollbar flex overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-1 shadow-lg"
			>
				{#each tabs as tab (tab.id)}
					<button
						onclick={() => (activeTab = tab.id)}
						class="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold whitespace-nowrap transition-all {activeTab ===
						tab.id
							? 'bg-blue-600 text-white shadow-lg'
							: 'text-slate-500 hover:text-slate-300'}"
					>
						<tab.icon class="h-4 w-4" /><span>{tab.label}</span>
					</button>
				{/each}
			</div>
		</nav>

		<main class="mx-auto max-w-4xl space-y-6 px-4">
			{#if activeTab === 'bg'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<ImageIcon class="h-5 w-5 text-blue-400" />
								<h2 class="text-sm font-black tracking-widest uppercase">Koleksi Background</h2>
							</div>
							<div
								class="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-2"
							>
								<Timer class="h-4 w-4 text-blue-400" /><span
									class="text-[9px] font-black text-slate-500 uppercase">Slide:</span
								>
								<input
									type="number"
									bind:value={settings.value.bgSlideshowDuration}
									class="w-12 bg-transparent text-center text-xs font-bold outline-none"
								/><span class="text-[9px] font-black text-slate-700">Detik</span>
							</div>
						</div>
						<div class="group relative mb-8">
							<input
								type="file"
								accept="image/*"
								onchange={handleUpload}
								class="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
							/>
							<div
								class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/50 p-8 transition-all group-hover:border-blue-500/5 group-hover:bg-blue-500/5"
							>
								{#if isUploading}<div
										class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"
									></div>
									<p class="mt-4 animate-pulse text-xs font-bold text-blue-400">Mengunggah...</p>
								{:else}<div class="mb-4 rounded-full bg-blue-500/10 p-4 text-blue-400">
										<Upload class="h-6 w-6" />
									</div>
									<p class="text-sm font-bold text-slate-400">Klik untuk mengunggah gambar</p>{/if}
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
							{#each settings.value.backgrounds as bg (bg)}<div
									class="group relative aspect-video overflow-hidden rounded-xl border border-slate-800"
									transition:slide
								>
									<img
										src={bg}
										alt="BG"
										class="h-full w-full object-cover transition-transform group-hover:scale-110"
									/>
									<div
										class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<button
											onclick={() => removeBg(bg)}
											class="rounded-lg bg-rose-600 p-2 text-white hover:bg-rose-500"
											><Trash2 class="h-4 w-4" /></button
										>
									</div>
								</div>{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if activeTab === 'jadwal'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					<!-- Waktu Persiapan -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<AlertCircle class="h-5 w-5 text-rose-400" />
								<h2 class="text-sm font-black tracking-widest uppercase">Persiapan Azan</h2>
							</div>
							<div
								class="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"
							>
								<Timer class="h-5 w-5 text-rose-400" /><input
									type="number"
									bind:value={settings.value.preAdzanDuration}
									class="w-16 bg-transparent text-center text-lg font-bold outline-none"
								/><span class="text-[10px] font-black text-slate-500 uppercase">Menit</span>
							</div>
						</div>
						<div class="flex gap-3 rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4">
							<Info class="h-4 w-4 shrink-0 text-rose-400" />
							<p class="text-[10px] leading-relaxed text-slate-400">
								Layar countdown akan muncul otomatis di display <span
									class="font-bold text-rose-400">{settings.value.preAdzanDuration} menit</span
								> sebelum waktu azan tiba.
							</p>
						</div>
					</section>

					<!-- Sinkronisasi Waktu (Time Drift) -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<Zap class="h-5 w-5 text-yellow-400" />
								<h2 class="text-sm font-black tracking-widest uppercase">Sinkronisasi Waktu</h2>
							</div>
							<div
								class="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-2"
							>
								<button
									onclick={() => settings.value.drift--}
									class="p-2 text-slate-500 transition-colors hover:text-white"
									><Minus class="h-4 w-4" /></button
								>
								<div class="flex items-center gap-3 px-2">
									<Timer class="h-5 w-5 text-yellow-400" />
									<input
										type="number"
										bind:value={settings.value.drift}
										class="w-16 bg-transparent text-center text-xl font-black text-yellow-400 outline-none"
									/>
									<span class="text-[10px] font-black text-slate-500 uppercase">Detik</span>
								</div>
								<button
									onclick={() => settings.value.drift++}
									class="p-2 text-slate-500 transition-colors hover:text-white"
									><Plus class="h-4 w-4" /></button
								>
							</div>
						</div>
						<div class="flex gap-3 rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-4">
							<Clock class="h-4 w-4 shrink-0 text-yellow-400" />
							<p class="text-[10px] leading-relaxed text-slate-400">
								Gunakan fitur ini untuk menyesuaikan jam display dengan jam lokal masjid. <span
									class="font-bold text-yellow-400">Positif (+)</span
								>
								untuk mempercepat, <span class="font-bold text-yellow-400">Negatif (-)</span> untuk memperlambat.
							</p>
						</div>
					</section>

					<!-- Koreksi Jadwal -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center gap-3">
							<Clock class="h-5 w-5 text-emerald-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">
								Koreksi Jadwal Sholat (Menit)
							</h2>
						</div>
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
							{#each offsetKeys as p (p)}
								<div class="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
									<label
										for="offset-{p}"
										class="mb-2 block text-[10px] font-black text-slate-500 uppercase"
										>{prayerLabels[p]}</label
									>
									<div class="flex items-center justify-center gap-2">
										<button
											onclick={() => settings.value.offsets[p]--}
											class="p-2 text-slate-500 transition-colors hover:text-white"
											><Minus class="h-4 w-4" /></button
										>
										<input
											id="offset-{p}"
											type="number"
											bind:value={settings.value.offsets[p]}
											class="w-14 bg-transparent text-center text-2xl font-black text-emerald-400 outline-none"
										/>
										<button
											onclick={() => settings.value.offsets[p]++}
											class="p-2 text-slate-500 transition-colors hover:text-white"
											><Plus class="h-4 w-4" /></button
										>
									</div>
								</div>
							{/each}
						</div>
						<p
							class="mt-4 text-center text-[9px] font-bold tracking-widest text-slate-500 uppercase opacity-50"
						>
							Gunakan fitur ini jika jadwal display berbeda dengan jadwal lokal masjid
						</p>
					</section>

					<!-- Tunggu Iqomah -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center gap-3">
							<Timer class="h-5 w-5 text-blue-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">Jeda Menuju Iqomah</h2>
						</div>
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
							{#each iqomahKeys as p (p)}
								<div class="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
									<label
										for="iqomah-{p}"
										class="mb-2 block text-[10px] font-black text-slate-500 uppercase"
										>{prayerLabels[p]}</label
									>
									<div class="flex items-center justify-center gap-1">
										<button
											onclick={() => settings.value.iqomah[p]--}
											class="p-1 text-slate-700 transition-colors hover:text-white"
											><Minus class="h-4 w-4" /></button
										>
										<input
											id="iqomah-{p}"
											type="number"
											bind:value={settings.value.iqomah[p]}
											class="w-14 bg-transparent text-center text-2xl font-black text-blue-400 outline-none"
										/>
										<button
											onclick={() => settings.value.iqomah[p]++}
											class="p-1 text-slate-700 transition-colors hover:text-white"
											><Plus class="h-4 w-4" /></button
										>
									</div>
									<span class="text-[8px] font-black text-slate-700 uppercase">Menit</span>
								</div>
							{/each}
						</div>
					</section>

					<!-- Pengaturan Jumat -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center gap-3">
							<LayoutDashboard class="h-5 w-5 text-purple-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">Khusus Hari Jum'at</h2>
						</div>
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div class="rounded-2xl border border-slate-800 bg-slate-950 p-6">
								<label
									for="friday-khatib"
									class="mb-4 block text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase"
									>Nama Khathib</label
								>
								<input
									id="friday-khatib"
									type="password"
									bind:value={settings.value.fridayKhatib}
									placeholder="Nama Khathib..."
									class="w-full rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500"
								/>
							</div>
							<div class="rounded-2xl border border-slate-800 bg-slate-950 p-6">
								<label
									for="friday-duration"
									class="mb-4 block text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase"
									>Durasi Khutbah (Menit)</label
								>
								<div class="flex items-center gap-4">
									<Timer class="h-6 w-6 text-purple-400" />
									<input
										id="friday-duration"
										type="number"
										bind:value={settings.value.fridayKhutbahDuration}
										class="flex-1 bg-transparent text-2xl font-black text-white outline-none"
									/>
								</div>
							</div>
						</div>
					</section>
				</div>
			{/if}

			{#if activeTab === 'teks'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center gap-3">
							<Type class="h-5 w-5 text-purple-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">Teks Berjalan</h2>
						</div>
						<textarea
							bind:value={settings.value.runningText}
							class="h-24 w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm outline-none focus:ring-2 focus:ring-purple-500"
						></textarea>
					</section>
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-8 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<MessageSquarePlus class="h-5 w-5 text-emerald-400" />
								<h2 class="text-sm font-black tracking-widest uppercase">Daftar Informasi</h2>
							</div>
							<div
								class="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-2"
							>
								<Timer class="h-4 w-4 text-emerald-400" /><span
									class="text-[9px] font-black text-slate-500 uppercase">Slide:</span
								>
								<input
									type="number"
									bind:value={settings.value.infoSlideshowDuration}
									class="w-12 bg-transparent text-center text-xs font-bold outline-none"
								/><span class="text-[9px] font-black text-slate-700">Detik</span>
							</div>
						</div>
						<div class="mb-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-6">
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<input
									bind:value={newInfoHeader}
									placeholder="Judul (misal: Info 1)"
									class="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm outline-none"
								/>
								<input
									bind:value={newInfoFooter}
									placeholder="Sumber (misal: HR. Muslim)"
									class="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm outline-none"
								/>
							</div>
							<textarea
								bind:value={newInfoContent}
								placeholder="Isi pesan..."
								class="h-24 w-full rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm outline-none"
							></textarea>
							<button
								onclick={addInfo}
								class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-4 text-xs font-black text-white uppercase transition-all hover:bg-blue-500"
								><Plus class="h-4 w-4" /> TAMBAH INFO</button
							>
						</div>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							{#each settings.value.infos as info (info.id)}
								<div
									class="flex flex-col rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg"
									transition:slide
								>
									<div class="mb-4 flex items-center justify-between">
										<span
											class="rounded-lg bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-400 uppercase"
											>{info.header}</span
										>
										<div class="flex items-center gap-2">
											<button
												onclick={() => toggleInfo(info.id)}
												class="p-2 {info.active ? 'text-emerald-400' : 'text-slate-600'}"
												>{#if info.active}<CircleCheck class="h-5 w-5" />{:else}<CircleX
														class="h-5 w-5"
													/>{/if}</button
											>
											<button onclick={() => deleteInfo(info.id)} class="p-2 text-rose-500"
												><Trash2 class="h-5 w-5" /></button
											>
										</div>
									</div>
									<p class="mb-4 flex-1 text-sm leading-relaxed italic opacity-80">
										"{info.content}"
									</p>
									<div
										class="mt-auto border-t border-slate-800 pt-4 text-[10px] font-black text-slate-600 uppercase"
									>
										{info.footer || '-'}
									</div>
								</div>
							{/each}
						</div>
					</section>
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center gap-3">
							<AlertCircle class="h-5 w-5 text-rose-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">Pesan Darurat</h2>
						</div>
						<input
							bind:value={settings.value.bigInfo}
							class="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm outline-none focus:ring-2 focus:ring-rose-500"
							placeholder="Biarkan kosong jika tidak ada pesan darurat"
						/>
					</section>
				</div>
			{/if}

			{#if activeTab === 'umum'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					<!-- Pilihan Tema -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center justify-center gap-3">
							<Palette class="h-5 w-5 text-purple-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">Tema Tampilan</h2>
						</div>
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
							{#each [{ id: 'vibe', label: 'Dynamic', color: 'from-blue-600 to-purple-600' }, { id: 'modern', label: 'Modern', color: 'from-slate-700 to-slate-900' }, { id: 'classic', label: 'Classic', color: 'from-emerald-700 to-teal-900' }, { id: 'ocean', label: 'Ocean', color: 'from-cyan-600 to-blue-800' }, { id: 'sunset', label: 'Sunset', color: 'from-orange-600 to-rose-800' }] as t (t.id)}
								<button
									onclick={() => (settings.value.theme = t.id as Settings['theme'])}
									class="relative overflow-hidden rounded-2xl border-2 p-4 transition-all {settings
										.value.theme === t.id
										? 'scale-105 border-white shadow-lg'
										: 'border-transparent opacity-60 hover:opacity-100'}"
								>
									<div class="absolute inset-0 bg-gradient-to-br {t.color} opacity-40"></div>
									<div class="relative flex flex-col items-center gap-2">
										<div
											class="h-8 w-8 rounded-full bg-gradient-to-br {t.color} shadow-inner"
										></div>
										<span class="text-[10px] font-black tracking-widest uppercase">{t.label}</span>
									</div>
									{#if settings.value.theme === t.id}
										<div class="absolute top-2 right-2">
											<CircleCheck class="h-4 w-4 text-white" />
										</div>
									{/if}
								</button>
							{/each}
						</div>
					</section>

					<section
						class="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl"
					>
						<div class="mb-6 flex items-center justify-center gap-3">
							<MapPin class="h-5 w-5 text-emerald-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">Koordinat Lokasi</h2>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="lat" class="mb-2 block text-[10px] font-black text-slate-500 uppercase"
									>Lat</label
								>
								<input
									id="lat"
									type="number"
									step="any"
									bind:value={settings.value.lat}
									class="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-sm"
								/>
							</div>
							<div>
								<label for="lng" class="mb-2 block text-[10px] font-black text-slate-500 uppercase"
									>Lng</label
								>
								<input
									id="lng"
									type="number"
									step="any"
									bind:value={settings.value.lng}
									class="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-sm"
								/>
							</div>
						</div>
					</section>
					<section
						class="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl"
					>
						<div class="mb-6 flex items-center justify-center gap-3">
							<Key class="h-5 w-5 text-blue-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">Keamanan</h2>
						</div>
						<label
							for="admin-password"
							class="mb-2 block text-[10px] font-black text-slate-500 uppercase"
							>Kata Sandi Baru</label
						>
						<input
							id="admin-password"
							type="password"
							bind:value={settings.value.adminPassword}
							class="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-center font-mono text-sm"
						/>
					</section>
					<!-- Mode Tampilan -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl">
						<div class="mb-6 flex items-center justify-center gap-3">
							<Zap class="h-5 w-5 text-amber-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">Mode Tampilan</h2>
						</div>
						<p class="mb-6 text-[10px] leading-relaxed text-slate-500">
							Untuk perangkat spek rendah (Android TV box, RAM kecil), pilih 'Ringan' atau 'Minimal' agar display tetap berjalan mulus.
						</p>
						<div class="grid grid-cols-3 gap-3">
							{#each [
								{ id: 'penuh', label: 'Penuh', desc: 'Semua efek visual', icon: 'bg-gradient-to-br from-blue-600 to-purple-600' },
								{ id: 'ringan', label: 'Ringan', desc: 'Tanpa efek kaca', icon: 'bg-gradient-to-br from-amber-500 to-orange-500' },
								{ id: 'minimal', label: 'Minimal', desc: 'Hanya teks & warna solid', icon: 'bg-gradient-to-br from-slate-500 to-slate-700' }
							] as item}
								<button
									onclick={() => (settings.value.performanceMode = item.id as Settings['performanceMode'])}
									class="relative overflow-hidden rounded-2xl border-2 p-4 transition-all {settings.value.performanceMode === item.id ? 'scale-105 border-amber-400 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}"
								>
									<div class="absolute inset-0 {item.icon} opacity-20"></div>
									<div class="relative flex flex-col items-center gap-2">
										<div class="h-8 w-8 rounded-full {item.icon} shadow-inner"></div>
										<span class="text-xs font-black tracking-widest uppercase">{item.label}</span>
										<span class="text-[8px] text-slate-500">{item.desc}</span>
									</div>
								</button>
							{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if activeTab === 'kas'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<Wallet class="h-5 w-5 text-emerald-400" />
								<h2 class="text-sm font-black tracking-widest uppercase">Laporan Kas</h2>
							</div>
							<label
								class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 transition-all hover:bg-slate-800"
							>
								<span class="text-[10px] font-black text-slate-500 uppercase"
									>Sembunyikan Nominal</span
								>
								<input
									type="checkbox"
									bind:checked={settings.value.hideTransactionAmount}
									class="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500"
								/>
							</label>
						</div>
						<div
							class="mb-6 space-y-4 rounded-2xl border border-slate-800/50 bg-slate-950 p-5 text-center"
						>
							<input
								bind:value={txDesc}
								placeholder="Keterangan..."
								class="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm outline-none"
							/>
							<div class="grid grid-cols-2 gap-3">
								<input
									bind:value={txAmountInput}
									oninput={handleAmountInput}
									placeholder="Jumlah"
									class="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 font-mono font-bold"
								/><select
									bind:value={txType}
									class="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-bold"
									><option value="in">MASUK (+)</option><option value="out">KELUAR (-)</option
									></select
								>
							</div>
							<button
								onclick={addTransaction}
								class="w-full rounded-xl bg-emerald-600 p-4 text-xs font-black text-white uppercase"
								>CATAT TRANSAKSI</button
							>
						</div>
						<div class="mb-4 flex items-end justify-between px-2">
							<p class="text-[10px] font-black text-slate-500 uppercase">Total Saldo</p>
							<p class="text-2xl font-black text-emerald-400 tabular-nums">
								{formatRupiah(settings.value.cash)}
							</p>
						</div>
						<div
							class="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-950"
						>
							{#each settings.value.transactions as tx (tx.id)}<div
									class="flex items-center justify-between p-4 hover:bg-slate-800/30"
								>
									<div class="min-w-0 flex-1 pr-2">
										<p class="truncate text-sm font-bold">{tx.desc}</p>
										<p class="text-[9px] font-black text-slate-500 uppercase">{tx.date}</p>
									</div>
									<div class="flex items-center gap-4">
										<p
											class="font-mono text-sm font-black {tx.type === 'in'
												? 'text-emerald-400'
												: 'text-rose-400'}"
										>
											{tx.type === 'in' ? '+' : '-'}
											{formatRupiah(tx.amount)}
										</p>
										<button onclick={() => removeTransaction(tx.id)} class="p-2 text-rose-500"
											><Trash2 class="h-4 w-4" /></button
										>
									</div>
								</div>{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if activeTab === 'suara'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					{#each [{ key: 'preadzan' as const, label: 'Pra-Adzan', desc: `Setiap ${settings.value.preAdzanDuration} menit sebelum adzan (mode hitung mundur)`, color: 'text-amber-400', border: 'border-amber-500/10', bg: 'bg-amber-500/5' }, { key: 'azan' as const, label: 'Azan', desc: 'Tepat waktu adzan tiba (mode iqomah dimulai)', color: 'text-blue-400', border: 'border-blue-500/10', bg: 'bg-blue-500/5' }, { key: 'iqomah' as const, label: 'Iqomah', desc: 'Saat iqomah tiba (mode sholat dimulai)', color: 'text-emerald-400', border: 'border-emerald-500/10', bg: 'bg-emerald-500/5' }] as s (s.key)}
						{@const cfg = settings.value.sound[s.key]}
						<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
							<div class="mb-4 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<Volume2 class="h-5 w-5 {s.color}" />
									<h2 class="text-sm font-black tracking-widest uppercase">{s.label}</h2>
								</div>
								<label
									class="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 transition-all hover:bg-slate-800"
								>
									<span class="text-[10px] font-black text-slate-500 uppercase">Nyala</span>
									<input
										type="checkbox"
										bind:checked={cfg.enabled}
										class="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500"
									/>
								</label>
							</div>
							<div class="mb-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
								<label
									for="sound-{s.key}"
									class="mb-3 block text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase"
									>Pilih Suara</label
								>
								<div class="flex gap-3">
									<select
										id="sound-{s.key}"
										bind:value={cfg.file}
										class="flex-1 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="/sounds/mixkit-alarm-digital-clock-beep-989.wav"
											>Digital Clock Beep</option
										>
										<option value="/sounds/mixkit-positive-interface-beep-221.wav"
											>Positive Interface Beep</option
										>
										<option value="/sounds/u_edtmwfwu7c-beep-329314.mp3">Notification Beep</option>
										<option value="/sounds/universfield-new-notification-022-370046.mp3"
											>New Notification 1</option
										>
										<option value="/sounds/universfield-new-notification-036-485897.mp3"
											>New Notification 2</option
										>
									</select>
									<button
										onclick={() => testSound(cfg.file)}
										class="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-xs font-black text-white uppercase transition-all hover:bg-blue-500 active:scale-95"
									>
										<Play class="h-4 w-4" /> Tes
									</button>
								</div>
							</div>
							<div class="flex gap-3 rounded-2xl border {s.border} {s.bg} p-4">
								<Volume2 class="h-4 w-4 shrink-0 {s.color}" />
								<p class="text-[10px] leading-relaxed text-slate-400">{s.desc}</p>
							</div>
						</section>
					{/each}
				</div>
			{/if}

			{#if activeTab === 'status'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					{#if serverStatus}
						<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
							<div class="mb-6 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<Activity class="h-5 w-5 text-emerald-400" />
									<h2 class="text-sm font-black tracking-widest uppercase">Perangkat</h2>
								</div>
								<button
									onclick={fetchStatus}
									class="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-[10px] font-black tracking-wider text-slate-400 uppercase transition-all hover:bg-slate-800"
									>Segarkan</button
								>
							</div>
							<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
								<div class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
									<p class="text-[9px] font-black tracking-[0.2em] text-slate-600 uppercase">
										Platform
									</p>
									<p class="mt-1 text-sm font-black text-white">
										{serverStatus.platform} ({serverStatus.arch})
									</p>
								</div>
								<div class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
									<p class="text-[9px] font-black tracking-[0.2em] text-slate-600 uppercase">CPU</p>
									<p class="mt-1 text-sm font-black text-white">{serverStatus.cpus} Core</p>
								</div>
							</div>
						</section>

						<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
							<div class="mb-6 flex items-center gap-3">
								<Activity class="h-5 w-5 text-blue-400" />
								<h2 class="text-sm font-black tracking-widest uppercase">Memori</h2>
							</div>
							<div class="mb-4 flex items-end justify-between">
								<span class="text-4xl font-black text-white tabular-nums"
									>{serverStatus.memory.usagePercent}%</span
								>
								<div class="text-right">
									<p class="text-xs font-bold text-slate-400">
										{fmtBytes(serverStatus.memory.used)} / {fmtBytes(serverStatus.memory.total)}
									</p>
									<p class="text-[10px] font-bold text-slate-600">
										Sisa {fmtBytes(serverStatus.memory.free)}
									</p>
								</div>
							</div>
							<div class="h-3 overflow-hidden rounded-full bg-slate-800">
								<div
									class="h-full rounded-full transition-all duration-1000 {serverStatus.memory
										.usagePercent > 80
										? 'bg-rose-500'
										: serverStatus.memory.usagePercent > 50
											? 'bg-amber-500'
											: 'bg-emerald-500'}"
									style="width: {serverStatus.memory.usagePercent}%"
								></div>
							</div>
							<div class="mt-4 grid grid-cols-2 gap-4">
								<div class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
									<p class="text-[9px] font-black tracking-[0.2em] text-slate-600 uppercase">
										Heap Node
									</p>
									<p class="mt-1 text-sm font-black text-white">{fmtBytes(serverStatus.heap)}</p>
								</div>
								<div class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
									<p class="text-[9px] font-black tracking-[0.2em] text-slate-600 uppercase">
										CPU Load
									</p>
									<p class="mt-1 text-sm font-black text-white">
										{serverStatus.loadAvg[0].toFixed(2)}
									</p>
								</div>
							</div>
						</section>

						<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<Clock class="h-5 w-5 text-purple-400" />
									<h2 class="text-sm font-black tracking-widest uppercase">Uptime</h2>
								</div>
								<div
									class="text-right text-sm font-black text-white tabular-nums"
								>
									<p class="text-[10px] font-bold text-slate-500">Server</p>
									<p>{fmtUptime(serverStatus.processUptime)}</p>
								</div>
							</div>
						</section>
					{:else}
						<div class="flex items-center justify-center py-20">
							<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
						</div>
					{/if}
				</div>
			{/if}

			{#if activeTab === 'about'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					<section
						class="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl"
					>
						<div class="mb-6 inline-block rounded-full bg-blue-500/10 p-6">
							<Cpu class="h-12 w-12 text-blue-400" />
						</div>
						<h2 class="text-2xl font-black tracking-tighter text-white uppercase">
							Al-Ye'AnDiMo v1.1.0
						</h2>
						<p class="mt-2 text-xs font-bold tracking-[0.3em] text-slate-500 uppercase">
							Alhamdulillah It's Yet Another Display Mosque
						</p>

						<div
							class="my-8 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"
						></div>

						<div class="space-y-4 text-sm text-slate-400">
							<p>
								Sistem informasi display masjid berbasis web yang ringan, modern, dan mudah
								dikustomisasi.
							</p>
							<div class="flex flex-wrap justify-center gap-2 pt-4">
								<span
									class="rounded-full border border-slate-800 bg-slate-950 px-4 py-1 text-[10px] font-bold"
									>Svelte 5</span
								>
								<span
									class="rounded-full border border-slate-800 bg-slate-950 px-4 py-1 text-[10px] font-bold"
									>TailwindCSS</span
								>
								<span
									class="rounded-full border border-slate-800 bg-slate-950 px-4 py-1 text-[10px] font-bold"
									>Vite</span
								>
							</div>
						</div>

						<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
							<a
								href="https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque"
								target="_blank"
								class="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 transition-all hover:bg-slate-800"
							>
								<Computer class="h-5 w-5 text-white" />
								<span class="text-xs font-black tracking-widest uppercase">Source Code</span>
							</a>
							<div
								class="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4"
							>
								<Heart class="h-5 w-5 fill-rose-500 text-rose-500" />
								<span class="text-xs font-black tracking-widest text-slate-300 uppercase"
									>nyanpoketto-kujira</span
								>
							</div>
						</div>

						<div class="my-8 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

						<div class="text-center">
							<h3 class="mb-6 text-sm font-black tracking-widest uppercase">Update & Versi</h3>

							<p class="mb-6 text-sm text-slate-400">
								Versi saat ini: <span class="font-bold text-white">v1.1.0</span>
							</p>

							{#if updateStatus === 'idle'}
								<button
									onclick={checkUpdate}
									class="inline-flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-3 text-xs font-black tracking-widest text-blue-400 uppercase transition-all hover:bg-blue-500/20"
								>
									<RefreshCw class="h-4 w-4" /> Periksa Update
								</button>

							{:else if updateStatus === 'checking'}
								<div class="flex items-center justify-center gap-3 text-sm text-slate-400">
									<RefreshCw class="h-4 w-4 animate-spin" /> Memeriksa...
								</div>

							{:else if updateStatus === 'latest'}
								<div class="space-y-4">
									<div class="flex items-center justify-center gap-3 text-emerald-400">
										<span class="text-2xl">✓</span>
										<span class="text-sm font-bold">Sudah versi terbaru</span>
									</div>
									<button
										onclick={checkUpdate}
										class="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-6 py-3 text-xs font-black tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-700"
									>
										<RefreshCw class="h-4 w-4" /> Periksa Lagi
									</button>
								</div>

							{:else if updateStatus === 'available'}
								<div class="space-y-4">
									<div class="flex items-center justify-center gap-3 text-amber-400">
										<Download class="h-5 w-5" />
										<span class="text-sm font-bold">Update tersedia: {latestVersion}</span>
									</div>
									<div class="flex flex-wrap items-center justify-center gap-3">
										<a
											href={latestUrl}
											target="_blank"
											class="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-black tracking-widest text-black uppercase transition-all hover:bg-amber-400"
										>
											<Download class="h-4 w-4" /> Download
										</a>
										<button
											onclick={applyUpdate}
											disabled={String(updateStatus) === 'applying'}
											class="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-black tracking-widest text-white uppercase transition-all hover:bg-emerald-500 disabled:opacity-50 active:scale-95"
										>
											{#if String(updateStatus) === 'applying'}
												<RefreshCw class="h-4 w-4 animate-spin" /> Mengupdate...
											{:else}
												<Download class="h-4 w-4" /> Update & Restart
											{/if}
										</button>
										<button
											onclick={checkUpdate}
											class="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-6 py-3 text-xs font-black tracking-widest text-slate-400 uppercase transition-all hover:bg-slate-700"
										>
											<RefreshCw class="h-4 w-4" /> Periksa Lagi
										</button>
									</div>
									{#if releaseNotes}
										<div class="mt-4 max-h-32 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-left text-xs leading-relaxed text-slate-500">
											{releaseNotes}
										</div>
									{/if}
								</div>

							{:else if updateStatus === 'applying'}
								<div class="space-y-4">
									<div class="flex items-center justify-center gap-3 text-emerald-400">
										<RefreshCw class="h-5 w-5 animate-spin" />
										<span class="text-sm font-bold">Memasang update...</span>
									</div>
									<p class="text-xs text-slate-500">
										Server akan restart otomatis. Halaman ini akan dimuat ulang setelah update selesai.
									</p>
								</div>

							{:else if updateStatus === 'error'}
								<div class="space-y-4">
									<div class="text-sm text-rose-400">Gagal memeriksa update</div>
									{#if updateError}
										<p class="text-[10px] text-slate-600">{updateError}</p>
									{/if}
									<button
										onclick={checkUpdate}
										class="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-3 text-xs font-black tracking-widest text-rose-400 uppercase transition-all hover:bg-rose-500/20"
									>
										<RefreshCw class="h-4 w-4" /> Coba Lagi
									</button>
								</div>
							{/if}

							<div class="mt-6 flex flex-wrap justify-center gap-2 text-[10px] text-slate-600">
								<a
									href="https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/releases"
									target="_blank"
									class="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-1.5 transition-all hover:border-slate-700 hover:text-slate-400"
								>
									Semua Rilis
								</a>
								<a
									href="https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque/blob/main/INSTALL.md"
									target="_blank"
									class="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-1.5 transition-all hover:border-slate-700 hover:text-slate-400"
								>
									Panduan Instalasi
								</a>
							</div>
						</div>
					</section>
				</div>
			{/if}
		</main>

		<!-- Toast Notification -->
		{#if toastVisible}
			<div
				class="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl transition-all {toastType === 'success'
					? 'border-emerald-500/30 bg-emerald-900/80 text-emerald-300'
					: toastType === 'error'
						? 'border-rose-500/30 bg-rose-900/80 text-rose-300'
						: 'border-blue-500/30 bg-blue-900/80 text-blue-300'}"
				transition:fade={{ duration: 200 }}
			>
				{#if toastType === 'success'}
					<Check class="h-5 w-5" />
				{:else if toastType === 'error'}
					<X class="h-5 w-5" />
				{:else}
					<Info class="h-5 w-5" />
				{/if}
				<p class="text-sm font-bold">{toastMessage}</p>
			</div>
		{/if}

		<footer class="pointer-events-none fixed right-0 bottom-6 left-0 z-50 px-6">
			<div class="pointer-events-auto mx-auto max-w-md">
				<button
					onclick={handleSave}
					class="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 p-5 text-sm font-black tracking-[0.3em] text-white uppercase shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition-all hover:bg-emerald-500 active:scale-95"
				>
					<Save class="h-5 w-5" /> SIMPAN PERUBAHAN
				</button>
			</div>
		</footer>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		background: #020617;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
