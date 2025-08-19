import { describe, it, expect, beforeEach } from 'vitest';
import { toastStore } from './toast-store.svelte';

describe('toast-store', () => {
	beforeEach(() => {
		// Clear all toasts before each test
		toastStore.clear();
	});

	describe('add', () => {
		it('should add a toast with default type and duration', () => {
			const id = toastStore.add('Test message');
			const toasts = toastStore.items;

			expect(toasts).toHaveLength(1);
			expect(toasts[0]).toMatchObject({
				id,
				message: 'Test message',
				type: 'info',
				duration: 5000
			});
		});

		it('should add a toast with custom type and duration', () => {
			const id = toastStore.add('Error message', 'error', 3000);
			const toasts = toastStore.items;

			expect(toasts).toHaveLength(1);
			expect(toasts[0]).toMatchObject({
				id,
				message: 'Error message',
				type: 'error',
				duration: 3000
			});
		});

		it('should generate unique IDs for multiple toasts', () => {
			const id1 = toastStore.add('Message 1');
			const id2 = toastStore.add('Message 2');

			expect(id1).not.toBe(id2);
			expect(toastStore.items).toHaveLength(2);
		});

		it('should return the generated ID', () => {
			const id = toastStore.add('Test');
			expect(typeof id).toBe('string');
			expect(id).toMatch(/^toast-\d+$/);
		});
	});

	describe('remove', () => {
		it('should remove a toast by ID', () => {
			const id1 = toastStore.add('Message 1');
			const id2 = toastStore.add('Message 2');

			expect(toastStore.items).toHaveLength(2);

			toastStore.remove(id1);
			expect(toastStore.items).toHaveLength(1);
			expect(toastStore.items[0].id).toBe(id2);
		});

		it('should handle removing non-existent toast gracefully', () => {
			toastStore.add('Message 1');
			expect(toastStore.items).toHaveLength(1);

			toastStore.remove('non-existent-id');
			expect(toastStore.items).toHaveLength(1);
		});

		it('should handle empty toast list', () => {
			expect(() => toastStore.remove('any-id')).not.toThrow();
		});
	});

	describe('clear', () => {
		it('should remove all toasts', () => {
			toastStore.add('Message 1');
			toastStore.add('Message 2');
			toastStore.add('Message 3');

			expect(toastStore.items).toHaveLength(3);

			toastStore.clear();
			expect(toastStore.items).toHaveLength(0);
		});

		it('should handle empty toast list', () => {
			expect(() => toastStore.clear()).not.toThrow();
			expect(toastStore.items).toHaveLength(0);
		});
	});

	describe('convenience methods', () => {
		it('should add success toast', () => {
			const id = toastStore.success('Success message');
			const toast = toastStore.items[0];

			expect(toast.type).toBe('success');
			expect(toast.message).toBe('Success message');
			expect(toast.id).toBe(id);
		});

		it('should add error toast', () => {
			const id = toastStore.error('Error message');
			const toast = toastStore.items[0];

			expect(toast.type).toBe('error');
			expect(toast.message).toBe('Error message');
			expect(toast.id).toBe(id);
		});

		it('should add warning toast', () => {
			const id = toastStore.warning('Warning message');
			const toast = toastStore.items[0];

			expect(toast.type).toBe('warning');
			expect(toast.message).toBe('Warning message');
			expect(toast.id).toBe(id);
		});

		it('should add info toast', () => {
			const id = toastStore.info('Info message');
			const toast = toastStore.items[0];

			expect(toast.type).toBe('info');
			expect(toast.message).toBe('Info message');
			expect(toast.id).toBe(id);
		});

		it('should accept custom duration in convenience methods', () => {
			toastStore.success('Success', 2000);
			toastStore.error('Error', 3000);

			const toasts = toastStore.items;
			expect(toasts[0].duration).toBe(2000);
			expect(toasts[1].duration).toBe(3000);
		});
	});

	describe('items getter', () => {
		it('should return current toast list', () => {
			expect(toastStore.items).toEqual([]);

			toastStore.add('Test 1');
			toastStore.add('Test 2');

			expect(toastStore.items).toHaveLength(2);
		});

		it('should return reactive reference to toasts', () => {
			const items1 = toastStore.items;
			toastStore.add('Test');
			const items2 = toastStore.items;

			// Should be the same reference (reactive)
			expect(items1).toBe(items2);
			expect(items1).toHaveLength(1);
		});
	});

	describe('toast ordering', () => {
		it('should maintain insertion order', () => {
			const id1 = toastStore.add('First');
			const id2 = toastStore.add('Second');
			const id3 = toastStore.add('Third');

			const toasts = toastStore.items;
			expect(toasts[0].id).toBe(id1);
			expect(toasts[1].id).toBe(id2);
			expect(toasts[2].id).toBe(id3);
		});

		it('should maintain order after removal', () => {
			const id1 = toastStore.add('First');
			const id2 = toastStore.add('Second');
			const id3 = toastStore.add('Third');

			toastStore.remove(id2);

			const toasts = toastStore.items;
			expect(toasts).toHaveLength(2);
			expect(toasts[0].id).toBe(id1);
			expect(toasts[1].id).toBe(id3);
		});
	});

	describe('edge cases', () => {
		it('should handle empty messages', () => {
			const id = toastStore.add('');
			const toast = toastStore.items[0];

			expect(toast.message).toBe('');
			expect(toast.id).toBe(id);
		});

		it('should handle zero duration', () => {
			toastStore.add('Test', 'info', 0);
			const toast = toastStore.items[0];

			expect(toast.duration).toBe(0);
		});

		it('should handle negative duration', () => {
			toastStore.add('Test', 'info', -1000);
			const toast = toastStore.items[0];

			expect(toast.duration).toBe(-1000);
		});

		it('should handle very long messages', () => {
			const longMessage = 'A'.repeat(1000);
			toastStore.add(longMessage);
			const toast = toastStore.items[0];

			expect(toast.message).toBe(longMessage);
		});
	});
});
