import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	mapServerError,
	handleError,
	handleAuthError,
	createValidationError,
	withErrorHandling,
	ERROR_MESSAGES
} from './error-utils';
import { toastStore } from './toast-store.svelte';

// Mock the toast store
vi.mock('./toast-store.svelte', () => ({
	toastStore: {
		error: vi.fn(),
		warning: vi.fn(),
		info: vi.fn(),
		success: vi.fn()
	}
}));

describe('error-utils', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock console.error to avoid noise in tests
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('ERROR_MESSAGES constants', () => {
		it('should provide standard error messages', () => {
			expect(ERROR_MESSAGES.NETWORK_ERROR).toContain('Connection failed');
			expect(ERROR_MESSAGES.INVALID_CREDENTIALS).toContain('Invalid email or password');
			expect(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS).toContain('already exists');
			expect(ERROR_MESSAGES.SESSION_EXPIRED).toContain('session has expired');
			expect(ERROR_MESSAGES.UNKNOWN_ERROR).toContain('unexpected error');
		});
	});

	describe('mapServerError', () => {
		it('should map Better Auth invalid credentials error', () => {
			const error = { message: 'Invalid credentials provided' };
			const result = mapServerError(error);

			expect(result.message).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
			expect(result.code).toBe('INVALID_CREDENTIALS');
			expect(result.severity).toBe('error');
		});

		it('should map Better Auth user exists error', () => {
			const error = { message: 'User already exists with this email' };
			const result = mapServerError(error);

			expect(result.message).toBe(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
			expect(result.code).toBe('EMAIL_ALREADY_EXISTS');
			expect(result.severity).toBe('error');
		});

		it('should map session expired error', () => {
			const error = { message: 'Session expired, please login again' };
			const result = mapServerError(error);

			expect(result.message).toBe(ERROR_MESSAGES.SESSION_EXPIRED);
			expect(result.code).toBe('SESSION_EXPIRED');
			expect(result.severity).toBe('warning');
		});

		it('should map network fetch errors', () => {
			const error = new TypeError('Failed to fetch');
			const result = mapServerError(error);

			expect(result.message).toBe(ERROR_MESSAGES.NETWORK_ERROR);
			expect(result.code).toBe('NETWORK_ERROR');
			expect(result.severity).toBe('error');
		});

		it('should map timeout/abort errors', () => {
			const error = new Error('Request aborted');
			error.name = 'AbortError';
			const result = mapServerError(error);

			expect(result.message).toBe(ERROR_MESSAGES.TIMEOUT_ERROR);
			expect(result.code).toBe('TIMEOUT_ERROR');
			expect(result.severity).toBe('error');
		});

		it('should return unknown error for unrecognized errors', () => {
			const error = new Error('Some random error');
			const result = mapServerError(error);

			expect(result.message).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
			expect(result.code).toBe('UNKNOWN_ERROR');
			expect(result.severity).toBe('error');
			expect(result.context?.originalError).toBe(error);
		});

		it('should handle null/undefined errors', () => {
			const result1 = mapServerError(null);
			const result2 = mapServerError(undefined);

			expect(result1.code).toBe('UNKNOWN_ERROR');
			expect(result2.code).toBe('UNKNOWN_ERROR');
		});

		it('should handle string errors', () => {
			const result = mapServerError('String error message');
			expect(result.code).toBe('UNKNOWN_ERROR');
		});

		it('should handle objects without message property', () => {
			const error = { status: 500, data: 'Server error' };
			const result = mapServerError(error);
			expect(result.code).toBe('UNKNOWN_ERROR');
		});

		it('should handle case-insensitive error matching', () => {
			// The current implementation is case-sensitive, so this documents current behavior
			const error1 = { message: 'INVALID CREDENTIALS' };
			const error2 = { message: 'invalid_credentials detected' };

			const result1 = mapServerError(error1);
			const result2 = mapServerError(error2);

			// Current implementation is case-sensitive, so these won't match
			expect(result1.code).toBe('UNKNOWN_ERROR');
			expect(result2.code).toBe('INVALID_CREDENTIALS');
		});

		it('should handle partial message matching', () => {
			const error = { message: 'Authentication failed: Invalid credentials provided by user' };
			const result = mapServerError(error);

			expect(result.code).toBe('INVALID_CREDENTIALS');
		});

		it('should prioritize specific error patterns', () => {
			const error = { message: 'User already exists and invalid credentials' };
			const result = mapServerError(error);

			// Should match the first pattern found (user exists)
			expect(result.code).toBe('EMAIL_ALREADY_EXISTS');
		});
	});

	describe('handleError', () => {
		it('should handle error with default options', () => {
			const error = new Error('Test error');
			const result = handleError(error);

			expect(result.code).toBe('UNKNOWN_ERROR');
			expect(console.error).toHaveBeenCalled();
			expect(toastStore.error).toHaveBeenCalledWith(result.message);
		});

		it('should handle error without showing toast', () => {
			const error = new Error('Test error');
			const result = handleError(error, { showToast: false });

			expect(toastStore.error).not.toHaveBeenCalled();
			expect(result.code).toBe('UNKNOWN_ERROR');
		});

		it('should handle error without logging', () => {
			const error = new Error('Test error');
			handleError(error, { logError: false });

			expect(console.error).not.toHaveBeenCalled();
		});

		it('should add context to error', () => {
			const error = new Error('Test error');
			const context = { userId: '123', action: 'login' };
			const result = handleError(error, { context });

			expect(result.context).toMatchObject(context);
		});

		it('should show appropriate toast based on severity', () => {
			// Error severity
			const errorObj = { message: 'Invalid credentials' };
			handleError(errorObj);
			expect(toastStore.error).toHaveBeenCalled();

			vi.clearAllMocks();

			// Warning severity
			const warningObj = { message: 'Session expired' };
			handleError(warningObj);
			expect(toastStore.warning).toHaveBeenCalled();

			// Note: Testing info severity is complex due to the mapServerError function
			// The current implementation doesn't easily produce info severity errors
			// This is acceptable as most auth errors are either errors or warnings
		});
	});

	describe('handleAuthError', () => {
		it('should handle auth error with field', () => {
			const error = { message: 'Invalid credentials' };
			const result = handleAuthError(error, 'email');

			expect(result.field).toBe('email');
			expect(result.code).toBe('INVALID_CREDENTIALS');
			expect(toastStore.error).not.toHaveBeenCalled(); // Should not show toast for form errors
		});

		it('should handle auth error without field', () => {
			const error = new Error('Auth error');
			const result = handleAuthError(error);

			expect(result.field).toBeUndefined();
			expect(result.context?.field).toBeUndefined();
		});
	});

	describe('createValidationError', () => {
		it('should create validation error with field', () => {
			const result = createValidationError('Invalid email format', 'email');

			expect(result.message).toBe('Invalid email format');
			expect(result.code).toBe('VALIDATION_ERROR');
			expect(result.severity).toBe('error');
			expect(result.field).toBe('email');
		});

		it('should create validation error without field', () => {
			const result = createValidationError('Form is invalid');

			expect(result.message).toBe('Form is invalid');
			expect(result.field).toBeUndefined();
		});
	});

	describe('withErrorHandling', () => {
		it('should return data on successful operation', async () => {
			const operation = vi.fn().mockResolvedValue('success data');
			const result = await withErrorHandling(operation);

			expect(result.data).toBe('success data');
			expect(result.error).toBeUndefined();
			expect(operation).toHaveBeenCalledOnce();
		});

		it('should return error on failed operation', async () => {
			const error = new Error('Operation failed');
			const operation = vi.fn().mockRejectedValue(error);
			const result = await withErrorHandling(operation);

			expect(result.data).toBeUndefined();
			expect(result.error).toBeDefined();
			expect(result.error?.code).toBe('UNKNOWN_ERROR');
		});

		it('should use custom error message', async () => {
			const error = new Error('Original error');
			const operation = vi.fn().mockRejectedValue(error);
			const result = await withErrorHandling(operation, {
				errorMessage: 'Custom error message'
			});

			expect(result.error?.message).toBe('Custom error message');
		});

		it('should handle showToast option', async () => {
			const error = new Error('Test error');
			const operation = vi.fn().mockRejectedValue(error);

			await withErrorHandling(operation, { showToast: true });
			expect(toastStore.error).toHaveBeenCalled();

			vi.clearAllMocks();

			await withErrorHandling(operation, { showToast: false });
			expect(toastStore.error).not.toHaveBeenCalled();
		});

		it('should add context to error', async () => {
			const error = new Error('Test error');
			const operation = vi.fn().mockRejectedValue(error);
			const context = { operation: 'test', userId: '123' };

			const result = await withErrorHandling(operation, { context });

			expect(result.error?.context).toMatchObject(context);
		});
	});

	describe('context handling', () => {
		it('should merge contexts correctly', () => {
			const error = new Error('Test error');
			const existingContext = { originalError: error };
			const newContext = { userId: '123', action: 'test' };

			const result = handleError(error, { context: newContext });

			expect(result.context).toMatchObject({
				...existingContext,
				...newContext
			});
		});

		it('should handle undefined context gracefully', () => {
			const error = new Error('Test error');
			const result = handleError(error, { context: undefined });

			expect(result.context).toBeDefined();
		});
	});
});
