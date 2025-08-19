<script lang="ts">
	import { Card, Button, Badge } from 'flowbite-svelte';
	import { MapPinAltSolid, PlusOutline, ChartOutline } from 'flowbite-svelte-icons';
</script>

<svelte:head>
	<title>Admin Dashboard - National Park Planner</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
				<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
					Welcome to the National Park Planner administration panel
				</p>
			</div>
			<Badge color="green" class="text-sm">
				<ChartOutline class="me-1 h-3 w-3" />
				System Online
			</Badge>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Parks Management Card -->
		<Card class="max-w-none p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center">
					<MapPinAltSolid class="h-8 w-8 text-blue-600 dark:text-blue-400" />
					<div class="ml-4">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Parks Management</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">Manage national parks data</p>
					</div>
				</div>
			</div>
			<div class="mt-4 flex space-x-2">
				<Button href="/admin/parks" size="sm">View All Parks</Button>
				<Button href="/admin/parks/create" color="green" size="sm">
					<PlusOutline class="me-1 h-3 w-3" />
					Add Park
				</Button>
			</div>
		</Card>

		<!-- System Stats Card (placeholder for future features) -->
		<Card class="max-w-none p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center">
					<ChartOutline class="h-8 w-8 text-green-600 dark:text-green-400" />
					<div class="ml-4">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">System Statistics</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">View system metrics</p>
					</div>
				</div>
			</div>
			<div class="mt-4">
				<Badge color="gray" class="text-xs">Coming Soon</Badge>
			</div>
		</Card>

		<!-- User Management Card (placeholder for future features) -->
		<Card class="max-w-none p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900"
					>
						<span class="font-semibold text-purple-600 dark:text-purple-400">U</span>
					</div>
					<div class="ml-4">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">Manage user accounts</p>
					</div>
				</div>
			</div>
			<div class="mt-4">
				<Badge color="gray" class="text-xs">Coming Soon</Badge>
			</div>
		</Card>
	</div>

	<!-- Recent Activity Section (placeholder) -->
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
		<div class="py-8 text-center">
			<ChartOutline class="mx-auto h-12 w-12 text-gray-400" />
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				Activity tracking will be available in a future update
			</p>
		</div>
	</div>
</div>
