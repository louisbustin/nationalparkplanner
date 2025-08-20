import { error, fail, redirect } from '@sveltejs/kit';
import { requireAdmin, extractUserFromSession } from '$lib/server/auth/admin.js';
import { airportsRepository } from '$lib/server/db/airports.js';
import { validateSession } from '$lib/auth-utils.server.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async (event) => {
	// Validate the current session
	const sessionResult = await validateSession(event);
	const user = extractUserFromSession(sessionResult.session);

	// Require admin access
	requireAdmin(user);

	const airportId = parseInt(event.params.id);

	if (isNaN(airportId)) {
		throw error(400, 'Invalid airport ID');
	}

	try {
		const airport = await airportsRepository.getAirportById(airportId);

		if (!airport) {
			throw error(404, 'Airport not found');
		}

		return {
			airport
		};
	} catch (err) {
		// If it's already an error response, re-throw it
		if (err instanceof Response) {
			throw err;
		}

		console.error('Failed to load airport:', err);
		throw error(500, 'Failed to load airport data');
	}
};

export const actions: Actions = {
	delete: async (event) => {
		// Validate the current session
		const sessionResult = await validateSession(event);
		const user = extractUserFromSession(sessionResult.session);

		// Require admin access
		requireAdmin(user);

		const airportId = parseInt(event.params.id);

		if (isNaN(airportId)) {
			return fail(400, {
				message: 'Invalid airport ID'
			});
		}
		// Redirect to airports list with success message including airport details
		const redirectUrl = new URL('/admin/airports', event.url.origin);
		try {
			// Check if the airport exists
			const existingAirport = await airportsRepository.getAirportById(airportId);

			if (!existingAirport) {
				return fail(404, {
					message: 'Airport not found'
				});
			}

			// Store airport details for success message before deletion
			const airportCode = existingAirport.iataCode;
			const airportName = existingAirport.name;

			// TODO: Add check for associated trip data when trip functionality is implemented
			// For now, we'll proceed with deletion as there are no trip tables yet
			// Future implementation should check for:
			// - Trip itineraries that reference this airport
			// - User bookmarks or saved airports
			// - Any other features that might reference airports

			// Delete the airport
			await airportsRepository.deleteAirport(airportId);

			redirectUrl.searchParams.set('deleted', 'true');
			redirectUrl.searchParams.set('code', airportCode);
			redirectUrl.searchParams.set('name', encodeURIComponent(airportName));
		} catch (err) {
			// If it's a redirect, re-throw it
			if (err instanceof Response) {
				throw err;
			}

			console.error('Failed to delete airport:', err);

			return fail(500, {
				message: 'Failed to delete airport. Please try again.'
			});
		}

		throw redirect(303, redirectUrl.toString());
	}
};
