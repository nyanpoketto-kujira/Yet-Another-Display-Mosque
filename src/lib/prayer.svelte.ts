import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes, Prayer } from 'adhan';
import { settings } from './settings.svelte';
import { browser } from '$app/environment';

export type DisplayMode = 'normal' | 'preadzan' | 'iqomah' | 'sholat' | 'khutbah';

class PrayerService {
	now = $state(new Date());

	// --- QA OVERRIDE LOGIC ---
	#debugMode = $state<DisplayMode | null>(null);
	#debugCountdown = $state<number | null>(null);
	#debugOffset = $state<number>(0); // Dalam milidetik

	setDebugMode(mode: DisplayMode | null, countdown: number | null = null) {
		this.#debugMode = mode;
		this.#debugCountdown = countdown;
	}

	setTimeOffset(offsetMs: number) {
		this.#debugOffset = offsetMs;
	}

	resetDebug() {
		this.#debugMode = null;
		this.#debugCountdown = null;
		this.#debugOffset = 0;
	}

	prayerTimes = $derived.by(() => {
		const coords = new Coordinates(settings.value.lat, settings.value.lng);
		const date = new Date(this.now.getTime() + this.#debugOffset); // Gunakan waktu simulasi untuk hitung jadwal
		const params = CalculationMethod.Singapore();
		const pt = new PrayerTimes(coords, date, params);

		pt.fajr = new Date(pt.fajr.getTime() + settings.value.offsets.fajr * 60000);
		pt.sunrise = new Date(pt.sunrise.getTime() + settings.value.offsets.sunrise * 60000);
		pt.dhuhr = new Date(pt.dhuhr.getTime() + settings.value.offsets.dhuhr * 60000);
		pt.asr = new Date(pt.asr.getTime() + settings.value.offsets.asr * 60000);
		pt.maghrib = new Date(pt.maghrib.getTime() + settings.value.offsets.maghrib * 60000);
		pt.isha = new Date(pt.isha.getTime() + settings.value.offsets.isha * 60000);

		return pt;
	});

	currentTime = $derived.by(() => {
		return new Date(this.now.getTime() + (settings.value.drift || 0) * 1000 + this.#debugOffset);
	});

	isFriday = $derived.by(() => {
		return this.currentTime.getDay() === 5;
	});

	hijriDate = $derived.by(() => {
		return (
			new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura-nu-latn', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			}).format(this.currentTime) + ' H'
		);
	});

	gregorianDate = $derived.by(() => {
		return new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(this.currentTime);
	});

	vibe = $derived.by(() => {
		const hour = this.currentTime.getHours();
		if (hour >= 4 && hour < 6)
			return {
				name: 'subuh',
				color: 'from-indigo-900 via-purple-900 to-slate-900',
				accent: 'text-indigo-400'
			};
		if (hour >= 6 && hour < 11)
			return {
				name: 'pagi',
				color: 'from-sky-900 via-blue-900 to-indigo-900',
				accent: 'text-sky-400'
			};
		if (hour >= 11 && hour < 15)
			return {
				name: 'siang',
				color: 'from-emerald-900 via-teal-900 to-cyan-900',
				accent: 'text-emerald-400'
			};
		if (hour >= 15 && hour < 18)
			return {
				name: 'ashar',
				color: 'from-amber-900 via-orange-900 to-rose-900',
				accent: 'text-amber-400'
			};
		if (hour >= 18 && hour < 19)
			return {
				name: 'maghrib',
				color: 'from-rose-950 via-red-950 to-purple-950',
				accent: 'text-rose-400'
			};
		return {
			name: 'malam',
			color: 'from-slate-950 via-black to-slate-900',
			accent: 'text-blue-400'
		};
	});

	greeting = $derived.by(() => {
		const hour = this.currentTime.getHours();
		if (hour >= 4 && hour < 10) return 'Selamat Pagi';
		if (hour >= 10 && hour < 15) return 'Selamat Siang';
		if (hour >= 15 && hour < 18) return 'Selamat Sore';
		return 'Selamat Malam';
	});

	mode = $derived.by((): DisplayMode => {
		if (this.#debugMode) return this.#debugMode; // PAKSA MODE (QA)

		const time = this.currentTime.getTime();
		const pt = this.prayerTimes;
		const prayers = [
			{ id: Prayer.Fajr, time: pt.fajr, iqomah: settings.value.iqomah.fajr },
			{ id: Prayer.Dhuhr, time: pt.dhuhr, iqomah: settings.value.iqomah.dhuhr },
			{ id: Prayer.Asr, time: pt.asr, iqomah: settings.value.iqomah.asr },
			{ id: Prayer.Maghrib, time: pt.maghrib, iqomah: settings.value.iqomah.maghrib },
			{ id: Prayer.Isha, time: pt.isha, iqomah: settings.value.iqomah.isha }
		];

		for (const p of prayers) {
			const adzanTime = p.time.getTime();

			if (this.isFriday && p.id === Prayer.Dhuhr) {
				const khutbahTime = adzanTime + (settings.value.fridayKhutbahDuration || 20) * 60000;
				const sholatEndTime = khutbahTime + (settings.value.sholatDuration || 15) * 60000;

				if (time >= adzanTime - (settings.value.preAdzanDuration || 10) * 60000 && time < adzanTime)
					return 'preadzan';
				if (time >= adzanTime && time < khutbahTime) return 'khutbah';
				if (time >= khutbahTime && time < sholatEndTime) return 'sholat';
				continue;
			}

			const iqomahTime = adzanTime + p.iqomah * 60000;
			const sholatEndTime = iqomahTime + (settings.value.sholatDuration || 15) * 60000;
			if (time >= adzanTime - (settings.value.preAdzanDuration || 10) * 60000 && time < adzanTime)
				return 'preadzan';
			if (time >= adzanTime && time < iqomahTime) return 'iqomah';
			if (time >= iqomahTime && time < sholatEndTime) return 'sholat';
		}
		return 'normal';
	});

	countdown = $derived.by(() => {
		if (this.#debugCountdown !== null) return this.#debugCountdown; // PAKSA TIMER (QA)

		const time = this.currentTime.getTime();
		const pt = this.prayerTimes;
		const currentMode = this.mode;
		if (currentMode === 'normal') return null;
		const prayers = [
			{ id: Prayer.Fajr, time: pt.fajr, iqomah: settings.value.iqomah.fajr },
			{ id: Prayer.Dhuhr, time: pt.dhuhr, iqomah: settings.value.iqomah.dhuhr },
			{ id: Prayer.Asr, time: pt.asr, iqomah: settings.value.iqomah.asr },
			{ id: Prayer.Maghrib, time: pt.maghrib, iqomah: settings.value.iqomah.maghrib },
			{ id: Prayer.Isha, time: pt.isha, iqomah: settings.value.iqomah.isha }
		];
		for (const p of prayers) {
			const adzanTime = p.time.getTime();

			if (this.isFriday && p.id === Prayer.Dhuhr && currentMode !== 'preadzan') {
				const khutbahTime = adzanTime + (settings.value.fridayKhutbahDuration || 20) * 60000;
				if (currentMode === 'khutbah' && time < khutbahTime)
					return Math.floor((khutbahTime - time) / 1000);
				return 0;
			}

			const iqomahTime = adzanTime + p.iqomah * 60000;
			if (currentMode === 'preadzan' && time < adzanTime)
				return Math.floor((adzanTime - time) / 1000);
			if (currentMode === 'iqomah' && time < iqomahTime)
				return Math.floor((iqomahTime - time) / 1000);
		}
		return 0;
	});

	constructor() {
		if (browser) {
			setInterval(() => {
				this.now = new Date();
				// Kalo lagi debug, kurangin timer manual tiap detik
				if (this.#debugCountdown !== null && this.#debugCountdown > 0) {
					this.#debugCountdown--;
				}
			}, 1000);
		}
	}
}

export const prayerService = new PrayerService();
