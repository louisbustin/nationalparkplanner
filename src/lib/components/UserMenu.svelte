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

<Button color="alternative" class="flex items-center space-x-2 p-2">
	<Avatar src={user.image || undefined} alt={user.name} size="sm" />
	<span class="hidden text-sm font-medium sm:block">{user.name}</span>
	<ChevronDownOutline class="h-3 w-3" />
</Button>

<Dropdown class="w-48">
	<div class="px-4 py-3 text-sm text-gray-900 dark:text-white">
		<div class="font-medium">{user.name}</div>
		<div class="truncate text-gray-500 dark:text-gray-400">{user.email}</div>
	</div>

	<DropdownItem href="/profile" class="flex items-center space-x-2">
		<UserOutline class="h-4 w-4" />
		<span>Profile</span>
	</DropdownItem>

	<DropdownItem class="flex items-center space-x-2">
		<button onclick={handleLogout} class="flex w-full items-center space-x-2 text-left">
			<ArrowRightToBracketOutline class="h-4 w-4" />
			<span>Sign Out</span>
		</button>
	</DropdownItem>
</Dropdown>
