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
	import { toastStore, ErrorBoundary, SkeletonLoader, LoadingSpinner } from '$lib';
	import { untrack } from 'svelte';

	let { data }: { data: PageData } = $props();

	let searchValue = $state(data.searchQuery || '');
	let searchTimeout: ReturnType<typeof setTimeout>;
	let isSearching = $state(false);

	// Handle search with debouncing
	function handleSearch(noTimeout = false) {
		clearTimeout(searchTimeout);
		isSearching = true;
		searchTimeout = setTimeout(
			() => {
				const url = new URL(page.url);
				if (searchValue.trim()) {
					url.searchParams.set('search', searchValue.trim());
				} else {
					url.searchParams.delete('search');
				}
				goto(url.toString()).finally(() => {
					isSearching = false;
				});
			},
			noTimeout ? 0 : 300
		);
	}

	// Format coordinates for display
	function formatCoordinates(lat: string | null, lng: string | null): string {
		if (!lat || !lng) return 'No coordinates';
		try {
			const latitude = parseFloat(lat);
			const longitude = parseFloat(lng);
			return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
		} catch {
			return 'Invalid coordinates';
		}
	}

	// Format elevation for display
	function formatElevation(elevation: number | null): string {
		if (elevation === null || elevation === undefined) return 'Unknown';
		return `${elevation.toLocaleString('en-US')} ft`;
	}

	// Handle success messages from URL parameters with airport-specific information
	$effect(() => {
		const urlParams = new SvelteURLSearchParams(window.location.search);
		let message = '';

		// Get airport code from URL parameters for more specific messaging
		const airportCode = urlParams.get('code');
		const airportName = urlParams.get('name');

		if (urlParams.has('created')) {
			if (airportCode) {
				message = `Airport ${airportCode}${airportName ? ` (${airportName})` : ''} has been created successfully.`;
			} else {
				message = 'Airport has been created successfully.';
			}
		}

		if (urlParams.has('updated')) {
			if (airportCode) {
				message = `Airport ${airportCode}${airportName ? ` (${airportName})` : ''} has been updated successfully.`;
			} else {
				message = 'Airport has been updated successfully.';
			}
		}

		if (urlParams.has('deleted')) {
			if (airportCode) {
				message = `Airport ${airportCode}${airportName ? ` (${airportName})` : ''} has been deleted successfully.`;
			} else {
				message = 'Airport has been deleted successfully.';
			}
		}

		if (message) {
			untrack(() => toastStore.success(message));
		}
	});
</script>

<ErrorBoundary>
	<div class="p-6">
		<!-- Header Section -->
		<div class="mb-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<Heading tag="h1" class="text-2xl font-bold text-gray-900 dark:text-white">
						Airports Management
					</Heading>
					<P class="mt-1 text-gray-600 dark:text-gray-400">
						Manage airports data for trip planning and optimization
					</P>
				</div>
				<Button href="/admin/airports/create" class="w-fit">
					<PlusOutline class="me-2 h-4 w-4" />
					Add New Airport
				</Button>
			</div>
		</div>

		<!-- Search and Stats Section -->
		<Card class="mb-6" size="xl">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="max-w-full flex-1">
					<div class="relative">
						<Search
							bind:value={searchValue}
							oninput={() => handleSearch()}
							placeholder="Search airports by IATA code, name, city, state, or country..."
							clearable
							clearableOnClick={() => {
								searchValue = '';
								handleSearch(true);
							}}
						></Search>
						{#if isSearching}
							<div class="absolute top-1/2 right-3 -translate-y-1/2">
								<LoadingSpinner size="xs" />
							</div>
						{/if}
					</div>
				</div>
				<div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
					{#if data.searchQuery}
						<Badge color="blue" class="whitespace-nowrap">
							Search: "{data.searchQuery}"
						</Badge>
					{/if}
					<span class="mr-2 whitespace-nowrap">
						{data.airports.length} airports
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

		<!-- Airports Table -->
		{#if isSearching && data.searchQuery}
			<!-- Loading state for search -->
			<Card size="xl" class="p-6">
				<div class="space-y-4">
					<SkeletonLoader type="list" lines={5} />
				</div>
			</Card>
		{:else if data.airports.length > 0}
			<Card size="xl">
				<Table hoverable={true} striped={true}>
					<TableHead>
						<TableHeadCell>IATA Code</TableHeadCell>
						<TableHeadCell>Airport Name</TableHeadCell>
						<TableHeadCell>City</TableHeadCell>
						<TableHeadCell>State/Region</TableHeadCell>
						<TableHeadCell>Country</TableHeadCell>
						<TableHeadCell>Coordinates</TableHeadCell>
						<TableHeadCell>
							<span class="sr-only">Actions</span>
						</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each data.airports as airport (airport.id)}
							<TableBodyRow>
								<TableBodyCell>
									<div class="flex flex-col">
										<Badge color="blue" class="w-fit font-mono text-sm">
											{airport.iataCode}
										</Badge>
										{#if airport.icaoCode}
											<span class="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
												{airport.icaoCode}
											</span>
										{/if}
									</div>
								</TableBodyCell>
								<TableBodyCell>
									<div class="font-medium text-gray-900 dark:text-white">
										{airport.name}
									</div>
									{#if airport.elevation}
										<div class="text-sm text-gray-500 dark:text-gray-400">
											{formatElevation(airport.elevation)}
										</div>
									{/if}
								</TableBodyCell>
								<TableBodyCell>
									<span class="text-gray-900 dark:text-white">
										{airport.city}
									</span>
								</TableBodyCell>
								<TableBodyCell>
									{#if airport.state}
										<Badge color="gray" class="whitespace-nowrap">
											{airport.state}
										</Badge>
									{:else}
										<span class="text-gray-400 dark:text-gray-500">—</span>
									{/if}
								</TableBodyCell>
								<TableBodyCell>
									<span class="text-gray-900 dark:text-white">
										{airport.country}
									</span>
								</TableBodyCell>
								<TableBodyCell>
									<div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
										<MapPinAltSolid class="me-1 h-3 w-3" />
										{formatCoordinates(airport.latitude, airport.longitude)}
									</div>
								</TableBodyCell>
								<TableBodyCell>
									<div class="flex items-center gap-2">
										<Button
											href="/admin/airports/{airport.id}/edit"
											size="xs"
											color="blue"
											class="p-2"
										>
											<EditOutline class="h-3 w-3" />
											<span class="sr-only">Edit {airport.name}</span>
										</Button>
										<Button
											href="/admin/airports/{airport.id}/delete"
											size="xs"
											color="red"
											class="p-2"
										>
											<TrashBinOutline class="h-3 w-3" />
											<span class="sr-only">Delete {airport.name}</span>
										</Button>
									</div>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			</Card>
		{:else}
			<!-- Empty State -->
			<Card class="p-12 text-center">
				<div class="flex flex-col items-center">
					<MapPinAltSolid class="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
					<Heading tag="h3" class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
						{data.searchQuery ? 'No airports found' : 'No airports yet'}
					</Heading>
					<P class="mb-6 max-w-md text-gray-600 dark:text-gray-400">
						{data.searchQuery
							? `No airports match your search for "${data.searchQuery}". Try a different search term.`
							: 'Get started by adding your first airport to the system.'}
					</P>
					{#if data.searchQuery}
						<Button
							color="light"
							onclick={() => {
								searchValue = '';
								const url = new URL(page.url);
								url.searchParams.delete('search');
								goto(url.toString());
							}}
						>
							Clear Search
						</Button>
					{:else}
						<Button href="/admin/airports/create">
							<PlusOutline class="me-2 h-4 w-4" />
							Add Your First Airport
						</Button>
					{/if}
				</div>
			</Card>
		{/if}
	</div>
</ErrorBoundary>
