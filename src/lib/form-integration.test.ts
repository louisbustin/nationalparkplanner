/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFormLoadingManager } from './form-loading.svelte';
import { validateForm, authValidationRules, validatePasswordConfirmation } from './validation';
import { handleError, handleAuthError } from './error-utils';
import { toastStore } from './toast-store.svelte';
import { loadingStore, LOADING_KEYS } from './loading-store.svelte';

// Mock dependencies
vi.mock('./toast-store.svelte', () => ({
	toastStore: {
		error: vi.fn(),
		success: vi.fn(),
		warning: vi.fn(),
		info: vi.fn(),
		clear: vi.fn()
	}
}));

vi.mock('./error-utils', () => ({
	handleError: vi.fn(),
	handleAuthError: vi.fn(),
	ERROR_MESSAGES: {
		INVALID_CREDENTIALS: 'Invalid email or password',
		EMAIL_ALREADY_EXISTS: 'Email already exists',
		NETWORK_ERROR: 'Network error'
	}
}));

describe('Form Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		loadingStore.clear();
		toastStore.clear();
	});

	describe('Registration Form Integration', () => {
		it('should handle complete registration form flow', async () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.REGISTER);

			// Initial state
			expect(formManager.isLoading).toBe(false);
			expect(formManager.hasErrors).toBe(false);

			// Simulate form data
			const formData = {
				name: 'John Doe',
				email: 'john@example.com',
				password: 'password123',
				confirmPassword: 'password123'
			};

			// Step 1: Validate form
			const validationResult = validateForm(
				formData,
				{
					name: authValidationRules.name,
					email: authValidationRules.email,
					password: authValidationRules.password
				},
				{
					confirmPassword: validatePasswordConfirmation
				}
			);

			expect(validationResult.isValid).toBe(true);
			expect(validationResult.errors).toEqual({});

			// Step 2: Submit form with loading management
			const mockRegistration = vi.fn().mockResolvedValue({
				user: { id: '123', name: 'John Doe', email: 'john@example.com' }
			});

			const result = await formManager.handleSubmit(mockRegistration, {
				onSuccess: (data) => {
					expect(data.user.name).toBe('John Doe');
				}
			});

			expect(result.success).toBe(true);
			expect(formManager.isLoading).toBe(false);
			expect(mockRegistration).toHaveBeenCalled();
		});

		it('should handle registration form validation errors', async () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.REGISTER);

			// Invalid form data
			const invalidFormData = {
				name: 'A', // Too short
				email: 'invalid-email',
				password: 'weak',
				confirmPassword: 'different'
			};

			// Validate form
			const validationResult = validateForm(
				invalidFormData,
				{
					name: authValidationRules.name,
					email: authValidationRules.email,
					password: authValidationRules.password
				},
				{
					confirmPassword: validatePasswordConfirmation
				}
			);

			expect(validationResult.isValid).toBe(false);

			// Set field errors in form manager
			formManager.setFieldErrors(validationResult.errors);

			expect(formManager.hasErrors).toBe(true);
			expect(formManager.fieldErrors.name).toBeDefined();
			expect(formManager.fieldErrors.email).toBeDefined();
			expect(formManager.fieldErrors.password).toBeDefined();
			expect(formManager.fieldErrors.confirmPassword).toBeDefined();
		});

		it('should handle registration server errors', async () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.REGISTER);

			const serverError = new Error('Email already exists');
			const mockRegistration = vi.fn().mockRejectedValue(serverError);

			// Mock error handling
			(handleError as any).mockReturnValue({
				message: 'Email already exists',
				code: 'EMAIL_ALREADY_EXISTS',
				severity: 'error'
			});

			const result = await formManager.handleSubmit(mockRegistration);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
			expect(formManager.error).toBe('Email already exists');
			expect(formManager.isLoading).toBe(false);
			expect(handleError).toHaveBeenCalledWith(serverError, { showToast: false });
		});
	});

	describe('Login Form Integration', () => {
		it('should handle complete login form flow', async () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.LOGIN);

			const loginData = {
				email: 'john@example.com',
				password: 'password123'
			};

			// Validate login form
			const validationResult = validateForm(loginData, {
				email: authValidationRules.email,
				password: authValidationRules.password
			});

			expect(validationResult.isValid).toBe(true);

			// Mock successful login
			const mockLogin = vi.fn().mockResolvedValue({
				user: { id: '123', name: 'John Doe', email: 'john@example.com' },
				session: { id: 'session-123', token: 'token-123' }
			});

			const result = await formManager.handleSubmit(mockLogin, {
				onSuccess: (data) => {
					expect(data.user.email).toBe('john@example.com');
				}
			});

			expect(result.success).toBe(true);
			expect(formManager.isLoading).toBe(false);
		});

		it('should handle login credential errors', async () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.LOGIN);

			const credentialsError = new Error('Invalid credentials');
			const mockLogin = vi.fn().mockRejectedValue(credentialsError);

			// Mock auth error handling
			(handleAuthError as any).mockReturnValue({
				message: 'Invalid email or password',
				code: 'INVALID_CREDENTIALS',
				severity: 'error',
				field: 'email'
			});

			const result = await formManager.handleSubmit(mockLogin);

			expect(result.success).toBe(false);
			expect(formManager.hasErrors).toBe(true);
		});

		it('should handle network errors during login', async () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.LOGIN);

			const networkError = new TypeError('Failed to fetch');
			const mockLogin = vi.fn().mockRejectedValue(networkError);

			// Mock network error handling
			(handleError as any).mockReturnValue({
				message: 'Connection failed. Please check your internet connection.',
				code: 'NETWORK_ERROR',
				severity: 'error'
			});

			const result = await formManager.handleSubmit(mockLogin);

			expect(result.success).toBe(false);
			expect(formManager.error).toBe('Connection failed. Please check your internet connection.');
		});
	});

	describe('Profile Update Form Integration', () => {
		it('should handle profile update flow', async () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.PROFILE_UPDATE);

			const profileData = {
				name: 'John Updated Doe'
			};

			// Validate profile data
			const validationResult = validateForm(profileData, {
				name: authValidationRules.name
			});

			expect(validationResult.isValid).toBe(true);

			// Mock successful profile update
			const mockUpdate = vi.fn().mockResolvedValue({
				user: { id: '123', name: 'John Updated Doe', email: 'john@example.com' }
			});

			const result = await formManager.handleSubmit(mockUpdate, {
				onSuccess: (data) => {
					expect(data.user.name).toBe('John Updated Doe');
				},
				showToast: true
			});

			expect(result.success).toBe(true);
			expect(formManager.isLoading).toBe(false);
		});

		it('should handle profile update validation errors', () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.PROFILE_UPDATE);

			const invalidProfileData = {
				name: '' // Required field
			};

			const validationResult = validateForm(invalidProfileData, {
				name: authValidationRules.name
			});

			expect(validationResult.isValid).toBe(false);
			expect(validationResult.errors.name).toBeDefined();

			// Set validation errors
			formManager.setFieldErrors(validationResult.errors);
			expect(formManager.hasErrors).toBe(true);
		});
	});

	describe('Form State Management Integration', () => {
		it('should coordinate multiple form managers', () => {
			const loginManager = createFormLoadingManager(LOADING_KEYS.LOGIN);
			const registerManager = createFormLoadingManager(LOADING_KEYS.REGISTER);

			// Start loading on login form
			loginManager.startLoading();
			expect(loginManager.isLoading).toBe(true);
			expect(registerManager.isLoading).toBe(false);
			expect(loadingStore.isLoading(LOADING_KEYS.LOGIN)).toBe(true);
			expect(loadingStore.isLoading(LOADING_KEYS.REGISTER)).toBe(false);

			// Start loading on register form
			registerManager.startLoading();
			expect(loginManager.isLoading).toBe(true);
			expect(registerManager.isLoading).toBe(true);
			expect(loadingStore.hasAnyLoading).toBe(true);

			// Stop loading on login form
			loginManager.stopLoading();
			expect(loginManager.isLoading).toBe(false);
			expect(registerManager.isLoading).toBe(true);
			expect(loadingStore.hasAnyLoading).toBe(true);

			// Stop loading on register form
			registerManager.stopLoading();
			expect(loadingStore.hasAnyLoading).toBe(false);
		});

		it('should handle form reset and cleanup', () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.LOGIN);

			// Set various states
			formManager.startLoading();
			formManager.setError('Some error');
			formManager.setFieldError('email', 'Invalid email');

			// The setError method stops loading, so we need to check the state after setting error
			expect(formManager.isLoading).toBe(false); // setError stops loading
			expect(formManager.hasErrors).toBe(true);

			// Reset form
			formManager.reset();

			expect(formManager.isLoading).toBe(false);
			expect(formManager.error).toBeNull();
			expect(formManager.fieldErrors).toEqual({});
			expect(formManager.hasErrors).toBe(false);
			expect(loadingStore.isLoading(LOADING_KEYS.LOGIN)).toBe(false);
		});

		it('should handle concurrent form operations', async () => {
			const formManager = createFormLoadingManager('concurrent-test');

			const operation1 = vi
				.fn()
				.mockImplementation(
					() => new Promise((resolve) => setTimeout(() => resolve('result1'), 50))
				);
			const operation2 = vi
				.fn()
				.mockImplementation(
					() => new Promise((resolve) => setTimeout(() => resolve('result2'), 30))
				);

			// Start concurrent operations
			const promise1 = formManager.handleSubmit(operation1);
			const promise2 = formManager.handleSubmit(operation2);

			// Both should be handled properly
			const [result1, result2] = await Promise.all([promise1, promise2]);

			expect(result1.success).toBe(true);
			expect(result2.success).toBe(true);
			expect(formManager.isLoading).toBe(false);
		});
	});

	describe('Error Recovery Integration', () => {
		it('should handle error recovery after failed submission', async () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.LOGIN);

			// First attempt fails
			const failingOperation = vi.fn().mockRejectedValue(new Error('Network error'));
			(handleError as any).mockReturnValue({
				message: 'Network error occurred',
				code: 'NETWORK_ERROR',
				severity: 'error'
			});

			const failResult = await formManager.handleSubmit(failingOperation);
			expect(failResult.success).toBe(false);
			expect(formManager.hasErrors).toBe(true);

			// Clear errors and retry
			formManager.clearErrors();
			expect(formManager.hasErrors).toBe(false);

			// Second attempt succeeds
			const successOperation = vi.fn().mockResolvedValue({ success: true });
			const successResult = await formManager.handleSubmit(successOperation);

			expect(successResult.success).toBe(true);
			expect(formManager.hasErrors).toBe(false);
		});

		it('should handle partial form validation recovery', () => {
			const formManager = createFormLoadingManager('validation-test');

			// Set multiple field errors
			formManager.setFieldErrors({
				email: 'Invalid email',
				password: 'Password too weak',
				name: 'Name too short'
			});

			expect(formManager.hasErrors).toBe(true);
			expect(Object.keys(formManager.fieldErrors)).toHaveLength(3);

			// Clear individual field errors as user fixes them
			formManager.clearFieldError('email');
			expect(formManager.fieldErrors.email).toBeUndefined();
			expect(Object.keys(formManager.fieldErrors)).toHaveLength(2);
			expect(formManager.hasErrors).toBe(true); // Still has other errors

			formManager.clearFieldError('password');
			formManager.clearFieldError('name');
			expect(formManager.hasErrors).toBe(false); // All errors cleared
		});
	});

	describe('Loading State Integration', () => {
		it('should integrate with global loading store', async () => {
			const formManager = createFormLoadingManager(LOADING_KEYS.LOGIN);

			expect(loadingStore.hasAnyLoading).toBe(false);

			// Start form operation
			const operation = vi
				.fn()
				.mockImplementation(
					() => new Promise((resolve) => setTimeout(() => resolve('result'), 50))
				);

			const promise = formManager.handleSubmit(operation);

			// Should be loading
			expect(formManager.isLoading).toBe(true);
			expect(loadingStore.isLoading(LOADING_KEYS.LOGIN)).toBe(true);
			expect(loadingStore.hasAnyLoading).toBe(true);

			await promise;

			// Should stop loading
			expect(formManager.isLoading).toBe(false);
			expect(loadingStore.isLoading(LOADING_KEYS.LOGIN)).toBe(false);
			expect(loadingStore.hasAnyLoading).toBe(false);
		});

		it('should handle loading state with multiple forms', () => {
			const loginManager = createFormLoadingManager(LOADING_KEYS.LOGIN);
			const profileManager = createFormLoadingManager(LOADING_KEYS.PROFILE_UPDATE);

			// Start loading on both forms
			loginManager.startLoading();
			profileManager.startLoading();

			expect(loadingStore.hasAnyLoading).toBe(true);
			expect(loadingStore.isLoading(LOADING_KEYS.LOGIN)).toBe(true);
			expect(loadingStore.isLoading(LOADING_KEYS.PROFILE_UPDATE)).toBe(true);

			// Stop one form
			loginManager.stopLoading();
			expect(loadingStore.hasAnyLoading).toBe(true); // Still has profile loading
			expect(loadingStore.isLoading(LOADING_KEYS.LOGIN)).toBe(false);
			expect(loadingStore.isLoading(LOADING_KEYS.PROFILE_UPDATE)).toBe(true);

			// Stop other form
			profileManager.stopLoading();
			expect(loadingStore.hasAnyLoading).toBe(false);
		});
	});

	describe('Validation Integration Scenarios', () => {
		it('should integrate real-time validation with form state', () => {
			const formManager = createFormLoadingManager('validation-integration');

			// Simulate progressive form filling
			const formData = { email: '', password: '', name: '' };

			// User starts typing email
			formData.email = 'invalid';
			let emailValidation = validateForm(
				{ email: formData.email },
				{
					email: authValidationRules.email
				}
			);

			if (!emailValidation.isValid) {
				formManager.setFieldError('email', emailValidation.errors.email);
			}
			expect(formManager.fieldErrors.email).toBeDefined();

			// User completes valid email
			formData.email = 'valid@example.com';
			emailValidation = validateForm(
				{ email: formData.email },
				{
					email: authValidationRules.email
				}
			);

			if (emailValidation.isValid) {
				formManager.clearFieldError('email');
			}
			expect(formManager.fieldErrors.email).toBeUndefined();

			// Similar process for other fields
			formData.password = 'weak';
			let passwordValidation = validateForm(
				{ password: formData.password },
				{
					password: authValidationRules.password
				}
			);

			if (!passwordValidation.isValid) {
				formManager.setFieldError('password', passwordValidation.errors.password);
			}
			expect(formManager.fieldErrors.password).toBeDefined();

			formData.password = 'strongPassword123';
			passwordValidation = validateForm(
				{ password: formData.password },
				{
					password: authValidationRules.password
				}
			);

			if (passwordValidation.isValid) {
				formManager.clearFieldError('password');
			}
			expect(formManager.fieldErrors.password).toBeUndefined();
		});
	});
});
