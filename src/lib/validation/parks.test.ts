import { describe, it, expect } from 'vitest';
import {
	updateParkSchema,
	createParkFormSchema,
	searchParksSchema,
	coordinateSchema,
	validateCreatePark,
	safeValidateCreatePark
} from './parks.js';

describe('parks validation schemas', () => {
	describe('createParkSchema', () => {
		it('should validate a valid park', () => {
			const validPark = {
				name: 'Yellowstone National Park',
				state: 'Wyoming',
				description: 'First national park in the world',
				latitude: 44.428,
				longitude: -110.588,
				establishedDate: new Date('1872-03-01'),
				area: 2221 // Area in square miles (reasonable size)
			};

			expect(() => validateCreatePark(validPark)).not.toThrow();
		});

		it('should validate minimal required fields', () => {
			const minimalPark = {
				name: 'Test Park',
				state: 'CA'
			};

			expect(() => validateCreatePark(minimalPark)).not.toThrow();
		});

		it('should reject invalid latitude', () => {
			const invalidPark = {
				name: 'Test Park',
				state: 'CA',
				latitude: 91 // Invalid: > 90
			};

			const result = safeValidateCreatePark(invalidPark);
			expect(result.success).toBe(false);
		});

		it('should reject invalid longitude', () => {
			const invalidPark = {
				name: 'Test Park',
				state: 'CA',
				longitude: -181 // Invalid: < -180
			};

			const result = safeValidateCreatePark(invalidPark);
			expect(result.success).toBe(false);
		});

		it('should reject future established date', () => {
			const invalidPark = {
				name: 'Test Park',
				state: 'CA',
				establishedDate: new Date('2030-01-01') // Future date
			};

			const result = safeValidateCreatePark(invalidPark);
			expect(result.success).toBe(false);
		});

		it('should reject negative area', () => {
			const invalidPark = {
				name: 'Test Park',
				state: 'CA',
				area: -100 // Negative area
			};

			const result = safeValidateCreatePark(invalidPark);
			expect(result.success).toBe(false);
		});
	});

	describe('createParkFormSchema', () => {
		it('should transform string coordinates to numbers', () => {
			const formData = {
				name: 'Test Park',
				state: 'CA',
				latitude: '44.428',
				longitude: '-110.588'
			};

			const result = createParkFormSchema.parse(formData);
			expect(result.latitude).toBe(44.428);
			expect(result.longitude).toBe(-110.588);
		});

		it('should handle empty string coordinates', () => {
			const formData = {
				name: 'Test Park',
				state: 'CA',
				latitude: '',
				longitude: ''
			};

			const result = createParkFormSchema.parse(formData);
			expect(result.latitude).toBeUndefined();
			expect(result.longitude).toBeUndefined();
		});

		it('should transform string date to Date object', () => {
			const formData = {
				name: 'Test Park',
				state: 'CA',
				establishedDate: '1872-03-01'
			};

			const result = createParkFormSchema.parse(formData);
			expect(result.establishedDate).toBeInstanceOf(Date);
			expect(result.establishedDate?.getFullYear()).toBe(1872);
		});

		it('should transform string area to number', () => {
			const formData = {
				name: 'Test Park',
				state: 'CA',
				area: '2221'
			};

			const result = createParkFormSchema.parse(formData);
			expect(result.area).toBe(2221);
		});
	});

	describe('updateParkSchema', () => {
		it('should allow partial updates', () => {
			const updateData = {
				id: 1,
				name: 'Updated Park Name'
			};

			const result = updateParkSchema.parse(updateData);
			expect(result.id).toBe(1);
			expect(result.name).toBe('Updated Park Name');
			expect(result.state).toBeUndefined();
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

		it('should reject empty search query', () => {
			const searchData = {
				query: ''
			};

			const result = searchParksSchema.safeParse(searchData);
			expect(result.success).toBe(false);
		});
	});

	describe('coordinateSchema', () => {
		it('should validate valid coordinates', () => {
			const coordinates = {
				latitude: 44.428,
				longitude: -110.588
			};

			const result = coordinateSchema.parse(coordinates);
			expect(result.latitude).toBe(44.428);
			expect(result.longitude).toBe(-110.588);
		});

		it('should reject invalid coordinates', () => {
			const invalidCoordinates = {
				latitude: 91,
				longitude: -181
			};

			const result = coordinateSchema.safeParse(invalidCoordinates);
			expect(result.success).toBe(false);
		});
	});
});
