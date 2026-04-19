export declare global {
	interface Window {
		OneSignalDeferred: ((OneSignal: {
			init: (options: { appId: string; serviceWorkerParam?: { scope: string }; serviceWorkerPath?: string }) => Promise<void>;
			User: {
				PushSubscription: {
					optIn: () => Promise<void>;
					optOut: () => Promise<void>;
					optedIn: boolean;
					addEventListener: (event: 'change', listener: () => void) => void;
					removeEventListener: (event: 'change', listener: () => void) => void;
				};
			};
			Slidedown: {
				promptPush: (options?: { force?: boolean }) => Promise<void>;
			};
		}) => Promise<void>)[];
		OneSignal?: {
			User: {
				PushSubscription: {
					optIn: () => Promise<void>;
					optOut: () => Promise<void>;
					optedIn: boolean;
					addEventListener: (event: 'change', listener: () => void) => void;
					removeEventListener: (event: 'change', listener: () => void) => void;
				};
			};
			Slidedown: {
				promptPush: (options?: { force?: boolean }) => Promise<void>;
			};
		};
	}
}