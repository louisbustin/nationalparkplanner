<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { Button } from 'flowbite-svelte';
	import { UserMenu } from './index.js';

	// Get session data from Better Auth
	const session = authClient.useSession();
</script>

{#if $session.data}
	<!-- User is logged in - show UserMenu -->
	<UserMenu user={$session.data.user} />
{:else}
	<!-- User is logged out - show login/register links -->
	<div class="flex items-center space-x-2 sm:space-x-3">
		<Button
			href="/auth/login"
			color="alternative"
			size="sm"
			class="px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
		>
			Sign In
		</Button>
		<Button href="/auth/register" size="sm" class="px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm">
			Sign Up
		</Button>
	</div>
{/if}
