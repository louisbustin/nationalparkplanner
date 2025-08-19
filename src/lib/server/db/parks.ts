import { eq, ilike, or, ne, and } from 'drizzle-orm';
import { db } from './index.js';
import { nationalParks } from './schema.js';

export interface CreateParkData {
	name: string;
	state: string;
	description?: string;
	latitude?: number;
	longitude?: number;
	establishedDate?: Date;
	area?: number;
}

export interface UpdateParkData extends Partial<CreateParkData> {
	id: number;
}

export type NationalPark = typeof nationalParks.$inferSelect;

export class ParksRepository {
	/**
	 * Get all national parks, ordered by name
	 */
	async getAllParks(): Promise<NationalPark[]> {
		try {
			return await db.select().from(nationalParks).orderBy(nationalParks.name);
		} catch (error) {
			throw new Error(
				`Failed to fetch parks: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Get a national park by ID
	 */
	async getParkById(id: number): Promise<NationalPark | null> {
		try {
			const result = await db.select().from(nationalParks).where(eq(nationalParks.id, id));
			return result[0] || null;
		} catch (error) {
			throw new Error(
				`Failed to fetch park with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Create a new national park
	 */
	async createPark(data: CreateParkData): Promise<NationalPark> {
		try {
			const now = new Date();
			const result = await db
				.insert(nationalParks)
				.values({
					name: data.name,
					state: data.state,
					description: data.description,
					latitude: data.latitude?.toString(),
					longitude: data.longitude?.toString(),
					establishedDate: data.establishedDate?.toISOString().split('T')[0],
					area: data.area?.toString(),
					createdAt: now,
					updatedAt: now
				})
				.returning();

			return result[0];
		} catch (error) {
			throw new Error(
				`Failed to create park: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Update an existing national park
	 */
	async updatePark(data: UpdateParkData): Promise<NationalPark> {
		try {
			const { id, ...updateData } = data;
			const now = new Date();

			const updateValues: Record<string, unknown> = {
				updatedAt: now
			};

			if (updateData.name !== undefined) updateValues.name = updateData.name;
			if (updateData.state !== undefined) updateValues.state = updateData.state;
			if (updateData.description !== undefined) updateValues.description = updateData.description;
			if (updateData.latitude !== undefined)
				updateValues.latitude = updateData.latitude?.toString();
			if (updateData.longitude !== undefined)
				updateValues.longitude = updateData.longitude?.toString();
			if (updateData.establishedDate !== undefined)
				updateValues.establishedDate = updateData.establishedDate?.toISOString().split('T')[0];
			if (updateData.area !== undefined) updateValues.area = updateData.area?.toString();

			const result = await db
				.update(nationalParks)
				.set(updateValues)
				.where(eq(nationalParks.id, id))
				.returning();

			if (result.length === 0) {
				throw new Error(`Park with ID ${id} not found`);
			}

			return result[0];
		} catch (error) {
			throw new Error(
				`Failed to update park: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Delete a national park by ID
	 */
	async deletePark(id: number): Promise<void> {
		try {
			const result = await db.delete(nationalParks).where(eq(nationalParks.id, id)).returning();

			if (result.length === 0) {
				throw new Error(`Park with ID ${id} not found`);
			}
		} catch (error) {
			throw new Error(
				`Failed to delete park: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Search parks by name or state
	 */
	async searchParks(query: string): Promise<NationalPark[]> {
		try {
			const searchTerm = `%${query}%`;
			return await db
				.select()
				.from(nationalParks)
				.where(or(ilike(nationalParks.name, searchTerm), ilike(nationalParks.state, searchTerm)))
				.orderBy(nationalParks.name);
		} catch (error) {
			throw new Error(
				`Failed to search parks: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Check if a park with the same name exists in the same state
	 */
	async parkExistsInState(name: string, state: string, excludeId?: number): Promise<boolean> {
		try {
			const conditions = [
				eq(nationalParks.name, name.trim()),
				eq(nationalParks.state, state.trim())
			];

			if (excludeId) {
				conditions.push(ne(nationalParks.id, excludeId));
			}

			const result = await db
				.select({ id: nationalParks.id })
				.from(nationalParks)
				.where(and(...conditions));

			return result.length > 0;
		} catch (error) {
			throw new Error(
				`Failed to check park existence: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}
}

// Export a singleton instance
export const parksRepository = new ParksRepository();
