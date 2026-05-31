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

export interface SoundConfig {
	enabled: boolean;
	file: string;
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
	bgSlideshowDuration: number;
	infoSlideshowDuration: number;
	transactions: Transaction[];
	adminPassword: string;
	backgrounds: string[];
	fridayKhatib: string;
	fridayKhutbahDuration: number;
	hideTransactionAmount: boolean;
	theme: 'vibe' | 'modern' | 'classic' | 'ocean' | 'sunset';
	sound: {
		preadzan: SoundConfig;
		azan: SoundConfig;
		iqomah: SoundConfig;
	};
	performanceMode: 'penuh' | 'ringan' | 'minimal';
}
