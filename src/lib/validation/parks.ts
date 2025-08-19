import { z } from 'zod';

/**
 * Validation schema for creating a new national park
 */
export const createParkSchema = z.object({
	name: z
		.string()
		.min(1, 'Park name is required')
		.max(100, 'Park name must be less than 100 characters')
		.trim(),
	state: z
		.string()
		.min(2, 'State is required')
		.max(50, 'State must be less than 50 characters')
		.trim(),
	description: z
		.string()
		.max(2000, 'Description must be less than 2000 characters')
		.optional()
		.or(z.literal('')),
	latitude: z
		.number()
		.min(-90, 'Latitude must be between -90 and 90 degrees')
		.max(90, 'Latitude must be between -90 and 90 degrees')
		.optional(),
	longitude: z
		.number()
		.min(-180, 'Longitude must be between -180 and 180 degrees')
		.max(180, 'Longitude must be between -180 and 180 degrees')
		.optional(),
	establishedDate: z.date().max(new Date(), 'Established date cannot be in the future').optional(),
	area: z
		.number()
		.positive('Area must be a positive number')
		.max(1000000, 'Area seems unreasonably large')
		.optional()
});

/**
 * Validation schema for updating an existing national park
 */
export const updateParkSchema = createParkSchema.partial().extend({
	id: z.number().positive('Invalid park ID')
});

/**
 * Form validation schema for park creation (handles string inputs from forms)
 */
export const createParkFormSchema = z.object({
	name: z
		.string()
		.min(1, 'Park name is required')
		.max(100, 'Park name must be less than 100 characters')
		.trim(),
	state: z
		.string()
		.min(2, 'State is required')
		.max(50, 'State must be less than 50 characters')
		.trim(),
	description: z
		.string()
		.max(2000, 'Description must be less than 2000 characters')
		.optional()
		.or(z.literal('')),
	latitude: z
		.string()
		.optional()
		.transform((val) => {
			if (!val || val.trim() === '') return undefined;
			const num = parseFloat(val);
			if (isNaN(num)) throw new Error('Invalid latitude format');
			return num;
		})
		.pipe(
			z
				.number()
				.min(-90, 'Latitude must be between -90 and 90 degrees')
				.max(90, 'Latitude must be between -90 and 90 degrees')
				.optional()
		),
	longitude: z
		.string()
		.optional()
		.transform((val) => {
			if (!val || val.trim() === '') return undefined;
			const num = parseFloat(val);
			if (isNaN(num)) throw new Error('Invalid longitude format');
			return num;
		})
		.pipe(
			z
				.number()
				.min(-180, 'Longitude must be between -180 and 180 degrees')
				.max(180, 'Longitude must be between -180 and 180 degrees')
				.optional()
		),
	establishedDate: z
		.string()
		.optional()
		.transform((val) => {
			if (!val || val.trim() === '') return undefined;
			const date = new Date(val);
			if (isNaN(date.getTime())) throw new Error('Invalid date format');
			return date;
		})
		.pipe(z.date().max(new Date(), 'Established date cannot be in the future').optional()),
	area: z
		.string()
		.optional()
		.transform((val) => {
			if (!val || val.trim() === '') return undefined;
			const num = parseFloat(val);
			if (isNaN(num)) throw new Error('Invalid area format');
			return num;
		})
		.pipe(
			z
				.number()
				.positive('Area must be a positive number')
				.max(1000000, 'Area seems unreasonably large')
				.optional()
		)
});

/**
 * Form validation schema for park updates (handles string inputs from forms)
 */
export const updateParkFormSchema = createParkFormSchema.partial().extend({
	id: z
		.string()
		.transform((val) => {
			const num = parseInt(val, 10);
			if (isNaN(num)) throw new Error('Invalid park ID');
			return num;
		})
		.pipe(z.number().positive('Invalid park ID'))
});

/**
 * Search query validation schema
 */
export const searchParksSchema = z.object({
	query: z
		.string()
		.min(1, 'Search query is required')
		.max(100, 'Search query must be less than 100 characters')
		.trim()
});

/**
 * Coordinate validation helper
 */
export const coordinateSchema = z.object({
	latitude: z
		.number()
		.min(-90, 'Latitude must be between -90 and 90 degrees')
		.max(90, 'Latitude must be between -90 and 90 degrees'),
	longitude: z
		.number()
		.min(-180, 'Longitude must be between -180 and 180 degrees')
		.max(180, 'Longitude must be between -180 and 180 degrees')
});

/**
 * Type definitions inferred from schemas
 */
export type CreateParkInput = z.infer<typeof createParkSchema>;
export type UpdateParkInput = z.infer<typeof updateParkSchema>;
export type CreateParkFormInput = z.infer<typeof createParkFormSchema>;
export type UpdateParkFormInput = z.infer<typeof updateParkFormSchema>;
export type SearchParksInput = z.infer<typeof searchParksSchema>;
export type CoordinateInput = z.infer<typeof coordinateSchema>;

/**
 * Validation helper functions
 */
export function validateCreatePark(data: unknown): CreateParkInput {
	return createParkSchema.parse(data);
}

export function validateUpdatePark(data: unknown): UpdateParkInput {
	return updateParkSchema.parse(data);
}

export function validateCreateParkForm(data: unknown): CreateParkFormInput {
	return createParkFormSchema.parse(data);
}

export function validateUpdateParkForm(data: unknown): UpdateParkFormInput {
	return updateParkFormSchema.parse(data);
}

export function validateSearchParks(data: unknown): SearchParksInput {
	return searchParksSchema.parse(data);
}

export function validateCoordinates(data: unknown): CoordinateInput {
	return coordinateSchema.parse(data);
}

/**
 * Safe validation functions that return results instead of throwing
 */
export function safeValidateCreatePark(data: unknown) {
	return createParkSchema.safeParse(data);
}

export function safeValidateUpdatePark(data: unknown) {
	return updateParkSchema.safeParse(data);
}

export function safeValidateCreateParkForm(data: unknown) {
	return createParkFormSchema.safeParse(data);
}

export function safeValidateUpdateParkForm(data: unknown) {
	return updateParkFormSchema.safeParse(data);
}

export function safeValidateSearchParks(data: unknown) {
	return searchParksSchema.safeParse(data);
}

export function safeValidateCoordinates(data: unknown) {
	return coordinateSchema.safeParse(data);
}
