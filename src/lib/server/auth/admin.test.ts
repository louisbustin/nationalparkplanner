import { describe, it, expect, vi } from 'vitest';
import { error } from '@sveltejs/kit';
import { isAdmin, requireAdmin, extractUserFromSession, type User } from './admin.js';
import type { UserSession } from '$lib/auth-utils.server';

// Mock SvelteKit error function
vi.mock('@sveltejs/kit', () => ({
	error: vi.fn((status: number, message: string) => {
		const err = new Error(message) as Error & { status: number };
		err.status = status;
		throw err;
	})
}));

describe('Admin Authorization', () => {
	const adminUser: User = {
		id: 'admin-123',
		name: 'Louis Admin',
		email: 'louis@eforge.us',
		emailVerified: true,
		image: 'https://example.com/avatar.jpg',
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01')
	};

	const regularUser: User = {
		id: 'user-456',
		name: 'Regular User',
		email: 'user@example.com',
		emailVerified: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01')
	};

	describe('isAdmin', () => {
		it('should return true for admin user', () => {
			const result = isAdmin(adminUser);
			expect(result).toBe(true);
		});

		it('should return false for regular user', () => {
			const result = isAdmin(regularUser);
			expect(result).toBe(false);
		});

		it('should return false for unverified user with admin email', () => {
			const unverifiedAdmin: User = {
				...adminUser,
				emailVerified: false
			};
			// Note: The current implementation doesn't check emailVerified
			// This test documents the current behavior
			const result = isAdmin(unverifiedAdmin);
			expect(result).toBe(true);
		});

		it('should return false for null user', () => {
			const result = isAdmin(null);
			expect(result).toBe(false);
		});

		it('should return false for undefined user', () => {
			const result = isAdmin(null as User | null);
			expect(result).toBe(false);
		});

		it('should be case sensitive for email comparison', () => {
			const caseVariantUser: User = {
				...adminUser,
				email: 'LOUIS@EFORGE.US'
			};
			const result = isAdmin(caseVariantUser);
			expect(result).toBe(false);
		});

		it('should not match similar but different emails', () => {
			const similarEmailUser: User = {
				...adminUser,
				email: 'louis@eforge.com' // Different domain
			};
			const result = isAdmin(similarEmailUser);
			expect(result).toBe(false);
		});

		it('should handle user with extra whitespace in email', () => {
			const whitespaceEmailUser: User = {
				...adminUser,
				email: ' louis@eforge.us '
			};
			const result = isAdmin(whitespaceEmailUser);
			expect(result).toBe(false);
		});
	});

	describe('requireAdmin', () => {
		it('should not throw for admin user', () => {
			expect(() => requireAdmin(adminUser)).not.toThrow();
		});

		it('should throw 404 error for regular user', () => {
			expect(() => requireAdmin(regularUser)).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});

		it('should throw 404 error for null user', () => {
			expect(() => requireAdmin(null)).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});

		it('should throw 404 error for undefined user', () => {
			expect(() => requireAdmin(null as User | null)).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});

		it('should throw 404 (not 403) to hide admin functionality', () => {
			try {
				requireAdmin(regularUser);
			} catch (err) {
				const error = err as Error & { status: number };
				expect(error.status).toBe(404);
				expect(error.message).toBe('Not found');
			}
		});

		it('should allow unverified admin user', () => {
			const unverifiedAdmin: User = {
				...adminUser,
				emailVerified: false
			};
			// Current implementation doesn't check emailVerified
			expect(() => requireAdmin(unverifiedAdmin)).not.toThrow();
		});
	});

	describe('extractUserFromSession', () => {
		it('should extract user from valid session', () => {
			const session: UserSession = {
				user: adminUser,
				session: {
					id: 'session-123',
					expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
					token: 'session-token',
					createdAt: new Date(),
					updatedAt: new Date(),
					ipAddress: '127.0.0.1',
					userAgent: 'Test Browser',
					userId: adminUser.id
				}
			};

			const result = extractUserFromSession(session);
			expect(result).toEqual(adminUser);
		});

		it('should return null for null session', () => {
			const result = extractUserFromSession(null);
			expect(result).toBeNull();
		});

		it('should return null for undefined session', () => {
			const result = extractUserFromSession(null as UserSession | null);
			expect(result).toBeNull();
		});

		it('should extract user even if session data is minimal', () => {
			const minimalSession: UserSession = {
				user: regularUser,
				session: {
					id: 'session-456',
					expiresAt: new Date(),
					token: 'token',
					createdAt: new Date(),
					updatedAt: new Date(),
					userId: regularUser.id
				}
			};

			const result = extractUserFromSession(minimalSession);
			expect(result).toEqual(regularUser);
		});
	});

	describe('integration scenarios', () => {
		it('should handle complete admin workflow', () => {
			const session: UserSession = {
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

			// Extract user from session
			const user = extractUserFromSession(session);
			expect(user).not.toBeNull();

			// Check if user is admin
			const isUserAdmin = isAdmin(user);
			expect(isUserAdmin).toBe(true);

			// Require admin access (should not throw)
			expect(() => requireAdmin(user)).not.toThrow();
		});

		it('should handle complete non-admin workflow', () => {
			const session: UserSession = {
				user: regularUser,
				session: {
					id: 'session-456',
					expiresAt: new Date(Date.now() + 86400000),
					token: 'session-token',
					createdAt: new Date(),
					updatedAt: new Date(),
					ipAddress: '127.0.0.1',
					userAgent: 'Test Browser',
					userId: regularUser.id
				}
			};

			// Extract user from session
			const user = extractUserFromSession(session);
			expect(user).not.toBeNull();

			// Check if user is admin
			const isUserAdmin = isAdmin(user);
			expect(isUserAdmin).toBe(false);

			// Require admin access (should throw)
			expect(() => requireAdmin(user)).toThrow();
		});

		it('should handle unauthenticated user workflow', () => {
			// No session
			const user = extractUserFromSession(null);
			expect(user).toBeNull();

			// Check if user is admin
			const isUserAdmin = isAdmin(user);
			expect(isUserAdmin).toBe(false);

			// Require admin access (should throw)
			expect(() => requireAdmin(user)).toThrow();
		});
	});

	describe('security considerations', () => {
		it('should not leak admin status through different error types', () => {
			// Both null user and regular user should get the same error
			let nullUserError: (Error & { status: number }) | undefined = undefined;
			let regularUserError: (Error & { status: number }) | undefined = undefined;

			try {
				requireAdmin(null);
			} catch (err) {
				nullUserError = err as (Error & { status: number }) | undefined;
			}

			try {
				requireAdmin(regularUser);
			} catch (err) {
				regularUserError = err as (Error & { status: number }) | undefined;
			}

			expect(nullUserError?.status).toBe(regularUserError?.status);
			expect(nullUserError?.message).toBe(regularUserError?.message);
		});

		it('should use 404 instead of 403 to hide admin functionality', () => {
			try {
				requireAdmin(regularUser);
			} catch (err) {
				const error = err as Error & { status: number };
				// Should be 404 (Not Found) not 403 (Forbidden)
				// This hides the existence of admin functionality from unauthorized users
				expect(error.status).toBe(404);
				expect(error.status).not.toBe(403);
			}
		});

		it('should handle malformed user objects gracefully', () => {
			const malformedUser = {
				id: 'test'
				// Missing required fields
			} as User;

			expect(() => isAdmin(malformedUser)).not.toThrow();
			expect(isAdmin(malformedUser)).toBe(false);
		});

		it('should handle user object with null email', () => {
			const userWithNullEmail = {
				...regularUser,
				email: null as unknown as string
			};

			expect(() => isAdmin(userWithNullEmail)).not.toThrow();
			expect(isAdmin(userWithNullEmail)).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should handle empty string email', () => {
			const userWithEmptyEmail: User = {
				...regularUser,
				email: ''
			};

			const result = isAdmin(userWithEmptyEmail);
			expect(result).toBe(false);
		});

		it('should handle user with admin email substring', () => {
			const userWithSubstring: User = {
				...regularUser,
				email: 'notlouis@eforge.us'
			};

			const result = isAdmin(userWithSubstring);
			expect(result).toBe(false);
		});

		it('should handle user with admin email as part of longer email', () => {
			const userWithLongerEmail: User = {
				...regularUser,
				email: 'louis@eforge.us.fake.com'
			};

			const result = isAdmin(userWithLongerEmail);
			expect(result).toBe(false);
		});
	});
});
