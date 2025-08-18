import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadingStore, LOADING_KEYS } from './loading-store.svelte';

describe('loading-store', () => {
	beforeEach(() => {
		// Clear all loading states before each test
		loadingStore.clear();
	});

	describe('isLoading', () => {
		it('should return false for non-existent keys', () => {
			expect(loadingStore.isLoading('non-existent')).toBe(false);
		});

		it('should return true for active loading states', () => {
			loadingStore.start('test-key');
			expect(loadingStore.isLoading('test-key')).toBe(true);
		});

		it('should return false after stopping loading', () => {
			loadingStore.start('test-key');
			loadingStore.stop('test-key');
			expect(loadingStore.isLoading('test-key')).toBe(false);
		});
	});

	describe('hasAnyLoading', () => {
		it('should return false when no operations are loading', () => {
			expect(loadingStore.hasAnyLoading).toBe(false);
		});

		it('should return true when any operation is loading', () => {
			loadingStore.start('test-key');
			expect(loadingStore.hasAnyLoading).toBe(true);
		});

		it('should return false after all operations stop loading', () => {
			loadingStore.start('key1');
			loadingStore.start('key2');
			expect(loadingStore.hasAnyLoading).toBe(true);

			loadingStore.stop('key1');
			expect(loadingStore.hasAnyLoading).toBe(true);

			loadingStore.stop('key2');
			expect(loadingStore.hasAnyLoading).toBe(false);
		});
	});

	describe('states', () => {
		it('should return empty object when no loading states', () => {
			expect(loadingStore.states).toEqual({});
		});

		it('should return current loading states', () => {
			loadingStore.start('key1');
			loadingStore.start('key2');

			const states = loadingStore.states;
			expect(states).toEqual({
				key1: true,
				key2: true
			});
		});

		it('should return a copy of states (not reference)', () => {
			loadingStore.start('test');
			const states1 = loadingStore.states;
			const states2 = loadingStore.states;

			expect(states1).toEqual(states2);
			expect(states1).not.toBe(states2); // Different objects
		});
	});

	describe('setLoading', () => {
		it('should set loading state to true', () => {
			loadingStore.setLoading('test', true);
			expect(loadingStore.isLoading('test')).toBe(true);
		});

		it('should set loading state to false', () => {
			loadingStore.setLoading('test', true);
			loadingStore.setLoading('test', false);
			expect(loadingStore.isLoading('test')).toBe(false);
		});

		it('should remove key when setting to false', () => {
			loadingStore.setLoading('test', true);
			expect(loadingStore.states).toHaveProperty('test');

			loadingStore.setLoading('test', false);
			expect(loadingStore.states).not.toHaveProperty('test');
		});
	});

	describe('start and stop', () => {
		it('should start loading for a key', () => {
			loadingStore.start('test');
			expect(loadingStore.isLoading('test')).toBe(true);
		});

		it('should stop loading for a key', () => {
			loadingStore.start('test');
			loadingStore.stop('test');
			expect(loadingStore.isLoading('test')).toBe(false);
		});

		it('should handle multiple keys independently', () => {
			loadingStore.start('key1');
			loadingStore.start('key2');

			expect(loadingStore.isLoading('key1')).toBe(true);
			expect(loadingStore.isLoading('key2')).toBe(true);

			loadingStore.stop('key1');
			expect(loadingStore.isLoading('key1')).toBe(false);
			expect(loadingStore.isLoading('key2')).toBe(true);
		});
	});

	describe('clear', () => {
		it('should clear all loading states', () => {
			loadingStore.start('key1');
			loadingStore.start('key2');
			loadingStore.start('key3');

			expect(Object.keys(loadingStore.states)).toHaveLength(3);

			loadingStore.clear();
			expect(loadingStore.states).toEqual({});
			expect(loadingStore.hasAnyLoading).toBe(false);
		});

		it('should handle empty state gracefully', () => {
			expect(() => loadingStore.clear()).not.toThrow();
			expect(loadingStore.states).toEqual({});
		});
	});

	describe('withLoading', () => {
		it('should manage loading state during async operation', async () => {
			const operation = vi.fn().mockResolvedValue('result');

			expect(loadingStore.isLoading('test')).toBe(false);

			const promise = loadingStore.withLoading('test', operation);

			// Should be loading during operation
			expect(loadingStore.isLoading('test')).toBe(true);

			const result = await promise;

			// Should stop loading after operation
			expect(loadingStore.isLoading('test')).toBe(false);
			expect(result).toBe('result');
			expect(operation).toHaveBeenCalledOnce();
		});

		it('should stop loading even if operation throws', async () => {
			const operation = vi.fn().mockRejectedValue(new Error('Test error'));

			expect(loadingStore.isLoading('test')).toBe(false);

			try {
				await loadingStore.withLoading('test', operation);
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
			}

			// Should stop loading even after error
			expect(loadingStore.isLoading('test')).toBe(false);
		});

		it('should handle multiple concurrent operations', async () => {
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

			const promise1 = loadingStore.withLoading('key1', operation1);
			const promise2 = loadingStore.withLoading('key2', operation2);

			// Both should be loading
			expect(loadingStore.isLoading('key1')).toBe(true);
			expect(loadingStore.isLoading('key2')).toBe(true);
			expect(loadingStore.hasAnyLoading).toBe(true);

			const [result1, result2] = await Promise.all([promise1, promise2]);

			expect(result1).toBe('result1');
			expect(result2).toBe('result2');
			expect(loadingStore.hasAnyLoading).toBe(false);
		});
	});

	describe('LOADING_KEYS constants', () => {
		it('should provide predefined loading keys', () => {
			expect(LOADING_KEYS.LOGIN).toBe('auth.login');
			expect(LOADING_KEYS.REGISTER).toBe('auth.register');
			expect(LOADING_KEYS.LOGOUT).toBe('auth.logout');
			expect(LOADING_KEYS.PROFILE_UPDATE).toBe('profile.update');
			expect(LOADING_KEYS.PROFILE_LOAD).toBe('profile.load');
			expect(LOADING_KEYS.SESSION_CHECK).toBe('auth.session_check');
		});

		it('should work with loading store methods', () => {
			loadingStore.start(LOADING_KEYS.LOGIN);
			expect(loadingStore.isLoading(LOADING_KEYS.LOGIN)).toBe(true);

			loadingStore.stop(LOADING_KEYS.LOGIN);
			expect(loadingStore.isLoading(LOADING_KEYS.LOGIN)).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should handle empty string keys', () => {
			loadingStore.start('');
			expect(loadingStore.isLoading('')).toBe(true);
		});

		it('should handle special character keys', () => {
			const specialKey = 'key.with-special_chars@123';
			loadingStore.start(specialKey);
			expect(loadingStore.isLoading(specialKey)).toBe(true);
		});

		it('should handle stopping non-existent keys gracefully', () => {
			expect(() => loadingStore.stop('non-existent')).not.toThrow();
			expect(loadingStore.isLoading('non-existent')).toBe(false);
		});

		it('should handle starting the same key multiple times', () => {
			loadingStore.start('test');
			loadingStore.start('test');
			loadingStore.start('test');

			expect(loadingStore.isLoading('test')).toBe(true);
			expect(Object.keys(loadingStore.states)).toHaveLength(1);
		});
	});
});
