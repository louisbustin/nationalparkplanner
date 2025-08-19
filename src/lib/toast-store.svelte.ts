/**
 * Toast notification store for managing temporary error and success messages
 */

import type { ToastMessage, ToastType } from './components/Toast.svelte';

class ToastStore {
	private toasts = $state<ToastMessage[]>([]);
	private nextId = 0;

	get items() {
		return this.toasts;
	}

	/**
	 * Add a new toast notification
	 */
	add(message: string, type: ToastType = 'info', duration = 5000): string {
		const id = `toast-${++this.nextId}`;
		const toast: ToastMessage = {
			id,
			message,
			type,
			duration
		};

		this.toasts.push(toast);
		return id;
	}

	/**
	 * Remove a toast by ID
	 */
	remove(id: string): void {
		const index = this.toasts.findIndex((toast) => toast.id === id);
		if (index > -1) {
			this.toasts.splice(index, 1);
		}
	}

	/**
	 * Clear all toasts
	 */
	clear(): void {
		this.toasts.length = 0;
	}

	/**
	 * Convenience methods for different toast types
	 */
	success(message: string, duration?: number): string {
		return this.add(message, 'success', duration);
	}

	error(message: string, duration?: number): string {
		return this.add(message, 'error', duration);
	}

	warning(message: string, duration?: number): string {
		return this.add(message, 'warning', duration);
	}

	info(message: string, duration?: number): string {
		return this.add(message, 'info', duration);
	}
}

// Global toast store instance
export const toastStore = new ToastStore();
