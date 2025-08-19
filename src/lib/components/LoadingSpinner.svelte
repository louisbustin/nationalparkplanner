<script lang="ts">
	import { Spinner } from 'flowbite-svelte';

	interface Props {
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		color?: 'primary' | 'blue' | 'gray' | 'green' | 'red' | 'yellow' | 'pink' | 'purple';
		text?: string;
		class?: string;
	}

	let { size = 'md', color = 'blue', text = '', class: className = '' }: Props = $props();

	const sizeMap = {
		xs: '4' as const,
		sm: '5' as const,
		md: '6' as const,
		lg: '8' as const,
		xl: '12' as const
	};

	const spinnerSize = $derived(sizeMap[size]);
</script>

<div class="flex items-center justify-center {className}">
	<Spinner {color} size={spinnerSize} />
	{#if text}
		<span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
			{text}
		</span>
	{/if}
</div>
