<script lang="ts">
	import { Button, Card, Spinner } from 'flowbite-svelte';
	import LoadingButton from './LoadingButton.svelte';
	import ErrorMessage from './ErrorMessage.svelte';

	interface Props {
		title: string;
		submitText: string;
		isLoading?: boolean;
		generalError?: string;
		loadingText?: string;
		useLoadingButton?: boolean;
		onsubmit?: (event: SubmitEvent) => void | Promise<void>;
		children?: import('svelte').Snippet;
	}

	let {
		title,
		submitText,
		isLoading = false,
		generalError = '',
		loadingText = 'Processing...',
		useLoadingButton = true,
		onsubmit,
		children
	}: Props = $props();

	const hasGeneralError = $derived(!!generalError);

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
			<ErrorMessage message={generalError} severity="error" class="mb-4" />
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			{@render children?.()}

			{#if useLoadingButton}
				<LoadingButton
					type="submit"
					class="w-full"
					loading={isLoading}
					{loadingText}
					color="primary"
				>
					{submitText}
				</LoadingButton>
			{:else}
				<Button type="submit" class="w-full" disabled={isLoading} color="primary">
					{#if isLoading}
						<Spinner class="mr-3" size="4" />
						{loadingText}
					{:else}
						{submitText}
					{/if}
				</Button>
			{/if}
		</form>
	</Card>
</div>

<style>
	:global(.dark) {
		color-scheme: dark;
	}
</style>
