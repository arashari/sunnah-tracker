<script lang="ts">
	import { locale } from '$lib/stores';
	import { t } from '$lib/i18n';
	import { fasts, type Fast } from '$lib/fasts';

	function getFastColor(fastId: string): string {
		switch (fastId) {
			case 'ayyamul-bidh': return 'bg-amber-500';
			case 'tasua':
			case 'ashura': return 'bg-orange-500';
			case 'yawn-arafat': return 'bg-emerald-500';
			default: return 'bg-amber-500';
		}
	}

	$: currentLocale = $locale;
</script>

<svelte:head>
	<title>{t('showFasts', currentLocale)} - {t('appName', currentLocale)}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
	<header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
		<div class="px-4 py-3 flex items-center gap-3">
			<a href="/" class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Back">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</a>
			<div>
				<h1 class="text-base font-semibold">{t('showFasts', currentLocale)}</h1>
				<p class="text-[10px] text-gray-500 dark:text-gray-400">{t('appName', currentLocale)}</p>
			</div>
		</div>
	</header>

	<main class="px-3 py-4 max-w-lg mx-auto space-y-3">
		{#each fasts as fast}
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
				<div class="flex items-start gap-3 mb-3">
					<span class="w-4 h-4 rounded-full mt-0.5 {getFastColor(fast.id)}"></span>
					<div class="flex-1">
						<h2 class="font-semibold text-emerald-700 dark:text-emerald-400">
							{currentLocale === 'id' ? fast.nameId : fast.nameEn}
						</h2>
						<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
							{currentLocale === 'id' ? fast.descId : fast.descEn}
						</p>
					</div>
				</div>
				
				<div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-3">
					<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('dalil', currentLocale)}</h3>
					<p class="text-sm text-gray-700 dark:text-gray-300 italic">"{currentLocale === 'id' ? fast.dalilId : fast.dalilEn}"</p>
				</div>
				
				<div class="flex items-center justify-between">
					<span class="text-xs text-gray-500 dark:text-gray-400">{t('source', currentLocale)}: {currentLocale === 'id' ? fast.sourceId : fast.sourceEn}</span>
					<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
						{t('recommended', currentLocale)}
					</span>
				</div>
			</div>
		{/each}
	</main>
</div>