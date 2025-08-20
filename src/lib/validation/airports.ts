import { z } from 'zod';

/**
 * Validation schema for creating a new airport
 */
export const createAirportSchema = z.object({
	iataCode: z
		.string()
		.length(3, 'IATA code must be exactly 3 characters')
		.regex(/^[A-Z]{3}$/, 'IATA code must be 3 uppercase letters')
		.trim(),
	icaoCode: z
		.string()
		.length(4, 'ICAO code must be exactly 4 characters')
		.regex(/^[A-Z]{4}$/, 'ICAO code must be 4 uppercase letters')
		.optional()
		.or(z.literal('')),
	name: z
		.string()
		.min(1, 'Airport name is required')
		.max(200, 'Airport name must be less than 200 characters')
		.trim(),
	city: z
		.string()
		.min(1, 'City is required')
		.max(100, 'City must be less than 100 characters')
		.trim(),
	state: z.string().max(100, 'State must be less than 100 characters').optional().or(z.literal('')),
	country: z
		.string()
		.min(1, 'Country is required')
		.max(100, 'Country must be less than 100 characters')
		.trim(),
	latitude: z
		.number()
		.min(-90, 'Latitude must be between -90 and 90 degrees')
		.max(90, 'Latitude must be between -90 and 90 degrees'),
	longitude: z
		.number()
		.min(-180, 'Longitude must be between -180 and 180 degrees')
		.max(180, 'Longitude must be between -180 and 180 degrees'),
	elevation: z
		.number()
		.int('Elevation must be a whole number')
		.min(-1500, 'Elevation seems unreasonably low')
		.max(30000, 'Elevation seems unreasonably high')
		.optional(),
	timezone: z
		.string()
		.max(50, 'Timezone must be less than 50 characters')
		.regex(/^[A-Za-z_/]+$/, 'Invalid timezone format')
		.optional()
		.or(z.literal(''))
});

/**
 * Validation schema for updating an existing airport
 */
export const updateAirportSchema = createAirportSchema.partial().extend({
	id: z.number().positive('Invalid airport ID')
});

/**
 * Form validation schema for airport creation (handles string inputs from forms)
 */
export const createAirportFormSchema = z.object({
	iataCode: z
		.string()
		.min(1, 'IATA code is required')
		.transform((val) => val.trim().toUpperCase())
		.pipe(
			z
				.string()
				.length(3, 'IATA code must be exactly 3 characters')
				.regex(/^[A-Z]{3}$/, 'IATA code must be 3 uppercase letters')
		),
	icaoCode: z
		.string()
		.optional()
		.transform((val) => {
			if (!val || val.trim() === '') return undefined;
			return val.trim().toUpperCase();
		})
		.pipe(
			z
				.string()
				.length(4, 'ICAO code must be exactly 4 characters')
				.regex(/^[A-Z]{4}$/, 'ICAO code must be 4 uppercase letters')
				.optional()
		),
	name: z
		.string()
		.min(1, 'Airport name is required')
		.max(200, 'Airport name must be less than 200 characters')
		.trim(),
	city: z
		.string()
		.min(1, 'City is required')
		.max(100, 'City must be less than 100 characters')
		.trim(),
	state: z
		.string()
		.max(100, 'State must be less than 100 characters')
		.optional()
		.or(z.literal(''))
		.transform((val) => {
			if (!val || val.trim() === '') return undefined;
			return val.trim();
		}),
	country: z
		.string()
		.min(1, 'Country is required')
		.max(100, 'Country must be less than 100 characters')
		.trim(),
	latitude: z
		.string()
		.min(1, 'Latitude is required')
		.transform((val) => {
			const num = parseFloat(val);
			if (isNaN(num)) throw new Error('Invalid latitude format');
			return num;
		})
		.pipe(
			z
				.number()
				.min(-90, 'Latitude must be between -90 and 90 degrees')
				.max(90, 'Latitude must be between -90 and 90 degrees')
		),
	longitude: z
		.string()
		.min(1, 'Longitude is required')
		.transform((val) => {
			const num = parseFloat(val);
			if (isNaN(num)) throw new Error('Invalid longitude format');
			return num;
		})
		.pipe(
			z
				.number()
				.min(-180, 'Longitude must be between -180 and 180 degrees')
				.max(180, 'Longitude must be between -180 and 180 degrees')
		),
	elevation: z
		.string()
		.optional()
		.transform((val) => {
			if (!val || val.trim() === '') return undefined;
			const num = parseInt(val, 10);
			if (isNaN(num)) throw new Error('Invalid elevation format');
			return num;
		})
		.pipe(
			z
				.number()
				.int('Elevation must be a whole number')
				.min(-1500, 'Elevation seems unreasonably low')
				.max(30000, 'Elevation seems unreasonably high')
				.optional()
		),
	timezone: z
		.string()
		.max(50, 'Timezone must be less than 50 characters')
		.optional()
		.or(z.literal(''))
		.transform((val) => {
			if (!val || val.trim() === '') return undefined;
			return val.trim();
		})
		.pipe(
			z
				.string()
				.regex(/^[A-Za-z_/]+$/, 'Invalid timezone format')
				.optional()
		)
});

/**
 * Form validation schema for airport updates (handles string inputs from forms)
 */
export const updateAirportFormSchema = createAirportFormSchema.partial().extend({
	id: z
		.string()
		.transform((val) => {
			const num = parseInt(val, 10);
			if (isNaN(num)) throw new Error('Invalid airport ID');
			return num;
		})
		.pipe(z.number().positive('Invalid airport ID'))
});

/**
 * Search query validation schema
 */
export const searchAirportsSchema = z.object({
	query: z
		.string()
		.min(1, 'Search query is required')
		.max(100, 'Search query must be less than 100 characters')
		.trim()
});

/**
 * IATA code validation schema
 */
export const iataCodeSchema = z
	.string()
	.length(3, 'IATA code must be exactly 3 characters')
	.regex(/^[A-Z]{3}$/, 'IATA code must be 3 uppercase letters');

/**
 * ICAO code validation schema
 */
export const icaoCodeSchema = z
	.string()
	.length(4, 'ICAO code must be exactly 4 characters')
	.regex(/^[A-Z]{4}$/, 'ICAO code must be 4 uppercase letters');

/**
 * Coordinate validation helper for airports
 */
export const airportCoordinateSchema = z.object({
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
export type CreateAirportInput = z.infer<typeof createAirportSchema>;
export type UpdateAirportInput = z.infer<typeof updateAirportSchema>;
export type CreateAirportFormInput = z.infer<typeof createAirportFormSchema>;
export type UpdateAirportFormInput = z.infer<typeof updateAirportFormSchema>;
export type SearchAirportsInput = z.infer<typeof searchAirportsSchema>;
export type AirportCoordinateInput = z.infer<typeof airportCoordinateSchema>;

/**
 * Validation helper functions
 */
export function validateCreateAirport(data: unknown): CreateAirportInput {
	return createAirportSchema.parse(data);
}

export function validateUpdateAirport(data: unknown): UpdateAirportInput {
	return updateAirportSchema.parse(data);
}

export function validateCreateAirportForm(data: unknown): CreateAirportFormInput {
	return createAirportFormSchema.parse(data);
}

export function validateUpdateAirportForm(data: unknown): UpdateAirportFormInput {
	return updateAirportFormSchema.parse(data);
}

export function validateSearchAirports(data: unknown): SearchAirportsInput {
	return searchAirportsSchema.parse(data);
}

export function validateAirportCoordinates(data: unknown): AirportCoordinateInput {
	return airportCoordinateSchema.parse(data);
}

export function validateIataCode(code: string): string {
	return iataCodeSchema.parse(code.toUpperCase());
}

export function validateIcaoCode(code: string): string {
	return icaoCodeSchema.parse(code.toUpperCase());
}

/**
 * Safe validation functions that return results instead of throwing
 */
export function safeValidateCreateAirport(data: unknown) {
	return createAirportSchema.safeParse(data);
}

export function safeValidateUpdateAirport(data: unknown) {
	return updateAirportSchema.safeParse(data);
}

export function safeValidateCreateAirportForm(data: unknown) {
	return createAirportFormSchema.safeParse(data);
}

export function safeValidateUpdateAirportForm(data: unknown) {
	return updateAirportFormSchema.safeParse(data);
}

export function safeValidateSearchAirports(data: unknown) {
	return searchAirportsSchema.safeParse(data);
}

export function safeValidateAirportCoordinates(data: unknown) {
	return airportCoordinateSchema.safeParse(data);
}

export function safeValidateIataCode(code: string) {
	return iataCodeSchema.safeParse(code.toUpperCase());
}

export function safeValidateIcaoCode(code: string) {
	return icaoCodeSchema.safeParse(code.toUpperCase());
}
