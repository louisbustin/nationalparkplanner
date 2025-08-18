<script lang="ts">
	import { Button, Card, Alert, Spinner } from 'flowbite-svelte';

	interface Props {
		title: string;
		submitText: string;
		isLoading?: boolean;
		errors?: Record<string, string>;
		generalError?: string;
		onsubmit?: (event: SubmitEvent) => void | Promise<void>;
		children?: any;
	}

	let {
		title,
		submitText,
		isLoading = false,
		errors = {},
		generalError = '',
		onsubmit,
		children
	}: Props = $props();

	const hasFieldErrors = $derived(Object.keys(errors).length > 0);
	const hasGeneralError = $derived(!!generalError);
	const hasAnyError = $derived(hasFieldErrors || hasGeneralError);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (onsubmit) {
			await onsubmit(event);
		}
	}
</script>

<div class="mx-auto w-full max-w-md">
	<Card class="p-6">
		<div class="mb-6 text-center">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
				{title}
			</h1>
		</div>

		{#if hasGeneralError}
			<Alert color="red" class="mb-4">
				{generalError}
			</Alert>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			{@render children?.()}

			<Button type="submit" class="w-full" disabled={isLoading} color="primary">
				{#if isLoading}
					<Spinner class="mr-3" size="4" />
					Processing...
				{:else}
					{submitText}
				{/if}
			</Button>
		</form>
	</Card>
</div>

<style>
	:global(.dark) {
		color-scheme: dark;
	}
</style>
