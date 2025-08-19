<script lang="ts">
	interface Props {
		type?: 'text' | 'card' | 'profile' | 'list' | 'custom';
		lines?: number;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { type = 'text', lines = 3, class: className = '', children }: Props = $props();
</script>

<div class="animate-pulse {className}" role="status" aria-label="Loading...">
	{#if type === 'text'}
		{#each Array.from({ length: lines }, (_, i) => i) as i (i)}
			<div
				class="mb-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 {i === lines - 1
					? 'w-3/4'
					: 'w-full'}"
			></div>
		{/each}
	{:else if type === 'card'}
		<div class="flex items-center space-x-3">
			<div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
			<div class="flex-1">
				<div class="mb-2 h-2.5 w-3/4 rounded-full bg-gray-200 dark:bg-gray-700"></div>
				<div class="h-2 w-1/2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
			</div>
		</div>
	{:else if type === 'profile'}
		<div class="flex flex-col items-center">
			<div class="mb-4 h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
			<div class="mb-2 h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
			<div class="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
		</div>
	{:else if type === 'list'}
		{#each Array.from({ length: lines }, (_, i) => i) as i (i)}
			<div class="mb-4 flex items-center space-x-3">
				<div class="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
				<div class="flex-1">
					<div class="mb-1 h-2.5 w-3/4 rounded-full bg-gray-200 dark:bg-gray-700"></div>
					<div class="h-2 w-1/2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
				</div>
			</div>
		{/each}
	{:else if type === 'custom' && children}
		{@render children()}
	{/if}

	<span class="sr-only">Loading...</span>
</div>
