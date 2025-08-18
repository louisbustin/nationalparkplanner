import { auth } from '$lib/auth';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If user is not authenticated, redirect to home
	if (!locals.user) {
		throw redirect(302, '/');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		try {
			// Get the session from Better Auth using the request headers
			const session = await auth.api.getSession({
				headers: request.headers
			});

			if (session) {
				// Sign out using Better Auth server API
				await auth.api.signOut({
					headers: request.headers
				});
			}

			// Clear any additional cookies that might be set
			// Better Auth should handle its own cookie cleanup, but we can be explicit
			const cookieNames = ['better-auth.session_token', 'better-auth.csrf_token'];

			cookieNames.forEach((name) => {
				cookies.delete(name, {
					path: '/',
					httpOnly: true,
					secure: true,
					sameSite: 'lax'
				});
			});

			// Redirect to home page after successful logout
			throw redirect(302, '/');
		} catch (error) {
			console.error('Logout error:', error);
			// Even if there's an error, redirect to home page
			// This ensures the user is logged out from the UI perspective
			throw redirect(302, '/');
		}
	}
};
