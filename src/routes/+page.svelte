<script lang="ts">
	import { onMount } from 'svelte';
	import { locale, theme, visibleFasts, type Theme, type VisibleFasts } from '$lib/stores';
	import { t, type Locale } from '$lib/i18n';
	import { getHijriDate, isAyyamulBidh, isTasuAshura, isYawnArafat } from '$lib/hijri';
	import { fasts, type Fast } from '$lib/fasts';

	let viewYear = new Date().getFullYear();
	let viewMonth = new Date().getMonth();
	let selectedDate: Date | null = null;
	let showSettings = false;
	let showFastModal = false;
	let selectedFast: Fast | null = null;

	const monthNames = {
		id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
		en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	};

	const dayNames = {
		id: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
		en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	};

	function getDaysInMonth(year: number, month: number): number {
		return new Date(year, month + 1, 0).getDate();
	}

	function getFirstDayOfMonth(year: number, month: number): number {
		return new Date(year, month, 1).getDay();
	}

	function isToday(date: Date): boolean {
		const today = new Date();
		return date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear();
	}

	function getFastsForDate(date: Date, visible: VisibleFasts): Fast[] {
		const hijri = getHijriDate(date);
		const result: Fast[] = [];

		if (visible.ayyamulBidh && isAyyamulBidh(hijri.day)) {
			const fast = fasts.find(f => f.id === 'ayyamul-bidh');
			if (fast) result.push(fast);
		}

		if (visible.tasuashura) {
			if (isTasuAshura(hijri.month, hijri.day)) {
				const fast = hijri.day === 9 
					? fasts.find(f => f.id === 'tasua')
					: fasts.find(f => f.id === 'ashura');
				if (fast) result.push(fast);
			}
		}

		if (visible.yawnArafat && isYawnArafat(hijri.month, hijri.day)) {
			const fast = fasts.find(f => f.id === 'yawn-arafat');
			if (fast) result.push(fast);
		}

		return result;
	}

	function prevMonth() {
		if (viewMonth === 0) {
			viewMonth = 11;
			viewYear--;
		} else {
			viewMonth--;
		}
	}

	function nextMonth() {
		if (viewMonth === 11) {
			viewMonth = 0;
			viewYear++;
		} else {
			viewMonth++;
		}
	}

	function goToToday() {
		const today = new Date();
		viewYear = today.getFullYear();
		viewMonth = today.getMonth();
	}

	function openFastModal(fast: Fast, date?: Date) {
		selectedFast = fast;
		if (date) selectedDate = date;
		showFastModal = true;
	}

	function generateGoogleCalendarUrl(date: Date, fast: Fast): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const startDate = `${year}${month}${day}`;
		const endDate = `${year}${month}${day}`;
		const title = encodeURIComponent(`Puasa ${fast.nameId}`);
		const details = encodeURIComponent(`Reminder puasa ${fast.nameId} - ${currentLocale === 'id' ? fast.descId : fast.descEn}`);
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}`;
	}

	function handleKeyDown(e: KeyboardEvent, action: () => void) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			action();
		}
	}

	function getFastColor(fastId: string): string {
		switch (fastId) {
			case 'ayyamul-bidh': return 'bg-amber-500';
			case 'tasua':
			case 'ashura': return 'bg-orange-500';
			case 'yawn-arafat': return 'bg-emerald-500';
			default: return 'bg-amber-500';
		}
	}

	onMount(() => {
		locale.init();
		theme.init();
		visibleFasts.init();
	});

	$: currentLocale = $locale;
	$: currentVisibleFasts = $visibleFasts;
	$: daysInMonth = getDaysInMonth(viewYear, viewMonth);
	$: firstDay = getFirstDayOfMonth(viewYear, viewMonth);
	$: currentMonthName = monthNames[currentLocale][viewMonth];
	$: dayName = dayNames[currentLocale];
	$: todayFasts = getFastsForDate(new Date(), currentVisibleFasts);
	$: hijriDate = getHijriDate(new Date(viewYear, viewMonth, 1));
	$: todayHijri = getHijriDate(new Date());
</script>

<svelte:head>
	<title>{t('appName', currentLocale)}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
	<header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
		<div class="px-4 py-3 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
				<div class="min-w-0">
					<h1 class="text-base font-semibold truncate">{t('appName', currentLocale)}</h1>
					<p class="text-[10px] text-gray-500 dark:text-gray-400">{todayHijri.day} {todayHijri.monthName} {todayHijri.year} H</p>
				</div>
			</div>
			<div class="flex items-center gap-1">
				<button
					onclick={() => showSettings = !showSettings}
					class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					aria-label={t('settings', currentLocale)}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</button>
			</div>
		</div>

		{#if showSettings}
			<div class="border-t border-gray-200 dark:border-gray-700 px-4 py-4 bg-gray-50 dark:bg-gray-800">
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-400">{t('language', currentLocale)}</span>
						<div class="flex gap-1">
							<button
								onclick={() => locale.set('id')}
								class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors {currentLocale === 'id' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}"
							>
								ID
							</button>
							<button
								onclick={() => locale.set('en')}
								class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors {currentLocale === 'en' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}"
							>
								EN
							</button>
						</div>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-400">{t('theme', currentLocale)}</span>
						<div class="flex gap-1">
							{#each [['light', '☀️'], ['dark', '🌙'], ['auto', '⚙️']] as [value, icon]}
								<button
									onclick={() => theme.set(value as Theme)}
									class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors {$theme === value ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}"
								>
									{icon}
								</button>
							{/each}
						</div>
					</div>

					<div>
						<span class="text-sm text-gray-600 dark:text-gray-400 block mb-2">{t('showFasts', currentLocale)}</span>
						<div class="flex flex-wrap gap-2">
							<button
								onclick={() => visibleFasts.toggle('ayyamulBidh')}
								class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors {currentVisibleFasts.ayyamulBidh ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800' : 'bg-white dark:bg-gray-700 text-gray-500'}"
							>
								<span class="w-2 h-2 rounded-full bg-amber-500"></span>
								Ayyamul Bidh
							</button>
						</div>
					</div>

					<a
						href="/deeds"
						class="flex items-center gap-2 w-full px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors"
						onclick={() => showSettings = false}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
						</svg>
						{t('showFasts', currentLocale)}
					</a>
				</div>
			</div>
		{/if}
	</header>

	<main class="px-3 py-4 max-w-lg mx-auto">
		<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
			<div class="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
				<button
					onclick={prevMonth}
					class="p-1.5 rounded-full hover:bg-white/20 transition-colors"
					aria-label={t('prevMonth', currentLocale)}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<div class="text-center">
					<h2 class="text-lg font-semibold">{currentMonthName} {viewYear}</h2>
					<p class="text-xs opacity-80">{hijriDate.day} {hijriDate.monthName} {hijriDate.year} H</p>
					<button
						onclick={goToToday}
						class="text-xs opacity-80 hover:opacity-100 underline"
					>
						{t('today', currentLocale)}
					</button>
				</div>
				<button
					onclick={nextMonth}
					class="p-1.5 rounded-full hover:bg-white/20 transition-colors"
					aria-label={t('nextMonth', currentLocale)}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>

			<div class="grid grid-cols-7 text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 py-2 bg-gray-100 dark:bg-gray-900">
				{#each dayName as day}
					<div class="py-1">{day}</div>
				{/each}
			</div>

			<div class="grid grid-cols-7">
				{#each Array(firstDay) as _}
					<div class="aspect-square"></div>
				{/each}

				{#each Array(daysInMonth) as _, i}
					{@const date = new Date(viewYear, viewMonth, i + 1)}
					{@const hijri = getHijriDate(date)}
					{@const fastsOnDate = getFastsForDate(date, currentVisibleFasts)}
					{@const isTodayDate = isToday(date)}
					{@const hasFasts = fastsOnDate.length > 0}
					<button
						onclick={() => hasFasts && openFastModal(fastsOnDate[0], date)}
						class="aspect-square flex flex-col items-center justify-center relative py-1 {hasFasts ? 'cursor-pointer' : 'cursor-default'}"
					>
						<span class="text-sm font-medium {isTodayDate ? 'w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center' : 'text-gray-700 dark:text-gray-300'}">
							{i + 1}
						</span>
						<span class="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
							{hijri.day}
						</span>
						{#if hasFasts}
							<div class="flex gap-0.5 mt-0.5">
								{#each fastsOnDate.slice(0, 3) as fast}
									<span class="w-1.5 h-1.5 rounded-full {getFastColor(fast.id)}"></span>
								{/each}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		{#if todayFasts.length > 0}
			<div class="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
				<h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
					<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
					{t('today', currentLocale)} - {t('fasting', currentLocale)}
				</h3>
				<div class="space-y-2">
					{#each todayFasts as fast}
						<button
							onclick={() => openFastModal(fast, new Date())}
							class="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
						>
							<span class="w-3 h-3 rounded-full {getFastColor(fast.id)}"></span>
							<div class="flex-1 min-w-0">
								<div class="font-medium text-sm truncate">{currentLocale === 'id' ? fast.nameId : fast.nameEn}</div>
								<div class="text-xs text-gray-500 dark:text-gray-400 truncate">{currentLocale === 'id' ? fast.descId : fast.descEn}</div>
							</div>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</main>

	{#if showFastModal && selectedFast}
		<div 
			class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
			onclick={() => showFastModal = false}
			onkeydown={(e) => e.key === 'Escape' && (showFastModal = false)}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div 
				class="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="sticky top-0 bg-white dark:bg-gray-800 px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
					<div class="flex items-center gap-3">
						<span class="w-4 h-4 rounded-full {getFastColor(selectedFast.id)}"></span>
						<h2 class="text-lg font-semibold">{currentLocale === 'id' ? selectedFast.nameId : selectedFast.nameEn}</h2>
					</div>
					<button
						onclick={() => showFastModal = false}
						class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
						aria-label={t('close', currentLocale)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div class="p-5 space-y-4">
					<p class="text-gray-600 dark:text-gray-400">{currentLocale === 'id' ? selectedFast.descId : selectedFast.descEn}</p>

					<div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
						<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('dalil', currentLocale)}</h3>
						<p class="text-sm text-gray-700 dark:text-gray-300 italic">"{currentLocale === 'id' ? selectedFast.dalilId : selectedFast.dalilEn}"</p>
					</div>

					<div>
						<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('source', currentLocale)}</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">{currentLocale === 'id' ? selectedFast.sourceId : selectedFast.sourceEn}</p>
					</div>

					<div class="flex items-center gap-2">
						<span class="text-xs font-medium text-gray-500 dark:text-gray-400">{t('rules', currentLocale)}:</span>
						<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
							{t('recommended', currentLocale)}
						</span>
					</div>

					{#if selectedDate}
						<a
							href={generateGoogleCalendarUrl(selectedDate, selectedFast)}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center justify-center gap-2 w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							{t('addToCalendar', currentLocale)}
						</a>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>