<script lang="ts">
	import { Alert } from 'flowbite-svelte';
	import { ExclamationCircleOutline, InfoCircleOutline } from 'flowbite-svelte-icons';

	export type ErrorSeverity = 'error' | 'warning' | 'info';

	interface Props {
		message: string;
		severity?: ErrorSeverity;
		dismissible?: boolean;
		class?: string;
	}

	let { message, severity = 'error', dismissible = false, class: className = '' }: Props = $props();

	const severityConfig = {
		error: {
			color: 'red' as const,
			icon: ExclamationCircleOutline
		},
		warning: {
			color: 'yellow' as const,
			icon: ExclamationCircleOutline
		},
		info: {
			color: 'blue' as const,
			icon: InfoCircleOutline
		}
	};

	const config = $derived(severityConfig[severity]);
</script>

<Alert color={config.color} dismissable={dismissible} class={className}>
	{#snippet icon()}
		<config.icon class="h-4 w-4" />
	{/snippet}
	{message}
</Alert>
