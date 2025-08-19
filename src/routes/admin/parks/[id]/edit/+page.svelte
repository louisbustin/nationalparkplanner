<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Card, Input, Label, Textarea, Helper, Heading, P, Alert } from 'flowbite-svelte';
	import { ArrowLeftOutline, ExclamationCircleOutline, PenOutline } from 'flowbite-svelte-icons';
	import { toastStore } from '$lib/toast-store.svelte';
	import type { ActionData, PageData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = $state(false);

	// Form field values - use existing data or form data if validation failed
	let formValues = $state({
		name: (form?.formData?.name as string) || data.formData.name,
		state: (form?.formData?.state as string) || data.formData.state,
		description: (form?.formData?.description as string) || data.formData.description,
		latitude: (form?.formData?.latitude as string) || data.formData.latitude,
		longitude: (form?.formData?.longitude as string) || data.formData.longitude,
		establishedDate: (form?.formData?.establishedDate as string) || data.formData.establishedDate,
		area: (form?.formData?.area as string) || data.formData.area
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

	// Form enhancement
	const handleSubmit: SubmitFunction = () => {
		isSubmitting = true;
		return async ({ result, update }) => {
			isSubmitting = false;
			if (result.type === 'redirect') {
				await goto(result.location);
			} else if (result.type === 'failure') {
				// Show error toast for server errors
				if (result.data?.message) {
					toastStore.error(result.data.message);
				}
				await update();
			} else {
				await update();
			}
		};
	};
</script>

<svelte:head>
	<title>Edit {data.park.name} - Admin Panel</title>
</svelte:head>

<div class="mx-auto max-w-4xl">
	<!-- Header -->
	<div class="mb-6">
		<div class="flex items-center justify-between">
			<div>
				<Heading tag="h1" class="text-2xl font-bold text-gray-900 dark:text-white">
					Edit National Park
				</Heading>
				<P class="mt-1 text-gray-600 dark:text-gray-400">
					Update information for <span class="font-medium">{data.park.name}</span>
				</P>
			</div>
			<Button href="/admin/parks" color="alternative" class="flex items-center">
				<ArrowLeftOutline class="me-2 h-4 w-4" />
				Back to Parks
			</Button>
		</div>
	</div>

	<!-- Error Alert -->
	{#if form?.message}
		<Alert color="red" class="mb-6">
			{#snippet icon()}
				<ExclamationCircleOutline class="h-4 w-4" />
			{/snippet}
			<span class="font-medium">Error!</span>
			{form.message}
		</Alert>
	{/if}

	<!-- Edit Form -->
	<Card class="p-6" size="xl">
		<form method="POST" action="?/update" use:enhance={handleSubmit}>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Park Name -->
				<div class="md:col-span-2">
					<Label for="name" class="mb-2 block">
						Park Name <span class="text-red-500">*</span>
					</Label>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="Enter park name"
						bind:value={formValues.name}
						color={hasFieldError('name') ? 'red' : undefined}
						disabled={isSubmitting}
						required
					/>
					{#if hasFieldError('name')}
						<Helper class="mt-2" color="red">
							<span class="font-medium">Error:</span>
							{getFieldError('name')}
						</Helper>
					{:else}
						<Helper class="mt-2">Enter the official name of the national park.</Helper>
					{/if}
				</div>

				<!-- State -->
				<div>
					<Label for="state" class="mb-2 block">
						State <span class="text-red-500">*</span>
					</Label>
					<Input
						id="state"
						name="state"
						type="text"
						placeholder="Enter state name"
						bind:value={formValues.state}
						color={hasFieldError('state') ? 'red' : undefined}
						disabled={isSubmitting}
						required
					/>
					{#if hasFieldError('state')}
						<Helper class="mt-2" color="red">
							<span class="font-medium">Error:</span>
							{getFieldError('state')}
						</Helper>
					{:else}
						<Helper class="mt-2">Enter the state where the park is located.</Helper>
					{/if}
				</div>

				<!-- Established Date -->
				<div>
					<Label for="establishedDate" class="mb-2 block">Established Date</Label>
					<Input
						id="establishedDate"
						name="establishedDate"
						type="date"
						bind:value={formValues.establishedDate}
						color={hasFieldError('establishedDate') ? 'red' : undefined}
						disabled={isSubmitting}
					/>
					{#if hasFieldError('establishedDate')}
						<Helper class="mt-2" color="red">
							<span class="font-medium">Error:</span>
							{getFieldError('establishedDate')}
						</Helper>
					{:else}
						<Helper class="mt-2">When was the park officially established?</Helper>
					{/if}
				</div>

				<!-- Latitude -->
				<div>
					<Label for="latitude" class="mb-2 block">Latitude</Label>
					<Input
						id="latitude"
						name="latitude"
						type="number"
						step="any"
						placeholder="e.g., 36.1069"
						bind:value={formValues.latitude}
						color={hasFieldError('latitude') ? 'red' : undefined}
						disabled={isSubmitting}
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
					<Label for="longitude" class="mb-2 block">Longitude</Label>
					<Input
						id="longitude"
						name="longitude"
						type="number"
						step="any"
						placeholder="e.g., -112.1129"
						bind:value={formValues.longitude}
						color={hasFieldError('longitude') ? 'red' : undefined}
						disabled={isSubmitting}
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

				<!-- Area -->
				<div>
					<Label for="area" class="mb-2 block">Area (square miles)</Label>
					<Input
						id="area"
						name="area"
						type="number"
						step="any"
						placeholder="e.g., 1200.5"
						bind:value={formValues.area}
						color={hasFieldError('area') ? 'red' : undefined}
						disabled={isSubmitting}
					/>
					{#if hasFieldError('area')}
						<Helper class="mt-2" color="red">
							<span class="font-medium">Error:</span>
							{getFieldError('area')}
						</Helper>
					{:else}
						<Helper class="mt-2">Total area of the park in square miles.</Helper>
					{/if}
				</div>

				<!-- Description -->
				<div class="md:col-span-2">
					<Label for="description" class="mb-2 block">Description</Label>
					<Textarea
						id="description"
						name="description"
						rows={4}
						placeholder="Enter a description of the national park..."
						bind:value={formValues.description}
						color={hasFieldError('description') ? 'red' : undefined}
						disabled={isSubmitting}
					/>
					{#if hasFieldError('description')}
						<Helper class="mt-2" color="red">
							<span class="font-medium">Error:</span>
							{getFieldError('description')}
						</Helper>
					{:else}
						<Helper class="mt-2">
							Provide a brief description of the park's features and attractions.
						</Helper>
					{/if}
				</div>
			</div>

			<!-- Form Actions -->
			<div class="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">
				<Button href="/admin/parks" color="alternative" disabled={isSubmitting}>Cancel</Button>
				<Button type="submit" disabled={isSubmitting} class="flex items-center">
					{#if isSubmitting}
						<svg
							class="me-2 h-4 w-4 animate-spin"
							fill="none"
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
						Updating Park...
					{:else}
						<PenOutline class="me-2 h-4 w-4" />
						Update Park
					{/if}
				</Button>
			</div>
		</form>
	</Card>

	<!-- Park Information -->
	<div class="mt-6">
		<Card class="bg-gray-50 dark:bg-gray-800">
			<div class="flex">
				<div class="flex-shrink-0">
					<ExclamationCircleOutline class="h-5 w-5 text-gray-400" />
				</div>
				<div class="ml-3">
					<P class="text-sm text-gray-700 dark:text-gray-300">
						<span class="font-medium">Park Information:</span>
					</P>
					<ul class="mt-2 list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
						<li>Created: {new Date(data.park.createdAt).toLocaleDateString()}</li>
						<li>Last Updated: {new Date(data.park.updatedAt).toLocaleDateString()}</li>
						<li>Park ID: {data.park.id}</li>
						<li>Changes will preserve the original creation date</li>
					</ul>
				</div>
			</div>
		</Card>
	</div>

	<!-- Help Text -->
	<div class="mt-6">
		<Card class="bg-blue-50 dark:bg-blue-900/20">
			<div class="flex">
				<div class="flex-shrink-0">
					<ExclamationCircleOutline class="h-5 w-5 text-blue-400" />
				</div>
				<div class="ml-3">
					<P class="text-sm text-blue-700 dark:text-blue-300">
						<span class="font-medium">Tips for editing parks:</span>
					</P>
					<ul class="mt-2 list-inside list-disc text-sm text-blue-600 dark:text-blue-400">
						<li>Only modify fields that need updating</li>
						<li>Park name and state combination must be unique</li>
						<li>Coordinate changes affect mapping and trip planning features</li>
						<li>Clear a field by removing all text to set it as empty</li>
					</ul>
				</div>
			</div>
		</Card>
	</div>
</div>
