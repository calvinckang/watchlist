<script lang="ts">
	import { enhance } from '$app/forms';
	import { Sun, Moon, Popcorn } from '@lucide/svelte';
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

<header class="page-header">
	<div class="page-title">
		<Popcorn size={24} strokeWidth={2.5} class="page-title-icon" />
		<h1>Watchit</h1>
	</div>
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

{#if showSignUp}
	<form method="post" action="?/signUpEmail" use:enhance class="auth-form">
		<h2 class="auth-form-title">Sign up</h2>
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
	<p class="form-switch auth-form-switch">Already have an account? <button type="button" class="link-btn" onclick={() => (showSignUp = false)}>Sign in</button></p>
{:else}
	<form method="post" action="?/signInEmail" use:enhance class="auth-form">
		<h2 class="auth-form-title">Sign in</h2>
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
	<p class="form-switch auth-form-switch">Don't have an account? <button type="button" class="link-btn" onclick={() => (showSignUp = true)}>Sign up</button></p>
{/if}
