import type { LayoutServerLoad } from './$types';
import { validateSession } from '$lib/auth-utils.server';
import { requireAdmin, extractUserFromSession } from '$lib/server/auth/admin';

/**
 * Server-side layout load function for admin routes
 * Validates user authentication and admin authorization for all admin pages
 */
export const load: LayoutServerLoad = async (event) => {
	// Validate the current session
	const sessionResult = await validateSession(event);

	// Extract user from session
	const user = extractUserFromSession(sessionResult.session);

	// Require admin access - this will throw a 404 error if user is not an admin
	requireAdmin(user);

	// If we reach here, user is authenticated and is an admin
	return {
		user: user,
		session: sessionResult.session
	};
};
