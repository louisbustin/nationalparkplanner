import { describe, it, expect, vi } from 'vitest';
import { isAdmin, requireAdmin, extractUserFromSession } from './admin';
import type { User } from './admin';
import type { UserSession } from '$lib/auth-utils.server';

// Mock SvelteKit's error function
vi.mock('@sveltejs/kit', () => ({
	error: (status: number, message: string) => {
		const err = new Error(message);
		(err as any).status = status;
		throw err;
	}
}));

describe('Admin Authorization', () => {
	const adminUser: User = {
		id: '1',
		name: 'Louis Admin',
		email: 'louis@eforge.us',
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	const regularUser: User = {
		id: '2',
		name: 'Regular User',
		email: 'user@example.com',
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	const mockSession: UserSession = {
		user: adminUser,
		session: {
			id: 'session-1',
			expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
			token: 'mock-token',
			userId: '1',
			createdAt: new Date(),
			updatedAt: new Date()
		}
	};

	describe('isAdmin', () => {
		it('should return true for admin user', () => {
			expect(isAdmin(adminUser)).toBe(true);
		});

		it('should return false for regular user', () => {
			expect(isAdmin(regularUser)).toBe(false);
		});

		it('should return false for null user', () => {
			expect(isAdmin(null)).toBe(false);
		});
	});

	describe('requireAdmin', () => {
		it('should not throw for admin user', () => {
			expect(() => requireAdmin(adminUser)).not.toThrow();
		});

		it('should throw 404 error for regular user', () => {
			expect(() => requireAdmin(regularUser)).toThrow();
		});

		it('should throw 404 error for null user', () => {
			expect(() => requireAdmin(null)).toThrow();
		});
	});

	describe('extractUserFromSession', () => {
		it('should extract user from valid session', () => {
			const user = extractUserFromSession(mockSession);
			expect(user).toEqual(adminUser);
		});

		it('should return null for null session', () => {
			const user = extractUserFromSession(null);
			expect(user).toBe(null);
		});
	});
});
