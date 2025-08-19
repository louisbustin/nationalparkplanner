import { error, fail, redirect } from '@sveltejs/kit';
import { requireAdmin, extractUserFromSession } from '$lib/server/auth/admin.js';
import { parksRepository } from '$lib/server/db/parks.js';
import { safeValidateUpdateParkForm } from '$lib/validation/parks.js';
import { validateSession } from '$lib/auth-utils.server.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async (event) => {
	// Validate the current session
	const sessionResult = await validateSession(event);
	const user = extractUserFromSession(sessionResult.session);

	// Require admin access
	requireAdmin(user);

	// Get park ID from URL parameters
	const parkId = parseInt(event.params.id);
	if (isNaN(parkId)) {
		throw error(400, 'Invalid park ID');
	}

	try {
		// Load the park data
		const park = await parksRepository.getParkById(parkId);

		if (!park) {
			throw error(404, 'Park not found');
		}

		// Convert database values back to form-friendly format
		const formData = {
			id: park.id.toString(),
			name: park.name,
			state: park.state,
			description: park.description || '',
			latitude: park.latitude || '',
			longitude: park.longitude || '',
			establishedDate: park.establishedDate || '',
			area: park.area || ''
		};

		return {
			park,
			formData
		};
	} catch (err) {
		// If it's already an error response, re-throw it
		if (err instanceof Response) {
			throw err;
		}

		console.error('Failed to load park for editing:', err);
		throw error(500, 'Failed to load park data');
	}
};

export const actions: Actions = {
	update: async (event) => {
		// Validate the current session
		const sessionResult = await validateSession(event);
		const user = extractUserFromSession(sessionResult.session);

		// Require admin access
		requireAdmin(user);

		// Get park ID from URL parameters
		const parkId = parseInt(event.params.id);
		if (isNaN(parkId)) {
			throw error(400, 'Invalid park ID');
		}

		const formData = await event.request.formData();
		const data = Object.fromEntries(formData);

		// Add the park ID to the form data for validation
		data.id = parkId.toString();

		// Validate form data
		const validation = safeValidateUpdateParkForm(data);

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
			// Check if park exists
			const existingPark = await parksRepository.getParkById(parkId);
			if (!existingPark) {
				throw error(404, 'Park not found');
			}

			// Check if another park with the same name exists in the same state (excluding current park)
			if (validatedData.name && validatedData.state) {
				const exists = await parksRepository.parkExistsInState(
					validatedData.name,
					validatedData.state,
					parkId
				);

				if (exists) {
					return fail(400, {
						fieldErrors: {
							name: 'A park with this name already exists in this state'
						},
						formData: data
					});
				}
			}

			// Update the park
			await parksRepository.updatePark({
				id: parkId,
				name: validatedData.name,
				state: validatedData.state,
				description: validatedData.description || undefined,
				latitude: validatedData.latitude,
				longitude: validatedData.longitude,
				establishedDate: validatedData.establishedDate,
				area: validatedData.area
			});
		} catch (error) {
			// If it's a redirect or error response, re-throw it
			if (error instanceof Response) {
				throw error;
			}

			console.error('Failed to update park:', error);

			return fail(500, {
				message: 'Failed to update park. Please try again.',
				formData: data
			});
		}
		// Redirect to parks list with success message
		throw redirect(303, '/admin/parks?updated=true');
	}
};
