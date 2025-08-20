import { eq, ilike, or, ne, and } from 'drizzle-orm';
import { db } from './index.js';
import { airports } from './schema.js';

export interface CreateAirportData {
	iataCode: string;
	icaoCode?: string;
	name: string;
	city: string;
	state?: string;
	country: string;
	latitude: number;
	longitude: number;
	elevation?: number;
	timezone?: string;
}

export interface UpdateAirportData extends Partial<CreateAirportData> {
	id: number;
}

export type Airport = typeof airports.$inferSelect;

export class AirportsRepository {
	/**
	 * Get all airports, ordered by name
	 */
	async getAllAirports(): Promise<Airport[]> {
		try {
			return await db.select().from(airports).orderBy(airports.name);
		} catch (error) {
			throw new Error(
				`Failed to fetch airports: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Get an airport by ID
	 */
	async getAirportById(id: number): Promise<Airport | null> {
		try {
			const result = await db.select().from(airports).where(eq(airports.id, id));
			return result[0] || null;
		} catch (error) {
			throw new Error(
				`Failed to fetch airport with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Get an airport by IATA code
	 */
	async getAirportByIataCode(iataCode: string): Promise<Airport | null> {
		try {
			const result = await db
				.select()
				.from(airports)
				.where(eq(airports.iataCode, iataCode.toUpperCase()));
			return result[0] || null;
		} catch (error) {
			throw new Error(
				`Failed to fetch airport with IATA code ${iataCode}: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Create a new airport
	 */
	async createAirport(data: CreateAirportData): Promise<Airport> {
		try {
			const now = new Date();
			const result = await db
				.insert(airports)
				.values({
					iataCode: data.iataCode.toUpperCase(),
					icaoCode: data.icaoCode?.toUpperCase(),
					name: data.name,
					city: data.city,
					state: data.state,
					country: data.country,
					latitude: data.latitude.toString(),
					longitude: data.longitude.toString(),
					elevation: data.elevation,
					timezone: data.timezone,
					createdAt: now,
					updatedAt: now
				})
				.returning();

			return result[0];
		} catch (error) {
			throw new Error(
				`Failed to create airport: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Update an existing airport
	 */
	async updateAirport(data: UpdateAirportData): Promise<Airport> {
		try {
			const { id, ...updateData } = data;
			const now = new Date();

			const updateValues: Record<string, unknown> = {
				updatedAt: now
			};

			if (updateData.iataCode !== undefined)
				updateValues.iataCode = updateData.iataCode.toUpperCase();
			if (updateData.icaoCode !== undefined)
				updateValues.icaoCode = updateData.icaoCode?.toUpperCase();
			if (updateData.name !== undefined) updateValues.name = updateData.name;
			if (updateData.city !== undefined) updateValues.city = updateData.city;
			if (updateData.state !== undefined) updateValues.state = updateData.state;
			if (updateData.country !== undefined) updateValues.country = updateData.country;
			if (updateData.latitude !== undefined) updateValues.latitude = updateData.latitude.toString();
			if (updateData.longitude !== undefined)
				updateValues.longitude = updateData.longitude.toString();
			if (updateData.elevation !== undefined) updateValues.elevation = updateData.elevation;
			if (updateData.timezone !== undefined) updateValues.timezone = updateData.timezone;

			const result = await db
				.update(airports)
				.set(updateValues)
				.where(eq(airports.id, id))
				.returning();

			if (result.length === 0) {
				throw new Error(`Airport with ID ${id} not found`);
			}

			return result[0];
		} catch (error) {
			throw new Error(
				`Failed to update airport: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Delete an airport by ID
	 */
	async deleteAirport(id: number): Promise<void> {
		try {
			const result = await db.delete(airports).where(eq(airports.id, id)).returning();

			if (result.length === 0) {
				throw new Error(`Airport with ID ${id} not found`);
			}
		} catch (error) {
			throw new Error(
				`Failed to delete airport: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Search airports by IATA code, name, city, state, or country
	 */
	async searchAirports(query: string): Promise<Airport[]> {
		try {
			const searchTerm = `%${query}%`;
			const upperQuery = `%${query.toUpperCase()}%`;

			return await db
				.select()
				.from(airports)
				.where(
					or(
						ilike(airports.iataCode, upperQuery),
						ilike(airports.icaoCode, upperQuery),
						ilike(airports.name, searchTerm),
						ilike(airports.city, searchTerm),
						ilike(airports.state, searchTerm),
						ilike(airports.country, searchTerm)
					)
				)
				.orderBy(airports.name);
		} catch (error) {
			throw new Error(
				`Failed to search airports: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Check if an airport with the same IATA code exists
	 */
	async airportExistsByIataCode(iataCode: string, excludeId?: number): Promise<boolean> {
		try {
			const conditions = [eq(airports.iataCode, iataCode.toUpperCase())];

			if (excludeId) {
				conditions.push(ne(airports.id, excludeId));
			}

			const result = await db
				.select({ id: airports.id })
				.from(airports)
				.where(and(...conditions));

			return result.length > 0;
		} catch (error) {
			throw new Error(
				`Failed to check airport existence by IATA code: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Check if an airport with the same ICAO code exists
	 */
	async airportExistsByIcaoCode(icaoCode: string, excludeId?: number): Promise<boolean> {
		try {
			if (!icaoCode) return false;

			const conditions = [eq(airports.icaoCode, icaoCode.toUpperCase())];

			if (excludeId) {
				conditions.push(ne(airports.id, excludeId));
			}

			const result = await db
				.select({ id: airports.id })
				.from(airports)
				.where(and(...conditions));

			return result.length > 0;
		} catch (error) {
			throw new Error(
				`Failed to check airport existence by ICAO code: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}
}

// Export a singleton instance
export const airportsRepository = new AirportsRepository();
