<script lang="ts">
	import { enhance } from '$app/forms';
	import { Sun, Moon } from '@lucide/svelte';
	import { getTheme, toggleTheme } from '$lib/theme';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let showSignUp = $state(false);
	let theme = $state<'light' | 'dark'>(getTheme());

	function handleThemeToggle() {
		theme = toggleTheme();
	}

	$effect(() => {
		const handler = () => (theme = getTheme());
		window.addEventListener('themechange', handler);
		return () => window.removeEventListener('themechange', handler);
	});
</script>

{#if showSignUp}
	<header class="page-header">
		<h1>Sign up</h1>
		<div class="header-actions">
			<button
				type="button"
				class="theme-toggle"
				onclick={handleThemeToggle}
				aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			>
				{#if theme === 'dark'}
					<Sun size={18} />
				{:else}
					<Moon size={18} />
				{/if}
			</button>
		</div>
	</header>
	<form method="post" action="?/signUpEmail" use:enhance>
		<label>
			Email
			<input type="email" name="email" required />
		</label>
		<label>
			Password
			<input type="password" name="password" required />
		</label>
		<label>
			Username
			<input name="name" required />
		</label>
		{#if form?.message}
			<p class="form-message">{form.message}</p>
		{/if}
		<button type="submit">Sign up</button>
	</form>
	<p class="form-switch">Already have an account? <button type="button" class="link-btn" onclick={() => (showSignUp = false)}>Sign in</button></p>
{:else}
	<header class="page-header">
		<h1>Sign in</h1>
		<div class="header-actions">
			<button
				type="button"
				class="theme-toggle"
				onclick={handleThemeToggle}
				aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			>
				{#if theme === 'dark'}
					<Sun size={18} />
				{:else}
					<Moon size={18} />
				{/if}
			</button>
		</div>
	</header>
	<form method="post" action="?/signInEmail" use:enhance>
		<label>
			Email
			<input type="email" name="email" required />
		</label>
		<label>
			Password
			<input type="password" name="password" required />
		</label>
		{#if form?.message}
			<p class="form-message">{form.message}</p>
		{/if}
		<button type="submit">Sign in</button>
	</form>
	<p class="form-switch">Don't have an account? <button type="button" class="link-btn" onclick={() => (showSignUp = true)}>Sign up</button></p>
{/if}
