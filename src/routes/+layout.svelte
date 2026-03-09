<script lang="ts">
	import { page } from '$app/stores';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();

	const isAuthPage = $derived($page.url.pathname === '/login');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-bg">
	<main class="app" class:auth-pages={isAuthPage}>
		{@render children()}
	</main>
</div>
