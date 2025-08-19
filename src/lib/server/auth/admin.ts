import { error } from '@sveltejs/kit';
import type { UserSession } from '$lib/auth-utils.server';

/**
 * Admin email address that has administrative privileges
 */
const ADMIN_EMAIL = 'louis@eforge.us';

/**
 * User interface extracted from UserSession for admin checking
 */
export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Checks if a user has admin privileges based on their email address
 * @param user - User object or null if not authenticated
 * @returns boolean - True if user is an admin, false otherwise
 */
export function isAdmin(user: User | null): boolean {
	if (!user) {
		return false;
	}

	return user.email === ADMIN_EMAIL;
}

/**
 * Requires admin access and throws an error if user is not an admin
 * @param user - User object or null if not authenticated
 * @throws {Error} - 404 error if user is not an admin (to hide admin functionality)
 */
export function requireAdmin(user: User | null): void {
	if (!isAdmin(user)) {
		// Use 404 instead of 403 to hide the existence of admin functionality
		// from unauthorized users, as specified in requirements
		throw error(404, 'Not found');
	}
}

/**
 * Extracts user from session for admin checking
 * @param session - UserSession or null
 * @returns User object or null
 */
export function extractUserFromSession(session: UserSession | null): User | null {
	if (!session) {
		return null;
	}

	return session.user;
}
