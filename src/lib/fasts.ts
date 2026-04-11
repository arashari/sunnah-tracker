export interface Fast {
	id: string;
	nameId: string;
	nameEn: string;
	descId: string;
	descEn: string;
	dalilId: string;
	dalilEn: string;
	sourceId: string;
	sourceEn: string;
	type: 'sunnah' | 'nawafil';
	checker: (hijriDay: number, hijriMonth: number, hijriYear: number) => boolean;
}

export const fasts: Fast[] = [
	{
		id: 'ayyamul-bidh',
		nameId: 'Ayyamul Bidh',
		nameEn: 'Ayyamul Bidh',
		descId: 'Puasa sunnah pada tanggal 13, 14, dan 15 bulan Hijriyah',
		descEn: 'Sunnah fasting on 13th, 14th, and 15th of Hijri month',
		dalilId: 'Dari Abi Hurairah RA, Nabi shallahu \'alaihi wasallam bersabda: "Puasa tiga hari setiap bulan adalah puasa sepanjang masa."',
		dalilEn: 'From Abi Hurairah RA, the Prophet SAW said: "Fasting three days every month is fasting for a lifetime."',
		sourceId: 'HR. Bukhari no. 1978, Muslim no. 1984',
		sourceEn: 'HR. Bukhari no. 1978, Muslim no. 1984',
		type: 'sunnah',
		checker: (day) => day === 13 || day === 14 || day === 15
	},
	{
		id: 'tasua',
		nameId: 'Tasu\'a',
		nameEn: 'Tasu\'a Fasting',
		descId: 'Puasa sunnah Tasu\'a pada tanggal 9 Muharram',
		descEn: 'Tasu\'a fasting on 9th Muharram',
		dalilId: 'Dari Ibnu Abbas RA, bahwa Puasa Hari Ashura (Tasu\'a) tanggal 9 Muharram disunnahkan.',
		dalilEn: 'From Ibn Abbas RA, that fasting on the day of Ashura (Tasu\'a) on 9th Muharram is recommended.',
		sourceId: 'HR. Abu Dawud, Tirmidhi',
		sourceEn: 'HR. Abu Dawud, Tirmidhi',
		type: 'sunnah',
		checker: (day, month) => month === 1 && day === 9
	},
	{
		id: 'ashura',
		nameId: 'Ashura',
		nameEn: 'Ashura Fasting',
		descId: 'Puasa sunnah Ashura pada tanggal 10 Muharram',
		descEn: 'Ashura fasting on 10th Muharram',
		dalilId: 'Dari Ibnu Abbas RA, ia berkata: "Aku tidak pernah melihat Nabi shallahu \'alaihi wasallam begitu semangat memperbaiki puasa hari Ashura melainkan karena ingin bertawasul dengan kehidupan Iaqrab (nabi Musa AS)."',
		dalilEn: 'From Ibn Abbas RA, he said: "I never saw the Prophet SAW so eager to fast Ashura except because he wanted to get close to the life of the close (Prophet Moses AS)."',
		sourceId: 'HR. Bukhari, Muslim',
		sourceEn: 'HR. Bukhari, Muslim',
		type: 'sunnah',
		checker: (day, month) => month === 1 && day === 10
	},
	{
		id: 'yawn-arafat',
		nameId: 'Yawm \'Arafat',
		nameEn: 'Yawm \'Arafat Fasting',
		descId: 'Puasa sunnah pada hari Arafah (9 Dzul Hijjah)',
		descEn: 'Fasting on the day of Arafah (9th Dhul Hijjah)',
		dalilId: 'Dari Abu Qatadah RA, Nabi shallahu \'alaihi wasallam bersabda: "Puasa hari Arafah dapat menghapus dosa tahun yang telah lalu dan tahun yang akan datang."',
		dalilEn: 'From Abu Qatadah RA, the Prophet SAW said: "Fasting on the day of Arafah can erase the sins of the past year and the coming year."',
		sourceId: 'HR. Muslim no. 1946',
		sourceEn: 'HR. Muslim no. 1946',
		type: 'sunnah',
		checker: (day, month) => month === 12 && day === 9
	}
];