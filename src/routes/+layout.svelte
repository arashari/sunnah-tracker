<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores';

	onMount(() => {
		theme.init();
		
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', () => {
			const currentTheme = localStorage.getItem('theme');
			if (currentTheme === 'auto') {
				document.documentElement.classList.toggle('dark', mediaQuery.matches);
			}
		});
	});
</script>

<slot />