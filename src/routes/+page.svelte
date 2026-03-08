<script lang="ts">
	import { enhance, deserialize, applyAction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Trash2, Sun, Moon } from '@lucide/svelte';
	import { getTheme, toggleTheme } from '$lib/theme';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let titleInput: HTMLInputElement | undefined = $state();
	let popoverOpen = $state(false);
	let emojiPickerOpen = $state(false);
	let popoverContainer: HTMLDivElement;
	let theme = $state<'light' | 'dark'>(getTheme());

	function handleThemeToggle() {
		theme = toggleTheme();
	}

	$effect(() => {
		const handler = () => (theme = getTheme());
		window.addEventListener('themechange', handler);
		return () => window.removeEventListener('themechange', handler);
	});

	const EMOJIS = ['😀', '😊', '😎', '🥳', '😇', '🤩', '😍', '🥰', '🤗', '👍', '🐶', '🐱', '🦊', '🐻', '🐼', '🦁', '🐯', '🦄', '⭐', '🔥', '❤️', '🎬', '🍿', '🎮', '📚', '✏️', '🎵', '🌈', '🎯', '🚀', '💡'];

	function togglePopover() {
		popoverOpen = !popoverOpen;
		if (!popoverOpen) emojiPickerOpen = false;
	}

	function handleClickOutside(e: MouseEvent) {
		if (popoverContainer && !popoverContainer.contains(e.target as Node)) {
			popoverOpen = false;
			emojiPickerOpen = false;
		}
	}

	$effect(() => {
		if (popoverOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});

	async function setAvatar(emoji: string) {
		const formData = new FormData();
		formData.set('emoji', emoji);
		const response = await fetch('?/updateAvatar', {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' },
			credentials: 'include',
			body: formData
		});
		const result = deserialize(await response.text());
		await applyAction(result);
		await invalidateAll();
	}

	async function removeMovie(id: number) {
		const formData = new FormData();
		formData.set('id', id.toString());
		const response = await fetch('?/removeMovie', {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' },
			credentials: 'include',
			body: formData
		});
		const result = deserialize(await response.text());
		await applyAction(result);
		await invalidateAll();
	}

	async function handleAddSubmit(e: SubmitEvent) {
		e.preventDefault();
		const formEl = e.target as HTMLFormElement;
		if (!formEl || !titleInput) return;

		const response = await fetch(formEl.action, {
			method: 'POST',
			body: new FormData(formEl)
		});

		const result = deserialize(await response.text());
		await applyAction(result);

		if (result.type === 'success' && !result.data?.message) {
			await invalidateAll();
			titleInput.value = '';
			titleInput.focus();
		}
	}
</script>

<header class="page-header">
	<h1>Watchlist</h1>
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
		<div class="user-popover-wrap" bind:this={popoverContainer}>
			<button type="button" class="user-info" onclick={togglePopover} aria-haspopup="menu" aria-expanded={popoverOpen}>
				<span class="user-avatar" class:emoji={!!data.user?.image} aria-hidden="true">{data.user?.image ?? data.user?.name?.charAt(0) ?? '?'}</span>
				<span class="user-name">{data.user.name}</span>
			</button>
			{#if popoverOpen}
				<div class="popover" role="menu">
					{#if emojiPickerOpen}
						<div class="emoji-grid">
							<button
								type="button"
								class="emoji-btn emoji-btn-clear"
								class:selected={!data.user?.image}
								onclick={() => setAvatar('')}
								title="Use initial"
							>Aa</button>
							{#each EMOJIS as emoji}
								<button
									type="button"
									class="emoji-btn"
									class:selected={data.user?.image === emoji}
									onclick={() => setAvatar(emoji)}
									title="Set as avatar"
								><span class="emoji-char">{emoji}</span></button>
							{/each}
						</div>
					{:else}
						<button type="button" class="popover-btn" onclick={(e) => { e.stopPropagation(); emojiPickerOpen = true; }}>Change avatar</button>
						<form method="post" action="?/signOut" use:enhance>
							<button type="submit">Sign out</button>
						</form>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</header>

<form method="post" action="?/addMovie" onsubmit={handleAddSubmit}>
	<label for="movie-title">Title</label>
	<div class="add-movie-row">
		<input id="movie-title" type="text" name="title" bind:this={titleInput} />
		<button type="submit">Add</button>
	</div>
</form>
{#if form?.message}
	<p class="form-message">{form.message}</p>
{/if}

<ul class="movie-list">
	{#each data.movies as m}
		<li>
			<span>{m.title}</span>
			<button type="button" class="remove-btn" aria-label="Remove {m.title}" onclick={() => removeMovie(m.id)}><Trash2 size={18} /></button>
		</li>
	{/each}
</ul>
