interface Env {
	ONESIGNAL_API_KEY: string;
	ONESIGNAL_APP_ID: string;
	TIMEZONE: string;
}

const FAST_DATES = [
	{ hijri: "13-01", name: "Ayyamul Bidh (13 Muharram)", description: "Berdiam diri di awal tahun Hijriah" },
	{ hijri: "14-01", name: "Ayyamul Bidh (14 Muharram)", description: "Berdiam diri di awal tahun Hijriah" },
	{ hijri: "15-01", name: "Ayyamul Bidh (15 Muharram)", description: "Berdiam diri di awal tahun Hijriah" },
	{ hijri: "09-01", name: "Tasu'a (9 Muharram)", description: "Puasa Tasu'a" },
	{ hijri: "10-01", name: "Ashura (10 Muharram)", description: "Puasa Ashura" },
	{ hijri: "09-12", name: "Yawm Arafat (9 Dhul Hijjah)", description: "Puasa Arafah" },
];

function toHijri(date: Date): { day: number; month: number; year: number } {
	const diff = date.getTime() - new Date(622, 6, 16).getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	let year = Math.floor(days / 354.36667) + 1;
	let dayOfYear = days - Math.floor((year - 1) * 354.36667);

	const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
	let month = 1;
	for (let i = 0; i < 12; i++) {
		if (dayOfYear <= monthLengths[i]) {
			month = i + 1;
			break;
		}
		dayOfYear -= monthLengths[i];
	}

	return { day: dayOfYear, month, year };
}

function hijriToday(tz: string): { day: number; month: number; year: number } {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: tz,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const parts = formatter.formatToParts(now);
	const get = (type: string) => parseInt(parts.find((p) => p.type === type)!.value);
	const year = get("year");
	const month = get("month");
	const day = get("day");
	return toHijri(new Date(year, month - 1, day));
}

function getUpcomingFast(hijri: { day: number; month: number; year: number }) {
	const today = `${hijri.day.toString().padStart(2, "0")}-${hijri.month.toString().padStart(2, "0")}`;

	for (const fast of FAST_DATES) {
		const [fd, fm] = fast.hijri.split("-").map(Number);
		if (fm === hijri.month && fd >= hijri.day && fd <= hijri.day + 3) {
			const daysUntil = fd - hijri.day;
			return { ...fast, daysUntil };
		}
	}
	return null;
}

async function sendNotification(title: string, message: string, env: Env) {
	await fetch("https://onesignal.com/api/v1/notifications", {
		method: "POST",
		headers: {
			Authorization: `Basic ${env.ONESIGNAL_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			app_id: env.ONESIGNAL_APP_ID,
			headings: { en: title, id: title },
			contents: { en: message, id: message },
			included_segments: ["Subscribed Users"],
		}),
	});
}

export default {
	async fetch(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
		return new Response("OK");
	},

	async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
		const hijri = hijriToday(env.TIMEZONE);
		const upcoming = getUpcomingFast(hijri);

		if (upcoming && upcoming.daysUntil === 1) {
			await sendNotification(
				"🌙 Besok Puasa Sunnah",
				`Besok adalah ${upcoming.name}. Siap untuk puasanya?`,
				env
			);
		}
	},
};
