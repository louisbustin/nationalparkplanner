<script lang="ts">
	import { Toast } from 'flowbite-svelte';
	import {
		CheckCircleOutline,
		ExclamationCircleOutline,
		InfoCircleOutline
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	export type ToastType = 'success' | 'error' | 'warning' | 'info';

	export interface ToastMessage {
		id: string;
		message: string;
		type: ToastType;
		duration?: number;
	}

	interface Props {
		message: string;
		type?: ToastType;
		duration?: number;
		dismissible?: boolean;
		onDismiss?: () => void;
		class?: string;
	}

	let {
		message,
		type = 'info',
		duration = 5000,
		dismissible = true,
		onDismiss,
		class: className = ''
	}: Props = $props();

	let visible = $state(true);

	const typeConfig = {
		success: {
			color: 'green' as const,
			icon: CheckCircleOutline
		},
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

	const config = $derived(typeConfig[type]);

	onMount(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				handleDismiss();
			}, duration);

			return () => clearTimeout(timer);
		}
	});

	function handleDismiss() {
		visible = false;
		if (onDismiss) {
			onDismiss();
		}
	}
</script>

{#if visible}
	<Toast color={config.color} dismissable={dismissible} class="mb-4 {className}">
		{#snippet icon()}
			<config.icon class="h-5 w-5" />
		{/snippet}
		{message}
	</Toast>
{/if}
