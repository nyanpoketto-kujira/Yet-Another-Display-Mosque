import { browser } from '$app/environment';
import { getToken } from './auth';
import type { Settings } from './types';

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
	bgSlideshowDuration: 1,
	infoSlideshowDuration: 15,
	transactions: [],
	adminPassword: 'vibe-masjid',
	backgrounds: [],
	fridayKhatib: 'Ustadz Ahmad Fulan',
	fridayKhutbahDuration: 20,
	hideTransactionAmount: false,
	theme: 'vibe',
	sound: {
		preadzan: { enabled: true, file: '/sounds/universfield-new-notification-022-370046.mp3' },
		azan: { enabled: true, file: '/sounds/universfield-new-notification-036-485897.mp3' },
		iqomah: { enabled: true, file: '/sounds/u_edtmwfwu7c-beep-329314.mp3' }
	},
	performanceMode: 'penuh',
};

class SettingsStore {
	#value = $state<Settings>(DEFAULT_SETTINGS);
	#loading = $state(true);

	get value() {
		return this.#value;
	}
	set value(v) {
		this.#value = v;
	}

	get loading() {
		return this.#loading;
	}

	async load() {
		if (!browser) return;
		this.#loading = true;
		try {
			const res = await fetch('/api/settings');
			if (res.ok) {
				const data = await res.json();
				const currentPwd = this.#value.adminPassword;
				this.#value = { ...DEFAULT_SETTINGS, ...data, adminPassword: currentPwd };
			}
		} catch (e) {
			console.warn('Gagal muat pengaturan:', e);
		} finally {
			this.#loading = false;
		}
	}

	update(newSettings: Partial<Settings>) {
		this.#value = { ...this.#value, ...newSettings };
	}

	async save() {
		if (!browser) return;
		try {
			const token = getToken();
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (token) headers['Authorization'] = `Bearer ${token}`;

			const dataToSave = $state.snapshot(this.#value);
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers,
				body: JSON.stringify(dataToSave)
			});
			if (!res.ok) {
				console.warn('Gagal simpan:', res.status);
			}
		} catch (e) {
			console.warn('Gagal simpan pengaturan:', e);
		}
	}
}

export const settings = new SettingsStore();
