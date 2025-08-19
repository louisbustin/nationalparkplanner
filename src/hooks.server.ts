import { auth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/auth-utils.server';
import { createLoginRedirect } from '$lib/auth-utils';
import { sequence } from '@sveltejs/kit/hooks';

/**
 * Protected route patterns that require authentication
 */
const PROTECTED_ROUTES = ['/profile', '/dashboard', '/trips', '/settings'];

/**
 * Auth route patterns that should redirect authenticated users
 */
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

/**
 * Logout route that should be accessible to authenticated users only
 */
const LOGOUT_ROUTE = '/auth/logout';

const setupSessionHandler: Handle = async ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth, building });
};

const authHandler: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event);
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

	// Check if current route is the logout route
	const isLogoutRoute = pathname.startsWith(LOGOUT_ROUTE);

	// Handle protected routes
	if (isProtectedRoute && !isAuthenticated) {
		// Redirect to login with return URL
		const loginRedirect = createLoginRedirect(pathname + event.url.search);
		throw redirect(302, loginRedirect);
	}

	// Handle logout route - only accessible to authenticated users
	if (isLogoutRoute && !isAuthenticated) {
		// If user is not authenticated, redirect to home
		throw redirect(302, '/');
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

	return resolve(event);
};

export const handle: Handle = sequence(setupSessionHandler, authHandler);
