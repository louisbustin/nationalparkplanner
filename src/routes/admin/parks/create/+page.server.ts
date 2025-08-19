import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin, extractUserFromSession } from '$lib/server/auth/admin.js';
import { parksRepository } from '$lib/server/db/parks.js';
import { safeValidateCreateParkForm } from '$lib/validation/parks.js';
import { validateSession } from '$lib/auth-utils.server.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async (event) => {
	// Validate the current session
	const sessionResult = await validateSession(event);
	const user = extractUserFromSession(sessionResult.session);

	// Require admin access
	requireAdmin(user);

	return {};
};

export const actions: Actions = {
	create: async (event) => {
		// Validate the current session
		const sessionResult = await validateSession(event);
		const user = extractUserFromSession(sessionResult.session);

		// Require admin access
		requireAdmin(user);

		const formData = await event.request.formData();
		const data = Object.fromEntries(formData);

		// Validate form data
		const validation = safeValidateCreateParkForm(data);

		if (!validation.success) {
			const fieldErrors: Record<string, string> = {};

			validation.error.issues.forEach((issue) => {
				const field = issue.path[0];
				if (field && typeof field === 'string') {
					fieldErrors[field] = issue.message;
				}
			});

			return fail(400, {
				fieldErrors,
				formData: data
			});
		}

		const validatedData = validation.data;

		try {
			// Check if park already exists in the same state
			const exists = await parksRepository.parkExistsInState(
				validatedData.name,
				validatedData.state
			);

			if (exists) {
				return fail(400, {
					fieldErrors: {
						name: 'A park with this name already exists in this state'
					},
					formData: data
				});
			}

			// Create the park
			await parksRepository.createPark({
				name: validatedData.name,
				state: validatedData.state,
				description: validatedData.description || undefined,
				latitude: validatedData.latitude,
				longitude: validatedData.longitude,
				establishedDate: validatedData.establishedDate,
				area: validatedData.area
			});
		} catch (error) {
			// If it's a redirect, re-throw it
			if (error instanceof Response) {
				throw error;
			}

			console.error('Failed to create park:', error);

			return fail(500, {
				message: 'Failed to create park. Please try again.',
				formData: data
			});
		}
		// Redirect to parks list with success message since if we made it here we are good
		throw redirect(303, '/admin/parks?created=true');
	}
};
