import { describe, it, expect } from 'vitest';
import {
	createAirportSchema,
	updateAirportSchema,
	createAirportFormSchema,
	updateAirportFormSchema,
	searchAirportsSchema,
	iataCodeSchema,
	icaoCodeSchema,
	airportCoordinateSchema,
	validateCreateAirport,
	validateIataCode,
	validateIcaoCode,
	safeValidateCreateAirport,
	safeValidateCreateAirportForm,
	safeValidateIataCode,
	safeValidateIcaoCode
} from './airports.js';

describe('Airport Validation', () => {
	describe('createAirportSchema', () => {
		it('should validate valid airport data with all fields', () => {
			const validData = {
				iataCode: 'LAX',
				icaoCode: 'KLAX',
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				state: 'California',
				country: 'United States',
				latitude: 33.94250107,
				longitude: -118.4081001,
				elevation: 125,
				timezone: 'America/Los_Angeles'
			};

			const result = createAirportSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it('should validate minimal required data', () => {
			const minimalData = {
				iataCode: 'LAX',
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				country: 'United States',
				latitude: 33.94250107,
				longitude: -118.4081001
			};

			const result = createAirportSchema.parse(minimalData);
			expect(result.iataCode).toBe('LAX');
			expect(result.name).toBe('Los Angeles International Airport');
			expect(result.city).toBe('Los Angeles');
			expect(result.country).toBe('United States');
			expect(result.latitude).toBe(33.94250107);
			expect(result.longitude).toBe(-118.4081001);
		});

		it('should trim whitespace from string fields', () => {
			const dataWithWhitespace = {
				iataCode: 'LAX', // IATA code validation is strict, so no whitespace
				name: '  Los Angeles Airport  ',
				city: '  Los Angeles  ',
				country: '  United States  ',
				latitude: 33.94250107,
				longitude: -118.4081001
			};

			const result = createAirportSchema.parse(dataWithWhitespace);
			expect(result.iataCode).toBe('LAX');
			expect(result.name).toBe('Los Angeles Airport');
			expect(result.city).toBe('Los Angeles');
			expect(result.country).toBe('United States');
		});

		it('should handle empty string for optional fields', () => {
			const dataWithEmptyOptionals = {
				iataCode: 'LAX',
				icaoCode: '',
				name: 'Los Angeles Airport',
				city: 'Los Angeles',
				state: '',
				country: 'United States',
				latitude: 33.94250107,
				longitude: -118.4081001,
				timezone: ''
			};

			const result = createAirportSchema.parse(dataWithEmptyOptionals);
			expect(result.icaoCode).toBe('');
			expect(result.state).toBe('');
			expect(result.timezone).toBe('');
		});

		describe('IATA code validation', () => {
			it('should reject empty IATA code', () => {
				const invalidData = {
					iataCode: '',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'IATA code must be exactly 3 characters'
				);
			});

			it('should reject IATA code that is too short', () => {
				const invalidData = {
					iataCode: 'LA',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'IATA code must be exactly 3 characters'
				);
			});

			it('should reject IATA code that is too long', () => {
				const invalidData = {
					iataCode: 'LAXX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'IATA code must be exactly 3 characters'
				);
			});

			it('should reject IATA code with lowercase letters', () => {
				const invalidData = {
					iataCode: 'lax',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'IATA code must be 3 uppercase letters'
				);
			});

			it('should reject IATA code with numbers', () => {
				const invalidData = {
					iataCode: 'LA1',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'IATA code must be 3 uppercase letters'
				);
			});

			it('should reject IATA code with special characters', () => {
				const invalidData = {
					iataCode: 'LA-',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'IATA code must be 3 uppercase letters'
				);
			});
		});

		describe('ICAO code validation', () => {
			it('should accept valid ICAO code', () => {
				const validData = {
					iataCode: 'LAX',
					icaoCode: 'KLAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				const result = createAirportSchema.parse(validData);
				expect(result.icaoCode).toBe('KLAX');
			});

			it('should reject ICAO code that is too short', () => {
				const invalidData = {
					iataCode: 'LAX',
					icaoCode: 'KLA',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'ICAO code must be exactly 4 characters'
				);
			});

			it('should reject ICAO code that is too long', () => {
				const invalidData = {
					iataCode: 'LAX',
					icaoCode: 'KLAXX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'ICAO code must be exactly 4 characters'
				);
			});

			it('should reject ICAO code with lowercase letters', () => {
				const invalidData = {
					iataCode: 'LAX',
					icaoCode: 'klax',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'ICAO code must be 4 uppercase letters'
				);
			});

			it('should reject ICAO code with numbers', () => {
				const invalidData = {
					iataCode: 'LAX',
					icaoCode: 'KLA1',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'ICAO code must be 4 uppercase letters'
				);
			});
		});

		describe('name validation', () => {
			it('should reject empty name', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: '',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow('Airport name is required');
			});

			it('should reject name that is too long', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'x'.repeat(201),
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'Airport name must be less than 200 characters'
				);
			});

			it('should accept name at maximum length', () => {
				const validData = {
					iataCode: 'LAX',
					name: 'x'.repeat(200),
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				const result = createAirportSchema.parse(validData);
				expect(result.name).toBe('x'.repeat(200));
			});
		});

		describe('city validation', () => {
			it('should reject empty city', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: '',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow('City is required');
			});

			it('should reject city that is too long', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'x'.repeat(101),
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'City must be less than 100 characters'
				);
			});
		});

		describe('state validation', () => {
			it('should accept valid state', () => {
				const validData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					state: 'California',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				const result = createAirportSchema.parse(validData);
				expect(result.state).toBe('California');
			});

			it('should reject state that is too long', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					state: 'x'.repeat(101),
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'State must be less than 100 characters'
				);
			});
		});

		describe('country validation', () => {
			it('should reject empty country', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: '',
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow('Country is required');
			});

			it('should reject country that is too long', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'x'.repeat(101),
					latitude: 0,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'Country must be less than 100 characters'
				);
			});
		});

		describe('coordinate validation', () => {
			it('should reject latitude below -90', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: -91,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'Latitude must be between -90 and 90 degrees'
				);
			});

			it('should reject latitude above 90', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 91,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'Latitude must be between -90 and 90 degrees'
				);
			});

			it('should accept boundary latitude values', () => {
				const validData1 = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: -90,
					longitude: 0
				};

				const validData2 = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 90,
					longitude: 0
				};

				expect(() => createAirportSchema.parse(validData1)).not.toThrow();
				expect(() => createAirportSchema.parse(validData2)).not.toThrow();
			});

			it('should reject longitude below -180', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: -181
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'Longitude must be between -180 and 180 degrees'
				);
			});

			it('should reject longitude above 180', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 181
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'Longitude must be between -180 and 180 degrees'
				);
			});

			it('should accept boundary longitude values', () => {
				const validData1 = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: -180
				};

				const validData2 = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 180
				};

				expect(() => createAirportSchema.parse(validData1)).not.toThrow();
				expect(() => createAirportSchema.parse(validData2)).not.toThrow();
			});
		});

		describe('elevation validation', () => {
			it('should accept valid elevation', () => {
				const validData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					elevation: 125
				};

				const result = createAirportSchema.parse(validData);
				expect(result.elevation).toBe(125);
			});

			it('should accept negative elevation', () => {
				const validData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					elevation: -50
				};

				const result = createAirportSchema.parse(validData);
				expect(result.elevation).toBe(-50);
			});

			it('should reject non-integer elevation', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					elevation: 125.5
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'Elevation must be a whole number'
				);
			});

			it('should reject elevation that is too low', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					elevation: -1501
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'Elevation seems unreasonably low'
				);
			});

			it('should reject elevation that is too high', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					elevation: 30001
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'Elevation seems unreasonably high'
				);
			});

			it('should accept boundary elevation values', () => {
				const validData1 = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					elevation: -1500
				};

				const validData2 = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					elevation: 30000
				};

				expect(() => createAirportSchema.parse(validData1)).not.toThrow();
				expect(() => createAirportSchema.parse(validData2)).not.toThrow();
			});
		});

		describe('timezone validation', () => {
			it('should accept valid timezone', () => {
				const validData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					timezone: 'America/Los_Angeles'
				};

				const result = createAirportSchema.parse(validData);
				expect(result.timezone).toBe('America/Los_Angeles');
			});

			it('should accept timezone with underscores', () => {
				const validData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					timezone: 'America/New_York'
				};

				const result = createAirportSchema.parse(validData);
				expect(result.timezone).toBe('America/New_York');
			});

			it('should reject timezone that is too long', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					timezone: 'x'.repeat(51)
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow(
					'Timezone must be less than 50 characters'
				);
			});

			it('should reject timezone with invalid characters', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					timezone: 'America/Los Angeles'
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow('Invalid timezone format');
			});

			it('should reject timezone with numbers', () => {
				const invalidData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0,
					timezone: 'America/Los_Angeles123'
				};

				expect(() => createAirportSchema.parse(invalidData)).toThrow('Invalid timezone format');
			});
		});
	});

	describe('updateAirportSchema', () => {
		it('should validate update with all fields', () => {
			const updateData = {
				id: 1,
				iataCode: 'LAX',
				icaoCode: 'KLAX',
				name: 'Updated Airport',
				city: 'Updated City',
				state: 'Updated State',
				country: 'Updated Country',
				latitude: 34.0,
				longitude: -119.0,
				elevation: 150,
				timezone: 'America/New_York'
			};

			const result = updateAirportSchema.parse(updateData);
			expect(result).toEqual(updateData);
		});

		it('should validate partial update', () => {
			const partialUpdate = {
				id: 1,
				name: 'Updated Name Only'
			};

			const result = updateAirportSchema.parse(partialUpdate);
			expect(result.id).toBe(1);
			expect(result.name).toBe('Updated Name Only');
		});

		it('should require valid ID', () => {
			const invalidData = {
				id: -1,
				name: 'Test Airport'
			};

			expect(() => updateAirportSchema.parse(invalidData)).toThrow('Invalid airport ID');
		});

		it('should require ID to be present', () => {
			const invalidData = {
				name: 'Test Airport'
			};

			expect(() => updateAirportSchema.parse(invalidData)).toThrow();
		});

		it('should validate partial coordinates', () => {
			const partialUpdate = {
				id: 1,
				latitude: 34.0
			};

			const result = updateAirportSchema.parse(partialUpdate);
			expect(result.latitude).toBe(34.0);
		});
	});

	describe('createAirportFormSchema', () => {
		it('should validate form data with string inputs', () => {
			const formData = {
				iataCode: 'lax',
				icaoCode: 'klax',
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				state: 'California',
				country: 'United States',
				latitude: '33.94250107',
				longitude: '-118.4081001',
				elevation: '125',
				timezone: 'America/Los_Angeles'
			};

			const result = createAirportFormSchema.parse(formData);
			expect(result.iataCode).toBe('LAX');
			expect(result.icaoCode).toBe('KLAX');
			expect(result.name).toBe('Los Angeles International Airport');
			expect(result.latitude).toBe(33.94250107);
			expect(result.longitude).toBe(-118.4081001);
			expect(result.elevation).toBe(125);
		});

		it('should handle empty optional string fields', () => {
			const formData = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: '33.94250107',
				longitude: '-118.4081001',
				icaoCode: '',
				state: '',
				elevation: '',
				timezone: ''
			};

			const result = createAirportFormSchema.parse(formData);
			expect(result.iataCode).toBe('LAX');
			expect(result.icaoCode).toBeUndefined();
			expect(result.state).toBeUndefined();
			expect(result.elevation).toBeUndefined();
			expect(result.timezone).toBeUndefined();
		});

		it('should handle whitespace-only optional fields', () => {
			const formData = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: '33.94250107',
				longitude: '-118.4081001',
				icaoCode: '   ',
				state: '   ',
				elevation: '   ',
				timezone: '   '
			};

			const result = createAirportFormSchema.parse(formData);
			expect(result.icaoCode).toBeUndefined();
			expect(result.state).toBeUndefined();
			expect(result.elevation).toBeUndefined();
			expect(result.timezone).toBeUndefined();
		});

		it('should convert IATA code to uppercase', () => {
			const formData = {
				iataCode: 'lax',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: '0',
				longitude: '0'
			};

			const result = createAirportFormSchema.parse(formData);
			expect(result.iataCode).toBe('LAX');
		});

		it('should convert ICAO code to uppercase', () => {
			const formData = {
				iataCode: 'LAX',
				icaoCode: 'klax',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: '0',
				longitude: '0'
			};

			const result = createAirportFormSchema.parse(formData);
			expect(result.icaoCode).toBe('KLAX');
		});

		it('should reject invalid latitude string', () => {
			const formData = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: 'not-a-number',
				longitude: '0'
			};

			expect(() => createAirportFormSchema.parse(formData)).toThrow('Invalid latitude format');
		});

		it('should reject invalid longitude string', () => {
			const formData = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: '0',
				longitude: 'invalid'
			};

			expect(() => createAirportFormSchema.parse(formData)).toThrow('Invalid longitude format');
		});

		it('should reject invalid elevation string', () => {
			const formData = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: '0',
				longitude: '0',
				elevation: 'not-a-number'
			};

			expect(() => createAirportFormSchema.parse(formData)).toThrow('Invalid elevation format');
		});

		it('should handle decimal coordinates in string format', () => {
			const formData = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: '33.94250112345679',
				longitude: '-118.40810098765432'
			};

			const result = createAirportFormSchema.parse(formData);
			expect(result.latitude).toBe(33.94250112345679);
			expect(result.longitude).toBe(-118.40810098765432);
		});

		it('should handle negative elevation in string format', () => {
			const formData = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: '0',
				longitude: '0',
				elevation: '-50'
			};

			const result = createAirportFormSchema.parse(formData);
			expect(result.elevation).toBe(-50);
		});
	});

	describe('updateAirportFormSchema', () => {
		it('should validate form update with ID string', () => {
			const formData = {
				id: '123',
				name: 'Updated Airport'
			};

			const result = updateAirportFormSchema.parse(formData);
			expect(result.id).toBe(123);
			expect(result.name).toBe('Updated Airport');
		});

		it('should reject invalid ID string', () => {
			const formData = {
				id: 'not-a-number',
				name: 'Updated Airport'
			};

			expect(() => updateAirportFormSchema.parse(formData)).toThrow('Invalid airport ID');
		});

		it('should handle partial form updates', () => {
			const formData = {
				id: '123',
				latitude: '34.0'
			};

			const result = updateAirportFormSchema.parse(formData);
			expect(result.id).toBe(123);
			expect(result.latitude).toBe(34.0);
		});
	});

	describe('searchAirportsSchema', () => {
		it('should validate search query', () => {
			const searchData = {
				query: 'Los Angeles'
			};

			const result = searchAirportsSchema.parse(searchData);
			expect(result.query).toBe('Los Angeles');
		});

		it('should trim search query', () => {
			const searchData = {
				query: '  Los Angeles  '
			};

			const result = searchAirportsSchema.parse(searchData);
			expect(result.query).toBe('Los Angeles');
		});

		it('should reject empty search query', () => {
			const searchData = {
				query: ''
			};

			expect(() => searchAirportsSchema.parse(searchData)).toThrow('Search query is required');
		});

		it('should reject search query that is too long', () => {
			const searchData = {
				query: 'x'.repeat(101)
			};

			expect(() => searchAirportsSchema.parse(searchData)).toThrow(
				'Search query must be less than 100 characters'
			);
		});

		it('should accept search query at maximum length', () => {
			const searchData = {
				query: 'x'.repeat(100)
			};

			const result = searchAirportsSchema.parse(searchData);
			expect(result.query).toBe('x'.repeat(100));
		});
	});

	describe('iataCodeSchema', () => {
		it('should validate valid IATA code', () => {
			const result = iataCodeSchema.parse('LAX');
			expect(result).toBe('LAX');
		});

		it('should reject invalid IATA codes', () => {
			const invalidCodes = ['', 'LA', 'LAXX', 'lax', 'LA1', 'L-X'];

			invalidCodes.forEach((code) => {
				expect(() => iataCodeSchema.parse(code)).toThrow();
			});
		});
	});

	describe('icaoCodeSchema', () => {
		it('should validate valid ICAO code', () => {
			const result = icaoCodeSchema.parse('KLAX');
			expect(result).toBe('KLAX');
		});

		it('should reject invalid ICAO codes', () => {
			const invalidCodes = ['', 'KLA', 'KLAXX', 'klax', 'KLA1', 'K-AX'];

			invalidCodes.forEach((code) => {
				expect(() => icaoCodeSchema.parse(code)).toThrow();
			});
		});
	});

	describe('airportCoordinateSchema', () => {
		it('should validate valid coordinates', () => {
			const coordinates = {
				latitude: 33.94250107,
				longitude: -118.4081001
			};

			const result = airportCoordinateSchema.parse(coordinates);
			expect(result).toEqual(coordinates);
		});

		it('should validate boundary coordinates', () => {
			const boundaryCoordinates = [
				{ latitude: 90, longitude: 180 },
				{ latitude: -90, longitude: -180 },
				{ latitude: 0, longitude: 0 }
			];

			boundaryCoordinates.forEach((coords) => {
				const result = airportCoordinateSchema.parse(coords);
				expect(result).toEqual(coords);
			});
		});

		it('should reject invalid coordinates', () => {
			const invalidCoordinates = [
				{ latitude: 91, longitude: 0 },
				{ latitude: -91, longitude: 0 },
				{ latitude: 0, longitude: 181 },
				{ latitude: 0, longitude: -181 }
			];

			invalidCoordinates.forEach((coords) => {
				expect(() => airportCoordinateSchema.parse(coords)).toThrow();
			});
		});
	});

	describe('validation helper functions', () => {
		describe('validateCreateAirport', () => {
			it('should validate and return parsed data', () => {
				const data = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				const result = validateCreateAirport(data);
				expect(result).toEqual(data);
			});

			it('should throw on invalid data', () => {
				const invalidData = {
					iataCode: '',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				expect(() => validateCreateAirport(invalidData)).toThrow();
			});
		});

		describe('validateIataCode', () => {
			it('should validate and convert to uppercase', () => {
				const result = validateIataCode('lax');
				expect(result).toBe('LAX');
			});

			it('should throw on invalid code', () => {
				expect(() => validateIataCode('invalid')).toThrow();
			});
		});

		describe('validateIcaoCode', () => {
			it('should validate and convert to uppercase', () => {
				const result = validateIcaoCode('klax');
				expect(result).toBe('KLAX');
			});

			it('should throw on invalid code', () => {
				expect(() => validateIcaoCode('invalid')).toThrow();
			});
		});
	});

	describe('safe validation functions', () => {
		describe('safeValidateCreateAirport', () => {
			it('should return success result for valid data', () => {
				const data = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				const result = safeValidateCreateAirport(data);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual(data);
				}
			});

			it('should return error result for invalid data', () => {
				const invalidData = {
					iataCode: '',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: 0,
					longitude: 0
				};

				const result = safeValidateCreateAirport(invalidData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeDefined();
					expect(result.error.issues.length).toBeGreaterThan(0);
					// Should have at least one error about IATA code
					const iataError = result.error.issues.find((issue) => issue.path[0] === 'iataCode');
					expect(iataError).toBeDefined();
				}
			});
		});

		describe('safeValidateCreateAirportForm', () => {
			it('should handle form validation safely', () => {
				const validFormData = {
					iataCode: 'LAX',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: '0',
					longitude: '0'
				};

				const result = safeValidateCreateAirportForm(validFormData);
				expect(result.success).toBe(true);
			});

			it('should return error for invalid form data', () => {
				const invalidFormData = {
					iataCode: '',
					name: 'Test Airport',
					city: 'Test City',
					country: 'Test Country',
					latitude: '0',
					longitude: '0'
				};

				const result = safeValidateCreateAirportForm(invalidFormData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues.length).toBeGreaterThan(0);
				}
			});
		});

		describe('safeValidateIataCode', () => {
			it('should return success for valid code', () => {
				const result = safeValidateIataCode('LAX');
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toBe('LAX');
				}
			});

			it('should return error for invalid code', () => {
				const result = safeValidateIataCode('invalid');
				expect(result.success).toBe(false);
			});
		});

		describe('safeValidateIcaoCode', () => {
			it('should return success for valid code', () => {
				const result = safeValidateIcaoCode('KLAX');
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toBe('KLAX');
				}
			});

			it('should return error for invalid code', () => {
				const result = safeValidateIcaoCode('invalid');
				expect(result.success).toBe(false);
			});
		});
	});

	describe('edge cases and error handling', () => {
		it('should handle null and undefined inputs', () => {
			expect(() => createAirportSchema.parse(null)).toThrow();
			expect(() => createAirportSchema.parse(undefined)).toThrow();
		});

		it('should handle non-object inputs', () => {
			expect(() => createAirportSchema.parse('string')).toThrow();
			expect(() => createAirportSchema.parse(123)).toThrow();
			expect(() => createAirportSchema.parse([])).toThrow();
		});

		it('should handle missing required fields', () => {
			const incompleteData = {
				iataCode: 'LAX',
				name: 'Test Airport'
				// Missing city, country, latitude, longitude
			};

			expect(() => createAirportSchema.parse(incompleteData)).toThrow();
		});

		it('should handle extra fields gracefully', () => {
			const dataWithExtraFields = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: 0,
				longitude: 0,
				extraField: 'should be ignored'
			};

			const result = createAirportSchema.parse(dataWithExtraFields);
			expect(result.iataCode).toBe('LAX');
			expect(result.name).toBe('Test Airport');
			expect('extraField' in result).toBe(false);
		});

		it('should handle coordinate precision', () => {
			const preciseCoords = {
				iataCode: 'LAX',
				name: 'Test Airport',
				city: 'Test City',
				country: 'Test Country',
				latitude: 33.94250112345679,
				longitude: -118.40810098765432
			};

			const result = createAirportSchema.parse(preciseCoords);
			expect(result.latitude).toBe(33.94250112345679);
			expect(result.longitude).toBe(-118.40810098765432);
		});

		it('should handle special characters in airport names', () => {
			const specialNameData = {
				iataCode: 'LAX',
				name: "O'Hare International Airport",
				city: 'Chicago',
				country: 'United States',
				latitude: 0,
				longitude: 0
			};

			const result = createAirportSchema.parse(specialNameData);
			expect(result.name).toBe("O'Hare International Airport");
		});

		it('should handle international characters', () => {
			const internationalData = {
				iataCode: 'CDG',
				name: 'Aéroport de Paris-Charles-de-Gaulle',
				city: 'Paris',
				country: 'France',
				latitude: 49.0097,
				longitude: 2.5479
			};

			const result = createAirportSchema.parse(internationalData);
			expect(result.name).toBe('Aéroport de Paris-Charles-de-Gaulle');
		});
	});

	describe('real-world scenarios', () => {
		it('should validate complete airport creation form submission', () => {
			const formSubmission = {
				iataCode: 'lax',
				icaoCode: 'klax',
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				state: 'California',
				country: 'United States',
				latitude: '33.94250107',
				longitude: '-118.4081001',
				elevation: '125',
				timezone: 'America/Los_Angeles'
			};

			const result = createAirportFormSchema.parse(formSubmission);
			expect(result.iataCode).toBe('LAX');
			expect(result.icaoCode).toBe('KLAX');
			expect(result.name).toBe('Los Angeles International Airport');
			expect(result.latitude).toBe(33.94250107);
			expect(result.longitude).toBe(-118.4081001);
			expect(result.elevation).toBe(125);
			expect(result.timezone).toBe('America/Los_Angeles');
		});

		it('should validate partial airport update form submission', () => {
			const updateSubmission = {
				id: '42',
				name: 'Updated Airport Name',
				elevation: '200'
			};

			const result = updateAirportFormSchema.parse(updateSubmission);
			expect(result.id).toBe(42);
			expect(result.name).toBe('Updated Airport Name');
			expect(result.elevation).toBe(200);
		});

		it('should validate search functionality', () => {
			const searchQueries = ['LAX', 'Los Angeles', 'California', 'United States', 'International'];

			searchQueries.forEach((query) => {
				const result = searchAirportsSchema.parse({ query });
				expect(result.query).toBe(query);
			});
		});

		it('should validate international airports', () => {
			const internationalAirports = [
				{
					iataCode: 'LHR',
					icaoCode: 'EGLL',
					name: 'London Heathrow Airport',
					city: 'London',
					country: 'United Kingdom',
					latitude: 51.47,
					longitude: -0.4543,
					elevation: 83,
					timezone: 'Europe/London'
				},
				{
					iataCode: 'NRT',
					icaoCode: 'RJAA',
					name: 'Narita International Airport',
					city: 'Tokyo',
					country: 'Japan',
					latitude: 35.7647,
					longitude: 140.3864,
					elevation: 141,
					timezone: 'Asia/Tokyo'
				}
			];

			internationalAirports.forEach((airport) => {
				const result = createAirportSchema.parse(airport);
				expect(result.iataCode).toBe(airport.iataCode);
				expect(result.name).toBe(airport.name);
			});
		});

		it('should handle airports without ICAO codes', () => {
			const airportWithoutIcao = {
				iataCode: 'LAX',
				name: 'Los Angeles International Airport',
				city: 'Los Angeles',
				state: 'California',
				country: 'United States',
				latitude: 33.94250107,
				longitude: -118.4081001
			};

			const result = createAirportSchema.parse(airportWithoutIcao);
			expect(result.iataCode).toBe('LAX');
			expect(result.icaoCode).toBeUndefined();
		});

		it('should handle airports at extreme elevations', () => {
			const highAltitudeAirport = {
				iataCode: 'LPB',
				icaoCode: 'SLLP',
				name: 'El Alto International Airport',
				city: 'La Paz',
				country: 'Bolivia',
				latitude: -16.5133,
				longitude: -68.1925,
				elevation: 13323 // One of the highest airports in the world
			};

			const result = createAirportSchema.parse(highAltitudeAirport);
			expect(result.elevation).toBe(13323);
		});
	});
});
