/**
 * Error handling utilities for authentication and general application errors
 */

import { toastStore } from './toast-store.svelte';

export interface AppError {
	message: string;
	code?: string;
	severity: 'error' | 'warning' | 'info';
	context?: Record<string, unknown>;
}

export interface AuthError extends AppError {
	field?: string;
}

/**
 * Standard error messages for common scenarios
 */
export const ERROR_MESSAGES = {
	// Network errors
	NETWORK_ERROR: 'Connection failed. Please check your internet connection and try again.',
	TIMEOUT_ERROR: 'Request timed out. Please try again.',
	SERVER_ERROR: 'Something went wrong on our end. Please try again later.',

	// Authentication errors
	INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials and try again.',
	EMAIL_ALREADY_EXISTS:
		'An account with this email already exists. Please use a different email or try logging in.',
	WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
	PASSWORDS_DONT_MATCH: 'Passwords do not match. Please make sure both passwords are identical.',
	SESSION_EXPIRED: 'Your session has expired. Please log in again.',
	UNAUTHORIZED: 'You are not authorized to access this resource. Please log in.',

	// Form validation errors
	REQUIRED_FIELD: 'This field is required.',
	INVALID_EMAIL: 'Please enter a valid email address.',
	INVALID_FORMAT: 'Please enter a valid format.',

	// General errors
	UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support.',
	MAINTENANCE: 'The service is temporarily unavailable for maintenance. Please try again later.'
} as const;

/**
 * Maps server error codes to user-friendly messages
 */
export function mapServerError(error: unknown): AppError {
	// Handle Better Auth errors
	if (error && typeof error === 'object' && 'message' in error) {
		const message = (error as { message: string }).message;

		// Map common Better Auth error messages
		if (message.includes('Invalid credentials') || message.includes('invalid_credentials')) {
			return {
				message: ERROR_MESSAGES.INVALID_CREDENTIALS,
				code: 'INVALID_CREDENTIALS',
				severity: 'error'
			};
		}

		if (message.includes('User already exists') || message.includes('email_already_exists')) {
			return {
				message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
				code: 'EMAIL_ALREADY_EXISTS',
				severity: 'error'
			};
		}

		if (message.includes('Session expired') || message.includes('session_expired')) {
			return {
				message: ERROR_MESSAGES.SESSION_EXPIRED,
				code: 'SESSION_EXPIRED',
				severity: 'warning'
			};
		}
	}

	// Handle fetch errors
	if (error instanceof TypeError && error.message.includes('fetch')) {
		return {
			message: ERROR_MESSAGES.NETWORK_ERROR,
			code: 'NETWORK_ERROR',
			severity: 'error'
		};
	}

	// Handle timeout errors
	if (error instanceof Error && error.name === 'AbortError') {
		return {
			message: ERROR_MESSAGES.TIMEOUT_ERROR,
			code: 'TIMEOUT_ERROR',
			severity: 'error'
		};
	}

	// Default error
	return {
		message: ERROR_MESSAGES.UNKNOWN_ERROR,
		code: 'UNKNOWN_ERROR',
		severity: 'error',
		context: { originalError: error }
	};
}

/**
 * Handles errors by displaying appropriate user feedback
 */
export function handleError(
	error: unknown,
	options?: {
		showToast?: boolean;
		logError?: boolean;
		context?: Record<string, unknown>;
	}
): AppError {
	const { showToast = true, logError = true, context } = options || {};

	const appError = mapServerError(error);

	// Add context if provided
	if (context) {
		appError.context = { ...appError.context, ...context };
	}

	// Log error for debugging (in development) or monitoring (in production)
	if (logError) {
		console.error('Application error:', {
			message: appError.message,
			code: appError.code,
			severity: appError.severity,
			context: appError.context,
			originalError: error
		});
	}

	// Show toast notification
	if (showToast) {
		if (appError.severity === 'error') {
			toastStore.error(appError.message);
		} else if (appError.severity === 'warning') {
			toastStore.warning(appError.message);
		} else {
			toastStore.info(appError.message);
		}
	}

	return appError;
}

/**
 * Handles authentication-specific errors
 */
export function handleAuthError(error: unknown, field?: string): AuthError {
	const appError = handleError(error, {
		showToast: false, // Don't show toast for form errors
		context: { field }
	});

	return {
		...appError,
		field
	};
}

/**
 * Creates a standardized error for form validation
 */
export function createValidationError(message: string, field?: string): AuthError {
	return {
		message,
		code: 'VALIDATION_ERROR',
		severity: 'error',
		field
	};
}

/**
 * Handles async operations with error handling
 */
export async function withErrorHandling<T>(
	operation: () => Promise<T>,
	options?: {
		showToast?: boolean;
		errorMessage?: string;
		context?: Record<string, unknown>;
	}
): Promise<{ data?: T; error?: AppError }> {
	try {
		const data = await operation();
		return { data };
	} catch (error) {
		const appError = handleError(error, {
			showToast: options?.showToast,
			context: options?.context
		});

		// Override error message if provided
		if (options?.errorMessage) {
			appError.message = options.errorMessage;
		}

		return { error: appError };
	}
}
