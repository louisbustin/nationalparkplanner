<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Spinner } from 'flowbite-svelte';
	import { ArrowRightToBracketOutline } from 'flowbite-svelte-icons';

	let isLoggingOut = $state(false);
</script>

<svelte:head>
	<title>Logging Out - National Park Planner</title>
</svelte:head>

<div class="flex min-h-[50vh] items-center justify-center">
	<div class="w-full max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Sign Out</h1>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				Are you sure you want to sign out of your account?
			</p>
		</div>

		<form
			method="POST"
			use:enhance={() => {
				isLoggingOut = true;
				return async ({ update }) => {
					await update();
					isLoggingOut = false;
				};
			}}
			class="space-y-4"
		>
			<div class="flex space-x-3">
				<Button type="submit" color="red" disabled={isLoggingOut} class="flex-1">
					{#if isLoggingOut}
						<Spinner class="mr-2 h-4 w-4" />
						Signing Out...
					{:else}
						<ArrowRightToBracketOutline class="mr-2 h-4 w-4" />
						Sign Out
					{/if}
				</Button>

				<Button href="/" color="alternative" disabled={isLoggingOut} class="flex-1">Cancel</Button>
			</div>
		</form>
	</div>
</div>
