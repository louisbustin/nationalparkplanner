import { error, fail, redirect } from '@sveltejs/kit';
import { requireAdmin, extractUserFromSession } from '$lib/server/auth/admin.js';
import { airportsRepository } from '$lib/server/db/airports.js';
import { safeValidateUpdateAirportForm } from '$lib/validation/airports.js';
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
	update: async (event) => {
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

		const formData = await event.request.formData();
		const data = Object.fromEntries(formData);

		// Add the ID to the form data for validation
		const dataWithId = { ...data, id: airportId.toString() };

		// Validate form data
		const validation = safeValidateUpdateAirportForm(dataWithId);

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

			// Check if airport with same IATA code already exists (excluding current airport)
			if (validatedData.iataCode) {
				const iataExists = await airportsRepository.airportExistsByIataCode(
					validatedData.iataCode,
					airportId
				);

				if (iataExists) {
					return fail(400, {
						fieldErrors: {
							iataCode: 'An airport with this IATA code already exists'
						},
						formData: data
					});
				}
			}

			// Check if airport with same ICAO code already exists (excluding current airport)
			if (validatedData.icaoCode) {
				const icaoExists = await airportsRepository.airportExistsByIcaoCode(
					validatedData.icaoCode,
					airportId
				);

				if (icaoExists) {
					return fail(400, {
						fieldErrors: {
							icaoCode: 'An airport with this ICAO code already exists'
						},
						formData: data
					});
				}
			}

			// Update the airport
			const updatedAirport = await airportsRepository.updateAirport({
				id: airportId,
				iataCode: validatedData.iataCode,
				icaoCode: validatedData.icaoCode,
				name: validatedData.name,
				city: validatedData.city,
				state: validatedData.state,
				country: validatedData.country,
				latitude: validatedData.latitude,
				longitude: validatedData.longitude,
				elevation: validatedData.elevation,
				timezone: validatedData.timezone
			});

			redirectUrl.searchParams.set('updated', 'true');
			redirectUrl.searchParams.set('code', updatedAirport.iataCode);
			redirectUrl.searchParams.set('name', encodeURIComponent(updatedAirport.name));
		} catch (err) {
			// If it's a redirect, re-throw it
			if (err instanceof Response) {
				throw err;
			}

			console.error('Failed to update airport:', err);

			return fail(500, {
				message: 'Failed to update airport. Please try again.',
				formData: data
			});
		}

		throw redirect(303, redirectUrl.toString());
	}
};
