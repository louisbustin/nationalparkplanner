import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { inArray } from 'drizzle-orm';
import { db } from './index.js';
import { nationalParks } from './schema.js';
import { ParksRepository, type CreateParkData, type UpdateParkData } from './parks.js';

describe('ParksRepository', () => {
	let repository: ParksRepository;
	let testParkIds: number[] = [];

	beforeEach(() => {
		repository = new ParksRepository();
		testParkIds = [];
	});

	afterEach(async () => {
		// Clean up test data
		if (testParkIds.length > 0) {
			await db.delete(nationalParks).where(inArray(nationalParks.id, testParkIds));
		}
	});

	describe('createPark', () => {
		it('should create a park with all fields', async () => {
			const parkData: CreateParkData = {
				name: 'Test Park',
				state: 'California',
				description: 'A beautiful test park',
				latitude: 37.7749,
				longitude: -122.4194,
				establishedDate: new Date('1872-03-01'),
				area: 1000.5
			};

			const result = await repository.createPark(parkData);
			testParkIds.push(result.id);

			expect(result).toMatchObject({
				name: 'Test Park',
				state: 'California',
				description: 'A beautiful test park',
				latitude: '37.77490000',
				longitude: '-122.41940000',
				establishedDate: '1872-03-01',
				area: '1000.50'
			});
			expect(result.id).toBeTypeOf('number');
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.updatedAt).toBeInstanceOf(Date);
		});

		it('should create a park with only required fields', async () => {
			const parkData: CreateParkData = {
				name: 'Minimal Park',
				state: 'Nevada'
			};

			const result = await repository.createPark(parkData);
			testParkIds.push(result.id);

			expect(result).toMatchObject({
				name: 'Minimal Park',
				state: 'Nevada',
				description: null,
				latitude: null,
				longitude: null,
				establishedDate: null,
				area: null
			});
			expect(result.id).toBeTypeOf('number');
		});

		it('should handle edge case data', async () => {
			const parkData: CreateParkData = {
				name: 'Edge Case Park',
				state: 'California'
			};

			const result = await repository.createPark(parkData);
			testParkIds.push(result.id);
			expect(result.name).toBe('Edge Case Park');
		});
	});

	describe('getAllParks', () => {
		it('should return all parks ordered by name', async () => {
			const result = await repository.getAllParks();
			expect(Array.isArray(result)).toBe(true);
			// Check that results are ordered by name if there are any
			if (result.length > 1) {
				for (let i = 1; i < result.length; i++) {
					expect(result[i].name >= result[i - 1].name).toBe(true);
				}
			}
		});

		it('should create and retrieve parks in correct order', async () => {
			// Create test parks
			const park1 = await repository.createPark({ name: 'Zion Park', state: 'Utah' });
			const park2 = await repository.createPark({ name: 'Arches Park', state: 'Utah' });
			testParkIds.push(park1.id, park2.id);

			const result = await repository.getAllParks();

			expect(result.length).toBeGreaterThanOrEqual(2);
			const testParks = result.filter((p) => testParkIds.includes(p.id));
			expect(testParks).toHaveLength(2);

			// Find our test parks in the ordered result
			const archesIndex = testParks.findIndex((p) => p.name === 'Arches Park');
			const zionIndex = testParks.findIndex((p) => p.name === 'Zion Park');
			expect(archesIndex).toBeLessThan(zionIndex);
		});
	});

	describe('getParkById', () => {
		it('should return park when it exists', async () => {
			const created = await repository.createPark({ name: 'Test Park', state: 'California' });
			testParkIds.push(created.id);

			const result = await repository.getParkById(created.id);

			expect(result).toMatchObject({
				id: created.id,
				name: 'Test Park',
				state: 'California'
			});
		});

		it('should return null when park does not exist', async () => {
			const result = await repository.getParkById(99999);
			expect(result).toBeNull();
		});

		it('should handle negative ID', async () => {
			const result = await repository.getParkById(-1);
			expect(result).toBeNull();
		});
	});

	describe('updatePark', () => {
		it('should update all fields of an existing park', async () => {
			const created = await repository.createPark({ name: 'Original Park', state: 'California' });
			testParkIds.push(created.id);

			const updateData: UpdateParkData = {
				id: created.id,
				name: 'Updated Park',
				state: 'Nevada',
				description: 'Updated description',
				latitude: 36.1699,
				longitude: -115.1398,
				establishedDate: new Date('1900-01-01'),
				area: 2000.75
			};

			const result = await repository.updatePark(updateData);

			expect(result).toMatchObject({
				id: created.id,
				name: 'Updated Park',
				state: 'Nevada',
				description: 'Updated description',
				latitude: '36.16990000',
				longitude: '-115.13980000',
				establishedDate: '1900-01-01',
				area: '2000.75'
			});
			expect(result.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
		});

		it('should update only specified fields', async () => {
			const created = await repository.createPark({
				name: 'Original Park',
				state: 'California',
				description: 'Original description'
			});
			testParkIds.push(created.id);

			const updateData: UpdateParkData = {
				id: created.id,
				name: 'Updated Name Only'
			};

			const result = await repository.updatePark(updateData);

			expect(result.name).toBe('Updated Name Only');
			expect(result.state).toBe('California');
			expect(result.description).toBe('Original description');
		});

		it('should throw error when park does not exist', async () => {
			const updateData: UpdateParkData = {
				id: 99999,
				name: 'Non-existent Park'
			};

			await expect(repository.updatePark(updateData)).rejects.toThrow(
				'Park with ID 99999 not found'
			);
		});
	});

	describe('deletePark', () => {
		it('should delete an existing park', async () => {
			const created = await repository.createPark({ name: 'To Delete', state: 'California' });

			await repository.deletePark(created.id);

			const result = await repository.getParkById(created.id);
			expect(result).toBeNull();
		});

		it('should throw error when park does not exist', async () => {
			await expect(repository.deletePark(99999)).rejects.toThrow('Park with ID 99999 not found');
		});
	});

	describe('searchParks', () => {
		beforeEach(async () => {
			// Create test data for search
			const park1 = await repository.createPark({
				name: 'Yellowstone National Park',
				state: 'Wyoming'
			});
			const park2 = await repository.createPark({
				name: 'Yosemite National Park',
				state: 'California'
			});
			const park3 = await repository.createPark({
				name: 'Grand Canyon National Park',
				state: 'Arizona'
			});
			testParkIds.push(park1.id, park2.id, park3.id);
		});

		it('should search parks by name', async () => {
			const result = await repository.searchParks('Yellow');

			const matchingParks = result.filter((p) => testParkIds.includes(p.id));
			expect(matchingParks).toHaveLength(1);
			expect(matchingParks[0].name).toBe('Yellowstone National Park');
		});

		it('should search parks by state', async () => {
			const result = await repository.searchParks('California');

			const matchingParks = result.filter((p) => testParkIds.includes(p.id));
			expect(matchingParks).toHaveLength(1);
			expect(matchingParks[0].state).toBe('California');
		});

		it('should be case insensitive', async () => {
			const result = await repository.searchParks('YELLOW');

			const matchingParks = result.filter((p) => testParkIds.includes(p.id));
			expect(matchingParks).toHaveLength(1);
			expect(matchingParks[0].name).toBe('Yellowstone National Park');
		});

		it('should return empty array for no matches', async () => {
			const result = await repository.searchParks('NonExistentPark');

			const matchingParks = result.filter((p) => testParkIds.includes(p.id));
			expect(matchingParks).toHaveLength(0);
		});

		it('should return results ordered by name', async () => {
			const result = await repository.searchParks('National');

			const matchingParks = result.filter((p) => testParkIds.includes(p.id));
			expect(matchingParks.length).toBeGreaterThanOrEqual(3);

			// Check that results are ordered by name
			for (let i = 1; i < matchingParks.length; i++) {
				expect(matchingParks[i].name >= matchingParks[i - 1].name).toBe(true);
			}
		});
	});

	describe('parkExistsInState', () => {
		beforeEach(async () => {
			const park = await repository.createPark({
				name: 'Duplicate Test Park',
				state: 'California'
			});
			testParkIds.push(park.id);
		});

		it('should return true when park exists in state', async () => {
			const result = await repository.parkExistsInState('Duplicate Test Park', 'California');
			expect(result).toBe(true);
		});

		it('should return false when park does not exist in state', async () => {
			const result = await repository.parkExistsInState('Non-existent Park', 'California');
			expect(result).toBe(false);
		});

		it('should return false when park exists in different state', async () => {
			const result = await repository.parkExistsInState('Duplicate Test Park', 'Nevada');
			expect(result).toBe(false);
		});

		it('should exclude specified park ID', async () => {
			// Test with a unique name to avoid conflicts with existing data
			const uniqueName = `Unique Test Park ${Date.now()}`;
			const uniquePark = await repository.createPark({ name: uniqueName, state: 'California' });
			testParkIds.push(uniquePark.id);

			// Should find the park normally
			const normalResult = await repository.parkExistsInState(uniqueName, 'California');
			expect(normalResult).toBe(true);

			// Should not find the park when excluding its ID
			const excludedResult = await repository.parkExistsInState(
				uniqueName,
				'California',
				uniquePark.id
			);
			expect(excludedResult).toBe(false);
		});

		it('should be case sensitive for exact matches', async () => {
			const result = await repository.parkExistsInState('duplicate test park', 'California');
			expect(result).toBe(false);
		});

		it('should trim whitespace from inputs', async () => {
			const result = await repository.parkExistsInState(
				'  Duplicate Test Park  ',
				'  California  '
			);
			expect(result).toBe(true);
		});
	});

	describe('error handling', () => {
		it('should provide meaningful error messages', async () => {
			try {
				await repository.updatePark({ id: 99999, name: 'Test' });
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toContain('Park with ID 99999 not found');
			}
		});
	});

	describe('data integrity', () => {
		it('should maintain timestamps correctly', async () => {
			const created = await repository.createPark({ name: 'Timestamp Test', state: 'California' });
			testParkIds.push(created.id);

			expect(created.createdAt).toBeInstanceOf(Date);
			expect(created.updatedAt).toBeInstanceOf(Date);
			expect(created.createdAt.getTime()).toBeLessThanOrEqual(created.updatedAt.getTime());

			// Wait a bit to ensure different timestamp
			await new Promise((resolve) => setTimeout(resolve, 10));

			const updated = await repository.updatePark({
				id: created.id,
				name: 'Updated Timestamp Test'
			});
			expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
			expect(updated.createdAt.getTime()).toBe(created.createdAt.getTime());
		});

		it('should handle numeric precision correctly', async () => {
			const parkData: CreateParkData = {
				name: 'Precision Test',
				state: 'California',
				latitude: 37.12345678,
				longitude: -122.87654321,
				area: 1234.56
			};

			const result = await repository.createPark(parkData);
			testParkIds.push(result.id);

			expect(result.latitude).toBe('37.12345678');
			expect(result.longitude).toBe('-122.87654321');
			expect(result.area).toBe('1234.56');
		});

		it('should handle date formatting correctly', async () => {
			const establishedDate = new Date('1872-03-01T10:30:00Z');
			const parkData: CreateParkData = {
				name: 'Date Test',
				state: 'California',
				establishedDate
			};

			const result = await repository.createPark(parkData);
			testParkIds.push(result.id);

			expect(result.establishedDate).toBe('1872-03-01');
		});
	});
});
