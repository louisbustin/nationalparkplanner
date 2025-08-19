/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormLoadingManager, createFormLoadingManager } from './form-loading.svelte';
import { loadingStore } from './loading-store.svelte';
import { handleError, type AppError } from './error-utils';

// Mock the error-utils module
vi.mock('./error-utils', () => ({
	handleError: vi.fn()
}));

describe('form-loading', () => {
	let manager: FormLoadingManager;
	const testKey = 'test-form';

	beforeEach(() => {
		vi.clearAllMocks();
		loadingStore.clear();
		manager = new FormLoadingManager(testKey);
	});

	describe('FormLoadingManager constructor', () => {
		it('should initialize with default state', () => {
			expect(manager.isLoading).toBe(false);
			expect(manager.error).toBeNull();
			expect(manager.fieldErrors).toEqual({});
			expect(manager.hasErrors).toBe(false);
		});
	});

	describe('loading state management', () => {
		it('should start loading correctly', () => {
			manager.startLoading();

			expect(manager.isLoading).toBe(true);
			expect(manager.error).toBeNull();
			expect(manager.fieldErrors).toEqual({});
			expect(loadingStore.isLoading(testKey)).toBe(true);
		});

		it('should stop loading correctly', () => {
			manager.startLoading();
			manager.stopLoading();

			expect(manager.isLoading).toBe(false);
			expect(loadingStore.isLoading(testKey)).toBe(false);
		});

		it('should clear errors when starting loading', () => {
			manager.setError('Test error');
			manager.setFieldError('email', 'Invalid email');

			manager.startLoading();

			expect(manager.error).toBeNull();
			expect(manager.fieldErrors).toEqual({});
		});
	});

	describe('error management', () => {
		it('should set general error from string', () => {
			manager.setError('Test error message');

			expect(manager.error).toBe('Test error message');
			expect(manager.hasErrors).toBe(true);
			expect(manager.isLoading).toBe(false);
		});

		it('should set general error from AppError object', () => {
			const appError: AppError = {
				message: 'App error message',
				code: 'TEST_ERROR',
				severity: 'error'
			};

			manager.setError(appError);

			expect(manager.error).toBe('App error message');
			expect(manager.hasErrors).toBe(true);
		});

		it('should set field-specific error', () => {
			manager.setFieldError('email', 'Invalid email format');

			expect(manager.fieldErrors.email).toBe('Invalid email format');
			expect(manager.hasErrors).toBe(true);
		});

		it('should set multiple field errors', () => {
			const errors = {
				email: 'Invalid email',
				password: 'Password too weak'
			};

			manager.setFieldErrors(errors);

			expect(manager.fieldErrors).toEqual(errors);
			expect(manager.hasErrors).toBe(true);
			expect(manager.isLoading).toBe(false);
		});

		it('should clear all errors', () => {
			manager.setError('General error');
			manager.setFieldError('email', 'Field error');

			manager.clearErrors();

			expect(manager.error).toBeNull();
			expect(manager.fieldErrors).toEqual({});
			expect(manager.hasErrors).toBe(false);
		});

		it('should clear specific field error', () => {
			manager.setFieldError('email', 'Email error');
			manager.setFieldError('password', 'Password error');

			manager.clearFieldError('email');

			expect(manager.fieldErrors.email).toBeUndefined();
			expect(manager.fieldErrors.password).toBe('Password error');
		});
	});

	describe('hasErrors getter', () => {
		it('should return false when no errors', () => {
			expect(manager.hasErrors).toBe(false);
		});

		it('should return true when general error exists', () => {
			manager.setError('General error');
			expect(manager.hasErrors).toBe(true);
		});

		it('should return true when field errors exist', () => {
			manager.setFieldError('email', 'Field error');
			expect(manager.hasErrors).toBe(true);
		});

		it('should return true when both error types exist', () => {
			manager.setError('General error');
			manager.setFieldError('email', 'Field error');
			expect(manager.hasErrors).toBe(true);
		});
	});

	describe('handleSubmit', () => {
		it('should handle successful operation', async () => {
			const operation = vi.fn().mockResolvedValue('success result');
			const onSuccess = vi.fn();

			const result = await manager.handleSubmit(operation, { onSuccess });

			expect(result.success).toBe(true);
			expect(result.data).toBe('success result');
			expect(result.error).toBeUndefined();
			expect(operation).toHaveBeenCalledOnce();
			expect(onSuccess).toHaveBeenCalledWith('success result');
			expect(manager.isLoading).toBe(false);
		});

		it('should handle operation failure', async () => {
			const error = new Error('Operation failed');
			const operation = vi.fn().mockRejectedValue(error);
			const onError = vi.fn();
			const mockAppError: AppError = {
				message: 'Handled error',
				severity: 'error'
			};

			(handleError as any).mockReturnValue(mockAppError);

			const result = await manager.handleSubmit(operation, { onError });

			expect(result.success).toBe(false);
			expect(result.data).toBeUndefined();
			expect(result.error).toBe(mockAppError);
			expect(handleError).toHaveBeenCalledWith(error, { showToast: false });
			expect(onError).toHaveBeenCalledWith(mockAppError);
			expect(manager.error).toBe('Handled error');
			expect(manager.isLoading).toBe(false);
		});

		it('should manage loading state during operation', async () => {
			let loadingDuringOperation = false;
			const operation = vi.fn().mockImplementation(async () => {
				loadingDuringOperation = manager.isLoading;
				return 'result';
			});

			expect(manager.isLoading).toBe(false);

			await manager.handleSubmit(operation);

			expect(loadingDuringOperation).toBe(true);
			expect(manager.isLoading).toBe(false);
		});

		it('should handle showToast option', async () => {
			const error = new Error('Test error');
			const operation = vi.fn().mockRejectedValue(error);

			await manager.handleSubmit(operation, { showToast: true });

			expect(handleError).toHaveBeenCalledWith(error, { showToast: true });
		});

		it('should stop loading even if onSuccess throws', async () => {
			const operation = vi.fn().mockResolvedValue('result');
			const onSuccess = vi.fn().mockRejectedValue(new Error('Success handler error'));

			// The handleSubmit method catches errors in onSuccess and treats them as failures
			const result = await manager.handleSubmit(operation, { onSuccess });
			expect(result.success).toBe(false);
			expect(manager.isLoading).toBe(false);
		});
	});

	describe('reset', () => {
		it('should reset all state', () => {
			manager.startLoading();
			manager.setError('Test error');
			manager.setFieldError('email', 'Field error');

			manager.reset();

			expect(manager.isLoading).toBe(false);
			expect(manager.error).toBeNull();
			expect(manager.fieldErrors).toEqual({});
			expect(manager.hasErrors).toBe(false);
			expect(loadingStore.isLoading(testKey)).toBe(false);
		});
	});

	describe('createFormLoadingManager', () => {
		it('should create a new FormLoadingManager instance', () => {
			const newManager = createFormLoadingManager('new-key');

			expect(newManager).toBeInstanceOf(FormLoadingManager);
			expect(newManager.isLoading).toBe(false);
			expect(newManager.error).toBeNull();
			expect(newManager.fieldErrors).toEqual({});
		});

		it('should create managers with different keys', () => {
			const manager1 = createFormLoadingManager('key1');
			const manager2 = createFormLoadingManager('key2');

			manager1.startLoading();
			expect(manager1.isLoading).toBe(true);
			expect(manager2.isLoading).toBe(false);

			expect(loadingStore.isLoading('key1')).toBe(true);
			expect(loadingStore.isLoading('key2')).toBe(false);
		});
	});

	describe('integration with loadingStore', () => {
		it('should sync with global loading store', () => {
			expect(loadingStore.isLoading(testKey)).toBe(false);

			manager.startLoading();
			expect(loadingStore.isLoading(testKey)).toBe(true);

			manager.stopLoading();
			expect(loadingStore.isLoading(testKey)).toBe(false);
		});

		it('should clean up loading state on reset', () => {
			manager.startLoading();
			expect(loadingStore.isLoading(testKey)).toBe(true);

			manager.reset();
			expect(loadingStore.isLoading(testKey)).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should handle empty field error key', () => {
			manager.setFieldError('', 'Empty key error');
			expect(manager.fieldErrors['']).toBe('Empty key error');

			manager.clearFieldError('');
			expect(manager.fieldErrors['']).toBeUndefined();
		});

		it('should handle clearing non-existent field error', () => {
			expect(() => manager.clearFieldError('non-existent')).not.toThrow();
		});

		it('should handle multiple start/stop loading calls', () => {
			manager.startLoading();
			manager.startLoading();
			expect(manager.isLoading).toBe(true);

			manager.stopLoading();
			expect(manager.isLoading).toBe(false);

			manager.stopLoading();
			expect(manager.isLoading).toBe(false);
		});

		it('should handle setting errors while loading', () => {
			manager.startLoading();
			expect(manager.isLoading).toBe(true);

			manager.setError('Error during loading');
			expect(manager.isLoading).toBe(false);
			expect(manager.error).toBe('Error during loading');
		});
	});
});
