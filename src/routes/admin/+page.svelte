<script lang="ts">
	import { settings, type Settings, type Transaction, type InfoItem } from '$lib/settings.svelte';
	import { prayerService } from '$lib/prayer.svelte';
	import { formatRupiah, parseRaw } from '$lib/utils/format';
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
		Unlock,
		Key,
		Eye,
		EyeOff,
		LayoutDashboard,
		Settings as SettingsIcon,
		LogOut,
		Image as ImageIcon,
		Upload,
		Palette,
		X,
		CircleCheck,
		CircleX,
		MessageSquarePlus,
		Timer,
		Info,
		Zap,
		Cpu,
		Computer,
		Heart
	} from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let isAuthenticated = $state(browser && sessionStorage.getItem('admin-yadm-auth') === 'true');
	let passwordInput = $state('');
	let loginError = $state(false);
	let showPass = $state(false);

	onMount(() => {
		settings.load();
	});

	function checkPassword() {
		if (passwordInput === settings.value.adminPassword) {
			isAuthenticated = true;
			loginError = false;
			if (browser) sessionStorage.setItem('admin-yadm-auth', 'true');
		} else {
			loginError = true;
			passwordInput = '';
		}
	}

	function logout() {
		if (confirm('Apakah Anda yakin ingin keluar dari Panel Admin?')) {
			isAuthenticated = false;
			if (browser) sessionStorage.removeItem('admin-yadm-auth');
		}
	}

	function goToHome() {
		window.location.href = '/';
	}

	let activeTab = $state<'umum' | 'kas' | 'jadwal' | 'teks' | 'bg' | 'about'>('umum');

	const tabs = [
		{ id: 'umum', label: 'Umum', icon: SettingsIcon },
		{ id: 'kas', label: 'Kas', icon: Wallet },
		{ id: 'jadwal', label: 'Jadwal', icon: Clock },
		{ id: 'teks', label: 'Info', icon: Type },
		{ id: 'bg', label: 'BG', icon: ImageIcon },
		{ id: 'about', label: 'About', icon: Cpu }
	] as const;

	// Mapping Label Bahasa Indonesia
	const prayerLabels: Record<string, string> = {
		fajr: 'Subuh',
		sunrise: 'Syuruq',
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
			date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
			desc: txDesc, amount, type: txType
		};
		const currentTxs = [tx, ...settings.value.transactions];
		const newBalance = tx.type === 'in' ? Number(settings.value.cash) + amount : Number(settings.value.cash) - amount;
		settings.update({ transactions: currentTxs, cash: newBalance });
		txDesc = ''; txAmountInput = '';
	}

	function removeTransaction(id: string) {
		if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return;
		const tx = settings.value.transactions.find((t) => t.id === id);
		if (!tx) return;
		const newBalance = tx.type === 'in' ? settings.value.cash - tx.amount : settings.value.cash + tx.amount;
		settings.update({ transactions: settings.value.transactions.filter((t) => t.id !== id), cash: newBalance });
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
		newInfoHeader = ''; newInfoContent = ''; newInfoFooter = '';
	}

	function toggleInfo(id: string) {
		const newInfos = settings.value.infos.map(info => info.id === id ? { ...info, active: !info.active } : info);
		settings.update({ infos: newInfos });
	}

	function deleteInfo(id: string) {
		if (!confirm('Hapus informasi ini?')) return;
		settings.update({ infos: settings.value.infos.filter(i => i.id !== id) });
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
			const res = await fetch('/api/upload', { method: 'POST', body: formData });
			const data = await res.json();
			if (data.fileName) {
				settings.update({ backgrounds: [...settings.value.backgrounds, data.fileName] });
			}
		} catch (err) { alert('Maaf, gagal mengunggah gambar.'); } finally { isUploading = false; }
	}

	async function removeBg(path: string) {
		if (!confirm('Hapus gambar ini dari koleksi background?')) return;
		try {
			await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: path }) });
			settings.update({ backgrounds: settings.value.backgrounds.filter((bg) => bg !== path) });
		} catch (err) { alert('Gagal menghapus gambar.'); }
	}

	async function handleSave() {
		await settings.save();
		alert('Alhamdulillah, semua perubahan berhasil disimpan.');
	}

	const offsetKeys = $derived(settings.value ? Object.keys(settings.value.offsets) as (keyof Settings['offsets'])[] : []);
	const iqomahKeys = $derived(settings.value ? Object.keys(settings.value.iqomah) as (keyof Settings['iqomah'])[] : []);
</script>

<div class="min-h-screen bg-slate-950 pb-32 font-sans text-slate-200">
	{#if !settings.value}
		<div class="flex min-h-screen items-center justify-center">
			<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
		</div>
	{:else if !isAuthenticated}
		<div class="flex min-h-screen items-center justify-center p-4" transition:fade>
			<div class="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl md:p-10">
				<div class="mb-6 inline-block rounded-2xl bg-blue-500/10 p-4"><Lock class="h-8 w-8 text-blue-400" /></div>
				<h1 class="mb-2 text-2xl font-black tracking-tighter text-white uppercase md:text-3xl">Panel Admin</h1>
				<div class="space-y-4 text-left">
					<div class="relative">
						<Key class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500" />
						<input type={showPass ? 'text' : 'password'} bind:value={passwordInput} onkeydown={(e) => e.key === 'Enter' && checkPassword()} placeholder="Masukkan Kata Sandi..." class="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 pr-12 pl-12 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
						<button onclick={() => (showPass = !showPass)} class="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 hover:text-slate-300">
							{#if showPass}<EyeOff class="h-5 w-5" />{:else}<Eye class="h-5 w-5" />{/if}
						</button>
					</div>
					<button onclick={checkPassword} class="w-full rounded-xl bg-blue-600 p-4 text-center text-sm font-black tracking-widest text-white uppercase shadow-lg transition-all hover:bg-blue-500 active:scale-95">MASUK SISTEM</button>
				</div>
			</div>
		</div>
	{:else}
		<header class="sticky top-0 z-40 mb-4 border-b border-slate-800 bg-slate-950/80 p-4 backdrop-blur-md md:p-6">
			<div class="mx-auto flex max-w-4xl items-center justify-between">
				<div class="flex items-center gap-2 md:gap-4">
					<button onclick={goToHome} class="rounded-xl p-2 transition-colors hover:bg-slate-800"><ArrowLeft class="h-5 w-5 text-white" /></button>
					<div><h1 class="text-lg leading-none font-black tracking-tight text-white uppercase md:text-xl">PENGURUS MASJID</h1><p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Panel Kontrol Layar</p></div>
				</div>
				<div class="flex items-center gap-4 md:gap-8">
					<div class="hidden text-right sm:block"><p class="text-[10px] font-black text-slate-500 uppercase">Waktu Server</p><p class="font-mono text-lg leading-none font-bold text-emerald-400">{prayerService.currentTime.toLocaleTimeString('id-ID')}</p></div>
					<button onclick={logout} class="rounded-xl border border-rose-500/20 p-2 text-rose-500 hover:bg-rose-500/10"><LogOut class="h-5 w-5" /></button>
				</div>
			</div>
		</header>

		<nav class="sticky top-20 z-30 mx-auto mb-6 max-w-4xl px-4">
			<div class="no-scrollbar flex overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-1 shadow-lg">
				{#each tabs as tab}
					<button onclick={() => (activeTab = tab.id)} class="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold whitespace-nowrap transition-all {activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}">
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
							<div class="flex items-center gap-3"><ImageIcon class="h-5 w-5 text-blue-400" /><h2 class="text-sm font-black tracking-widest uppercase">Koleksi Background</h2></div>
							<div class="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
								<Timer class="h-4 w-4 text-blue-400" /><span class="text-[9px] font-black uppercase text-slate-500">Slide:</span>
								<input type="number" bind:value={settings.value.bgSlideshowDuration} class="w-12 bg-transparent text-center font-bold text-xs outline-none" /><span class="text-[9px] font-black text-slate-700">Detik</span>
							</div>
						</div>
						<div class="group relative mb-8">
							<input type="file" accept="image/*" onchange={handleUpload} class="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
							<div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/50 p-8 transition-all group-hover:border-blue-500/5 group-hover:bg-blue-500/5">
								{#if isUploading}<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div><p class="mt-4 animate-pulse text-xs font-bold text-blue-400">Mengunggah...</p>
								{:else}<div class="mb-4 rounded-full bg-blue-500/10 p-4 text-blue-400"><Upload class="h-6 w-6" /></div><p class="text-sm font-bold text-slate-400">Klik untuk mengunggah gambar</p>{/if}
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
							{#each settings.value.backgrounds as bg}<div class="group relative aspect-video overflow-hidden rounded-xl border border-slate-800" transition:slide><img src={bg} alt="BG" class="h-full w-full object-cover transition-transform group-hover:scale-110" /><div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"><button onclick={() => removeBg(bg)} class="rounded-lg bg-rose-600 p-2 text-white hover:bg-rose-500"><Trash2 class="h-4 w-4" /></button></div></div>{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if activeTab === 'jadwal'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					<!-- Waktu Persiapan -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center gap-3"><AlertCircle class="h-5 w-5 text-rose-400" /><h2 class="text-sm font-black tracking-widest uppercase">Persiapan Azan</h2></div>
							<div class="flex items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
								<Timer class="h-5 w-5 text-rose-400" /><input type="number" bind:value={settings.value.preAdzanDuration} class="w-16 bg-transparent text-center font-bold text-lg outline-none" /><span class="text-[10px] font-black text-slate-500 uppercase">Menit</span>
							</div>
						</div>
						<div class="flex gap-3 bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
							<Info class="h-4 w-4 text-rose-400 shrink-0" /><p class="text-[10px] text-slate-400 leading-relaxed">Layar countdown akan muncul otomatis di display <span class="font-bold text-rose-400">{settings.value.preAdzanDuration} menit</span> sebelum waktu azan tiba.</p>
						</div>
					</section>

					<!-- Sinkronisasi Waktu (Time Drift) -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center gap-3"><Zap class="h-5 w-5 text-yellow-400" /><h2 class="text-sm font-black tracking-widest uppercase">Sinkronisasi Waktu</h2></div>
							<div class="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
								<button onclick={() => settings.value.drift--} class="p-2 hover:text-white transition-colors text-slate-500"><Minus class="h-4 w-4" /></button>
								<div class="flex items-center gap-3 px-2">
									<Timer class="h-5 w-5 text-yellow-400" />
									<input type="number" bind:value={settings.value.drift} class="w-16 bg-transparent text-center font-black text-xl outline-none text-yellow-400" />
									<span class="text-[10px] font-black text-slate-500 uppercase">Detik</span>
								</div>
								<button onclick={() => settings.value.drift++} class="p-2 hover:text-white transition-colors text-slate-500"><Plus class="h-4 w-4" /></button>
							</div>
						</div>
						<div class="flex gap-3 bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
							<Clock class="h-4 w-4 text-yellow-400 shrink-0" /><p class="text-[10px] text-slate-400 leading-relaxed">Gunakan fitur ini untuk menyesuaikan jam display dengan jam lokal masjid. <span class="font-bold text-yellow-400">Positif (+)</span> untuk mempercepat, <span class="font-bold text-yellow-400">Negatif (-)</span> untuk memperlambat.</p>
						</div>
					</section>

					<!-- Koreksi Jadwal -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center gap-3"><Clock class="h-5 w-5 text-emerald-400" /><h2 class="text-sm font-black tracking-widest uppercase">Koreksi Jadwal Sholat (Menit)</h2></div>
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
							{#each offsetKeys as p}
								<div class="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
									<label for="offset-{p}" class="mb-2 block text-[10px] font-black text-slate-500 uppercase">{prayerLabels[p]}</label>
									<div class="flex items-center justify-center gap-2">
										<button onclick={() => settings.value.offsets[p]--} class="p-2 hover:text-white transition-colors text-slate-500"><Minus class="h-4 w-4" /></button>
										<input id="offset-{p}" type="number" bind:value={settings.value.offsets[p]} class="w-14 bg-transparent text-center text-2xl font-black outline-none text-emerald-400" />
										<button onclick={() => settings.value.offsets[p]++} class="p-2 hover:text-white transition-colors text-slate-500"><Plus class="h-4 w-4" /></button>
									</div>
								</div>
							{/each}
						</div>
						<p class="mt-4 text-[9px] text-slate-500 text-center uppercase tracking-widest font-bold opacity-50">Gunakan fitur ini jika jadwal display berbeda dengan jadwal lokal masjid</p>
					</section>

					<!-- Tunggu Iqomah -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center gap-3"><Timer class="h-5 w-5 text-blue-400" /><h2 class="text-sm font-black tracking-widest uppercase">Jeda Menuju Iqomah</h2></div>
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
							{#each iqomahKeys as p}
								<div class="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
									<label for="iqomah-{p}" class="mb-2 block text-[10px] font-black text-slate-500 uppercase">{prayerLabels[p]}</label>
									<div class="flex items-center justify-center gap-1">
										<button onclick={() => settings.value.iqomah[p]--} class="p-1 hover:text-white transition-colors text-slate-700"><Minus class="h-4 w-4" /></button>
										<input id="iqomah-{p}" type="number" bind:value={settings.value.iqomah[p]} class="w-14 bg-transparent text-center text-2xl font-black outline-none text-blue-400" />
										<button onclick={() => settings.value.iqomah[p]++} class="p-1 hover:text-white transition-colors text-slate-700"><Plus class="h-4 w-4" /></button>
									</div>
									<span class="text-[8px] font-black text-slate-700 uppercase">Menit</span>
								</div>
							{/each}
						</div>
					</section>

					<!-- Pengaturan Jumat -->
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center gap-3"><LayoutDashboard class="h-5 w-5 text-purple-400" /><h2 class="text-sm font-black tracking-widest uppercase">Khusus Hari Jum'at</h2></div>
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div class="rounded-2xl border border-slate-800 bg-slate-950 p-6">
								<label for="friday-khatib" class="mb-4 block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nama Khathib</label>
								<input id="friday-khatib" type="text" bind:value={settings.value.fridayKhatib} placeholder="Nama Khathib..." class="w-full rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500" />
							</div>
							<div class="rounded-2xl border border-slate-800 bg-slate-950 p-6">
								<label for="friday-duration" class="mb-4 block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Durasi Khutbah (Menit)</label>
								<div class="flex items-center gap-4">
									<Timer class="h-6 w-6 text-purple-400" />
									<input id="friday-duration" type="number" bind:value={settings.value.fridayKhutbahDuration} class="flex-1 bg-transparent text-2xl font-black outline-none text-white" />
								</div>
							</div>
						</div>
					</section>
				</div>
			{/if}

			{#if activeTab === 'teks'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center gap-3"><Type class="h-5 w-5 text-purple-400" /><h2 class="text-sm font-black tracking-widest uppercase">Teks Berjalan</h2></div>
						<textarea bind:value={settings.value.runningText} class="h-24 w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm outline-none focus:ring-2 focus:ring-purple-500"></textarea>
					</section>
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-8 flex items-center justify-between">
							<div class="flex items-center gap-3"><MessageSquarePlus class="h-5 w-5 text-emerald-400" /><h2 class="text-sm font-black tracking-widest uppercase">Daftar Informasi</h2></div>
							<div class="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
								<Timer class="h-4 w-4 text-emerald-400" /><span class="text-[9px] font-black uppercase text-slate-500">Slide:</span>
								<input type="number" bind:value={settings.value.infoSlideshowDuration} class="w-12 bg-transparent text-center font-bold text-xs outline-none" /><span class="text-[9px] font-black text-slate-700">Detik</span>
							</div>
						</div>
						<div class="mb-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-6">
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<input bind:value={newInfoHeader} placeholder="Judul (misal: Info 1)" class="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm outline-none" />
								<input bind:value={newInfoFooter} placeholder="Sumber (misal: HR. Muslim)" class="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm outline-none" />
							</div>
							<textarea bind:value={newInfoContent} placeholder="Isi pesan..." class="h-24 w-full rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm outline-none"></textarea>
							<button onclick={addInfo} class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-4 text-xs font-black text-white uppercase transition-all hover:bg-blue-500"><Plus class="h-4 w-4" /> TAMBAH INFO</button>
						</div>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							{#each settings.value.infos as info (info.id)}
								<div class="flex flex-col rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg" transition:slide>
									<div class="mb-4 flex items-center justify-between">
										<span class="rounded-lg bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-400 uppercase">{info.header}</span>
										<div class="flex items-center gap-2">
											<button onclick={() => toggleInfo(info.id)} class="p-2 {info.active ? 'text-emerald-400' : 'text-slate-600'}">{#if info.active}<CircleCheck class="h-5 w-5" />{:else}<CircleX class="h-5 w-5" />{/if}</button>
											<button onclick={() => deleteInfo(info.id)} class="p-2 text-rose-500"><Trash2 class="h-5 w-5" /></button>
										</div>
									</div>
									<p class="mb-4 flex-1 text-sm italic opacity-80 leading-relaxed">"{info.content}"</p>
									<div class="mt-auto border-t border-slate-800 pt-4 text-[10px] font-black text-slate-600 uppercase">{info.footer || '-'}</div>
								</div>
							{/each}
						</div>
					</section>
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center gap-3"><AlertCircle class="h-5 w-5 text-rose-400" /><h2 class="text-sm font-black tracking-widest uppercase">Pesan Darurat</h2></div>
						<input bind:value={settings.value.bigInfo} class="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm outline-none focus:ring-2 focus:ring-rose-500" placeholder="Biarkan kosong jika tidak ada pesan darurat" />
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
							{#each [
								{ id: 'vibe', label: 'Dynamic', color: 'from-blue-600 to-purple-600' },
								{ id: 'modern', label: 'Modern', color: 'from-slate-700 to-slate-900' },
								{ id: 'classic', label: 'Classic', color: 'from-emerald-700 to-teal-900' },
								{ id: 'ocean', label: 'Ocean', color: 'from-cyan-600 to-blue-800' },
								{ id: 'sunset', label: 'Sunset', color: 'from-orange-600 to-rose-800' }
							] as t}
								<button
									onclick={() => (settings.value.theme = t.id as any)}
									class="relative overflow-hidden rounded-2xl border-2 p-4 transition-all {settings.value.theme === t.id ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}"
								>
									<div class="absolute inset-0 bg-gradient-to-br {t.color} opacity-40"></div>
									<div class="relative flex flex-col items-center gap-2">
										<div class="h-8 w-8 rounded-full bg-gradient-to-br {t.color} shadow-inner"></div>
										<span class="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
									</div>
									{#if settings.value.theme === t.id}
										<div class="absolute top-2 right-2"><CircleCheck class="h-4 w-4 text-white" /></div>
									{/if}
								</button>
							{/each}
						</div>
					</section>

					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl text-center">
						<div class="flex items-center justify-center gap-3 mb-6">
							<MapPin class="h-5 w-5 text-emerald-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">Koordinat Lokasi</h2>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="lat" class="mb-2 block text-[10px] font-black text-slate-500 uppercase">Lat</label>
								<input id="lat" type="number" step="any" bind:value={settings.value.lat} class="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-sm" />
							</div>
							<div>
								<label for="lng" class="mb-2 block text-[10px] font-black text-slate-500 uppercase">Lng</label>
								<input id="lng" type="number" step="any" bind:value={settings.value.lng} class="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-sm" />
							</div>
						</div>
					</section>
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl text-center">
						<div class="flex items-center justify-center gap-3 mb-6">
							<Key class="h-5 w-5 text-blue-400" />
							<h2 class="text-sm font-black tracking-widest uppercase">Keamanan</h2>
						</div>
						<label for="admin-password" class="mb-2 block text-[10px] font-black text-slate-500 uppercase">Kata Sandi Baru</label>
						<input id="admin-password" type="text" bind:value={settings.value.adminPassword} class="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-center font-mono text-sm" />
					</section>
				</div>
			{/if}

			{#if activeTab === 'kas'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center gap-3"><Wallet class="h-5 w-5 text-emerald-400" /><h2 class="text-sm font-black tracking-widest uppercase">Laporan Kas</h2></div>
							<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 transition-all hover:bg-slate-800">
								<span class="text-[10px] font-black uppercase text-slate-500">Sembunyikan Nominal</span>
								<input type="checkbox" bind:checked={settings.value.hideTransactionAmount} class="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500" />
							</label>
						</div>
						<div class="mb-6 space-y-4 rounded-2xl border border-slate-800/50 bg-slate-950 p-5 text-center"><input bind:value={txDesc} placeholder="Keterangan..." class="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm outline-none" /><div class="grid grid-cols-2 gap-3"><input bind:value={txAmountInput} oninput={handleAmountInput} placeholder="Jumlah" class="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 font-mono font-bold" /><select bind:value={txType} class="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-bold"><option value="in">MASUK (+)</option><option value="out">KELUAR (-)</option></select></div><button onclick={addTransaction} class="w-full rounded-xl bg-emerald-600 p-4 text-xs font-black text-white uppercase">CATAT TRANSAKSI</button></div><div class="mb-4 flex items-end justify-between px-2"><p class="text-[10px] font-black text-slate-500 uppercase">Total Saldo</p><p class="text-2xl font-black text-emerald-400 tabular-nums">{formatRupiah(settings.value.cash)}</p></div><div class="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-950">{#each settings.value.transactions as tx (tx.id)}<div class="flex items-center justify-between p-4 hover:bg-slate-800/30"><div class="min-w-0 flex-1 pr-2"><p class="truncate text-sm font-bold">{tx.desc}</p><p class="text-[9px] font-black text-slate-500 uppercase">{tx.date}</p></div><div class="flex items-center gap-4"><p class="font-mono text-sm font-black {tx.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}">{tx.type === 'in' ? '+' : '-'} {formatRupiah(tx.amount)}</p><button onclick={() => removeTransaction(tx.id)} class="text-rose-500 p-2"><Trash2 class="h-4 w-4" /></button></div></div>{/each}</div></section>
				</div>
			{/if}

			{#if activeTab === 'about'}
				<div transition:fade={{ duration: 200 }} class="space-y-6">
					<section class="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl text-center">
						<div class="mb-6 inline-block rounded-full bg-blue-500/10 p-6">
							<Cpu class="h-12 w-12 text-blue-400" />
						</div>
						<h2 class="text-2xl font-black tracking-tighter text-white uppercase">YADM v1.0.0</h2>
						<p class="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Yet Another Display Mosque</p>
						
						<div class="my-8 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
						
						<div class="space-y-4 text-sm text-slate-400">
							<p>Sistem informasi display masjid berbasis web yang ringan, modern, dan mudah dikustomisasi.</p>
							<div class="flex flex-wrap justify-center gap-2 pt-4">
								<span class="rounded-full border border-slate-800 bg-slate-950 px-4 py-1 text-[10px] font-bold">Svelte 5</span>
								<span class="rounded-full border border-slate-800 bg-slate-950 px-4 py-1 text-[10px] font-bold">TailwindCSS</span>
								<span class="rounded-full border border-slate-800 bg-slate-950 px-4 py-1 text-[10px] font-bold">Vite</span>
							</div>
						</div>

						<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
							<a href="https://github.com/nyanpoketto-kujira/Yet-Another-Display-Mosque" target="_blank" class="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 transition-all hover:bg-slate-800">
								<Computer class="h-5 w-5 text-white" />
								<span class="text-xs font-black uppercase tracking-widest">Source Code</span>
							</a>
							<div class="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
								<Heart class="h-5 w-5 text-rose-500 fill-rose-500" />
								<span class="text-xs font-black uppercase tracking-widest text-slate-300">nyanpoketto-kujira</span>
							</div>
						</div>
					</section>
				</div>
			{/if}
		</main>

		<footer class="pointer-events-none fixed right-0 bottom-6 left-0 z-50 px-6">
			<div class="pointer-events-auto mx-auto max-w-md">
				<button onclick={handleSave} class="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 p-5 text-sm font-black tracking-[0.3em] text-white uppercase shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition-all hover:bg-emerald-500 active:scale-95">
					<Save class="h-5 w-5" /> SIMPAN PERUBAHAN
				</button>
			</div>
		</footer>
	{/if}
</div>

<style>
	:global(body) { margin: 0; background: #020617; }
	.no-scrollbar::-webkit-scrollbar { display: none; }
	.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

	/* Hide spin buttons */
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
