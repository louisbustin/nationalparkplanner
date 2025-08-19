import type { PageServerLoad } from './$types';
import { parksRepository } from '$lib/server/db/parks';

const PARKS_PER_PAGE = 20;

/**
 * Server-side load function for the admin parks list page
 * Handles parks data loading, search functionality, and pagination
 */
export const load: PageServerLoad = async ({ url }) => {
	try {
		// Get search query from URL parameters
		const searchQuery = url.searchParams.get('search')?.trim() || '';

		// Get page number from URL parameters (default to 1)
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));

		let parks;
		let totalParks = 0;

		if (searchQuery) {
			// If there's a search query, use the search method
			parks = await parksRepository.searchParks(searchQuery);
			totalParks = parks.length;

			// Apply pagination to search results
			const startIndex = (page - 1) * PARKS_PER_PAGE;
			const endIndex = startIndex + PARKS_PER_PAGE;
			parks = parks.slice(startIndex, endIndex);
		} else {
			// If no search query, get all parks
			const allParks = await parksRepository.getAllParks();
			totalParks = allParks.length;

			// Apply pagination
			const startIndex = (page - 1) * PARKS_PER_PAGE;
			const endIndex = startIndex + PARKS_PER_PAGE;
			parks = allParks.slice(startIndex, endIndex);
		}

		// Calculate pagination info
		const totalPages = Math.ceil(totalParks / PARKS_PER_PAGE);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return {
			parks,
			pagination: {
				currentPage: page,
				totalPages,
				totalParks,
				parksPerPage: PARKS_PER_PAGE,
				hasNextPage,
				hasPrevPage,
				startIndex: (page - 1) * PARKS_PER_PAGE + 1,
				endIndex: Math.min(page * PARKS_PER_PAGE, totalParks)
			},
			searchQuery
		};
	} catch (error) {
		console.error('Failed to load parks:', error);

		// Return empty state on error
		return {
			parks: [],
			pagination: {
				currentPage: 1,
				totalPages: 0,
				totalParks: 0,
				parksPerPage: PARKS_PER_PAGE,
				hasNextPage: false,
				hasPrevPage: false,
				startIndex: 0,
				endIndex: 0
			},
			searchQuery: '',
			error: 'Failed to load parks. Please try again.'
		};
	}
};
