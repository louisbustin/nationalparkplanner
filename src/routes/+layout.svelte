<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Navbar, NavBrand, NavHamburger, NavUl, NavLi } from 'flowbite-svelte';
	import { AuthStatus } from '$lib/components';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar>
	<NavBrand href="/">
		<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
			National Park Planner
		</span>
	</NavBrand>

	<div class="flex md:order-2">
		<AuthStatus />
		<NavHamburger />
	</div>

	<NavUl>
		<NavLi href="/">Home</NavLi>
		<NavLi href="/parks">Parks</NavLi>
		<NavLi href="/trips">My Trips</NavLi>
	</NavUl>
</Navbar>

<main class="container mx-auto px-4 py-8">
	{@render children?.()}
</main>
