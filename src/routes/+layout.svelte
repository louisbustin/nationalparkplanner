<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { DarkMode, Navbar, NavBrand, NavHamburger, NavUl, NavLi } from 'flowbite-svelte';
	import { AuthStatus } from '$lib/components';
	import { page } from '$app/state';
	let { children } = $props();
	let hidden = $state(true);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

{#if page.url.pathname.startsWith('/admin')}
	<main>
		{@render children?.()}
	</main>
{:else}
	<Navbar class="border-b border-gray-200 dark:border-gray-700">
		<NavBrand href="/" class="flex items-center">
			<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
				National Park Planner
			</span>
		</NavBrand>

		<!-- Mobile and Desktop Auth Status + Hamburger -->
		<div class="flex items-center space-x-3 md:order-2">
			<DarkMode />
			<AuthStatus />
			<NavHamburger onclick={() => (hidden = !hidden)} class="md:hidden" />
		</div>

		<!-- Navigation Links -->
		<NavUl {hidden} class="md:order-1 md:flex md:w-auto">
			<NavLi href="/" class="md:hover:bg-transparent">Home</NavLi>
			<NavLi href="/parks" class="md:hover:bg-transparent">Parks</NavLi>
			<NavLi href="/trips" class="md:hover:bg-transparent">My Trips</NavLi>
		</NavUl>
	</Navbar>

	<main class="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
		{@render children?.()}
	</main>
{/if}
