<script lang="ts">
	import { enhance, deserialize, applyAction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { X, Sun, Moon, Film, Popcorn, Pin, Check, Trash2, MoreVertical } from '@lucide/svelte';
	import { getTheme, toggleTheme } from '$lib/theme';
	import type { ActionData, PageData } from './$types';

	const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let searchQuery = $state('');
	let searchResults = $state<{ id: number; title: string; poster_path: string | null; release_date: string | null }[]>([]);
	let searchLoading = $state(false);
	let searchDebounceTimer: ReturnType<typeof setTimeout>;
	let popoverOpen = $state(false);
	let emojiPickerOpen = $state(false);
	let popoverContainer: HTMLDivElement;
	let searchContainer: HTMLDivElement;
	let scrolled = $state(false);
	let theme = $state<'light' | 'dark'>(getTheme());
	let openMenuId = $state<number | null>(null);

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
		if (searchContainer && !searchContainer.contains(e.target as Node)) {
			searchResults = [];
		}
		if (openMenuId !== null && !(e.target as Element).closest('[data-card-menu-container]')) {
			openMenuId = null;
		}
	}

	$effect(() => {
		if (popoverOpen || searchResults.length > 0 || openMenuId !== null) {
			const handler = (e: MouseEvent) => handleClickOutside(e);
			document.addEventListener('click', handler);
			return () => document.removeEventListener('click', handler);
		}
	});

	$effect(() => {
		const handler = () => {
			scrolled = window.scrollY > 4;
		};
		window.addEventListener('scroll', handler, { passive: true });
		handler();
		return () => window.removeEventListener('scroll', handler);
	});

	async function fetchSearchResults() {
		const q = searchQuery.trim();
		if (!q) {
			searchResults = [];
			return;
		}
		searchLoading = true;
		try {
			const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`);
			const json = await res.json();
			searchResults = json.results ?? [];
		} catch {
			searchResults = [];
		} finally {
			searchLoading = false;
		}
	}

	function onSearchInput() {
		clearTimeout(searchDebounceTimer);
		searchDebounceTimer = setTimeout(fetchSearchResults, 300);
	}

	function clearSearch() {
		searchQuery = '';
		searchResults = [];
	}

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
		openMenuId = null;
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

	async function toggleWatched(id: number) {
		openMenuId = null;
		const formData = new FormData();
		formData.set('id', id.toString());
		const response = await fetch('?/toggleWatched', {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' },
			credentials: 'include',
			body: formData
		});
		const result = deserialize(await response.text());
		await applyAction(result);
		await invalidateAll();
	}

	async function togglePin(id: number) {
		openMenuId = null;
		const formData = new FormData();
		formData.set('id', id.toString());
		const response = await fetch('?/togglePin', {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' },
			credentials: 'include',
			body: formData
		});
		const result = deserialize(await response.text());
		await applyAction(result);
		await invalidateAll();
	}

	function toggleCardMenu(id: number) {
		openMenuId = openMenuId === id ? null : id;
	}

	async function addMovieFromSearch(movie: { title: string; poster_path: string | null }) {
		const formData = new FormData();
		formData.set('title', movie.title);
		if (movie.poster_path) formData.set('poster_path', movie.poster_path);

		const response = await fetch('?/addMovie', {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' },
			credentials: 'include',
			body: formData
		});
		const result = deserialize(await response.text());
		await applyAction(result);
		if (result.type === 'success' && !result.data?.message) {
			await invalidateAll();
			searchQuery = '';
			searchResults = [];
		}
	}

	function posterUrl(path: string | null, size: 'w92' | 'w154' = 'w92'): string | undefined {
		if (!path) return undefined;
		return `${TMDB_IMAGE_BASE}/${size}${path}`;
	}
</script>

<div class="sticky-top" class:scrolled>
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

	<div class="search-wrap" bind:this={searchContainer}>
		<div class="search-input-wrap">
			<input
				id="movie-search"
				type="text"
				placeholder="Add a movie..."
				bind:value={searchQuery}
				oninput={onSearchInput}
				class:has-value={searchQuery.length > 0}
			/>
			{#if searchQuery.length > 0}
				<button
					type="button"
					class="search-clear-btn"
					onclick={clearSearch}
					aria-label="Clear search"
				>
					<X size={18} />
				</button>
			{/if}
			{#if searchLoading}
				<p class="search-status">Searching...</p>
			{:else if searchQuery.trim() && !searchLoading}
				<div class="search-results">
			{#if searchResults.length === 0}
				<p class="search-status">No movies found</p>
			{:else}
				{#each searchResults as result (result.id)}
					<button
						type="button"
						class="search-result-btn"
						onclick={() => addMovieFromSearch(result)}
					>
						{#if result.poster_path}
							<img
								class="search-result-poster"
								src={posterUrl(result.poster_path, 'w154')}
								alt=""
								width="50"
								height="75"
							/>
						{:else}
							<span class="search-result-poster-placeholder" aria-hidden="true"><Film size={24} /></span>
						{/if}
						<span class="search-result-info">
							<span class="search-result-title">{result.title}</span>
							{#if result.release_date}
								<span class="search-result-year">({result.release_date.slice(0, 4)})</span>
							{/if}
						</span>
					</button>
				{/each}
			{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
{#if form?.message}
	<p class="form-message">{form.message}</p>
{/if}

{#if data.movies.length === 0}
	<div class="empty-state">
		<div class="empty-state-icon" aria-hidden="true">👀</div>
		<p class="empty-state-title">No movies yet</p>
		<p class="empty-state-text">Start building your watchlist by adding a movie above.</p>
	</div>
{:else}
	<ul class="movie-list movie-list-cards">
		{#each data.movies as m (m.id)}
			<li class="movie-card" class:menu-open={openMenuId === m.id} in:fade={{ duration: 120 }} out:fade={{ duration: 120 }}>
				<div class="movie-card-poster-wrap">
					{#if m.posterPath}
						<img
							class="movie-card-poster"
							src={posterUrl(m.posterPath, 'w154')}
							alt=""
						/>
					{:else}
						<span class="movie-card-poster-placeholder" aria-hidden="true"><Film size={32} /></span>
					{/if}
					{#if m.watched || m.pinned}
						<div class="movie-card-poster-badges" aria-hidden="true">
							{#if m.watched}
								<span class="movie-card-badge-icon movie-card-badge-icon--watched"><Check size={14} /></span>
							{/if}
							{#if m.pinned}
								<span class="movie-card-badge-icon movie-card-badge-icon--pinned"><Pin size={14} /></span>
							{/if}
						</div>
					{/if}
					<div class="movie-card-poster-actions" aria-hidden="false">
						<button
							type="button"
							class="movie-card-poster-action-btn"
							onclick={(e) => {
								e.stopPropagation();
								toggleWatched(m.id);
							}}
						>
							{m.watched ? 'Mark unwatched' : 'Mark watched'}
						</button>
						<button
							type="button"
							class="movie-card-poster-action-btn"
							onclick={(e) => {
								e.stopPropagation();
								togglePin(m.id);
							}}
						>
							{m.pinned ? 'Unpin' : 'Pin'}
						</button>
						<button
							type="button"
							class="movie-card-poster-action-btn movie-card-poster-action-btn-delete"
							onclick={(e) => {
								e.stopPropagation();
								removeMovie(m.id);
							}}
						>
							Delete
						</button>
					</div>
				</div>
				<div class="movie-card-title-row">
					<span class="movie-card-title">{m.title}</span>
				</div>
			</li>
		{/each}
	</ul>
{/if}
