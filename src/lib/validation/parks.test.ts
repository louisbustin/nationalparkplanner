import { describe, it, expect } from 'vitest';
import {
	createParkSchema,
	updateParkSchema,
	createParkFormSchema,
	updateParkFormSchema,
	searchParksSchema,
	coordinateSchema,
	validateCreatePark,
	safeValidateCreatePark,
	safeValidateCreateParkForm
} from './parks.js';

describe('Parks Validation', () => {
	describe('createParkSchema', () => {
		it('should validate valid park data', () => {
			const validData = {
				name: 'Yellowstone National Park',
				state: 'Wyoming',
				description: 'A beautiful national park',
				latitude: 44.428,
				longitude: -110.5885,
				establishedDate: new Date('1872-03-01'),
				area: 898317 // Valid area in acres
			};

			const result = createParkSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it('should validate minimal required data', () => {
			const minimalData = {
				name: 'Test Park',
				state: 'CA'
			};

			const result = createParkSchema.parse(minimalData);
			expect(result.name).toBe('Test Park');
			expect(result.state).toBe('CA');
		});

		it('should trim whitespace from name and state', () => {
			const dataWithWhitespace = {
				name: '  Yellowstone  ',
				state: '  Wyoming  '
			};

			const result = createParkSchema.parse(dataWithWhitespace);
			expect(result.name).toBe('Yellowstone');
			expect(result.state).toBe('Wyoming');
		});

		it('should reject empty name', () => {
			const invalidData = {
				name: '',
				state: 'Wyoming'
			};

			expect(() => createParkSchema.parse(invalidData)).toThrow('Park name is required');
		});

		it('should reject name that is too long', () => {
			const invalidData = {
				name: 'x'.repeat(101),
				state: 'Wyoming'
			};

			expect(() => createParkSchema.parse(invalidData)).toThrow(
				'Park name must be less than 100 characters'
			);
		});

		it('should reject empty state', () => {
			const invalidData = {
				name: 'Test Park',
				state: ''
			};

			expect(() => createParkSchema.parse(invalidData)).toThrow('State is required');
		});

		it('should reject state that is too short', () => {
			const invalidData = {
				name: 'Test Park',
				state: 'A'
			};

			expect(() => createParkSchema.parse(invalidData)).toThrow('State is required');
		});

		it('should reject description that is too long', () => {
			const invalidData = {
				name: 'Test Park',
				state: 'Wyoming',
				description: 'x'.repeat(2001)
			};

			expect(() => createParkSchema.parse(invalidData)).toThrow(
				'Description must be less than 2000 characters'
			);
		});

		it('should reject invalid latitude', () => {
			const invalidData = {
				name: 'Test Park',
				state: 'Wyoming',
				latitude: 91
			};

			expect(() => createParkSchema.parse(invalidData)).toThrow(
				'Latitude must be between -90 and 90 degrees'
			);
		});

		it('should reject invalid longitude', () => {
			const invalidData = {
				name: 'Test Park',
				state: 'Wyoming',
				longitude: 181
			};

			expect(() => createParkSchema.parse(invalidData)).toThrow(
				'Longitude must be between -180 and 180 degrees'
			);
		});

		it('should reject future established date', () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);

			const invalidData = {
				name: 'Test Park',
				state: 'Wyoming',
				establishedDate: futureDate
			};

			expect(() => createParkSchema.parse(invalidData)).toThrow(
				'Established date cannot be in the future'
			);
		});

		it('should reject negative area', () => {
			const invalidData = {
				name: 'Test Park',
				state: 'Wyoming',
				area: -100
			};

			expect(() => createParkSchema.parse(invalidData)).toThrow('Area must be a positive number');
		});

		it('should reject unreasonably large area', () => {
			const invalidData = {
				name: 'Test Park',
				state: 'Wyoming',
				area: 1000001
			};

			expect(() => createParkSchema.parse(invalidData)).toThrow('Area seems unreasonably large');
		});
	});

	describe('updateParkSchema', () => {
		it('should validate update with all fields', () => {
			const updateData = {
				id: 1,
				name: 'Updated Park',
				state: 'California',
				description: 'Updated description'
			};

			const result = updateParkSchema.parse(updateData);
			expect(result).toEqual(updateData);
		});

		it('should validate partial update', () => {
			const partialUpdate = {
				id: 1,
				name: 'Updated Name Only'
			};

			const result = updateParkSchema.parse(partialUpdate);
			expect(result.id).toBe(1);
			expect(result.name).toBe('Updated Name Only');
		});

		it('should require valid ID', () => {
			const invalidData = {
				id: -1,
				name: 'Test Park'
			};

			expect(() => updateParkSchema.parse(invalidData)).toThrow('Invalid park ID');
		});

		it('should require ID to be present', () => {
			const invalidData = {
				name: 'Test Park'
			};

			expect(() => updateParkSchema.parse(invalidData)).toThrow();
		});
	});

	describe('createParkFormSchema', () => {
		it('should validate form data with string inputs', () => {
			const formData = {
				name: 'Test Park',
				state: 'Wyoming',
				description: 'A test park',
				latitude: '44.4280',
				longitude: '-110.5885',
				establishedDate: '1872-03-01',
				area: '898317'
			};

			const result = createParkFormSchema.parse(formData);
			expect(result.name).toBe('Test Park');
			expect(result.latitude).toBe(44.428);
			expect(result.longitude).toBe(-110.5885);
			expect(result.establishedDate).toBeInstanceOf(Date);
			expect(result.area).toBe(898317);
		});

		it('should handle empty optional string fields', () => {
			const formData = {
				name: 'Test Park',
				state: 'Wyoming',
				latitude: '',
				longitude: '',
				establishedDate: '',
				area: ''
			};

			const result = createParkFormSchema.parse(formData);
			expect(result.name).toBe('Test Park');
			expect(result.latitude).toBeUndefined();
			expect(result.longitude).toBeUndefined();
			expect(result.establishedDate).toBeUndefined();
			expect(result.area).toBeUndefined();
		});

		it('should handle whitespace-only optional fields', () => {
			const formData = {
				name: 'Test Park',
				state: 'Wyoming',
				latitude: '   ',
				longitude: '   ',
				establishedDate: '   ',
				area: '   '
			};

			const result = createParkFormSchema.parse(formData);
			expect(result.latitude).toBeUndefined();
			expect(result.longitude).toBeUndefined();
			expect(result.establishedDate).toBeUndefined();
			expect(result.area).toBeUndefined();
		});

		it('should reject invalid latitude string', () => {
			const formData = {
				name: 'Test Park',
				state: 'Wyoming',
				latitude: 'not-a-number'
			};

			expect(() => createParkFormSchema.parse(formData)).toThrow('Invalid latitude format');
		});

		it('should reject invalid longitude string', () => {
			const formData = {
				name: 'Test Park',
				state: 'Wyoming',
				longitude: 'invalid'
			};

			expect(() => createParkFormSchema.parse(formData)).toThrow('Invalid longitude format');
		});

		it('should reject invalid date string', () => {
			const formData = {
				name: 'Test Park',
				state: 'Wyoming',
				establishedDate: 'not-a-date'
			};

			expect(() => createParkFormSchema.parse(formData)).toThrow('Invalid date format');
		});

		it('should reject invalid area string', () => {
			const formData = {
				name: 'Test Park',
				state: 'Wyoming',
				area: 'not-a-number'
			};

			expect(() => createParkFormSchema.parse(formData)).toThrow('Invalid area format');
		});

		it('should handle various date formats', () => {
			const validDateFormats = [
				'1872-03-01',
				'03/01/1872',
				'March 1, 1872',
				'1872-03-01T00:00:00Z'
			];

			validDateFormats.forEach((dateStr) => {
				const formData = {
					name: 'Test Park',
					state: 'Wyoming',
					establishedDate: dateStr
				};

				const result = createParkFormSchema.parse(formData);
				expect(result.establishedDate).toBeInstanceOf(Date);
			});
		});
	});

	describe('updateParkFormSchema', () => {
		it('should validate form update with ID string', () => {
			const formData = {
				id: '123',
				name: 'Updated Park'
			};

			const result = updateParkFormSchema.parse(formData);
			expect(result.id).toBe(123);
			expect(result.name).toBe('Updated Park');
		});

		it('should reject invalid ID string', () => {
			const formData = {
				id: 'not-a-number',
				name: 'Updated Park'
			};

			expect(() => updateParkFormSchema.parse(formData)).toThrow('Invalid park ID');
		});
	});

	describe('searchParksSchema', () => {
		it('should validate search query', () => {
			const searchData = {
				query: 'Yellowstone'
			};

			const result = searchParksSchema.parse(searchData);
			expect(result.query).toBe('Yellowstone');
		});

		it('should trim search query', () => {
			const searchData = {
				query: '  Yellowstone  '
			};

			const result = searchParksSchema.parse(searchData);
			expect(result.query).toBe('Yellowstone');
		});

		it('should reject empty search query', () => {
			const searchData = {
				query: ''
			};

			expect(() => searchParksSchema.parse(searchData)).toThrow('Search query is required');
		});

		it('should reject search query that is too long', () => {
			const searchData = {
				query: 'x'.repeat(101)
			};

			expect(() => searchParksSchema.parse(searchData)).toThrow(
				'Search query must be less than 100 characters'
			);
		});
	});

	describe('coordinateSchema', () => {
		it('should validate valid coordinates', () => {
			const coordinates = {
				latitude: 44.428,
				longitude: -110.5885
			};

			const result = coordinateSchema.parse(coordinates);
			expect(result).toEqual(coordinates);
		});

		it('should validate boundary coordinates', () => {
			const boundaryCoordinates = [
				{ latitude: 90, longitude: 180 },
				{ latitude: -90, longitude: -180 },
				{ latitude: 0, longitude: 0 }
			];

			boundaryCoordinates.forEach((coords) => {
				const result = coordinateSchema.parse(coords);
				expect(result).toEqual(coords);
			});
		});

		it('should reject invalid latitude', () => {
			const invalidCoords = {
				latitude: 91,
				longitude: 0
			};

			expect(() => coordinateSchema.parse(invalidCoords)).toThrow(
				'Latitude must be between -90 and 90 degrees'
			);
		});

		it('should reject invalid longitude', () => {
			const invalidCoords = {
				latitude: 0,
				longitude: 181
			};

			expect(() => coordinateSchema.parse(invalidCoords)).toThrow(
				'Longitude must be between -180 and 180 degrees'
			);
		});
	});

	describe('validation helper functions', () => {
		describe('validateCreatePark', () => {
			it('should validate and return parsed data', () => {
				const data = {
					name: 'Test Park',
					state: 'Wyoming'
				};

				const result = validateCreatePark(data);
				expect(result).toEqual(data);
			});

			it('should throw on invalid data', () => {
				const invalidData = {
					name: '',
					state: 'Wyoming'
				};

				expect(() => validateCreatePark(invalidData)).toThrow();
			});
		});

		describe('safe validation functions', () => {
			it('should return success result for valid data', () => {
				const data = {
					name: 'Test Park',
					state: 'Wyoming'
				};

				const result = safeValidateCreatePark(data);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data).toEqual(data);
				}
			});

			it('should return error result for invalid data', () => {
				const invalidData = {
					name: '',
					state: 'Wyoming'
				};

				const result = safeValidateCreatePark(invalidData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error).toBeDefined();
					expect(result.error.issues).toHaveLength(1);
					expect(result.error.issues[0].message).toBe('Park name is required');
				}
			});

			it('should handle form validation safely', () => {
				const invalidFormData = {
					name: '', // Invalid empty name - this will trigger a validation error
					state: 'Wyoming'
				};

				const result = safeValidateCreateParkForm(invalidFormData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues.length).toBeGreaterThan(0);
					expect(result.error.issues[0].message).toBe('Park name is required');
				}
			});
		});
	});

	describe('edge cases and error handling', () => {
		it('should handle null and undefined inputs', () => {
			expect(() => createParkSchema.parse(null)).toThrow();
			expect(() => createParkSchema.parse(undefined)).toThrow();
		});

		it('should handle non-object inputs', () => {
			expect(() => createParkSchema.parse('string')).toThrow();
			expect(() => createParkSchema.parse(123)).toThrow();
			expect(() => createParkSchema.parse([])).toThrow();
		});

		it('should handle missing required fields', () => {
			const incompleteData = {
				name: 'Test Park'
				// Missing state
			};

			expect(() => createParkSchema.parse(incompleteData)).toThrow();
		});

		it('should handle extra fields gracefully', () => {
			const dataWithExtraFields = {
				name: 'Test Park',
				state: 'Wyoming',
				extraField: 'should be ignored'
			};

			const result = createParkSchema.parse(dataWithExtraFields);
			expect(result.name).toBe('Test Park');
			expect(result.state).toBe('Wyoming');
			expect('extraField' in result).toBe(false);
		});

		it('should handle numeric strings in form validation', () => {
			const formData = {
				name: 'Test Park',
				state: 'Wyoming',
				latitude: '44.4280',
				longitude: '-110.5885',
				area: '1000.5'
			};

			const result = createParkFormSchema.parse(formData);
			expect(typeof result.latitude).toBe('number');
			expect(typeof result.longitude).toBe('number');
			expect(typeof result.area).toBe('number');
		});

		it('should handle decimal precision in coordinates', () => {
			const preciseCoords = {
				latitude: 44.42801234,
				longitude: -110.58851234
			};

			const result = coordinateSchema.parse(preciseCoords);
			expect(result.latitude).toBe(44.42801234);
			expect(result.longitude).toBe(-110.58851234);
		});
	});

	describe('real-world scenarios', () => {
		it('should validate complete park creation form submission', () => {
			const formSubmission = {
				name: 'Grand Canyon National Park',
				state: 'Arizona',
				description: 'A steep-sided canyon carved by the Colorado River in Arizona, United States.',
				latitude: '36.1069',
				longitude: '-112.1129',
				establishedDate: '1919-02-26',
				area: '593493'
			};

			const result = createParkFormSchema.parse(formSubmission);
			expect(result.name).toBe('Grand Canyon National Park');
			expect(result.state).toBe('Arizona');
			expect(result.latitude).toBe(36.1069);
			expect(result.longitude).toBe(-112.1129);
			expect(result.establishedDate).toBeInstanceOf(Date);
			expect(result.area).toBe(593493);
		});

		it('should validate partial park update form submission', () => {
			const updateSubmission = {
				id: '42',
				description: 'Updated park description with more details about the park features.'
			};

			const result = updateParkFormSchema.parse(updateSubmission);
			expect(result.id).toBe(42);
			expect(result.description).toBe(
				'Updated park description with more details about the park features.'
			);
		});

		it('should validate search functionality', () => {
			const searchQueries = ['Yellowstone', 'Grand Canyon', 'Yosemite Valley', 'Utah parks', 'CA'];

			searchQueries.forEach((query) => {
				const result = searchParksSchema.parse({ query });
				expect(result.query).toBe(query);
			});
		});
	});
});
