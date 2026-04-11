import pkg from 'hijri-converter';
const { toHijri: convert } = pkg;

export interface HijriDate {
	day: number;
	month: number;
	year: number;
	monthName: string;
}

const hijriMonths = {
	id: [
		'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir',
		'Rajab', 'Sha\'ban', 'Ramadan', 'Syawwal', 'Dzul Qadah', 'Dzul Hijjah'
	],
	en: [
		'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir',
		'Rajab', 'Sha\'ban', 'Ramadan', 'Syawwal', 'Dzul Qadah', 'Dzul Hijjah'
	]
};

export function getHijriDate(date: Date, locale: 'id' | 'en' = 'id'): HijriDate {
	const y = date.getFullYear();
	const m = date.getMonth() + 1;
	const d = date.getDate();

	const hijri = convert(y, m, d);

	return {
		day: hijri.hd,
		month: hijri.hm,
		year: hijri.hy,
		monthName: hijriMonths[locale][hijri.hm - 1]
	};
}

export function isAyyamulBidh(hijriDay: number): boolean {
	return hijriDay === 13 || hijriDay === 14 || hijriDay === 15;
}

export function isTasuAshura(hijriMonth: number, hijriDay: number): boolean {
	if (hijriMonth === 1) {
		return hijriDay === 9 || hijriDay === 10;
	}
	return false;
}

export function isYawnArafat(hijriMonth: number, hijriDay: number): boolean {
	if (hijriMonth === 12) {
		return hijriDay === 9;
	}
	return false;
}