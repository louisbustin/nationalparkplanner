<script lang="ts">
	import { onMount } from 'svelte';
	import { Alert, Button } from 'flowbite-svelte';
	import { ExclamationCircleOutline, ArrowsRepeatOutline } from 'flowbite-svelte-icons';

	interface Props {
		fallback?: import('svelte').Snippet<[Error]>;
		onError?: (error: Error) => void;
		children: import('svelte').Snippet;
	}

	let { fallback, onError, children }: Props = $props();

	let hasError = $state(false);
	let error = $state<Error | null>(null);

	onMount(() => {
		const handleError = (event: ErrorEvent) => {
			hasError = true;
			error = new Error(event.message);
			if (onError) {
				onError(error);
			}
		};

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			hasError = true;
			error = new Error(event.reason?.message || 'Unhandled promise rejection');
			if (onError) {
				onError(error);
			}
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleUnhandledRejection);

		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleUnhandledRejection);
		};
	});

	function retry() {
		hasError = false;
		error = null;
	}
</script>

{#if hasError && error}
	{#if fallback}
		{@render fallback(error)}
	{:else}
		<div class="mx-auto max-w-md p-6">
			<Alert color="red" class="mb-4">
				{#snippet icon()}
					<ExclamationCircleOutline class="h-5 w-5" />
				{/snippet}
				<span class="font-medium">Something went wrong!</span>
				<div class="mt-2 text-sm">
					An unexpected error occurred. Please try refreshing the page or contact support if the
					problem persists.
				</div>
			</Alert>

			<div class="flex gap-2">
				<Button color="primary" onclick={retry}>
					<ArrowsRepeatOutline class="mr-2 h-4 w-4" />
					Try Again
				</Button>
				<Button color="alternative" onclick={() => window.location.reload()}>Refresh Page</Button>
			</div>
		</div>
	{/if}
{:else}
	{@render children()}
{/if}
