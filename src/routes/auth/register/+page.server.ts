import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { authValidationRules, validateForm, validatePasswordConfirmation } from '$lib/validation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// TODO: Redirect if user is already logged in when session management is implemented
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString() || '';
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';
		const confirmPassword = formData.get('confirmPassword')?.toString() || '';

		// Server-side validation
		const values = { name, email, password, confirmPassword };
		const validation = validateForm(
			values,
			{
				name: authValidationRules.name,
				email: authValidationRules.email,
				password: authValidationRules.password,
				confirmPassword: authValidationRules.confirmPassword
			},
			{
				confirmPassword: validatePasswordConfirmation
			}
		);

		if (!validation.isValid) {
			return fail(400, {
				errors: validation.errors,
				values: { name, email } // Don't return passwords
			});
		}

		try {
			// Create user with Better Auth
			const response = await auth.api.signUpEmail({
				body: {
					name,
					email,
					password
				},
				asResponse: true
			});

			if (!response.ok) {
				const errorData = await response.json();

				// Handle specific Better Auth errors
				if (errorData.message && errorData.message.includes('email')) {
					return fail(400, {
						errors: { email: 'Email already registered' },
						values: { name, email }
					});
				}

				return fail(400, {
					error: errorData.message || 'Registration failed. Please try again.',
					values: { name, email }
				});
			}

			// Registration successful, redirect to home page
			throw redirect(302, '/');
		} catch (error) {
			console.error('Registration error:', error);

			// Handle network or unexpected errors
			return fail(500, {
				error: 'An unexpected error occurred. Please try again.',
				values: { name, email }
			});
		}
	}
};
