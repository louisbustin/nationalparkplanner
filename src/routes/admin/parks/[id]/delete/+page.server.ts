import { error, redirect } from '@sveltejs/kit';
import { parksRepository } from '$lib/server/db/parks.js';
import { requireAdmin, extractUserFromSession } from '$lib/server/auth/admin.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Check admin authorization
	const user = extractUserFromSession(locals.session);
	requireAdmin(user);

	const parkId = parseInt(params.id);
	if (isNaN(parkId)) {
		throw error(404, 'Park not found');
	}

	try {
		const park = await parksRepository.getParkById(parkId);
		if (!park) {
			throw error(404, 'Park not found');
		}

		return {
			park
		};
	} catch (err) {
		if (err instanceof Error && err.message.includes('not found')) {
			throw error(404, 'Park not found');
		}
		throw error(500, 'Failed to load park data');
	}
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		// Check admin authorization
		const user = extractUserFromSession(locals.session);
		requireAdmin(user);

		const parkId = parseInt(params.id);
		if (isNaN(parkId)) {
			throw error(404, 'Park not found');
		}

		try {
			// First verify the park exists
			const park = await parksRepository.getParkById(parkId);
			if (!park) {
				throw error(404, 'Park not found');
			}

			// TODO: Add checks for associated trip data before deletion
			// This would be implemented when trip functionality is added
			// For now, we'll proceed with deletion as no trip system exists yet

			// Perform the deletion
			await parksRepository.deletePark(parkId);
		} catch (err) {
			if (err instanceof Error) {
				if (err.message.includes('not found')) {
					throw error(404, 'Park not found');
				}
				// Check for foreign key constraint violations (future trip associations)
				if (err.message.includes('foreign key') || err.message.includes('constraint')) {
					throw error(400, 'Cannot delete park: it has associated trip data');
				}
			}
			throw error(500, 'Failed to delete park');
		}
		// Redirect to parks list with success message
		throw redirect(303, '/admin/parks?deleted=true');
	}
};
