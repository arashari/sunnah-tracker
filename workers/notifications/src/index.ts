interface Env {
	ONESIGNAL_API_KEY: string;
	ONESIGNAL_APP_ID: string;
	TIMEZONE: string;
}

interface FastDate {
	hijriDay: number;
	hijriMonth: number;
	nameId: string;
	nameEn: string;
	descId: string;
	descEn: string;
}

const HIJRI_MONTH_NAMES_ID = [
	'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir',
	'Rajab', "Sha'ban", 'Ramadan', 'Syawwal', 'Dzul Qadah', 'Dzul Hijjah'
];

const HIJRI_MONTH_NAMES_EN = HIJRI_MONTH_NAMES_ID;

const FAST_DATES: FastDate[] = [
	...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).flatMap(month => [
		{ hijriDay: 13, hijriMonth: month, nameId: `Ayyamul Bidh (13 ${HIJRI_MONTH_NAMES_ID[month - 1]})`, nameEn: `Ayyamul Bidh (13 ${HIJRI_MONTH_NAMES_EN[month - 1]})`, descId: 'Puasa sunnah pada tanggal 13 bulan Hijriyah', descEn: 'Sunnah fasting on 13th of Hijri month' },
		{ hijriDay: 14, hijriMonth: month, nameId: `Ayyamul Bidh (14 ${HIJRI_MONTH_NAMES_ID[month - 1]})`, nameEn: `Ayyamul Bidh (14 ${HIJRI_MONTH_NAMES_EN[month - 1]})`, descId: 'Puasa sunnah pada tanggal 14 bulan Hijriyah', descEn: 'Sunnah fasting on 14th of Hijri month' },
		{ hijriDay: 15, hijriMonth: month, nameId: `Ayyamul Bidh (15 ${HIJRI_MONTH_NAMES_ID[month - 1]})`, nameEn: `Ayyamul Bidh (15 ${HIJRI_MONTH_NAMES_EN[month - 1]})`, descId: 'Puasa sunnah pada tanggal 15 bulan Hijriyah', descEn: 'Sunnah fasting on 15th of Hijri month' },
	]),
	{ hijriDay: 9, hijriMonth: 1, nameId: "Tasu'a", nameEn: "Tasu'a Fasting", descId: "Puasa Tasu'a pada 9 Muharram", descEn: "Tasu'a fasting on 9th Muharram" },
	{ hijriDay: 10, hijriMonth: 1, nameId: 'Ashura', nameEn: 'Ashura Fasting', descId: 'Puasa Ashura pada 10 Muharram', descEn: 'Ashura fasting on 10th Muharram' },
	{ hijriDay: 9, hijriMonth: 12, nameId: "Yawm 'Arafat", nameEn: "Yawm 'Arafat Fasting", descId: 'Puasa pada hari Arafah (9 Dzul Hijjah)', descEn: 'Fasting on the day of Arafah (9th Dhul Hijjah)' },
];

function hijriToday(tz: string): { day: number; month: number; year: number } {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: tz,
		calendar: 'islamic-umalqura',
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
	});
	const parts = formatter.formatToParts(now);
	const day = parseInt(parts.find(p => p.type === 'day')!.value);
	const month = parseInt(parts.find(p => p.type === 'month')!.value);
	const year = parseInt(parts.find(p => p.type === 'year')!.value);
	return { day, month, year };
}

function getUpcomingFasts(hijri: { day: number; month: number; year: number }): (FastDate & { daysUntil: number })[] {
	const results: (FastDate & { daysUntil: number })[] = [];

	for (const fast of FAST_DATES) {
		if (fast.hijriMonth !== hijri.month) continue;

		const daysUntil = fast.hijriDay - hijri.day;
		if (daysUntil >= 0 && daysUntil <= 3) {
			results.push({ ...fast, daysUntil });
		}
	}

	return results;
}

async function sendNotification(titleId: string, titleEn: string, msgId: string, msgEn: string, env: Env): Promise<{ success: boolean; status: number } | null> {
	try {
		const response = await fetch('https://onesignal.com/api/v1/notifications', {
			method: 'POST',
			headers: {
				Authorization: `Basic ${env.ONESIGNAL_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				app_id: env.ONESIGNAL_APP_ID,
				headings: { en: titleEn, id: titleId },
				contents: { en: msgEn, id: msgId },
				included_segments: ['Subscribed Users'],
			}),
		});

		if (!response.ok) {
			console.error(`OneSignal API error: ${response.status} ${await response.text()}`);
			return { success: false, status: response.status };
		}

		return { success: true, status: response.status };
	} catch (error) {
		console.error('OneSignal API call failed:', error);
		return null;
	}
}

export default {
	async fetch(_request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
		const hijri = hijriToday(env.TIMEZONE || 'Asia/Jakarta');
		const upcoming = getUpcomingFasts(hijri);

		const fastsToday = upcoming
			.filter(f => f.daysUntil === 0)
			.map(f => f.nameEn);
		const fastsTomorrow = upcoming
			.filter(f => f.daysUntil === 1)
			.map(f => f.nameEn);

		return new Response(JSON.stringify({
			hijri,
			today: hijri.day >= 0 ? `${hijri.day} ${HIJRI_MONTH_NAMES_EN[hijri.month - 1]} ${hijri.year} H` : 'unknown',
			fastsToday,
			fastsTomorrow,
		}, null, 2), {
			headers: { 'Content-Type': 'application/json' },
		});
	},

	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const hijri = hijriToday(env.TIMEZONE || 'Asia/Jakarta');
		const upcoming = getUpcomingFasts(hijri);

		const tomorrowFasts = upcoming.filter(f => f.daysUntil === 1);

		for (const fast of tomorrowFasts) {
			ctx.waitUntil(
				sendNotification(
					'🌙 Besok Puasa Sunnah',
					'🌙 Sunnah Fasting Tomorrow',
					`Besok adalah ${fast.nameId}. ${fast.descId}`,
					`Tomorrow is ${fast.nameEn}. ${fast.descEn}`,
					env
				).then(result => {
					if (!result || !result.success) {
						console.error(`Failed to send notification for ${fast.nameEn}:`, result);
					} else {
						console.log(`Notification sent for ${fast.nameEn}`);
					}
				})
			);
		}

		if (tomorrowFasts.length === 0) {
			console.log(`No upcoming fasts tomorrow. Hijri date: ${hijri.day}/${hijri.month}/${hijri.year}`);
		}
	},
};