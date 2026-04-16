import { writable } from 'svelte/store';
import type { Locale } from './i18n';

function createLocaleStore() {
	const { subscribe, set, update } = writable<Locale>('id');

	return {
		subscribe,
		set: (value: Locale) => {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('locale', value);
			}
			set(value);
		},
		init: () => {
			if (typeof localStorage !== 'undefined') {
				const saved = localStorage.getItem('locale') as Locale;
				if (saved && (saved === 'id' || saved === 'en')) {
					set(saved);
				}
			}
		}
	};
}

export const locale = createLocaleStore();

export type Theme = 'light' | 'dark' | 'auto';

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('auto');

	return {
		subscribe,
		set: (value: Theme) => {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('theme', value);
			}
			set(value);
			applyTheme(value);
		},
		init: () => {
			if (typeof localStorage !== 'undefined') {
				const saved = localStorage.getItem('theme') as Theme;
				if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
					set(saved);
					applyTheme(saved);
				} else {
					applyTheme('auto');
				}
			} else {
				applyTheme('auto');
			}
		}
	};
}

function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;

	const root = document.documentElement;
	
	if (theme === 'auto') {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		root.classList.toggle('dark', prefersDark);
	} else {
		root.classList.toggle('dark', theme === 'dark');
	}
}

export const theme = createThemeStore();

export type VisibleFasts = {
	ayyamulBidh: boolean;
	tasuashura: boolean;
	yawnArafat: boolean;
};

function createFastsStore() {
	const defaultFasts: VisibleFasts = {
		ayyamulBidh: true,
		tasuashura: true,
		yawnArafat: true
	};

	const { subscribe, set, update } = writable<VisibleFasts>(defaultFasts);

	return {
		subscribe,
		set: (value: VisibleFasts) => {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('visibleFasts', JSON.stringify(value));
			}
			set(value);
		},
		toggle: (key: keyof VisibleFasts) => {
			update(current => {
				const newValue = { ...current, [key]: !current[key] };
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('visibleFasts', JSON.stringify(newValue));
				}
				return newValue;
			});
		},
		init: () => {
			if (typeof localStorage !== 'undefined') {
				const saved = localStorage.getItem('visibleFasts');
				if (saved) {
					try {
						set(JSON.parse(saved));
					} catch {
						set(defaultFasts);
					}
				}
			}
		}
	};
}

export const visibleFasts = createFastsStore();

export const notificationsEnabled = writable(false);

export async function initNotifications() {
	if (typeof window !== 'undefined' && window.OneSignal && window.OneSignal.User.PushSubscription.optedIn) {
		notificationsEnabled.set(true);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('notificationsEnabled', 'true');
		}
		return;
	}

	if (typeof localStorage !== 'undefined') {
		const saved = localStorage.getItem('notificationsEnabled');
		if (saved === 'true') {
			notificationsEnabled.set(true);
		}
	}
}

export async function requestNotificationPermission() {
	if (!('Notification' in window)) {
		alert('Notifications not supported');
		return false;
	}

	if (Notification.permission === 'denied') {
		return false;
	}

	if (window.OneSignal) {
		await window.OneSignal.Slidedown.promptPush({ force: true });
		const optedIn = window.OneSignal.User.PushSubscription.optedIn;
		notificationsEnabled.set(optedIn);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('notificationsEnabled', optedIn ? 'true' : 'false');
		}
		return optedIn;
	}

	if (Notification.permission === 'granted') {
		notificationsEnabled.set(true);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('notificationsEnabled', 'true');
		}
		return true;
	}

	const permission = await Notification.requestPermission();
	if (permission === 'granted') {
		notificationsEnabled.set(true);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('notificationsEnabled', 'true');
		}
		return true;
	}

	return false;
}

export async function unsubscribeFromNotifications() {
	notificationsEnabled.set(false);
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('notificationsEnabled', 'false');
	}

	if (window.OneSignal) {
		await window.OneSignal.User.PushSubscription.optOut();
	}
}