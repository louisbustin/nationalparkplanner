import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { authValidationRules, validateForm } from '$lib/validation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if user is already logged in
	// Better Auth sets user and session in locals
	if (locals.user && locals.session) {
		throw redirect(302, '/');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';
		const rememberMe = formData.get('rememberMe') === 'on';

		// Server-side validation
		const loginValidationRules = {
			email: authValidationRules.email,
			password: {
				required: true,
				message: 'Password is required'
			}
		};

		const values = { email, password };
		const validation = validateForm(values, loginValidationRules);

		if (!validation.isValid) {
			return fail(400, {
				errors: validation.errors,
				values: { email } // Don't return password
			});
		}

		try {
			// Authenticate user with Better Auth
			const response = await auth.api.signInEmail({
				body: {
					email,
					password,
					rememberMe
				},
				asResponse: true
			});

			if (!response.ok) {
				const errorData = await response.json();

				// Handle specific authentication errors
				if (
					errorData.message &&
					(errorData.message.includes('Invalid') ||
						errorData.message.includes('credentials') ||
						errorData.message.includes('password') ||
						errorData.message.includes('email'))
				) {
					return fail(400, {
						error: 'Invalid email or password',
						values: { email }
					});
				}

				return fail(400, {
					error: errorData.message || 'Login failed. Please try again.',
					values: { email }
				});
			}

			// Login successful, redirect to home page
			// Better Auth's SvelteKit handler will automatically set the session cookie
			throw redirect(302, '/');
		} catch (error) {
			console.error('Login error:', error);

			// Handle network or unexpected errors
			return fail(500, {
				error: 'An unexpected error occurred. Please try again.',
				values: { email }
			});
		}
	}
};
