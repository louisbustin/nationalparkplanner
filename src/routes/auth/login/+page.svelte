<script lang="ts">
	import { A, Card, Button, Alert, Spinner, Checkbox, Heading, P } from 'flowbite-svelte';
	import { FormField } from '$lib/components';
	import { authValidationRules, validateForm } from '$lib/validation';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	interface Props {
		form?: ActionData;
	}

	let { form }: Props = $props();

	// Form values
	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);

	// Form state
	let errors = $state<Record<string, string>>({});
	let submitError = $state('');
	let isLoading = $state(false);

	// Validation - only check required fields for login
	const loginValidationRules = {
		email: authValidationRules.email,
		password: {
			required: true,
			message: 'Password is required'
		}
	};

	const isValid = $derived(() => {
		const validation = validateForm({ email, password }, loginValidationRules);
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
			email = form.values.email || '';
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();

		// Clear previous errors
		submitError = '';
		errors = {};

		// Validate form
		const validation = validateForm({ email, password }, loginValidationRules);

		if (!validation.isValid) {
			errors = validation.errors;
			return;
		}

		isLoading = true;

		try {
			const result = await authClient.signIn.email({
				email,
				password,
				rememberMe
			});

			if (result.error) {
				submitError = result.error.message || 'Login failed. Please check your credentials.';
			} else {
				// Login successful, redirect to dashboard or home
				await goto('/');
			}
		} catch (error) {
			console.error('Login error:', error);
			submitError = 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In - National Park Planner</title>
	<meta
		name="description"
		content="Sign in to your account to access your saved trip plans and continue planning your national park adventures"
	/>
</svelte:head>

<div class="flex min-h-screen justify-center px-4 py-12 sm:px-6 lg:px-8">
	<div>
		<div class="text-center">
			<Heading tag="h2" class="mt-6 text-3xl font-extrabold text-gray-900">
				Sign in to your account
			</Heading>
			<P class="text-center">Continue planning your national park adventures</P>
		</div>

		<Card class="mt-8 p-4" size="xl">
			<form method="POST" onsubmit={handleSubmit} class="space-y-6">
				{#if submitError}
					<Alert color="red" class="mb-4">
						{submitError}
					</Alert>
				{/if}

				<FormField
					label="Email Address"
					name="email"
					type="email"
					placeholder="Enter your email address"
					required
					bind:value={email}
					error={errors.email}
					rule={loginValidationRules.email}
					disabled={isLoading}
					autocomplete="email"
				/>

				<FormField
					label="Password"
					name="password"
					type="password"
					placeholder="Enter your password"
					required
					bind:value={password}
					error={errors.password}
					rule={loginValidationRules.password}
					disabled={isLoading}
					autocomplete="current-password"
				/>

				<div class="flex items-center justify-between">
					<Checkbox bind:checked={rememberMe} disabled={isLoading}>Remember me</Checkbox>
					<!-- TODO: Add forgot password link when password reset is implemented -->
				</div>

				<Button type="submit" class="w-full" disabled={!isValid || isLoading} size="lg">
					{#if isLoading}
						<Spinner class="mr-3" size="4" />
						Signing In...
					{:else}
						Sign In
					{/if}
				</Button>

				<div class="text-center">
					<P class="text-sm">
						Don't have an account?
						<A href="/auth/register">Sign up here</A>
					</P>
				</div>
			</form>
		</Card>
	</div>
</div>
