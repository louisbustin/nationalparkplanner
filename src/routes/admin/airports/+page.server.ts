import type { PageServerLoad } from './$types';
import { airportsRepository } from '$lib/server/db/airports';

export const load: PageServerLoad = async ({ url }) => {
	try {
		// Get search query from URL parameters
		const searchQuery = url.searchParams.get('search') || '';

		// Load airports based on search query
		let airports;
		if (searchQuery.trim()) {
			airports = await airportsRepository.searchAirports(searchQuery.trim());
		} else {
			airports = await airportsRepository.getAllAirports();
		}

		return {
			airports,
			searchQuery
		};
	} catch (error) {
		console.error('Failed to load airports:', error);
		return {
			airports: [],
			searchQuery: '',
			error: 'Failed to load airports. Please try again.'
		};
	}
};
