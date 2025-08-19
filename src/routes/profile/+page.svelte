<script lang="ts">
	import type { PageData } from './$types';
	import {
		Card,
		Heading,
		P,
		Badge,
		Avatar,
		Skeleton,
		Alert,
		Button,
		Spinner,
		Modal,
		Toast
	} from 'flowbite-svelte';
	import {
		UserSolid,
		CalendarEditSolid,
		EnvelopeSolid,
		ClockSolid,
		PenSolid,
		CheckCircleSolid,
		ExclamationCircleSolid
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import FormField from '$lib/components/FormField.svelte';
	import { nameValidation } from '$lib/validation';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let isLoading = $state(true);
	let loadError = $state('');
	let isEditModalOpen = $state(false);
	let isSubmitting = $state(false);
	let editName = $state(data.user.name);
	let showSuccessToast = $state(false);
	let showErrorToast = $state(false);
	let toastMessage = $state('');

	// Get form result from page store
	const form = $derived(page.form);

	// Simulate loading state for better UX
	onMount(() => {
		// Add a small delay to show loading state
		const timer = setTimeout(() => {
			isLoading = false;
		}, 300);

		return () => clearTimeout(timer);
	});

	// Format dates for better display
	const formatDate = (dateString: string | Date) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return 'Invalid date';
		}
	};

	const formatDateTime = (dateString: string | Date) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return 'Invalid date';
		}
	};

	// Calculate account age
	const getAccountAge = (createdAt: string | Date) => {
		try {
			const created = new Date(createdAt);
			const now = new Date();
			const diffTime = Math.abs(now.getTime() - created.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays < 30) {
				return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
			} else if (diffDays < 365) {
				const months = Math.floor(diffDays / 30);
				return `${months} month${months === 1 ? '' : 's'}`;
			} else {
				const years = Math.floor(diffDays / 365);
				return `${years} year${years === 1 ? '' : 's'}`;
			}
		} catch {
			return 'Unknown';
		}
	};

	// Handle edit modal
	function openEditModal() {
		editName = data.user.name;
		isEditModalOpen = true;
	}

	function closeEditModal() {
		isEditModalOpen = false;
		editName = data.user.name;
	}

	// Handle form results
	$effect(() => {
		if (form) {
			if (form.success) {
				showSuccessToast = true;
				toastMessage = form.message || 'Profile updated successfully!';
				isEditModalOpen = false;
				// Update local data if user info was returned
				if (form.user) {
					data.user.name = form.user.name;
					data.user.updatedAt = form.user.updatedAt;
				}
				// Auto-dismiss success toast after 3 seconds
				setTimeout(() => {
					showSuccessToast = false;
				}, 3000);
			} else if (form.error) {
				showErrorToast = true;
				toastMessage = form.error;
				// Auto-dismiss error toast after 5 seconds
				setTimeout(() => {
					showErrorToast = false;
				}, 5000);
			}
			isSubmitting = false;
		}
	});
</script>

<svelte:head>
	<title>Profile - National Park Planner</title>
	<meta
		name="description"
		content="View and manage your National Park Planner profile information"
	/>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-8">
		<Heading tag="h1" class="mb-2 flex items-center gap-3">
			<UserSolid class="h-8 w-8 text-primary-600" />
			Your Profile
		</Heading>
		<P class="text-gray-600 dark:text-gray-400">Manage your account information and settings</P>
	</div>

	{#if loadError}
		<Alert color="red" class="mb-6">
			<span class="font-medium">Error loading profile:</span>
			{loadError}
			<Button size="xs" color="red" class="ml-4" onclick={() => window.location.reload()}>
				Retry
			</Button>
		</Alert>
	{/if}

	<div class="grid gap-6 md:grid-cols-2">
		<!-- Main Profile Information -->
		<Card class="p-6">
			<div class="mb-4">
				<Heading tag="h2" class="mb-4 flex items-center gap-2 text-xl">
					<UserSolid class="h-5 w-5" />
					Profile Information
				</Heading>
			</div>

			{#if isLoading}
				<div class="space-y-6">
					<div class="flex items-center space-x-4">
						<Skeleton class="h-16 w-16 rounded-full" />
						<div class="space-y-2">
							<Skeleton class="h-4 w-32" />
							<Skeleton class="h-3 w-24" />
						</div>
					</div>
					<div class="space-y-4">
						<div>
							<Skeleton class="mb-2 h-3 w-16" />
							<Skeleton class="h-4 w-48" />
						</div>
						<div>
							<Skeleton class="mb-2 h-3 w-16" />
							<Skeleton class="h-4 w-40" />
						</div>
					</div>
				</div>
			{:else}
				<div class="space-y-6">
					<!-- Avatar and Name Section -->
					<div class="flex items-center space-x-4">
						<Avatar
							src={data.user.image}
							alt={data.user.name}
							size="lg"
							class="ring-2 ring-gray-200 dark:ring-gray-700"
						>
							{data.user.name.charAt(0).toUpperCase()}
						</Avatar>
						<div>
							<Heading tag="h3" class="text-lg font-semibold text-gray-900 dark:text-white">
								{data.user.name}
							</Heading>
							<P class="text-sm text-gray-500 dark:text-gray-400">
								Member for {getAccountAge(data.user.createdAt)}
							</P>
						</div>
					</div>

					<!-- Profile Details -->
					<div class="space-y-4">
						<div class="flex items-start space-x-3">
							<UserSolid class="mt-0.5 h-5 w-5 text-gray-400" />
							<div>
								<P class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</P>
								<P class="font-medium text-gray-900 dark:text-white">
									{data.user.name}
								</P>
							</div>
						</div>

						<div class="flex items-start space-x-3">
							<EnvelopeSolid class="mt-0.5 h-5 w-5 text-gray-400" />
							<div class="flex-1">
								<P class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
									Email Address
								</P>
								<div class="flex items-center gap-2">
									<P class="font-medium text-gray-900 dark:text-white">
										{data.user.email}
									</P>
									{#if data.user.emailVerified}
										<Badge color="green" class="text-xs">Verified</Badge>
									{:else}
										<Badge color="yellow" class="text-xs">Unverified</Badge>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</Card>

		<!-- Account Information -->
		<Card class="p-6">
			<div class="mb-4">
				<Heading tag="h2" class="mb-4 flex items-center gap-2 text-xl">
					<CalendarEditSolid class="h-5 w-5" />
					Account Details
				</Heading>
			</div>

			{#if isLoading}
				<div class="space-y-4">
					<div>
						<Skeleton class="mb-2 h-3 w-24" />
						<Skeleton class="h-4 w-32" />
					</div>
					<div>
						<Skeleton class="mb-2 h-3 w-24" />
						<Skeleton class="h-4 w-40" />
					</div>
					<div>
						<Skeleton class="mb-2 h-3 w-24" />
						<Skeleton class="h-4 w-36" />
					</div>
				</div>
			{:else}
				<div class="space-y-4">
					<div class="flex items-start space-x-3">
						<CalendarEditSolid class="mt-0.5 h-5 w-5 text-gray-400" />
						<div>
							<P class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
								Account Created
							</P>
							<P class="font-medium text-gray-900 dark:text-white">
								{formatDate(data.user.createdAt)}
							</P>
						</div>
					</div>

					<div class="flex items-start space-x-3">
						<ClockSolid class="mt-0.5 h-5 w-5 text-gray-400" />
						<div>
							<P class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</P>
							<P class="font-medium text-gray-900 dark:text-white">
								{formatDate(data.user.updatedAt)}
							</P>
						</div>
					</div>

					<div class="flex items-start space-x-3">
						<ClockSolid class="mt-0.5 h-5 w-5 text-gray-400" />
						<div>
							<P class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
								Session Expires
							</P>
							<P class="font-medium text-gray-900 dark:text-white">
								{formatDateTime(data.session.expiresAt)}
							</P>
						</div>
					</div>

					<div class="border-t border-gray-200 pt-2 dark:border-gray-700">
						<P class="text-xs text-gray-500 dark:text-gray-400">
							User ID: {data.user.id}
						</P>
					</div>
				</div>
			{/if}
		</Card>
	</div>

	<!-- Action Buttons -->
	{#if !isLoading}
		<div class="mt-8 flex flex-wrap gap-4">
			<Button color="primary" size="lg" onclick={openEditModal}>
				<PenSolid class="mr-2 h-4 w-4" />
				Edit Profile
			</Button>
			<Button color="alternative" size="lg">Account Settings</Button>
		</div>
	{/if}
</div>

<!-- Edit Profile Modal -->
<Modal bind:open={isEditModalOpen} size="sm" autoclose={false} class="w-full">
	<div class="p-6">
		<div class="mb-6">
			<Heading tag="h3" class="text-xl font-semibold text-gray-900 dark:text-white">
				Edit Profile
			</Heading>
			<P class="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your profile information</P>
		</div>

		<form
			method="POST"
			action="?/updateProfile"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
				};
			}}
		>
			<FormField
				label="Full Name"
				type="text"
				placeholder="Enter your full name"
				required={true}
				bind:value={editName}
				rule={nameValidation}
				error={form?.fieldErrors?.name}
				name="name"
			/>

			<div class="mt-6 flex justify-end gap-3">
				<Button color="alternative" onclick={closeEditModal} disabled={isSubmitting}>Cancel</Button>
				<Button
					type="submit"
					color="primary"
					disabled={isSubmitting || !editName.trim() || editName === data.user.name}
				>
					{#if isSubmitting}
						<Spinner class="mr-2 h-4 w-4" />
						Saving...
					{:else}
						<CheckCircleSolid class="mr-2 h-4 w-4" />
						Save Changes
					{/if}
				</Button>
			</div>
		</form>
	</div>
</Modal>

<!-- Success Toast -->
{#if showSuccessToast}
	<Toast color="green" position="top-right" class="mb-4" dismissable>
		<CheckCircleSolid class="mr-2 h-5 w-5" />
		{toastMessage}
	</Toast>
{/if}

<!-- Error Toast -->
{#if showErrorToast}
	<Toast color="red" position="top-right" class="mb-4" dismissable>
		<ExclamationCircleSolid class="mr-2 h-5 w-5" />
		{toastMessage}
	</Toast>
{/if}
