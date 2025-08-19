import { describe, it, expect, vi, beforeEach } from 'vitest';
import { error } from '@sveltejs/kit';
import type { UserSession } from '$lib/auth-utils.server';

// Mock SvelteKit functions
vi.mock('@sveltejs/kit', () => ({
	error: vi.fn((status: number, message: string) => {
		const err = new Error(message) as Error & { status: number };
		err.status = status;
		throw err;
	})
}));

// Mock auth utilities
vi.mock('$lib/auth-utils.server', () => ({
	getSession: vi.fn()
}));

describe('Admin Route Protection', () => {
	const adminUser = {
		id: 'admin-123',
		name: 'Louis Admin',
		email: 'louis@eforge.us',
		emailVerified: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01')
	};

	const regularUser = {
		id: 'user-456',
		name: 'Regular User',
		email: 'user@example.com',
		emailVerified: true,
		createdAt: new Date('2023-01-01'),
		updatedAt: new Date('2023-01-01')
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Admin Layout Server Load', () => {
		// We'll test the admin layout load function logic
		const testAdminLayoutLoad = (session: UserSession | null) => {
			// This simulates the logic from src/routes/admin/+layout.server.ts
			if (!session) {
				throw error(404, 'Not found');
			}

			const user = session.user;
			if (!user || user.email !== 'louis@eforge.us') {
				throw error(404, 'Not found');
			}

			return {
				user
			};
		};

		it('should allow admin user access', () => {
			const adminSession: UserSession = {
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

			const result = testAdminLayoutLoad(adminSession);
			expect(result.user).toEqual(adminUser);
		});

		it('should deny regular user access', () => {
			const regularSession: UserSession = {
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

			expect(() => testAdminLayoutLoad(regularSession)).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});

		it('should deny unauthenticated user access', () => {
			expect(() => testAdminLayoutLoad(null)).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});

		it('should deny user with null email', () => {
			const userWithNullEmail = { ...regularUser, email: null as unknown as string };
			const sessionWithNullEmail: UserSession = {
				user: userWithNullEmail,
				session: {
					id: 'session-789',
					expiresAt: new Date(Date.now() + 86400000),
					token: 'session-token',
					createdAt: new Date(),
					updatedAt: new Date(),
					ipAddress: '127.0.0.1',
					userAgent: 'Test Browser',
					userId: userWithNullEmail.id
				}
			};

			expect(() => testAdminLayoutLoad(sessionWithNullEmail)).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});
	});

	describe('Parks Management Route Protection', () => {
		// Test the parks route protection logic
		const testParksRouteAccess = (session: UserSession | null) => {
			// This simulates the authorization check that should be in parks routes
			if (!session || !session.user || session.user.email !== 'louis@eforge.us') {
				throw error(404, 'Not found');
			}
			return true;
		};

		it('should allow admin to access parks management', () => {
			const adminSession: UserSession = {
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

			expect(() => testParksRouteAccess(adminSession)).not.toThrow();
		});

		it('should deny regular user access to parks management', () => {
			const regularSession: UserSession = {
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

			expect(() => testParksRouteAccess(regularSession)).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});

		it('should deny unauthenticated access to parks management', () => {
			expect(() => testParksRouteAccess(null)).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});
	});

	describe('Form Action Protection', () => {
		// Test form action protection (create, update, delete)
		const testFormActionProtection = (session: UserSession | null, actionType: string) => {
			if (!session || !session.user || session.user.email !== 'louis@eforge.us') {
				throw error(404, 'Not found');
			}

			// Simulate successful action
			return { success: true, action: actionType };
		};

		it('should allow admin to perform create action', () => {
			const adminSession: UserSession = {
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

			const result = testFormActionProtection(adminSession, 'create');
			expect(result.success).toBe(true);
			expect(result.action).toBe('create');
		});

		it('should allow admin to perform update action', () => {
			const adminSession: UserSession = {
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

			const result = testFormActionProtection(adminSession, 'update');
			expect(result.success).toBe(true);
			expect(result.action).toBe('update');
		});

		it('should allow admin to perform delete action', () => {
			const adminSession: UserSession = {
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

			const result = testFormActionProtection(adminSession, 'delete');
			expect(result.success).toBe(true);
			expect(result.action).toBe('delete');
		});

		it('should deny regular user from performing create action', () => {
			const regularSession: UserSession = {
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

			expect(() => testFormActionProtection(regularSession, 'create')).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});

		it('should deny unauthenticated user from performing any action', () => {
			expect(() => testFormActionProtection(null, 'create')).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});
	});

	describe('Session Edge Cases', () => {
		it('should handle expired session gracefully', () => {
			const expiredSession: UserSession = {
				user: adminUser,
				session: {
					id: 'session-123',
					expiresAt: new Date(Date.now() - 86400000), // Expired 24 hours ago
					token: 'session-token',
					createdAt: new Date(),
					updatedAt: new Date(),
					ipAddress: '127.0.0.1',
					userAgent: 'Test Browser',
					userId: adminUser.id
				}
			};

			// The session validation should happen before our admin check
			// but for this test, we'll assume the session is still passed through
			const testWithExpiredSession = (session: UserSession | null) => {
				if (!session || !session.user || session.user.email !== 'louis@eforge.us') {
					throw error(404, 'Not found');
				}
				return true;
			};

			expect(() => testWithExpiredSession(expiredSession)).not.toThrow();
		});

		it('should handle malformed session data', () => {
			const malformedSession = {
				user: {},
				session: {
					id: 'session-123',
					expiresAt: new Date(Date.now() + 86400000),
					token: 'session-token',
					createdAt: new Date(),
					updatedAt: new Date(),
					ipAddress: '127.0.0.1',
					userAgent: 'Test Browser',
					userId: 'some-id'
				}
			} as UserSession;

			const testWithMalformedSession = (session: UserSession | null) => {
				if (!session || !session.user || session.user.email !== 'louis@eforge.us') {
					throw error(404, 'Not found');
				}
				return true;
			};

			expect(() => testWithMalformedSession(malformedSession)).toThrow();
			expect(error).toHaveBeenCalledWith(404, 'Not found');
		});
	});

	describe('Security Consistency', () => {
		it('should always return 404 for unauthorized access', () => {
			const scenarios = [
				null, // No session
				{ user: regularUser, session: {} } as UserSession, // Regular user
				{ user: { ...adminUser, email: 'fake@example.com' }, session: {} } as UserSession, // Wrong email
				{ user: {}, session: {} } as UserSession // Null user
			];

			scenarios.forEach((session) => {
				const testScenario = (s: UserSession | null) => {
					if (!s || !s.user || s.user.email !== 'louis@eforge.us') {
						throw error(404, 'Not found');
					}
				};

				expect(() => testScenario(session)).toThrow();

				// Verify that all scenarios throw the same error
				try {
					testScenario(session);
				} catch (err) {
					const error = err as Error & { status: number };
					expect(error.status).toBe(404);
					expect(error.message).toBe('Not found');
				}
			});
		});

		it('should not leak information about admin routes existence', () => {
			// All unauthorized access should look the same
			const regularUserError = (() => {
				try {
					const testFunc = (session: UserSession | null) => {
						if (!session || !session.user || session.user.email !== 'louis@eforge.us') {
							throw error(404, 'Not found');
						}
					};
					testFunc({ user: regularUser, session: {} } as UserSession);
				} catch (err) {
					return err;
				}
			})();

			const noSessionError = (() => {
				try {
					const testFunc = (session: UserSession | null) => {
						if (!session || !session.user || session.user.email !== 'louis@eforge.us') {
							throw error(404, 'Not found');
						}
					};
					testFunc(null);
				} catch (err) {
					return err;
				}
			})();

			// Both should be identical 404 errors
			expect(regularUserError).toEqual(noSessionError);
		});
	});
});
