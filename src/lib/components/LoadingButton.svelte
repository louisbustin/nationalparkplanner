<script lang="ts">
	import { Button, Spinner } from 'flowbite-svelte';

	interface Props {
		loading?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		color?: 'primary' | 'alternative' | 'dark' | 'light' | 'green' | 'red' | 'yellow' | 'purple';
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		loadingText?: string;
		class?: string;
		onclick?: (event: MouseEvent) => void | Promise<void>;
		children: import('svelte').Snippet;
	}

	let {
		loading = false,
		disabled = false,
		type = 'button',
		color = 'primary',
		size = 'md',
		loadingText = 'Loading...',
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const isDisabled = $derived(loading || disabled);

	async function handleClick(event: MouseEvent) {
		if (onclick && !isDisabled) {
			await onclick(event);
		}
	}
</script>

<Button {type} {color} {size} disabled={isDisabled} class={className} onclick={handleClick}>
	{#if loading}
		<Spinner class="mr-3" size="4" />
		{loadingText}
	{:else}
		{@render children()}
	{/if}
</Button>
