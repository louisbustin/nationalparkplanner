import type { PageServerLoad } from './$types';

/**
 * Server-side load function for admin dashboard
 * The layout already handles authentication and authorization,
 * so we just need to return any dashboard-specific data
 */
export const load: PageServerLoad = async ({ parent }) => {
	// Get the layout data (user, session) from parent
	const { user, session } = await parent();

	// In the future, we could load dashboard statistics here
	// For now, just return the user data
	return {
		user,
		session
	};
};
