<script lang="ts">
	import { Input, Label, Helper } from 'flowbite-svelte';
	import type { ValidationRule } from '$lib/validation';
	import { validateField, getPasswordStrength } from '$lib/validation';

	interface Props {
		label: string;
		type?: 'email' | 'password' | 'text';
		placeholder?: string;
		required?: boolean;
		error?: string;
		value: string;
		rule?: ValidationRule;
		showPasswordStrength?: boolean;
		disabled?: boolean;
		autocomplete?: 'email' | 'current-password' | 'new-password' | 'name' | 'off';
		name?: string;
	}

	let {
		label,
		type = 'text',
		placeholder = '',
		required = false,
		error = '',
		value = $bindable(''),
		rule,
		showPasswordStrength = false,
		disabled = false,
		autocomplete,
		name
	}: Props = $props();

	let touched = $state(false);
	let fieldError = $state('');

	// Validate field when value changes and field has been touched
	$effect(() => {
		if (touched && rule) {
			const validationError = validateField(value, rule);
			fieldError = validationError || '';
		}
	});

	// Use provided error or field validation error
	const displayError = $derived(error || fieldError);
	const hasError = $derived(!!displayError);

	// Password strength for password fields
	const passwordStrength = $derived(() => {
		if (type === 'password' && showPasswordStrength && value) {
			return getPasswordStrength(value);
		}
		return null;
	});

	const strengthData = $derived(passwordStrength());

	function handleBlur() {
		touched = true;
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
	}
</script>

<div class="mb-4">
	<Label for={label.toLowerCase().replace(/\s+/g, '-')} class="mb-2">
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</Label>

	<Input
		id={label.toLowerCase().replace(/\s+/g, '-')}
		name={name || label.toLowerCase().replace(/\s+/g, '-')}
		{type}
		{placeholder}
		{value}
		{disabled}
		{autocomplete}
		color={hasError ? 'red' : undefined}
		onblur={handleBlur}
		oninput={handleInput}
		class="w-full"
	/>

	{#if displayError}
		<Helper class="mt-2" color="red">
			{displayError}
		</Helper>
	{/if}

	{#if strengthData && showPasswordStrength}
		<div class="mt-2">
			<div class="flex items-center gap-2">
				<div class="h-2 flex-1 rounded-full bg-gray-200">
					<div
						class="h-2 rounded-full transition-all duration-300 {strengthData.color === 'red'
							? 'bg-red-500'
							: strengthData.color === 'yellow'
								? 'bg-yellow-500'
								: 'bg-green-500'}"
						style="width: {(strengthData.score / 5) * 100}%"
					></div>
				</div>
			</div>
			<Helper class="mt-1" color={strengthData.color === 'green' ? 'green' : 'gray'}>
				{strengthData.feedback}
			</Helper>
		</div>
	{/if}
</div>
