<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Search,
		Button,
		Card,
		P,
		Heading,
		Badge,
		PaginationNav,
		Alert
	} from 'flowbite-svelte';
	import {
		PlusOutline,
		EditOutline,
		TrashBinOutline,
		MapPinAltSolid,
		ExclamationCircleOutline
	} from 'flowbite-svelte-icons';
	import type { PageData } from './$types';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { toastStore } from '$lib';
	import { untrack } from 'svelte';

	let { data }: { data: PageData } = $props();

	// Success messages are now handled by the admin layout via toasts

	let searchValue = $state(data.searchQuery || '');
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Handle search with debouncing
	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL(page.url);
			if (searchValue.trim()) {
				url.searchParams.set('search', searchValue.trim());
			} else {
				url.searchParams.delete('search');
			}
			url.searchParams.delete('page'); // Reset to first page on new search
			goto(url.toString());
		}, 300);
	}

	// Handle pagination
	function handlePageChange(newPage: number) {
		const url = new URL(page.url);
		if (newPage > 1) {
			url.searchParams.set('page', newPage.toString());
		} else {
			url.searchParams.delete('page');
		}
		goto(url.toString());
	}

	// Format date for display
	function formatDate(dateString: string | null): string {
		if (!dateString) return 'Unknown';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return 'Invalid date';
		}
	}

	// Format area for display
	function formatArea(areaString: string | null): string {
		if (!areaString) return 'Unknown';
		try {
			const area = parseFloat(areaString);
			return area.toLocaleString('en-US') + ' sq mi';
		} catch {
			return 'Unknown';
		}
	}

	// Handle success messages from URL parameters
	$effect(() => {
		const urlParams = new SvelteURLSearchParams(window.location.search);
		let message = '';
		if (urlParams.has('created')) {
			message = 'National park has been created successfully.';
		}

		if (urlParams.has('updated')) {
			message = 'National park has been updated successfully.';
		}

		if (urlParams.has('deleted')) {
			message = 'National park has been deleted successfully.';
		}
		if (message) {
			untrack(() => toastStore.success(message));
		}
	});
</script>

<div class="p-6">
	<!-- Header Section -->
	<div class="mb-6">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<Heading tag="h1" class="text-2xl font-bold text-gray-900 dark:text-white">
					National Parks Management
				</Heading>
				<P class="mt-1 text-gray-600 dark:text-gray-400">
					Manage national parks data for the trip planning system
				</P>
			</div>
			<Button href="/admin/parks/create" class="w-fit">
				<PlusOutline class="me-2 h-4 w-4" />
				Add New Park
			</Button>
		</div>
	</div>

	<!-- Search and Stats Section -->
	<Card class="mb-6" size="xl">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="max-w-full flex-1">
				<Search
					bind:value={searchValue}
					oninput={handleSearch}
					placeholder="Search parks by name or state..."
					clearable
				></Search>
			</div>
			<div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
				{#if data.searchQuery}
					<Badge color="blue" class="whitespace-nowrap">
						Search: "{data.searchQuery}"
					</Badge>
				{/if}
				<span class="mr-2 whitespace-nowrap">
					{data.pagination.totalParks} total parks
				</span>
			</div>
		</div>
	</Card>

	<!-- Error Message -->
	{#if data.error}
		<Alert color="red" class="mb-6">
			{#snippet icon()}<ExclamationCircleOutline class="h-4 w-4" />{/snippet}
			<span class="font-medium">Error!</span>
			{data.error}
		</Alert>
	{/if}

	<!-- Parks Table -->
	{#if data.parks.length > 0}
		<Card size="xl">
			<!-- Pagination Info -->
			{#if data.pagination.totalPages > 1}
				<div
					class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700"
				>
					<P class="text-sm text-gray-600 dark:text-gray-400">
						Showing {data.pagination.startIndex} to {data.pagination.endIndex} of {data.pagination
							.totalParks} parks
					</P>
				</div>
			{/if}

			<!-- Table -->
			<Table hoverable={true} striped={true}>
				<TableHead>
					<TableHeadCell>Park Name</TableHeadCell>
					<TableHeadCell>State</TableHeadCell>
					<TableHeadCell>Established</TableHeadCell>
					<TableHeadCell>Area</TableHeadCell>
					<TableHeadCell>Location</TableHeadCell>
					<TableHeadCell>
						<span class="sr-only">Actions</span>
					</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each data.parks as park (park.id)}
						<TableBodyRow>
							<TableBodyCell>
								<div class="font-medium text-gray-900 dark:text-white">
									{park.name}
								</div>
								{#if park.description}
									<div class="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
										{park.description}
									</div>
								{/if}
							</TableBodyCell>
							<TableBodyCell>
								<Badge color="gray" class="whitespace-nowrap">
									{park.state}
								</Badge>
							</TableBodyCell>
							<TableBodyCell>
								{formatDate(park.establishedDate)}
							</TableBodyCell>
							<TableBodyCell>
								{formatArea(park.area)}
							</TableBodyCell>
							<TableBodyCell>
								{#if park.latitude && park.longitude}
									<div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
										<MapPinAltSolid class="me-1 h-3 w-3" />
										{parseFloat(park.latitude).toFixed(4)}, {parseFloat(park.longitude).toFixed(4)}
									</div>
								{:else}
									<span class="text-gray-400 dark:text-gray-500">No coordinates</span>
								{/if}
							</TableBodyCell>
							<TableBodyCell>
								<div class="flex items-center gap-2">
									<Button href="/admin/parks/{park.id}/edit" size="xs" color="blue" class="p-2">
										<EditOutline class="h-3 w-3" />
										<span class="sr-only">Edit {park.name}</span>
									</Button>
									<Button href="/admin/parks/{park.id}/delete" size="xs" color="red" class="p-2">
										<TrashBinOutline class="h-3 w-3" />
										<span class="sr-only">Delete {park.name}</span>
									</Button>
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>

			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<div
					class="flex items-center justify-center border-t border-gray-200 p-4 dark:border-gray-700"
				>
					<PaginationNav
						currentPage={data.pagination.currentPage}
						totalPages={data.pagination.totalPages}
						onPageChange={handlePageChange}
						visiblePages={5}
					/>
				</div>
			{/if}
		</Card>
	{:else}
		<!-- Empty State -->
		<Card class="py-12 text-center">
			<div class="flex flex-col items-center">
				<MapPinAltSolid class="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
				<Heading tag="h3" class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
					{data.searchQuery ? 'No parks found' : 'No parks yet'}
				</Heading>
				<P class="mb-6 max-w-md text-gray-600 dark:text-gray-400">
					{data.searchQuery
						? `No parks match your search for "${data.searchQuery}". Try a different search term.`
						: 'Get started by adding your first national park to the system.'}
				</P>
				{#if data.searchQuery}
					<Button
						color="light"
						onclick={() => {
							searchValue = '';
							const url = new URL(page.url);
							url.searchParams.delete('search');
							url.searchParams.delete('page');
							goto(url.toString());
						}}
					>
						Clear Search
					</Button>
				{:else}
					<Button href="/admin/parks/create">
						<PlusOutline class="me-2 h-4 w-4" />
						Add Your First Park
					</Button>
				{/if}
			</div>
		</Card>
	{/if}
</div>
