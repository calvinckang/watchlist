<script lang="ts">
	import { enhance, deserialize, applyAction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let titleInput: HTMLInputElement | undefined = $state();

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

<ul>
	{#each data.movies as m}
		<li>{m.title}</li>
	{/each}
</ul>
