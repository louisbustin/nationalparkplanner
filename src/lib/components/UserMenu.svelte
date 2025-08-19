<script lang="ts">
	import { Dropdown, DropdownItem, Avatar, Button } from 'flowbite-svelte';
	import {
		ChevronDownOutline,
		UserOutline,
		ArrowRightToBracketOutline
	} from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';

	interface Props {
		user: {
			name: string;
			email: string;
			image?: string | null;
		};
	}

	let { user }: Props = $props();

	async function handleLogout() {
		try {
			// Use the comprehensive logout handler
			const { handleLogout: performCompleteLogout } = await import('$lib/auth-utils');
			await performCompleteLogout('/');
		} catch (error) {
			console.error('Logout failed:', error);

			// Fallback: direct navigation to home
			goto('/');
		}
	}
</script>

<Button color="alternative" class="flex items-center space-x-1 p-1.5 sm:space-x-2 sm:p-2">
	<Avatar src={user.image || undefined} alt={user.name} size="sm" class="h-6 w-6 sm:h-8 sm:w-8" />
	<span class="hidden max-w-24 truncate text-xs font-medium sm:block sm:max-w-32 sm:text-sm">
		{user.name}
	</span>
	<ChevronDownOutline class="h-3 w-3 flex-shrink-0" />
</Button>

<Dropdown class="z-50 w-48 sm:w-56" simple>
	<div
		class="border-b border-gray-200 px-4 py-3 text-sm text-gray-900 dark:border-gray-600 dark:text-white"
	>
		<div class="truncate font-medium">{user.name}</div>
		<div class="truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">{user.email}</div>
	</div>

	<DropdownItem href="/profile" class="flex items-center space-x-2 py-2 sm:py-2.5">
		<UserOutline class="h-4 w-4 flex-shrink-0" />
		<span class="text-sm">Profile</span>
	</DropdownItem>

	<DropdownItem class="flex items-center space-x-2 py-2 sm:py-2.5">
		<button onclick={handleLogout} class="flex w-full items-center space-x-2 text-left text-sm">
			<ArrowRightToBracketOutline class="h-4 w-4 flex-shrink-0" />
			<span>Sign Out</span>
		</button>
	</DropdownItem>
</Dropdown>
