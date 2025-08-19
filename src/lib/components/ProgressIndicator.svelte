<script lang="ts">
	import { Progressbar } from 'flowbite-svelte';

	interface Props {
		progress: number; // 0-100
		color?: 'blue' | 'gray' | 'green' | 'red' | 'yellow' | 'pink' | 'purple';
		size?: 'h-1.5' | 'h-2.5' | 'h-4' | 'h-6';
		labelInside?: boolean;
		labelOutside?: boolean;
		animate?: boolean;
		class?: string;
	}

	let {
		progress,
		color = 'blue',
		size = 'h-2.5',
		labelInside = false,
		labelOutside = false,
		animate = true,
		class: className = ''
	}: Props = $props();

	// Ensure progress is between 0 and 100
	const normalizedProgress = $derived(Math.max(0, Math.min(100, progress)));
	const progressText = $derived(`${Math.round(normalizedProgress)}%`);
</script>

<div class={className}>
	{#if labelOutside}
		<div class="mb-1 flex justify-between">
			<span class="text-base font-medium text-blue-700 dark:text-white">Progress</span>
			<span class="text-sm font-medium text-blue-700 dark:text-white">{progressText}</span>
		</div>
	{/if}

	<Progressbar progress={normalizedProgress} {color} {size} {labelInside} {animate} />
</div>
