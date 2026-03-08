<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let showSignUp = $state(false);
</script>

{#if showSignUp}
	<h1>Sign up</h1>
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
	<p class="form-switch">Already have an account? <button type="button" class="link-btn" onclick={() => (showSignUp = false)}>Log in</button></p>
{:else}
	<h1>Login</h1>
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
		<button type="submit">Login</button>
	</form>
	<p class="form-switch">Don't have an account? <button type="button" class="link-btn" onclick={() => (showSignUp = true)}>Sign up</button></p>
{/if}
