<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Card, Heading, P, Alert, Modal } from 'flowbite-svelte';
	import {
		ArrowLeftOutline,
		ExclamationCircleOutline,
		TrashBinOutline
	} from 'flowbite-svelte-icons';
	import { toastStore } from '$lib/toast-store.svelte';
	import type { PageData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data }: { data: PageData } = $props();

	let isDeleting = $state(false);
	let showConfirmModal = $state(false);

	// Form enhancement for deletion
	const handleDelete: SubmitFunction = () => {
		isDeleting = true;
		showConfirmModal = false;
		return async ({ result, update }) => {
			isDeleting = false;
			if (result.type === 'redirect') {
				await goto(result.location);
			} else if (result.type === 'error') {
				// Show error toast for server errors
				toastStore.error('Failed to delete park. Please try again.');
				await update();
			} else {
				await update();
			}
		};
	};

	// Handle modal actions
	function onModalAction({ action }: { action: string }) {
		if (action === 'confirm') {
			// The form submission will be handled by the enhance function
			return true;
		} else {
			// Cancel - close modal
			showConfirmModal = false;
			return true;
		}
	}
</script>

<svelte:head>
	<title>Delete {data.park.name} - Admin Panel</title>
</svelte:head>

<div class="mx-auto max-w-4xl">
	<!-- Header -->
	<div class="mb-6">
		<div class="flex items-center justify-between">
			<div>
				<Heading tag="h1" class="text-2xl font-bold text-gray-900 dark:text-white">
					Delete National Park
				</Heading>
				<P class="mt-1 text-gray-600 dark:text-gray-400">
					Permanently remove <span class="font-medium">{data.park.name}</span> from the system
				</P>
			</div>
			<Button href="/admin/parks" color="alternative" class="flex items-center">
				<ArrowLeftOutline class="me-2 h-4 w-4" />
				Back to Parks
			</Button>
		</div>
	</div>

	<!-- Warning Alert -->
	<Alert color="red" class="mb-6">
		{#snippet icon()}<ExclamationCircleOutline class="h-4 w-4" />{/snippet}
		<span class="font-medium">Warning!</span>
		This action cannot be undone. The park and all associated data will be permanently deleted.
	</Alert>

	<!-- Park Details Card -->
	<Card class="mb-6 p-4" size="xl">
		<div class="space-y-4">
			<div>
				<Heading tag="h3" class="text-lg font-semibold text-gray-900 dark:text-white">
					Park Information
				</Heading>
				<P class="text-gray-600 dark:text-gray-400">
					Review the details of the park you are about to delete.
				</P>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<P class="text-sm font-medium text-gray-700 dark:text-gray-300">Name</P>
					<P class="text-gray-900 dark:text-white">{data.park.name}</P>
				</div>

				<div>
					<P class="text-sm font-medium text-gray-700 dark:text-gray-300">State</P>
					<P class="text-gray-900 dark:text-white">{data.park.state}</P>
				</div>

				{#if data.park.establishedDate}
					<div>
						<P class="text-sm font-medium text-gray-700 dark:text-gray-300">Established</P>
						<P class="text-gray-900 dark:text-white">
							{new Date(data.park.establishedDate).toLocaleDateString()}
						</P>
					</div>
				{/if}

				{#if data.park.area}
					<div>
						<P class="text-sm font-medium text-gray-700 dark:text-gray-300">Area</P>
						<P class="text-gray-900 dark:text-white">{data.park.area} square miles</P>
					</div>
				{/if}

				{#if data.park.latitude && data.park.longitude}
					<div class="md:col-span-2">
						<P class="text-sm font-medium text-gray-700 dark:text-gray-300">Coordinates</P>
						<P class="text-gray-900 dark:text-white">
							{data.park.latitude}, {data.park.longitude}
						</P>
					</div>
				{/if}

				{#if data.park.description}
					<div class="md:col-span-2">
						<P class="text-sm font-medium text-gray-700 dark:text-gray-300">Description</P>
						<P class="text-gray-900 dark:text-white">{data.park.description}</P>
					</div>
				{/if}
			</div>

			<div class="border-t pt-4">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<P class="text-sm font-medium text-gray-700 dark:text-gray-300">Created</P>
						<P class="text-gray-900 dark:text-white">
							{new Date(data.park.createdAt).toLocaleDateString()}
						</P>
					</div>
					<div>
						<P class="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</P>
						<P class="text-gray-900 dark:text-white">
							{new Date(data.park.updatedAt).toLocaleDateString()}
						</P>
					</div>
				</div>
			</div>
		</div>
	</Card>

	<!-- Deletion Consequences -->
	<Card class="mb-6 bg-red-50 p-4 dark:bg-red-900/20" size="xl">
		<div class="flex">
			<div class="flex-shrink-0">
				<ExclamationCircleOutline class="h-5 w-5 text-red-400" />
			</div>
			<div class="ml-3">
				<P class="text-sm text-red-700 dark:text-red-300">
					<span class="font-medium">Deletion Consequences:</span>
				</P>
				<ul class="mt-2 list-inside list-disc text-sm text-red-600 dark:text-red-400">
					<li>The park will be permanently removed from the database</li>
					<li>This action cannot be undone</li>
					<li>Any future trip planning features that reference this park will be affected</li>
					<li>Historical data and statistics related to this park will be lost</li>
				</ul>
			</div>
		</div>
	</Card>

	<!-- Action Buttons -->
	<div class="flex flex-col gap-4 sm:flex-row sm:justify-end">
		<Button href="/admin/parks" color="alternative" disabled={isDeleting}>Cancel</Button>
		<Button
			color="red"
			disabled={isDeleting}
			onclick={() => (showConfirmModal = true)}
			class="flex items-center"
		>
			<TrashBinOutline class="me-2 h-4 w-4" />
			Delete Park
		</Button>
	</div>
</div>

<!-- Confirmation Modal -->
<Modal
	bind:open={showConfirmModal}
	size="xs"
	permanent
	form
	onaction={onModalAction}
	class="text-center"
>
	<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
	<Heading tag="h3" class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
		Are you sure you want to delete "{data.park.name}"?
	</Heading>
	<P class="mb-5 text-sm text-gray-500 dark:text-gray-400">
		This action cannot be undone. The park will be permanently removed from the system.
	</P>

	{#snippet footer()}
		<div class="flex w-full flex-col gap-4 sm:flex-row sm:justify-end sm:gap-4">
			<form method="POST" action="?/delete" use:enhance={handleDelete} class="inline">
				<Button type="submit" value="confirm" color="red" disabled={isDeleting}>
					{#if isDeleting}
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
						Yes, Delete
					{/if}
				</Button>
				<Button type="submit" value="cancel" color="alternative" disabled={isDeleting}
					>Cancel</Button
				>
			</form>
		</div>
	{/snippet}
</Modal>
