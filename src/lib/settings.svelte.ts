import { browser } from '$app/environment';

export interface Transaction {
	id: string;
	date: string;
	desc: string;
	amount: number;
	type: 'in' | 'out';
}

export interface InfoItem {
	id: string;
	header: string;
	content: string;
	footer: string;
	active: boolean;
}

export interface Settings {
	lat: number;
	lng: number;
	offsets: {
		fajr: number;
		sunrise: number;
		dhuha: number;
		dhuhr: number;
		asr: number;
		maghrib: number;
		isha: number;
	};
	iqomah: {
		fajr: number;
		dhuhr: number;
		asr: number;
		maghrib: number;
		isha: number;
	};
	drift: number;
	cash: number;
	runningText: string;
	bigInfo: string;
	infos: InfoItem[];
	preAdzanDuration: number;
	sholatDuration: number;
	bgSlideshowDuration: number; // Detik
	infoSlideshowDuration: number; // Detik
	transactions: Transaction[];
	adminPassword: string;
	backgrounds: string[];
	fridayKhatib: string;
	fridayKhutbahDuration: number; // Menit
	hideTransactionAmount: boolean;
	theme: 'vibe' | 'modern' | 'classic' | 'ocean' | 'sunset';
}

const DEFAULT_SETTINGS: Settings = {
	lat: -6.2,
	lng: 106.8,
	offsets: { fajr: 0, sunrise: 0, dhuha: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
	iqomah: { fajr: 10, dhuhr: 10, asr: 10, maghrib: 10, isha: 10 },
	drift: 0,
	cash: 0,
	runningText:
		'YADM (Yet Another Display Mosque) - Selamat datang jamaah sekalian. Mari rapatkan shaf.',
	bigInfo: '',
	infos: [
		{
			id: '1',
			header: 'Hadits Hari Ini',
			content:
				'Barangsiapa yang menempuh jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga.',
			footer: 'HR. Muslim',
			active: true
		}
	],
	preAdzanDuration: 10,
	sholatDuration: 15,
	bgSlideshowDuration: 60,
	infoSlideshowDuration: 15,
	transactions: [],
	adminPassword: 'vibe-masjid',
	backgrounds: [],
	fridayKhatib: 'Ustadz Ahmad Fulan',
	fridayKhutbahDuration: 20,
	hideTransactionAmount: false,
	theme: 'vibe'
};

class SettingsStore {
	#value = $state<Settings>(DEFAULT_SETTINGS);

	get value() {
		return this.#value;
	}
	set value(v) {
		this.#value = v;
	}

	async load() {
		if (!browser) return;
		try {
			const res = await fetch('/api/settings');
			if (res.ok) {
				const data = await res.json();
				this.#value = { ...DEFAULT_SETTINGS, ...data };
			}
		} catch (e) {
			console.error('Gagal muat pengaturan:', e);
		}
	}

	update(newSettings: Partial<Settings>) {
		this.#value = { ...this.#value, ...newSettings };
		this.save();
	}

	async save() {
		if (!browser) return;
		try {
			const dataToSave = $state.snapshot(this.#value);
			await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(dataToSave)
			});
		} catch (e) {
			console.error('Gagal simpan pengaturan:', e);
		}
	}
}

export const settings = new SettingsStore();
