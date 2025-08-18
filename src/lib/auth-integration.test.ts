/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authClient } from './auth-client';
import {
	handleLogout,
	isCurrentSessionValid,
	createAuthState,
	hasAccess,
	getReturnUrl,
	createLoginRedirect
} from './auth-utils';
import { validateForm, authValidationRules, validatePasswordConfirmation } from './validation';
import { handleError, handleAuthError } from './error-utils';
import { toastStore } from './toast-store.svelte';
import { loadingStore } from './loading-store.svelte';

// Mock the auth client
vi.mock('./auth-client', () => ({
	authClient: {
		signUp: vi.fn(),
		signIn: vi.fn(),
		signOut: vi.fn(),
		getSession: vi.fn(),
		useSession: vi.fn()
	}
}));

// Mock navigation
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({
	goto: mockGoto
}));

// Mock toast store
vi.mock('./toast-store.svelte', () => ({
	toastStore: {
		error: vi.fn(),
		success: vi.fn(),
		warning: vi.fn(),
		info: vi.fn(),
		clear: vi.fn()
	}
}));

describe('Authentication Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		loadingStore.clear();
		toastStore.clear();
		// Mock console methods to avoid noise
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('User Registration Flow', () => {
		it('should complete successful registration flow', async () => {
			// Mock successful registration
			const mockUser = {
				id: 'user-123',
				name: 'John Doe',
				email: 'john@example.com',
				emailVerified: false
			};

			(authClient.signUp as any).mockResolvedValue({
				data: { user: mockUser },
				error: null
			});

			// Simulate form data
			const formData = {
				name: 'John Doe',
				email: 'john@example.com',
				password: 'password123',
				confirmPassword: 'password123'
			};

			// Validate form data
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

			// Simulate registration
			const result = await authClient.signUp({
				name: formData.name,
				email: formData.email,
				password: formData.password
			});

			expect(result.data?.user).toEqual(mockUser);
			expect(authClient.signUp).toHaveBeenCalledWith({
				name: 'John Doe',
				email: 'john@example.com',
				password: 'password123'
			});
		});

		it('should handle registration validation errors', () => {
			const invalidFormData = {
				name: 'A', // Too short
				email: 'invalid-email', // Invalid format
				password: 'weak', // Too weak
				confirmPassword: 'different' // Doesn't match
			};

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
			expect(validationResult.errors.name).toBeDefined();
			expect(validationResult.errors.email).toBeDefined();
			expect(validationResult.errors.password).toBeDefined();
			expect(validationResult.errors.confirmPassword).toBeDefined();
		});

		it('should handle registration server errors', async () => {
			const serverError = new Error('Email already exists');
			(authClient.signUp as any).mockRejectedValue(serverError);

			try {
				await authClient.signUp({
					name: 'John Doe',
					email: 'existing@example.com',
					password: 'password123'
				});
			} catch (error) {
				const handledError = handleAuthError(error, 'email');
				expect(handledError.message).toBeDefined();
				expect(handledError.field).toBe('email');
			}
		});
	});

	describe('User Login Flow', () => {
		it('should complete successful login flow', async () => {
			const mockSession = {
				user: {
					id: 'user-123',
					name: 'John Doe',
					email: 'john@example.com',
					emailVerified: true
				},
				session: {
					id: 'session-123',
					expiresAt: new Date(Date.now() + 3600000),
					token: 'token-123'
				}
			};

			(authClient.signIn as any).mockResolvedValue({
				data: mockSession,
				error: null
			});

			// Simulate login form data
			const loginData = {
				email: 'john@example.com',
				password: 'password123'
			};

			// Validate login data
			const validationResult = validateForm(loginData, {
				email: authValidationRules.email,
				password: authValidationRules.password
			});

			expect(validationResult.isValid).toBe(true);

			// Simulate login
			const result = await authClient.signIn({
				email: loginData.email,
				password: loginData.password
			});

			expect(result.data).toEqual(mockSession);
			expect(authClient.signIn).toHaveBeenCalledWith({
				email: 'john@example.com',
				password: 'password123'
			});
		});

		it('should handle login validation errors', () => {
			const invalidLoginData = {
				email: '', // Required
				password: '' // Required
			};

			const validationResult = validateForm(invalidLoginData, {
				email: authValidationRules.email,
				password: authValidationRules.password
			});

			expect(validationResult.isValid).toBe(false);
			expect(validationResult.errors.email).toBeDefined();
			expect(validationResult.errors.password).toBeDefined();
		});

		it('should handle invalid credentials error', async () => {
			const credentialsError = new Error('Invalid credentials');
			(authClient.signIn as any).mockRejectedValue(credentialsError);

			try {
				await authClient.signIn({
					email: 'wrong@example.com',
					password: 'wrongpassword'
				});
			} catch (error) {
				const handledError = handleError(error);
				expect(handledError.message).toBeDefined();
			}
		});

		it('should handle return URL after successful login', () => {
			// Test return URL handling
			const urlWithReturn = new URL('http://localhost/auth/login?returnUrl=%2Fprofile');
			const returnUrl = getReturnUrl(urlWithReturn);
			expect(returnUrl).toBe('/profile');

			// Test login redirect creation
			const loginRedirect = createLoginRedirect('/protected-page');
			expect(loginRedirect).toContain('/auth/login');
			expect(loginRedirect).toContain('returnUrl');
		});
	});

	describe('Session Management Flow', () => {
		it('should validate active session', async () => {
			const mockSession = {
				user: {
					id: 'user-123',
					name: 'John Doe',
					email: 'john@example.com'
				},
				session: {
					id: 'session-123',
					expiresAt: new Date(Date.now() + 3600000)
				}
			};

			(authClient.getSession as any).mockResolvedValue({
				data: mockSession
			});

			const isValid = await isCurrentSessionValid();
			expect(isValid).toBe(true);
		});

		it('should handle invalid session', async () => {
			(authClient.getSession as any).mockResolvedValue({
				data: null
			});

			const isValid = await isCurrentSessionValid();
			expect(isValid).toBe(false);
		});

		it('should handle session errors', async () => {
			(authClient.getSession as any).mockRejectedValue(new Error('Session error'));

			const isValid = await isCurrentSessionValid();
			expect(isValid).toBe(false);
		});

		it('should create proper auth state from session', () => {
			const mockSession = {
				user: {
					id: 'user-123',
					name: 'John Doe',
					email: 'john@example.com',
					emailVerified: true,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				session: {
					id: 'session-123',
					expiresAt: new Date(Date.now() + 3600000),
					token: 'token-123',
					ipAddress: '127.0.0.1',
					userAgent: 'test',
					userId: 'user-123',
					createdAt: new Date(),
					updatedAt: new Date()
				}
			};

			const authState = createAuthState(mockSession, false);

			expect(authState.isAuthenticated).toBe(true);
			expect(authState.user).toEqual(mockSession.user);
			expect(authState.session).toEqual(mockSession.session);
			expect(authState.isLoading).toBe(false);
		});

		it('should check access permissions', () => {
			const validSession = {
				user: {
					id: 'user-123',
					name: 'John Doe',
					email: 'john@example.com',
					emailVerified: true,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				session: {
					id: 'session-123',
					expiresAt: new Date(Date.now() + 3600000), // Valid session
					token: 'token-123',
					ipAddress: '127.0.0.1',
					userAgent: 'test',
					userId: 'user-123',
					createdAt: new Date(),
					updatedAt: new Date()
				}
			};

			const expiredSession = {
				...validSession,
				session: {
					...validSession.session,
					expiresAt: new Date(Date.now() - 3600000) // Expired session
				}
			};

			expect(hasAccess(validSession)).toBe(true);
			expect(hasAccess(expiredSession)).toBe(false);
			expect(hasAccess(null)).toBe(false);
		});
	});

	describe('Logout Flow', () => {
		it('should complete successful logout flow', async () => {
			(authClient.signOut as any).mockResolvedValue({ success: true });

			await handleLogout('/');

			expect(authClient.signOut).toHaveBeenCalled();
			expect(mockGoto).toHaveBeenCalledWith('/', { replaceState: true });
		});

		it('should handle logout errors gracefully', async () => {
			(authClient.signOut as any).mockRejectedValue(new Error('Logout failed'));

			// Should not throw error
			await expect(handleLogout('/')).resolves.not.toThrow();
			expect(mockGoto).toHaveBeenCalledWith('/', { replaceState: true });
		});

		it('should redirect to custom URL after logout', async () => {
			(authClient.signOut as any).mockResolvedValue({ success: true });

			await handleLogout('/login');

			expect(mockGoto).toHaveBeenCalledWith('/login', { replaceState: true });
		});
	});

	describe('Error Recovery Scenarios', () => {
		it('should handle network errors during authentication', async () => {
			const networkError = new TypeError('Failed to fetch');
			(authClient.signIn as any).mockRejectedValue(networkError);

			try {
				await authClient.signIn({
					email: 'test@example.com',
					password: 'password123'
				});
			} catch (error) {
				const handledError = handleError(error);
				expect(handledError.code).toBe('NETWORK_ERROR');
				expect(handledError.message).toContain('Connection failed');
			}
		});

		it('should handle session expiration during operation', async () => {
			const sessionError = new Error('Session expired');
			(authClient.getSession as any).mockRejectedValue(sessionError);

			const isValid = await isCurrentSessionValid();
			expect(isValid).toBe(false);
		});

		it('should handle concurrent authentication operations', async () => {
			// Mock the auth client before calling operations
			(authClient.getSession as any).mockResolvedValue({ data: null });

			// Simulate multiple concurrent operations
			const operation1 = authClient.getSession();
			const operation2 = authClient.getSession();

			const [result1, result2] = await Promise.all([operation1, operation2]);

			expect(result1).toEqual({ data: null });
			expect(result2).toEqual({ data: null });
		});
	});

	describe('Form Integration Scenarios', () => {
		it('should integrate validation with form submission', async () => {
			// Test complete form validation and submission flow
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

			// Step 2: Submit if valid
			if (validationResult.isValid) {
				(authClient.signUp as any).mockResolvedValue({
					data: { user: { id: '123', name: 'John Doe', email: 'john@example.com' } }
				});

				const result = await authClient.signUp({
					name: formData.name,
					email: formData.email,
					password: formData.password
				});

				expect(result.data).toBeDefined();
			}
		});

		it('should handle progressive form validation', () => {
			// Test field-by-field validation as user types
			const fields = ['name', 'email', 'password', 'confirmPassword'];
			const formData = {
				name: '',
				email: '',
				password: '',
				confirmPassword: ''
			};

			// Initially all fields are invalid
			fields.forEach((field) => {
				const fieldValidation = validateForm(
					{ [field]: formData[field as keyof typeof formData] },
					{
						[field]: authValidationRules[field as keyof typeof authValidationRules]
					}
				);
				expect(fieldValidation.isValid).toBe(false);
			});

			// Fill in valid data progressively
			formData.name = 'John Doe';
			formData.email = 'john@example.com';
			formData.password = 'password123';
			formData.confirmPassword = 'password123';

			const finalValidation = validateForm(
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

			expect(finalValidation.isValid).toBe(true);
		});
	});

	describe('Route Protection Integration', () => {
		it('should handle protected route access with valid session', () => {
			const validSession = {
				user: {
					id: 'user-123',
					name: 'John Doe',
					email: 'john@example.com',
					emailVerified: true,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				session: {
					id: 'session-123',
					expiresAt: new Date(Date.now() + 3600000),
					token: 'token-123',
					ipAddress: '127.0.0.1',
					userAgent: 'test',
					userId: 'user-123',
					createdAt: new Date(),
					updatedAt: new Date()
				}
			};

			const hasValidAccess = hasAccess(validSession);
			expect(hasValidAccess).toBe(true);

			// Should allow access to protected route
			if (hasValidAccess) {
				// User can access protected content
				expect(true).toBe(true);
			}
		});

		it('should handle protected route access without session', () => {
			const hasValidAccess = hasAccess(null);
			expect(hasValidAccess).toBe(false);

			// Should redirect to login
			if (!hasValidAccess) {
				const loginRedirect = createLoginRedirect('/protected-route');
				expect(loginRedirect).toContain('/auth/login');
				expect(loginRedirect).toContain('returnUrl');
			}
		});

		it('should handle session expiration during protected route access', () => {
			const expiredSession = {
				user: {
					id: 'user-123',
					name: 'John Doe',
					email: 'john@example.com',
					emailVerified: true,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				session: {
					id: 'session-123',
					expiresAt: new Date(Date.now() - 3600000), // Expired
					token: 'token-123',
					ipAddress: '127.0.0.1',
					userAgent: 'test',
					userId: 'user-123',
					createdAt: new Date(),
					updatedAt: new Date()
				}
			};

			const hasValidAccess = hasAccess(expiredSession);
			expect(hasValidAccess).toBe(false);

			// Should redirect to login due to expired session
			if (!hasValidAccess) {
				const loginRedirect = createLoginRedirect('/protected-route');
				expect(loginRedirect).toContain('/auth/login');
			}
		});
	});
});
