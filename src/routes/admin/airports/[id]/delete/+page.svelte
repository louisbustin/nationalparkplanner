<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Card, Heading, P, Alert, Modal } from 'flowbite-svelte';
	import {
		ArrowLeftOutline,
		ExclamationCircleOutline,
		TrashBinOutline,
		MapPinAltSolid
	} from 'flowbite-svelte-icons';
	import { toastStore } from '$lib/toast-store.svelte';
	import { ErrorBoundary, LoadingOverlay } from '$lib/components';
	import type { ActionData, PageData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = $state(false);
	let showConfirmModal = $state(false);

	// Form enhancement
	const handleSubmit: SubmitFunction = () => {
		isSubmitting = true;
		showConfirmModal = false;
		return async ({ result, update }) => {
			isSubmitting = false;
			if (result.type === 'redirect') {
				// Success - redirect will show success toast on the airports list page
				await goto(result.location);
			} else if (result.type === 'failure') {
				// Show error toast for server errors
				if (result.data?.message) {
					toastStore.error(`Failed to delete airport: ${result.data.message}`);
				} else {
					toastStore.error('Failed to delete airport. Please try again.');
				}
				await update();
			} else {
				await update();
			}
		};
	};

	function openConfirmModal() {
		showConfirmModal = true;
	}

	function closeConfirmModal() {
		showConfirmModal = false;
	}
</script>

<svelte:head>
	<title>Delete Airport: {data.airport.name} - Admin Panel</title>
</svelte:head>

<ErrorBoundary>
	<LoadingOverlay visible={isSubmitting} message="Deleting airport..." />
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-6">
			<div class="flex items-center justify-between">
				<div>
					<Heading tag="h1" class="text-2xl font-bold text-gray-900 dark:text-white">
						Delete Airport
					</Heading>
					<P class="mt-1 text-gray-600 dark:text-gray-400">
						Permanently remove {data.airport.name} ({data.airport.iataCode}) from the system.
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

		<!-- Airport Details Card -->
		<Card class="mb-6 p-6" size="xl">
			<div class="flex items-start space-x-4">
				<div class="flex-shrink-0">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20"
					>
						<MapPinAltSolid class="h-6 w-6 text-red-600 dark:text-red-400" />
					</div>
				</div>
				<div class="flex-1">
					<Heading tag="h3" class="text-lg font-semibold text-gray-900 dark:text-white">
						{data.airport.name}
					</Heading>
					<div
						class="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400"
					>
						<div><span class="font-medium">IATA Code:</span> {data.airport.iataCode}</div>
						{#if data.airport.icaoCode}
							<div><span class="font-medium">ICAO Code:</span> {data.airport.icaoCode}</div>
						{/if}
						<div><span class="font-medium">City:</span> {data.airport.city}</div>
						{#if data.airport.state}
							<div><span class="font-medium">State/Region:</span> {data.airport.state}</div>
						{/if}
						<div><span class="font-medium">Country:</span> {data.airport.country}</div>
						<div>
							<span class="font-medium">Coordinates:</span>
							{data.airport.latitude}, {data.airport.longitude}
						</div>
						{#if data.airport.elevation}
							<div><span class="font-medium">Elevation:</span> {data.airport.elevation} ft</div>
						{/if}
						{#if data.airport.timezone}
							<div><span class="font-medium">Timezone:</span> {data.airport.timezone}</div>
						{/if}
					</div>
				</div>
			</div>
		</Card>

		<!-- Warning Card -->
		<Card class="mb-6 bg-red-50 dark:bg-red-900/20">
			<div class="flex">
				<div class="flex-shrink-0">
					<ExclamationCircleOutline class="h-5 w-5 text-red-400" />
				</div>
				<div class="ml-3">
					<Heading tag="h3" class="text-sm font-medium text-red-800 dark:text-red-300">
						Warning: This action cannot be undone
					</Heading>
					<div class="mt-2 text-sm text-red-700 dark:text-red-400">
						<P
							>Deleting this airport will permanently remove it from the system. This action
							includes:</P
						>
						<ul class="mt-2 list-inside list-disc">
							<li>All airport information and metadata</li>
							<li>Any associated trip planning data (when implemented)</li>
							<li>Historical records and references</li>
						</ul>
						<P class="mt-2">
							<span class="font-medium">Note:</span> Currently, there are no trip planning features that
							reference airports, so this deletion will not affect any existing user data.
						</P>
					</div>
				</div>
			</div>
		</Card>

		<!-- Action Buttons -->
		<div class="flex flex-col gap-4 sm:flex-row sm:justify-end">
			<Button
				href="/admin/airports"
				color="alternative"
				disabled={isSubmitting}
				class={isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
			>
				Cancel
			</Button>
			<Button
				color="red"
				onclick={openConfirmModal}
				disabled={isSubmitting}
				class="flex items-center {isSubmitting ? 'cursor-not-allowed opacity-50' : ''}"
			>
				<TrashBinOutline class="me-2 h-4 w-4" />
				Delete Airport
			</Button>
		</div>
	</div>

	<!-- Confirmation Modal -->
	<Modal bind:open={showConfirmModal} size="md" autoclose={false} class="w-full">
		{#snippet header()}
			<div class="flex items-center">
				<ExclamationCircleOutline class="me-2 h-6 w-6 text-red-600" />
				<span>Confirm Deletion</span>
			</div>
		{/snippet}

		<div class="space-y-4">
			<P class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
				Are you sure you want to delete <span class="font-semibold">{data.airport.name}</span>
				({data.airport.iataCode})?
			</P>

			<div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
				<P class="text-sm text-gray-600 dark:text-gray-400">
					<span class="font-medium">Airport:</span>
					{data.airport.name}<br />
					<span class="font-medium">IATA Code:</span>
					{data.airport.iataCode}<br />
					<span class="font-medium">Location:</span>
					{data.airport.city}, {data.airport.state ? `${data.airport.state}, ` : ''}{data.airport
						.country}
				</P>
			</div>

			<Alert color="red" class="border-0">
				{#snippet icon()}<ExclamationCircleOutline class="h-4 w-4" />{/snippet}
				This action cannot be undone. The airport will be permanently removed from the system.
			</Alert>
		</div>

		{#snippet footer()}
			<div class="flex justify-end space-x-2">
				<Button color="alternative" onclick={closeConfirmModal} disabled={isSubmitting}>
					Cancel
				</Button>
				<form method="POST" action="?/delete" use:enhance={handleSubmit} class="inline">
					<Button type="submit" color="red" disabled={isSubmitting} class="flex items-center">
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
							Deleting...
						{:else}
							<TrashBinOutline class="me-2 h-4 w-4" />
							Yes, Delete Airport
						{/if}
					</Button>
				</form>
			</div>
		{/snippet}
	</Modal>
</ErrorBoundary>
