<script lang="ts">
	import { Spinner } from 'flowbite-svelte';

	interface Props {
		visible: boolean;
		message?: string;
		backdrop?: boolean;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		visible,
		message = 'Loading...',
		backdrop = true,
		size = 'md',
		class: className = ''
	}: Props = $props();

	const sizeConfig = {
		sm: { spinner: '6' as const, text: 'text-sm' },
		md: { spinner: '8' as const, text: 'text-base' },
		lg: { spinner: '12' as const, text: 'text-lg' }
	};

	const config = $derived(sizeConfig[size]);
</script>

{#if visible}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center {className}"
		role="status"
		aria-label={message}
	>
		{#if backdrop}
			<div class="bg-opacity-50 dark:bg-opacity-80 absolute inset-0 bg-gray-900"></div>
		{/if}

		<div
			class="relative flex flex-col items-center justify-center rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
		>
			<Spinner color="blue" size={config.spinner} />
			{#if message}
				<p class="mt-4 {config.text} text-gray-700 dark:text-gray-300">
					{message}
				</p>
			{/if}
		</div>
	</div>
{/if}
