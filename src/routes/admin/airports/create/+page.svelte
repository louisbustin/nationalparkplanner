<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Card, Input, Label, Helper, Heading, P, Alert } from 'flowbite-svelte';
	import {
		ArrowLeftOutline,
		CheckCircleSolid,
		ExclamationCircleOutline
	} from 'flowbite-svelte-icons';
	import { toastStore } from '$lib/toast-store.svelte';
	import { ErrorBoundary, LoadingOverlay } from '$lib/components';
	import type { ActionData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { form }: { form: ActionData } = $props();

	let isSubmitting = $state(false);
	let hasAttemptedSubmit = $state(false);

	// Form field values - convert FormDataEntryValue to string
	let formValues = $state({
		iataCode: (form?.formData?.iataCode as string) || '',
		icaoCode: (form?.formData?.icaoCode as string) || '',
		name: (form?.formData?.name as string) || '',
		city: (form?.formData?.city as string) || '',
		state: (form?.formData?.state as string) || '',
		country: (form?.formData?.country as string) || '',
		latitude: (form?.formData?.latitude as string) || '',
		longitude: (form?.formData?.longitude as string) || '',
		elevation: (form?.formData?.elevation as string) || '',
		timezone: (form?.formData?.timezone as string) || ''
	});

	// Helper function to get field error
	function getFieldError(field: string): string | undefined {
		if (!form?.fieldErrors) return undefined;
		const fieldErrors = form.fieldErrors as Record<string, string>;
		return fieldErrors[field];
	}

	// Helper function to check if field has error
	function hasFieldError(field: string): boolean {
		return !!getFieldError(field);
	}

	// Helper function to get field validation state
	function getFieldValidationState(field: string, value: string, required: boolean = false) {
		const hasError = hasFieldError(field);
		const isEmpty = !value || value.trim() === '';
		const hasValue = !isEmpty;

		if (hasError) return 'error';
		if (hasAttemptedSubmit && required && isEmpty) return 'error';
		if (hasAttemptedSubmit && hasValue) return 'success';
		return 'default';
	}

	// Auto-format IATA code to uppercase
	function handleIataInput(event: Event) {
		const target = event.target as HTMLInputElement;
		formValues.iataCode = target.value.toUpperCase().slice(0, 3);
	}

	// Auto-format ICAO code to uppercase
	function handleIcaoInput(event: Event) {
		const target = event.target as HTMLInputElement;
		formValues.icaoCode = target.value.toUpperCase().slice(0, 4);
	}

	// Form enhancement
	const handleSubmit: SubmitFunction = () => {
		isSubmitting = true;
		hasAttemptedSubmit = true;
		return async ({ result, update }) => {
			isSubmitting = false;
			if (result.type === 'redirect') {
				// Success - redirect will show success toast on the airports list page
				await goto(result.location);
			} else if (result.type === 'failure') {
				// Show error toast for server errors
				if (result.data?.message) {
					toastStore.error(`Failed to create airport: ${result.data.message}`);
				} else if (result.data?.fieldErrors) {
					// Show general error for field validation errors
					toastStore.error('Please correct the errors below and try again.');
				}
				await update();
			} else {
				await update();
			}
		};
	};
</script>

<svelte:head>
	<title>Create Airport - Admin Panel</title>
</svelte:head>

<ErrorBoundary>
	<LoadingOverlay visible={isSubmitting} message="Creating airport..." />
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-6">
			<div class="flex items-center justify-between">
				<div>
					<Heading tag="h1" class="text-2xl font-bold text-gray-900 dark:text-white">
						Create Airport
					</Heading>
					<P class="mt-1 text-gray-600 dark:text-gray-400">
						Add a new airport to the system with all required information.
					</P>
				</div>
				<Button href="/admin/airports" color="alternative" class="flex items-center">
					<ArrowLeftOutline class="me-2 h-4 w-4" />
					Back to Airports
				</Button>
			</div>
		</div>

		<!-- Error Alert -->
		{#if form?.message}
			<Alert color="red" class="mb-6">
				{#snippet icon()}<ExclamationCircleOutline class="h-4 w-4" />{/snippet}
				<span class="font-medium">Error!</span>
				{form.message}
			</Alert>
		{/if}

		<!-- Create Form -->
		<Card class="p-6" size="xl">
			<form method="POST" action="?/create" use:enhance={handleSubmit}>
				<div class="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
					<!-- IATA Code -->
					<div>
						<Label for="iataCode" class="mb-2 block">
							IATA Code <span class="text-red-500">*</span>
						</Label>
						<Input
							id="iataCode"
							name="iataCode"
							type="text"
							placeholder="LAX"
							bind:value={formValues.iataCode}
							oninput={handleIataInput}
							color={getFieldValidationState('iataCode', formValues.iataCode, true) === 'error'
								? 'red'
								: getFieldValidationState('iataCode', formValues.iataCode, true) === 'success'
									? 'green'
									: undefined}
							disabled={isSubmitting}
							class={isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
							maxlength={3}
							required
						/>
						{#if hasFieldError('iataCode')}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								{getFieldError('iataCode')}
							</Helper>
						{:else if hasAttemptedSubmit && !formValues.iataCode.trim()}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								IATA code is required
							</Helper>
						{:else if formValues.iataCode && formValues.iataCode.length === 3}
							<Helper class="mt-2" color="green">Valid IATA code format</Helper>
						{:else}
							<Helper class="mt-2">3-letter IATA airport code (e.g., LAX, JFK, DEN).</Helper>
						{/if}
					</div>

					<!-- ICAO Code -->
					<div>
						<Label for="icaoCode" class="mb-2 block">ICAO Code</Label>
						<Input
							id="icaoCode"
							name="icaoCode"
							type="text"
							placeholder="KLAX"
							bind:value={formValues.icaoCode}
							oninput={handleIcaoInput}
							color={hasFieldError('icaoCode') ? 'red' : undefined}
							disabled={isSubmitting}
							maxlength={4}
						/>
						{#if hasFieldError('icaoCode')}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								{getFieldError('icaoCode')}
							</Helper>
						{:else}
							<Helper class="mt-2">4-letter ICAO airport code (optional, e.g., KLAX, KJFK).</Helper>
						{/if}
					</div>

					<!-- Airport Name -->
					<div class="md:col-span-2">
						<Label for="name" class="mb-2 block">
							Airport Name <span class="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder="Los Angeles International Airport"
							bind:value={formValues.name}
							color={getFieldValidationState('name', formValues.name, true) === 'error'
								? 'red'
								: getFieldValidationState('name', formValues.name, true) === 'success'
									? 'green'
									: undefined}
							disabled={isSubmitting}
							class={isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
							required
						/>
						{#if hasFieldError('name')}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								{getFieldError('name')}
							</Helper>
						{:else if hasAttemptedSubmit && !formValues.name.trim()}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								Airport name is required
							</Helper>
						{:else if formValues.name && formValues.name.trim().length >= 3}
							<Helper class="mt-2" color="green">Valid airport name</Helper>
						{:else}
							<Helper class="mt-2">Enter the official name of the airport.</Helper>
						{/if}
					</div>

					<!-- City -->
					<div>
						<Label for="city" class="mb-2 block">
							City <span class="text-red-500">*</span>
						</Label>
						<Input
							id="city"
							name="city"
							type="text"
							placeholder="Los Angeles"
							bind:value={formValues.city}
							color={hasFieldError('city') ? 'red' : undefined}
							disabled={isSubmitting}
							required
						/>
						{#if hasFieldError('city')}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								{getFieldError('city')}
							</Helper>
						{:else}
							<Helper class="mt-2">City where the airport is located.</Helper>
						{/if}
					</div>

					<!-- State/Region -->
					<div>
						<Label for="state" class="mb-2 block">State/Region</Label>
						<Input
							id="state"
							name="state"
							type="text"
							placeholder="California"
							bind:value={formValues.state}
							color={hasFieldError('state') ? 'red' : undefined}
							disabled={isSubmitting}
						/>
						{#if hasFieldError('state')}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								{getFieldError('state')}
							</Helper>
						{:else}
							<Helper class="mt-2">State, province, or region (optional).</Helper>
						{/if}
					</div>

					<!-- Country -->
					<div>
						<Label for="country" class="mb-2 block">
							Country <span class="text-red-500">*</span>
						</Label>
						<Input
							id="country"
							name="country"
							type="text"
							placeholder="United States"
							bind:value={formValues.country}
							color={hasFieldError('country') ? 'red' : undefined}
							disabled={isSubmitting}
							required
						/>
						{#if hasFieldError('country')}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								{getFieldError('country')}
							</Helper>
						{:else}
							<Helper class="mt-2">Country where the airport is located.</Helper>
						{/if}
					</div>

					<!-- Latitude -->
					<div>
						<Label for="latitude" class="mb-2 block">
							Latitude <span class="text-red-500">*</span>
						</Label>
						<Input
							id="latitude"
							name="latitude"
							type="number"
							step="any"
							placeholder="33.9425"
							bind:value={formValues.latitude}
							color={hasFieldError('latitude') ? 'red' : undefined}
							disabled={isSubmitting}
							required
						/>
						{#if hasFieldError('latitude')}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								{getFieldError('latitude')}
							</Helper>
						{:else}
							<Helper class="mt-2">Latitude coordinate (-90 to 90 degrees).</Helper>
						{/if}
					</div>

					<!-- Longitude -->
					<div>
						<Label for="longitude" class="mb-2 block">
							Longitude <span class="text-red-500">*</span>
						</Label>
						<Input
							id="longitude"
							name="longitude"
							type="number"
							step="any"
							placeholder="-118.4081"
							bind:value={formValues.longitude}
							color={hasFieldError('longitude') ? 'red' : undefined}
							disabled={isSubmitting}
							required
						/>
						{#if hasFieldError('longitude')}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								{getFieldError('longitude')}
							</Helper>
						{:else}
							<Helper class="mt-2">Longitude coordinate (-180 to 180 degrees).</Helper>
						{/if}
					</div>

					<!-- Elevation -->
					<div>
						<Label for="elevation" class="mb-2 block">Elevation (feet)</Label>
						<Input
							id="elevation"
							name="elevation"
							type="number"
							placeholder="125"
							bind:value={formValues.elevation}
							color={hasFieldError('elevation') ? 'red' : undefined}
							disabled={isSubmitting}
						/>
						{#if hasFieldError('elevation')}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								{getFieldError('elevation')}
							</Helper>
						{:else}
							<Helper class="mt-2">Airport elevation above sea level in feet (optional).</Helper>
						{/if}
					</div>

					<!-- Timezone -->
					<div>
						<Label for="timezone" class="mb-2 block">Timezone</Label>
						<Input
							id="timezone"
							name="timezone"
							type="text"
							placeholder="America/Los_Angeles"
							bind:value={formValues.timezone}
							color={hasFieldError('timezone') ? 'red' : undefined}
							disabled={isSubmitting}
						/>
						{#if hasFieldError('timezone')}
							<Helper class="mt-2" color="red">
								<span class="font-medium">Error:</span>
								{getFieldError('timezone')}
							</Helper>
						{:else}
							<Helper class="mt-2"
								>IANA timezone identifier (optional, e.g., America/New_York).</Helper
							>
						{/if}
					</div>
				</div>

				<!-- Form Actions -->
				<div class="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">
					<Button href="/admin/airports" color="alternative" disabled={isSubmitting}>Cancel</Button>
					<Button type="submit" disabled={isSubmitting} class="flex items-center">
						{#if isSubmitting}
							<svg
								class="me-2 h-4 w-4 animate-spin"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									fill="currentColor"
								></path>
							</svg>
							Creating Airport...
						{:else}
							<CheckCircleSolid class="me-2 h-4 w-4" />
							Create Airport
						{/if}
					</Button>
				</div>
			</form>
		</Card>

		<!-- Help Text -->
		<div class="mt-6">
			<Card class="bg-blue-50 dark:bg-blue-900/20">
				<div class="flex">
					<div class="flex-shrink-0">
						<ExclamationCircleOutline class="h-5 w-5 text-blue-400" />
					</div>
					<div class="ml-3">
						<P class="text-sm text-blue-700 dark:text-blue-300">
							<span class="font-medium">Tips for creating airports:</span>
						</P>
						<ul class="mt-2 list-inside list-disc text-sm text-blue-600 dark:text-blue-400">
							<li>IATA code, airport name, city, country, and coordinates are required</li>
							<li>IATA codes are automatically converted to uppercase (3 letters)</li>
							<li>ICAO codes are automatically converted to uppercase (4 letters, optional)</li>
							<li>Coordinates help with distance calculations and trip planning</li>
							<li>Elevation and timezone are optional but useful for flight planning</li>
						</ul>
					</div>
				</div>
			</Card>
		</div>
	</div>
</ErrorBoundary>
