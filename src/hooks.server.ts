import { auth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { validateSession, createLoginRedirect } from '$lib/auth-utils';

/**
 * Protected route patterns that require authentication
 */
const PROTECTED_ROUTES = ['/profile', '/dashboard', '/trips', '/settings'];

/**
 * Auth route patterns that should redirect authenticated users
 */
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export const handle: Handle = async ({ event, resolve }) => {
	// First, let Better Auth handle its own routes and set up session
	const response = await svelteKitHandler({ event, resolve, auth, building });

	// Skip route protection during build time
	if (building) {
		return response;
	}

	const { pathname } = event.url;

	// Validate current session
	const sessionResult = await validateSession(event);
	const isAuthenticated = sessionResult.isValid;

	// Store session data in locals for use in load functions and pages
	event.locals.session = sessionResult.session;
	event.locals.user = sessionResult.session?.user || null;

	// Check if current route is protected
	const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

	// Check if current route is an auth route
	const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

	// Handle protected routes
	if (isProtectedRoute && !isAuthenticated) {
		// Redirect to login with return URL
		const loginRedirect = createLoginRedirect(pathname + event.url.search);
		throw redirect(302, loginRedirect);
	}

	// Handle auth routes when user is already authenticated
	if (isAuthRoute && isAuthenticated) {
		// Check for return URL in query params
		const returnUrl = event.url.searchParams.get('returnUrl');
		if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
			throw redirect(302, returnUrl);
		}
		// Default redirect to home page
		throw redirect(302, '/');
	}

	return response;
};
