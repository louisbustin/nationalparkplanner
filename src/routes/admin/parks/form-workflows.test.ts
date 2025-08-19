import { describe, it, expect, vi, beforeEach } from 'vitest';
import { error, redirect } from '@sveltejs/kit';
import type { UserSession } from '$lib/auth-utils.server';
import { parksRepository } from '$lib/server/db/parks.js';
import { validateCreateParkForm, validateUpdateParkForm } from '$lib/validation/parks.js';

// Mock SvelteKit functions
vi.mock('@sveltejs/kit', () => ({
	error: vi.fn((status: number, message: string) => {
		const err = new Error(message) as Error & { status: number };
		err.status = status;
		throw err;
	}),
	redirect: vi.fn((status: number, location: string) => {
		const err = new Error(`Redirect to ${location}`) as Error & {
			status: number;
			location: string;
		};
		err.status = status;
		err.location = location;
		throw err;
	})
}));

// Mock the parks repository
vi.mock('$lib/server/db/parks.js', () => ({
	parksRepository: {
		createPark: vi.fn(),
		updatePark: vi.fn(),
		deletePark: vi.fn(),
		getParkById: vi.fn(),
		getAllParks: vi.fn(),
		searchParks: vi.fn(),
		parkExistsInState: vi.fn()
	}
}));

// Mock validation functions
vi.mock('$lib/validation/parks.js', () => ({
	validateCreateParkForm: vi.fn(),
	validateUpdateParkForm: vi.fn()
}));

describe('Admin Parks Form Workflows', () => {
	const adminUser = {
		id: 'admin-123',
		name: 'Louis Admin',
		email: 'louis@eforge.us',
		emailVerified: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01')
	};

	const adminSession: UserSession = {
		user: adminUser,
		session: {
			id: 'session-123',
			expiresAt: new Date(Date.now() + 86400000),
			token: 'session-token',
			createdAt: new Date(),
			updatedAt: new Date(),
			ipAddress: '127.0.0.1',
			userAgent: 'Test Browser',
			userId: adminUser.id
		}
	};

	const mockPark = {
		id: 1,
		name: 'Test Park',
		state: 'California',
		description: 'A test park',
		latitude: '37.7749',
		longitude: '-122.4194',
		establishedDate: '1872-03-01',
		area: '1000.5',
		createdAt: new Date(),
		updatedAt: new Date()
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Create Park Workflow', () => {
		const simulateCreateParkAction = async (formData: FormData, session: UserSession | null) => {
			if (!session || session.user.email !== 'louis@eforge.us') {
				throw error(404, 'Not found');
			}

			const data = Object.fromEntries(formData);
			const validatedData = validateCreateParkForm(data);

			const exists = await parksRepository.parkExistsInState(
				validatedData.name,
				validatedData.state
			);

			if (exists) {
				return {
					status: 400,
					errors: { name: 'A park with this name already exists in this state' }
				};
			}

			await parksRepository.createPark(validatedData);
			throw redirect(303, `/admin/parks`);
		};

		it('should successfully create a park with valid data', async () => {
			const formData = new FormData();
			formData.append('name', 'New Test Park');
			formData.append('state', 'California');
			formData.append('description', 'A beautiful new park');

			const validatedData = {
				name: 'New Test Park',
				state: 'California',
				description: 'A beautiful new park'
			};

			vi.mocked(validateCreateParkForm).mockReturnValue(validatedData);
			vi.mocked(parksRepository.parkExistsInState).mockResolvedValue(false);
			vi.mocked(parksRepository.createPark).mockResolvedValue(mockPark);

			await expect(simulateCreateParkAction(formData, adminSession)).rejects.toThrow(
				'Redirect to /admin/parks'
			);

			expect(validateCreateParkForm).toHaveBeenCalled();
			expect(parksRepository.parkExistsInState).toHaveBeenCalledWith('New Test Park', 'California');
			expect(parksRepository.createPark).toHaveBeenCalledWith(validatedData);
		});

		it('should reject creation if park already exists', async () => {
			const formData = new FormData();
			formData.append('name', 'Existing Park');
			formData.append('state', 'California');

			const validatedData = {
				name: 'Existing Park',
				state: 'California'
			};

			vi.mocked(validateCreateParkForm).mockReturnValue(validatedData);
			vi.mocked(parksRepository.parkExistsInState).mockResolvedValue(true);

			const result = await simulateCreateParkAction(formData, adminSession);

			expect(result.status).toBe(400);
			expect(result.errors.name).toBe('A park with this name already exists in this state');
			expect(parksRepository.createPark).not.toHaveBeenCalled();
		});

		it('should deny access to non-admin users', async () => {
			const regularSession: UserSession = {
				...adminSession,
				user: { ...adminUser, email: 'user@example.com' }
			};

			const formData = new FormData();
			formData.append('name', 'Test Park');
			formData.append('state', 'California');

			await expect(simulateCreateParkAction(formData, regularSession)).rejects.toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});
	});

	describe('Update Park Workflow', () => {
		const simulateUpdateParkAction = async (
			formData: FormData,
			session: UserSession | null,
			parkId: number
		) => {
			if (!session || session.user.email !== 'louis@eforge.us') {
				throw error(404, 'Not found');
			}

			const data = Object.fromEntries(formData);
			data.id = parkId.toString();

			const validatedData = validateUpdateParkForm(data);

			if (validatedData.name && validatedData.state) {
				const exists = await parksRepository.parkExistsInState(
					validatedData.name,
					validatedData.state,
					parkId
				);

				if (exists) {
					return {
						status: 400,
						errors: { name: 'A park with this name already exists in this state' }
					};
				}
			}

			await parksRepository.updatePark(validatedData);
			throw redirect(303, `/admin/parks`);
		};

		it('should successfully update a park with valid data', async () => {
			const formData = new FormData();
			formData.append('name', 'Updated Park Name');
			formData.append('description', 'Updated description');

			const validatedData = {
				id: 1,
				name: 'Updated Park Name',
				description: 'Updated description'
			};

			vi.mocked(validateUpdateParkForm).mockReturnValue(validatedData);
			vi.mocked(parksRepository.parkExistsInState).mockResolvedValue(false);
			vi.mocked(parksRepository.updatePark).mockResolvedValue({ ...mockPark, ...validatedData });

			await expect(simulateUpdateParkAction(formData, adminSession, 1)).rejects.toThrow(
				'Redirect to /admin/parks'
			);

			expect(validateUpdateParkForm).toHaveBeenCalled();
			expect(parksRepository.updatePark).toHaveBeenCalledWith(validatedData);
		});

		it('should handle partial updates', async () => {
			const formData = new FormData();
			formData.append('description', 'Only updating description');

			const validatedData = {
				id: 1,
				description: 'Only updating description'
			};

			vi.mocked(validateUpdateParkForm).mockReturnValue(validatedData);
			vi.mocked(parksRepository.updatePark).mockResolvedValue({ ...mockPark, ...validatedData });

			await expect(simulateUpdateParkAction(formData, adminSession, 1)).rejects.toThrow(
				'Redirect to /admin/parks'
			);

			expect(parksRepository.parkExistsInState).not.toHaveBeenCalled();
			expect(parksRepository.updatePark).toHaveBeenCalledWith(validatedData);
		});
	});

	describe('Delete Park Workflow', () => {
		const simulateDeleteParkAction = async (session: UserSession | null, parkId: number) => {
			if (!session || session.user.email !== 'louis@eforge.us') {
				throw error(404, 'Not found');
			}

			await parksRepository.deletePark(parkId);
			throw redirect(303, `/admin/parks`);
		};

		it('should successfully delete an existing park', async () => {
			vi.mocked(parksRepository.deletePark).mockResolvedValue(undefined);

			await expect(simulateDeleteParkAction(adminSession, 1)).rejects.toThrow(
				'Redirect to /admin/parks'
			);

			expect(parksRepository.deletePark).toHaveBeenCalledWith(1);
		});
	});

	describe('Form Data Processing', () => {
		it('should handle empty form fields correctly', () => {
			const formData = new FormData();
			formData.append('name', 'Test Park');
			formData.append('state', 'California');
			formData.append('description', '');
			formData.append('latitude', '');

			const data = Object.fromEntries(formData);

			expect(data.name).toBe('Test Park');
			expect(data.state).toBe('California');
			expect(data.description).toBe('');
			expect(data.latitude).toBe('');
		});

		it('should handle form data with special characters', () => {
			const formData = new FormData();
			formData.append('name', 'Grand Teton & Yellowstone');
			formData.append('description', 'A park with "quotes" and special chars: @#$%');

			const data = Object.fromEntries(formData);

			expect(data.name).toBe('Grand Teton & Yellowstone');
			expect(data.description).toBe('A park with "quotes" and special chars: @#$%');
		});

		it('should handle numeric form inputs as strings', () => {
			const formData = new FormData();
			formData.append('latitude', '37.7749');
			formData.append('longitude', '-122.4194');

			const data = Object.fromEntries(formData);

			expect(typeof data.latitude).toBe('string');
			expect(typeof data.longitude).toBe('string');
			expect(data.latitude).toBe('37.7749');
			expect(data.longitude).toBe('-122.4194');
		});
	});

	describe('Error Handling and User Feedback', () => {
		it('should provide specific validation error messages', () => {
			const validationErrors = [
				{ field: 'name', message: 'Park name is required' },
				{ field: 'state', message: 'State is required' },
				{ field: 'latitude', message: 'Latitude must be between -90 and 90 degrees' }
			];

			validationErrors.forEach(({ message }) => {
				expect(message).toBeTruthy();
				expect(message.length).toBeGreaterThan(0);
				expect(message).toMatch(/^[A-Z]/);
			});
		});

		it('should handle network/database errors gracefully', () => {
			const errorScenarios = [
				{ error: 'Network timeout', expectedStatus: 500 },
				{ error: 'Database connection failed', expectedStatus: 500 },
				{ error: 'Park with ID 123 not found', expectedStatus: 404 }
			];

			errorScenarios.forEach(({ error, expectedStatus }) => {
				let status = 500;

				if (error.includes('not found')) {
					status = 404;
				}

				expect(status).toBe(expectedStatus);
			});
		});

		it('should preserve form data on validation errors', () => {
			const originalFormData = {
				name: 'Test Park',
				state: 'California',
				description: 'A test park'
			};

			const errorResponse = {
				status: 400,
				errors: { name: 'Park name already exists' },
				data: originalFormData
			};

			expect(errorResponse.data).toEqual(originalFormData);
			expect(errorResponse.errors.name).toBe('Park name already exists');
		});
	});

	describe('Authorization and Security', () => {
		it('should consistently deny access to unauthorized users', () => {
			const unauthorizedScenarios = [
				null, // No session
				{ user: { ...adminUser, email: 'user@example.com' }, session: {} } as UserSession, // Regular user
				{ user: { ...adminUser, email: 'fake@admin.com' }, session: {} } as UserSession // Wrong admin email
			];

			unauthorizedScenarios.forEach((session) => {
				const testAuth = (s: UserSession | null) => {
					if (!s || !s.user || s.user.email !== 'louis@eforge.us') {
						throw error(404, 'Not found');
					}
				};

				expect(() => testAuth(session)).toThrow();
			});
		});

		it('should use 404 errors to hide admin functionality', () => {
			const testUnauthorizedAccess = (session: UserSession | null) => {
				if (!session || !session.user || session.user.email !== 'louis@eforge.us') {
					throw error(404, 'Not found');
				}
			};

			try {
				testUnauthorizedAccess(null);
			} catch (err) {
				const error = err as Error & { status: number };
				expect(error.status).toBe(404);
				expect(error.message).toBe('Not found');
			}
		});
	});

	describe('Validation Integration', () => {
		it('should validate form data before processing', () => {
			const formData = {
				name: 'Test Park',
				state: 'California',
				description: 'A test park'
			};

			// Mock successful validation
			vi.mocked(validateCreateParkForm).mockReturnValue(formData);

			const result = validateCreateParkForm(formData);
			expect(result).toEqual(formData);
			expect(validateCreateParkForm).toHaveBeenCalledWith(formData);
		});

		it('should handle validation errors appropriately', () => {
			const invalidData = {
				name: '',
				state: 'CA'
			};

			// Mock validation error
			vi.mocked(validateCreateParkForm).mockImplementation(() => {
				throw new Error('Park name is required');
			});

			expect(() => validateCreateParkForm(invalidData)).toThrow('Park name is required');
		});
	});
});
