import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { validateField } from '$lib/validation';
import { nameValidation } from '$lib/validation';

export const load: PageServerLoad = async (a) => {
	try {
		const { locals } = a;
		// Double-check authentication (middleware should have already handled this)
		if (!locals.session || !locals.user) {
			throw error(401, 'Unauthorized - Please log in to view your profile');
		}

		// Return user data for the profile page with proper error handling
		return {
			user: {
				id: locals.user.id,
				name: locals.user.name,
				email: locals.user.email,
				emailVerified: locals.user.emailVerified,
				image: locals.user.image,
				createdAt: locals.user.createdAt,
				updatedAt: locals.user.updatedAt
			},
			session: {
				id: locals.session.session.id,
				expiresAt: locals.session.session.expiresAt,
				createdAt: locals.session.session.createdAt
			}
		};
	} catch (err) {
		console.error('Profile load error:', err);

		// If it's already a SvelteKit error, re-throw it
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		// Otherwise, throw a generic server error
		throw error(500, 'Failed to load profile data. Please try again.');
	}
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		// Check authentication
		if (!locals.session || !locals.user) {
			return fail(401, {
				error: 'Unauthorized - Please log in to update your profile',
				success: false
			});
		}

		try {
			const formData = await request.formData();
			const name = formData.get('name')?.toString()?.trim();

			// Validate input
			if (!name) {
				return fail(400, {
					error: 'Name is required',
					success: false,
					fieldErrors: { name: 'Name is required' }
				});
			}

			// Validate name using existing validation
			const nameError = validateField(name, nameValidation);
			if (nameError) {
				return fail(400, {
					error: nameError,
					success: false,
					fieldErrors: { name: nameError },
					values: { name }
				});
			}

			// Check if name is different from current name
			if (name === locals.user.name) {
				return fail(400, {
					error: 'No changes detected',
					success: false,
					values: { name }
				});
			}

			// Update user profile using Better Auth
			const updateResult = await auth.api.updateUser({
				headers: request.headers,
				body: {
					name: name
				}
			});

			if (!updateResult) {
				return fail(500, {
					error: 'Failed to update profile. Please try again.',
					success: false,
					values: { name }
				});
			}

			return {
				success: true,
				message: 'Profile updated successfully!',
				user: updateResult
			};
		} catch (err) {
			console.error('Profile update error:', err);

			const formData = await request.formData();
			return fail(500, {
				error: 'An unexpected error occurred. Please try again.',
				success: false,
				values: { name: formData?.get('name')?.toString() || '' }
			});
		}
	}
};
