<script lang="ts">
	import { enhance, deserialize, applyAction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Trash2 } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let titleInput: HTMLInputElement | undefined = $state();

	async function removeMovie(id: number) {
		const formData = new FormData();
		formData.set('id', id.toString());
		const response = await fetch(new URL('?/removeMovie', $page.url.href).href, {
			method: 'POST',
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
	<form method="post" action="?/signOut" use:enhance>
		<button type="submit">Sign out</button>
	</form>
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
