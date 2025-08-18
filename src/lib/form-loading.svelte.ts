/**
 * Form loading and error state management utilities
 */

import { loadingStore } from './loading-store.svelte';
import { handleError, type AppError } from './error-utils';

export interface FormLoadingState {
	isLoading: boolean;
	error: string | null;
	fieldErrors: Record<string, string>;
}

export class FormLoadingManager {
	private loadingKey: string;
	private state = $state<FormLoadingState>({
		isLoading: false,
		error: null,
		fieldErrors: {}
	});

	constructor(loadingKey: string) {
		this.loadingKey = loadingKey;
	}

	get isLoading(): boolean {
		return this.state.isLoading;
	}

	get error(): string | null {
		return this.state.error;
	}

	get fieldErrors(): Record<string, string> {
		return this.state.fieldErrors;
	}

	get hasErrors(): boolean {
		return !!this.state.error || Object.keys(this.state.fieldErrors).length > 0;
	}

	/**
	 * Start loading state
	 */
	startLoading(): void {
		this.state.isLoading = true;
		this.state.error = null;
		this.state.fieldErrors = {};
		loadingStore.start(this.loadingKey);
	}

	/**
	 * Stop loading state
	 */
	stopLoading(): void {
		this.state.isLoading = false;
		loadingStore.stop(this.loadingKey);
	}

	/**
	 * Set general error
	 */
	setError(error: string | AppError): void {
		if (typeof error === 'string') {
			this.state.error = error;
		} else {
			this.state.error = error.message;
		}
		this.stopLoading();
	}

	/**
	 * Set field-specific error
	 */
	setFieldError(field: string, error: string): void {
		this.state.fieldErrors[field] = error;
	}

	/**
	 * Set multiple field errors
	 */
	setFieldErrors(errors: Record<string, string>): void {
		this.state.fieldErrors = { ...errors };
		this.stopLoading();
	}

	/**
	 * Clear all errors
	 */
	clearErrors(): void {
		this.state.error = null;
		this.state.fieldErrors = {};
	}

	/**
	 * Clear specific field error
	 */
	clearFieldError(field: string): void {
		delete this.state.fieldErrors[field];
	}

	/**
	 * Handle form submission with loading and error management
	 */
	async handleSubmit<T>(
		operation: () => Promise<T>,
		options?: {
			onSuccess?: (result: T) => void | Promise<void>;
			onError?: (error: AppError) => void;
			showToast?: boolean;
		}
	): Promise<{ success: boolean; data?: T; error?: AppError }> {
		try {
			this.startLoading();
			const result = await operation();

			if (options?.onSuccess) {
				await options.onSuccess(result);
			}

			return { success: true, data: result };
		} catch (error) {
			const appError = handleError(error, {
				showToast: options?.showToast ?? false
			});

			this.setError(appError);

			if (options?.onError) {
				options.onError(appError);
			}

			return { success: false, error: appError };
		} finally {
			this.stopLoading();
		}
	}

	/**
	 * Reset the form state
	 */
	reset(): void {
		this.state.isLoading = false;
		this.state.error = null;
		this.state.fieldErrors = {};
		loadingStore.stop(this.loadingKey);
	}
}

/**
 * Create a form loading manager
 */
export function createFormLoadingManager(loadingKey: string): FormLoadingManager {
	return new FormLoadingManager(loadingKey);
}
