import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin, extractUserFromSession } from '$lib/server/auth/admin.js';
import { airportsRepository } from '$lib/server/db/airports.js';
import { safeValidateCreateAirportForm } from '$lib/validation/airports.js';
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
		const validation = safeValidateCreateAirportForm(data);

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
			// Check if airport with same IATA code already exists
			const iataExists = await airportsRepository.airportExistsByIataCode(validatedData.iataCode);

			if (iataExists) {
				return fail(400, {
					fieldErrors: {
						iataCode: 'An airport with this IATA code already exists'
					},
					formData: data
				});
			}

			// Check if airport with same ICAO code already exists (if provided)
			if (validatedData.icaoCode) {
				const icaoExists = await airportsRepository.airportExistsByIcaoCode(validatedData.icaoCode);

				if (icaoExists) {
					return fail(400, {
						fieldErrors: {
							icaoCode: 'An airport with this ICAO code already exists'
						},
						formData: data
					});
				}
			}

			// Create the airport
			const createdAirport = await airportsRepository.createAirport({
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

			redirectUrl.searchParams.set('created', 'true');
			redirectUrl.searchParams.set('code', createdAirport.iataCode);
			redirectUrl.searchParams.set('name', encodeURIComponent(createdAirport.name));
		} catch (error) {
			// If it's a redirect, re-throw it
			if (error instanceof Response) {
				throw error;
			}

			console.error('Failed to create airport:', error);

			return fail(500, {
				message: 'Failed to create airport. Please try again.',
				formData: data
			});
		}

		throw redirect(303, redirectUrl.toString());
	}
};
