<script lang="ts">
	import { Card, Button, Alert, Spinner } from 'flowbite-svelte';
	import { FormField } from '$lib/components';
	import { authValidationRules, validateForm, validatePasswordConfirmation } from '$lib/validation';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	interface Props {
		data?: any;
		form?: ActionData;
	}

	let { data, form }: Props = $props();

	// Form values
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	// Form state
	let errors = $state<Record<string, string>>({});
	let submitError = $state('');
	let isLoading = $state(false);

	// Validation
	const isValid = $derived(() => {
		const validation = validateForm(
			{ name, email, password, confirmPassword },
			{
				name: authValidationRules.name,
				email: authValidationRules.email,
				password: authValidationRules.password,
				confirmPassword: authValidationRules.confirmPassword
			},
			{
				confirmPassword: validatePasswordConfirmation
			}
		);
		return validation.isValid;
	});

	// Handle server-side form errors
	$effect(() => {
		if (form?.errors) {
			errors = { ...form.errors };
		}
		if (form?.error) {
			submitError = form.error;
		}
		if (form?.values) {
			name = form.values.name || '';
			email = form.values.email || '';
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();

		// Clear previous errors
		submitError = '';
		errors = {};

		// Validate form
		const validation = validateForm(
			{ name, email, password, confirmPassword },
			{
				name: authValidationRules.name,
				email: authValidationRules.email,
				password: authValidationRules.password,
				confirmPassword: authValidationRules.confirmPassword
			},
			{
				confirmPassword: validatePasswordConfirmation
			}
		);

		if (!validation.isValid) {
			errors = validation.errors;
			return;
		}

		isLoading = true;

		try {
			const result = await authClient.signUp.email({
				name,
				email,
				password
			});

			if (result.error) {
				submitError = result.error.message || 'Registration failed. Please try again.';
			} else {
				// Registration successful, redirect to dashboard or home
				await goto('/');
			}
		} catch (error) {
			console.error('Registration error:', error);
			submitError = 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign Up - National Park Planner</title>
	<meta
		name="description"
		content="Create your account to start planning your national park adventures"
	/>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h2 class="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
			<p class="mt-2 text-sm text-gray-600">Start planning your national park adventures</p>
		</div>

		<Card class="mt-8">
			<form method="POST" onsubmit={handleSubmit} class="space-y-6">
				{#if submitError}
					<Alert color="red" class="mb-4">
						{submitError}
					</Alert>
				{/if}

				<FormField
					label="Full Name"
					name="name"
					type="text"
					placeholder="Enter your full name"
					required
					bind:value={name}
					error={errors.name}
					rule={authValidationRules.name}
					disabled={isLoading}
					autocomplete="name"
				/>

				<FormField
					label="Email Address"
					name="email"
					type="email"
					placeholder="Enter your email address"
					required
					bind:value={email}
					error={errors.email}
					rule={authValidationRules.email}
					disabled={isLoading}
					autocomplete="email"
				/>

				<FormField
					label="Password"
					name="password"
					type="password"
					placeholder="Create a strong password"
					required
					bind:value={password}
					error={errors.password}
					rule={authValidationRules.password}
					showPasswordStrength={true}
					disabled={isLoading}
					autocomplete="new-password"
				/>

				<FormField
					label="Confirm Password"
					name="confirmPassword"
					type="password"
					placeholder="Confirm your password"
					required
					bind:value={confirmPassword}
					error={errors.confirmPassword}
					rule={authValidationRules.confirmPassword}
					disabled={isLoading}
					autocomplete="new-password"
				/>

				<Button type="submit" class="w-full" disabled={!isValid || isLoading} size="lg">
					{#if isLoading}
						<Spinner class="mr-3" size="4" />
						Creating Account...
					{:else}
						Create Account
					{/if}
				</Button>

				<div class="text-center">
					<p class="text-sm text-gray-600">
						Already have an account?
						<a href="/auth/login" class="text-primary-600 hover:text-primary-500 font-medium">
							Sign in here
						</a>
					</p>
				</div>
			</form>
		</Card>
	</div>
</div>
