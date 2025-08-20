<script lang="ts">
	import { page } from '$app/state';
	import {
		A,
		Navbar,
		NavBrand,
		NavHamburger,
		NavUl,
		NavLi,
		Breadcrumb,
		BreadcrumbItem,
		DarkMode
	} from 'flowbite-svelte';
	import {
		ChartOutline,
		CogSolid,
		GlobeOutline,
		HomeOutline,
		MapPinAltSolid,
		UserSolid
	} from 'flowbite-svelte-icons';
	import { ToastContainer, ErrorBoundary } from '$lib/components';
	import { toastStore } from '$lib/toast-store.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let activeUrl = $derived(page.url.pathname);
	let hidden = $state(true);
	let sidebarOpen = $state(false);

	// Generate breadcrumb items based on current path
	let breadcrumbItems = $derived((): Array<{ label: string; href: string }> => {
		const pathSegments = page.url.pathname.split('/').filter(Boolean);
		const items: Array<{ label: string; href: string }> = [{ label: 'Home', href: '/' }];

		let currentPath = '';
		for (const segment of pathSegments) {
			currentPath += `/${segment}`;
			if (segment === 'admin') {
				items.push({ label: 'Admin', href: '/admin' });
			} else if (segment === 'parks') {
				items.push({ label: 'Parks Management', href: '/admin/parks' });
			} else if (segment === 'airports') {
				items.push({ label: 'Airports Management', href: '/admin/airports' });
			} else if (segment === 'create') {
				// Check if we're in parks or airports context
				if (currentPath.includes('/admin/parks/')) {
					items.push({ label: 'Create Park', href: currentPath });
				} else if (currentPath.includes('/admin/airports/')) {
					items.push({ label: 'Create Airport', href: currentPath });
				}
			} else if (segment === 'edit') {
				// Check if we're in parks or airports context
				if (currentPath.includes('/admin/parks/')) {
					items.push({ label: 'Edit Park', href: currentPath });
				} else if (currentPath.includes('/admin/airports/')) {
					items.push({ label: 'Edit Airport', href: currentPath });
				}
			} else if (segment === 'delete') {
				// Check if we're in parks or airports context
				if (currentPath.includes('/admin/parks/')) {
					items.push({ label: 'Delete Park', href: currentPath });
				} else if (currentPath.includes('/admin/airports/')) {
					items.push({ label: 'Delete Airport', href: currentPath });
				}
			}
		}

		return items;
	});
</script>

<!-- Admin Navigation Bar -->
<Navbar class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
	<NavBrand href="/admin" class="flex items-center">
		<CogSolid class="me-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
		<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
			Admin Panel
		</span>
	</NavBrand>

	<!-- Mobile and Desktop Controls -->
	<div class="flex items-center space-x-3 md:order-2">
		<DarkMode />

		<!-- User Info -->
		<div class="flex items-center space-x-2">
			<UserSolid class="h-5 w-5 text-gray-600 dark:text-gray-400" />
			<span class="text-sm text-gray-700 dark:text-gray-300">
				{data.user?.email || 'Admin'}
			</span>
		</div>

		<!-- Back to Main Site -->
		<A href="/" class="hidden md:block">
			<HomeOutline class="me-1 h-4 w-4" />
			Main Site
		</A>

		<NavHamburger onclick={() => (hidden = !hidden)} class="md:hidden" />
	</div>

	<!-- Mobile Navigation -->
	<NavUl {hidden} class="md:hidden">
		<NavLi href="/admin/parks">Parks Management</NavLi>
		<NavLi href="/admin/airports">Airports Management</NavLi>
		<NavLi href="/">Back to Main Site</NavLi>
	</NavUl>
</Navbar>

<!-- Desktop Layout with Sidebar -->
<div class="flex h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Sidebar for Desktop -->
	<aside class="hidden md:flex md:w-64 md:flex-col">
		<div
			class="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex flex-shrink-0 items-center px-4">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Administration</h2>
			</div>

			<div class="mt-5 flex flex-grow flex-col">
				<nav class="flex-1 space-y-1 px-2 pb-4">
					<!-- Dashboard/Overview -->
					<a
						href="/admin"
						class="group flex items-center rounded-md px-2 py-2 text-sm font-medium {activeUrl ===
						'/admin'
							? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
							: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}"
					>
						<ChartOutline
							class="mr-3 h-5 w-5 {activeUrl === '/admin'
								? 'text-blue-500 dark:text-blue-300'
								: 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'}"
						/>
						Dashboard
					</a>

					<!-- Parks Management -->
					<a
						href="/admin/parks"
						class="group flex items-center rounded-md px-2 py-2 text-sm font-medium {activeUrl.startsWith(
							'/admin/parks'
						)
							? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
							: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}"
					>
						<MapPinAltSolid
							class="mr-3 h-5 w-5 {activeUrl.startsWith('/admin/parks')
								? 'text-blue-500 dark:text-blue-300'
								: 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'}"
						/>
						Parks Management
					</a>

					<!-- Airports Management -->
					<a
						href="/admin/airports"
						class="group flex items-center rounded-md px-2 py-2 text-sm font-medium {activeUrl.startsWith(
							'/admin/airports'
						)
							? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
							: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}"
					>
						<GlobeOutline
							class="mr-3 h-5 w-5 {activeUrl.startsWith('/admin/airports')
								? 'text-blue-500 dark:text-blue-300'
								: 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'}"
						/>
						Airports Management
					</a>

					<!-- Future admin sections can be added here -->
					<!-- Users Management (future) -->
					<!-- Settings (future) -->
				</nav>
			</div>
		</div>
	</aside>

	<!-- Main Content Area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Breadcrumb Navigation -->
		<div class="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
			<Breadcrumb aria-label="Admin breadcrumb navigation">
				{#each breadcrumbItems() as item, index (index)}
					{#if index === breadcrumbItems().length - 1}
						<!-- Last item (current page) -->
						<BreadcrumbItem>{item.label}</BreadcrumbItem>
					{:else if index === 0}
						<!-- First item (Home) -->
						<BreadcrumbItem href={item.href} home>
							{item.label}
						</BreadcrumbItem>
					{:else}
						<!-- Middle items -->
						<BreadcrumbItem href={item.href}>{item.label}</BreadcrumbItem>
					{/if}
				{/each}
			</Breadcrumb>
		</div>

		<!-- Page Content -->
		<main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
			<div class="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
				<ErrorBoundary>
					{@render children?.()}
				</ErrorBoundary>
			</div>
		</main>
	</div>
</div>

<!-- Mobile Sidebar Overlay (for future mobile sidebar implementation) -->
{#if sidebarOpen}
	<div class="fixed inset-0 z-40 md:hidden">
		<button
			class="bg-opacity-75 fixed inset-0 h-full w-full bg-gray-600"
			onclick={() => (sidebarOpen = false)}
			onkeydown={(e) => e.key === 'Escape' && (sidebarOpen = false)}
			aria-label="Close sidebar"
		></button>
		<!-- Mobile sidebar content would go here -->
	</div>
{/if}

<!-- Toast Container -->
<ToastContainer
	toasts={toastStore.items}
	onRemove={(id) => toastStore.remove(id)}
	position="top-right"
/>
