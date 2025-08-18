<script lang="ts">
	import Toast from './Toast.svelte';
	import type { ToastType } from './Toast.svelte';

	export interface ToastMessage {
		id: string;
		message: string;
		type: ToastType;
		duration?: number;
	}

	interface Props {
		toasts: ToastMessage[];
		onRemove: (id: string) => void;
		position?:
			| 'top-right'
			| 'top-left'
			| 'bottom-right'
			| 'bottom-left'
			| 'top-center'
			| 'bottom-center';
	}

	let { toasts, onRemove, position = 'top-right' }: Props = $props();

	const positionClasses = {
		'top-right': 'fixed top-4 right-4 z-50',
		'top-left': 'fixed top-4 left-4 z-50',
		'bottom-right': 'fixed bottom-4 right-4 z-50',
		'bottom-left': 'fixed bottom-4 left-4 z-50',
		'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
		'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'
	};

	function handleDismiss(id: string) {
		onRemove(id);
	}
</script>

<div class={positionClasses[position]}>
	{#each toasts as toast (toast.id)}
		<Toast
			message={toast.message}
			type={toast.type}
			duration={toast.duration}
			onDismiss={() => handleDismiss(toast.id)}
		/>
	{/each}
</div>
