<script lang="ts">
	import { Input, Label, Helper } from 'flowbite-svelte';

	interface Props {
		label: string;
		name: string;
		type?: 'text' | 'number' | 'email';
		placeholder?: string;
		required?: boolean;
		value: string;
		error?: string;
		disabled?: boolean;
		maxlength?: number;
		step?: string;
		helpText?: string;
		successText?: string;
		oninput?: (event: Event) => void;
		class?: string;
	}

	let {
		label,
		name,
		type = 'text',
		placeholder = '',
		required = false,
		value = $bindable(''),
		error,
		disabled = false,
		maxlength,
		step,
		helpText,
		successText,
		oninput,
		class: className = ''
	}: Props = $props();

	// Determine field state for visual feedback
	const fieldState = $derived(() => {
		if (error) return 'error';
		if (successText && value.trim()) return 'success';
		return 'default';
	});

	const inputColor = $derived(() => {
		switch (fieldState()) {
			case 'error':
				return 'red';
			case 'success':
				return 'green';
			default:
				return undefined;
		}
	});

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		if (oninput) {
			oninput(event);
		}
	}
</script>

<div class="mb-4 {className}">
	<Label for={name} class="mb-2 block">
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</Label>

	<Input
		id={name}
		{name}
		{type}
		{placeholder}
		{value}
		{disabled}
		{maxlength}
		{step}
		color={inputColor()}
		class="w-full {disabled ? 'cursor-not-allowed opacity-50' : ''}"
		oninput={handleInput}
		{required}
	/>

	{#if error}
		<Helper class="mt-2" color="red">
			<span class="font-medium">Error:</span>
			{error}
		</Helper>
	{:else if successText && value.trim()}
		<Helper class="mt-2" color="green">
			{successText}
		</Helper>
	{:else if helpText}
		<Helper class="mt-2">
			{helpText}
		</Helper>
	{/if}
</div>
