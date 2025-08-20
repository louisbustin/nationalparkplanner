import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { AirportsRepository, type CreateAirportData, type UpdateAirportData } from './airports.js';
import { db } from './index.js';
import { airports } from './schema.js';

// Mock the database
vi.mock('./index.js', () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

const mockDb = vi.mocked(db);

describe('AirportsRepository', () => {
	let repository: AirportsRepository;
	let mockAirport: {
		id: number;
		iataCode: string;
		icaoCode: string;
		name: string;
		city: string;
		state: string;
		country: string;
		latitude: string;
		longitude: string;
		elevation: number;
		timezone: string;
		createdAt: Date;
		updatedAt: Date;
	};

	beforeEach(() => {
		repository = new AirportsRepository();
		mockAirport = {
			id: 1,
			iataCode: 'LAX',
			icaoCode: 'KLAX',
			name: 'Los Angeles International Airport',
			city: 'Los Angeles',
			state: 'California',
			country: 'United States',
			latitude: '33.94250107',
			longitude: '-118.4081001',
			elevation: 125,
			timezone: 'America/Los_Angeles',
			createdAt: new Date('2024-01-01T00:00:00Z'),
			updatedAt: new Date('2024-01-01T00:00:00Z')
		};

		// Reset all mocks
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('getAllAirports', () => {
		it('should return all airports ordered by name', async () => {
			const mockAirports = [mockAirport];
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockAirports)
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.getAllAirports();

			expect(mockDb.select).toHaveBeenCalled();
			expect(mockSelect.from).toHaveBeenCalledWith(airports);
			expect(mockSelect.orderBy).toHaveBeenCalledWith(airports.name);
			expect(result).toEqual(mockAirports);
		});

		it('should throw error when database operation fails', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockRejectedValue(new Error('Database error'))
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await expect(repository.getAllAirports()).rejects.toThrow(
				'Failed to fetch airports: Database error'
			);
		});

		it('should handle unknown errors', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockRejectedValue('Unknown error')
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await expect(repository.getAllAirports()).rejects.toThrow(
				'Failed to fetch airports: Unknown error'
			);
		});
	});

	describe('getAirportById', () => {
		it('should return airport when found', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.getAirportById(1);

			expect(mockDb.select).toHaveBeenCalled();
			expect(mockSelect.from).toHaveBeenCalledWith(airports);
			expect(mockSelect.where).toHaveBeenCalledWith(eq(airports.id, 1));
			expect(result).toEqual(mockAirport);
		});

		it('should return null when airport not found', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.getAirportById(999);

			expect(result).toBeNull();
		});

		it('should throw error when database operation fails', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockRejectedValue(new Error('Database error'))
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await expect(repository.getAirportById(1)).rejects.toThrow(
				'Failed to fetch airport with ID 1: Database error'
			);
		});
	});

	describe('getAirportByIataCode', () => {
		it('should return airport when found by IATA code', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.getAirportByIataCode('lax');

			expect(mockDb.select).toHaveBeenCalled();
			expect(mockSelect.from).toHaveBeenCalledWith(airports);
			expect(mockSelect.where).toHaveBeenCalledWith(eq(airports.iataCode, 'LAX'));
			expect(result).toEqual(mockAirport);
		});

		it('should return null when airport not found', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.getAirportByIataCode('XYZ');

			expect(result).toBeNull();
		});

		it('should convert IATA code to uppercase', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await repository.getAirportByIataCode('lax');

			expect(mockSelect.where).toHaveBeenCalledWith(eq(airports.iataCode, 'LAX'));
		});

		it('should throw error when database operation fails', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockRejectedValue(new Error('Database error'))
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await expect(repository.getAirportByIataCode('LAX')).rejects.toThrow(
				'Failed to fetch airport with IATA code LAX: Database error'
			);
		});
	});

	describe('createAirport', () => {
		it('should create airport with all fields', async () => {
			const createData: CreateAirportData = {
				iataCode: 'lax',
				icaoCode: 'klax',
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				state: 'California',
				country: 'United States',
				latitude: 33.94250107,
				longitude: -118.4081001,
				elevation: 125,
				timezone: 'America/Los_Angeles'
			};

			const mockInsert = {
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.insert.mockReturnValue(mockInsert);

			const result = await repository.createAirport(createData);

			expect(mockDb.insert).toHaveBeenCalledWith(airports);
			expect(mockInsert.values).toHaveBeenCalledWith({
				iataCode: 'LAX',
				icaoCode: 'KLAX',
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				state: 'California',
				country: 'United States',
				latitude: '33.94250107',
				longitude: '-118.4081001',
				elevation: 125,
				timezone: 'America/Los_Angeles',
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date)
			});
			expect(result).toEqual(mockAirport);
		});

		it('should create airport with minimal required fields', async () => {
			const createData: CreateAirportData = {
				iataCode: 'LAX',
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				country: 'United States',
				latitude: 33.94250107,
				longitude: -118.4081001
			};

			const mockInsert = {
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.insert.mockReturnValue(mockInsert);

			const result = await repository.createAirport(createData);

			expect(mockInsert.values).toHaveBeenCalledWith({
				iataCode: 'LAX',
				icaoCode: undefined,
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				state: undefined,
				country: 'United States',
				latitude: '33.94250107',
				longitude: '-118.4081001',
				elevation: undefined,
				timezone: undefined,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date)
			});
			expect(result).toEqual(mockAirport);
		});

		it('should convert codes to uppercase', async () => {
			const createData: CreateAirportData = {
				iataCode: 'lax',
				icaoCode: 'klax',
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				country: 'United States',
				latitude: 33.94250107,
				longitude: -118.4081001
			};

			const mockInsert = {
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.insert.mockReturnValue(mockInsert);

			await repository.createAirport(createData);

			expect(mockInsert.values).toHaveBeenCalledWith(
				expect.objectContaining({
					iataCode: 'LAX',
					icaoCode: 'KLAX'
				})
			);
		});

		it('should throw error when database operation fails', async () => {
			const createData: CreateAirportData = {
				iataCode: 'LAX',
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				country: 'United States',
				latitude: 33.94250107,
				longitude: -118.4081001
			};

			const mockInsert = {
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockRejectedValue(new Error('Duplicate key'))
			};
			// @ts-expect-error Strange cast
			mockDb.insert.mockReturnValue(mockInsert);

			await expect(repository.createAirport(createData)).rejects.toThrow(
				'Failed to create airport: Duplicate key'
			);
		});
	});

	describe('updateAirport', () => {
		it('should update airport with all fields', async () => {
			const updateData: UpdateAirportData = {
				id: 1,
				iataCode: 'lax',
				icaoCode: 'klax',
				name: 'Updated Airport Name',
				city: 'Updated City',
				state: 'Updated State',
				country: 'Updated Country',
				latitude: 34.0,
				longitude: -119.0,
				elevation: 150,
				timezone: 'America/New_York'
			};

			const mockUpdate = {
				set: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.update.mockReturnValue(mockUpdate);

			const result = await repository.updateAirport(updateData);

			expect(mockDb.update).toHaveBeenCalledWith(airports);
			expect(mockUpdate.set).toHaveBeenCalledWith({
				updatedAt: expect.any(Date),
				iataCode: 'LAX',
				icaoCode: 'KLAX',
				name: 'Updated Airport Name',
				city: 'Updated City',
				state: 'Updated State',
				country: 'Updated Country',
				latitude: '34',
				longitude: '-119',
				elevation: 150,
				timezone: 'America/New_York'
			});
			expect(mockUpdate.where).toHaveBeenCalledWith(eq(airports.id, 1));
			expect(result).toEqual(mockAirport);
		});

		it('should update airport with partial data', async () => {
			const updateData: UpdateAirportData = {
				id: 1,
				name: 'Updated Name Only'
			};

			const mockUpdate = {
				set: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.update.mockReturnValue(mockUpdate);

			const result = await repository.updateAirport(updateData);

			expect(mockUpdate.set).toHaveBeenCalledWith({
				updatedAt: expect.any(Date),
				name: 'Updated Name Only'
			});
			expect(result).toEqual(mockAirport);
		});

		it('should throw error when airport not found', async () => {
			const updateData: UpdateAirportData = {
				id: 999,
				name: 'Updated Name'
			};

			const mockUpdate = {
				set: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.update.mockReturnValue(mockUpdate);

			await expect(repository.updateAirport(updateData)).rejects.toThrow(
				'Airport with ID 999 not found'
			);
		});

		it('should throw error when database operation fails', async () => {
			const updateData: UpdateAirportData = {
				id: 1,
				name: 'Updated Name'
			};

			const mockUpdate = {
				set: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				returning: vi.fn().mockRejectedValue(new Error('Database error'))
			};
			// @ts-expect-error Strange cast
			mockDb.update.mockReturnValue(mockUpdate);

			await expect(repository.updateAirport(updateData)).rejects.toThrow(
				'Failed to update airport: Database error'
			);
		});
	});

	describe('deleteAirport', () => {
		it('should delete airport successfully', async () => {
			const mockDelete = {
				where: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.delete.mockReturnValue(mockDelete);

			await repository.deleteAirport(1);

			expect(mockDb.delete).toHaveBeenCalledWith(airports);
			expect(mockDelete.where).toHaveBeenCalledWith(eq(airports.id, 1));
		});

		it('should throw error when airport not found', async () => {
			const mockDelete = {
				where: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.delete.mockReturnValue(mockDelete);

			await expect(repository.deleteAirport(999)).rejects.toThrow('Airport with ID 999 not found');
		});

		it('should throw error when database operation fails', async () => {
			const mockDelete = {
				where: vi.fn().mockReturnThis(),
				returning: vi.fn().mockRejectedValue(new Error('Database error'))
			};
			// @ts-expect-error Strange cast
			mockDb.delete.mockReturnValue(mockDelete);

			await expect(repository.deleteAirport(1)).rejects.toThrow(
				'Failed to delete airport: Database error'
			);
		});
	});

	describe('searchAirports', () => {
		it('should search airports by query', async () => {
			const mockAirports = [mockAirport];
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockAirports)
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.searchAirports('Los Angeles');

			expect(mockDb.select).toHaveBeenCalled();
			expect(mockSelect.from).toHaveBeenCalledWith(airports);
			expect(mockSelect.where).toHaveBeenCalled();
			expect(mockSelect.orderBy).toHaveBeenCalledWith(airports.name);
			expect(result).toEqual(mockAirports);
		});

		it('should handle empty search query', async () => {
			const mockAirports = [mockAirport];
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockAirports)
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.searchAirports('');

			expect(result).toEqual(mockAirports);
		});

		it('should throw error when database operation fails', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockRejectedValue(new Error('Database error'))
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await expect(repository.searchAirports('test')).rejects.toThrow(
				'Failed to search airports: Database error'
			);
		});
	});

	describe('airportExistsByIataCode', () => {
		it('should return true when airport exists', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([{ id: 1 }])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.airportExistsByIataCode('LAX');

			expect(result).toBe(true);
		});

		it('should return false when airport does not exist', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.airportExistsByIataCode('XYZ');

			expect(result).toBe(false);
		});

		it('should exclude specific ID when provided', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await repository.airportExistsByIataCode('LAX', 1);

			expect(mockSelect.where).toHaveBeenCalled();
		});

		it('should convert IATA code to uppercase', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await repository.airportExistsByIataCode('lax');

			expect(mockSelect.where).toHaveBeenCalled();
		});

		it('should throw error when database operation fails', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockRejectedValue(new Error('Database error'))
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await expect(repository.airportExistsByIataCode('LAX')).rejects.toThrow(
				'Failed to check airport existence by IATA code: Database error'
			);
		});
	});

	describe('airportExistsByIcaoCode', () => {
		it('should return true when airport exists', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([{ id: 1 }])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.airportExistsByIcaoCode('KLAX');

			expect(result).toBe(true);
		});

		it('should return false when airport does not exist', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			const result = await repository.airportExistsByIcaoCode('KXYZ');

			expect(result).toBe(false);
		});

		it('should return false for empty ICAO code', async () => {
			const result = await repository.airportExistsByIcaoCode('');

			expect(result).toBe(false);
		});

		it('should exclude specific ID when provided', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await repository.airportExistsByIcaoCode('KLAX', 1);

			expect(mockSelect.where).toHaveBeenCalled();
		});

		it('should convert ICAO code to uppercase', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await repository.airportExistsByIcaoCode('klax');

			expect(mockSelect.where).toHaveBeenCalled();
		});

		it('should throw error when database operation fails', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockRejectedValue(new Error('Database error'))
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await expect(repository.airportExistsByIcaoCode('KLAX')).rejects.toThrow(
				'Failed to check airport existence by ICAO code: Database error'
			);
		});
	});

	describe('data integrity and constraints', () => {
		it('should handle coordinate precision correctly', async () => {
			const createData: CreateAirportData = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: 33.94250112345679,
				longitude: -118.40810098765432
			};

			const mockInsert = {
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.insert.mockReturnValue(mockInsert);

			await repository.createAirport(createData);

			// Check that the values were called with the converted string coordinates
			const callArgs = mockInsert.values.mock.calls[0][0];
			expect(callArgs.latitude).toBe(createData.latitude.toString());
			expect(callArgs.longitude).toBe(createData.longitude.toString());
		});

		it('should handle negative coordinates', async () => {
			const createData: CreateAirportData = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: -33.942501,
				longitude: -118.4081
			};

			const mockInsert = {
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.insert.mockReturnValue(mockInsert);

			await repository.createAirport(createData);

			expect(mockInsert.values).toHaveBeenCalledWith(
				expect.objectContaining({
					latitude: '-33.942501',
					longitude: '-118.4081'
				})
			);
		});

		it('should handle negative elevation', async () => {
			const createData: CreateAirportData = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: 33.942501,
				longitude: -118.4081,
				elevation: -50
			};

			const mockInsert = {
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.insert.mockReturnValue(mockInsert);

			await repository.createAirport(createData);

			expect(mockInsert.values).toHaveBeenCalledWith(
				expect.objectContaining({
					elevation: -50
				})
			);
		});
	});

	describe('edge cases', () => {
		it('should handle null and undefined values correctly in updates', async () => {
			const updateData: UpdateAirportData = {
				id: 1,
				state: undefined,
				elevation: undefined,
				timezone: undefined
			};

			const mockUpdate = {
				set: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.update.mockReturnValue(mockUpdate);

			await repository.updateAirport(updateData);

			expect(mockUpdate.set).toHaveBeenCalledWith({
				updatedAt: expect.any(Date)
			});
		});

		it('should handle special characters in search', async () => {
			const mockSelect = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue([])
			};
			// @ts-expect-error Strange cast
			mockDb.select.mockReturnValue(mockSelect);

			await repository.searchAirports("O'Hare");

			expect(mockSelect.where).toHaveBeenCalled();
		});

		it('should handle very long airport names', async () => {
			const longName = 'A'.repeat(200);
			const createData: CreateAirportData = {
				iataCode: 'LAX',
				name: longName,
				city: 'Test City',
				country: 'Test Country',
				latitude: 33.942501,
				longitude: -118.4081
			};

			const mockInsert = {
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([mockAirport])
			};
			// @ts-expect-error Strange cast
			mockDb.insert.mockReturnValue(mockInsert);

			await repository.createAirport(createData);

			expect(mockInsert.values).toHaveBeenCalledWith(
				expect.objectContaining({
					name: longName
				})
			);
		});
	});
});
