import type { RequestEvent } from '@sveltejs/kit';
import { auth } from './auth';

/**
 * User session interface based on Better Auth session structure
 */
export interface UserSession {
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image?: string;
		createdAt: Date;
		updatedAt: Date;
	};
	session: {
		id: string;
		expiresAt: Date;
		token: string;
		ipAddress?: string;
		userAgent?: string;
		userId: string;
		createdAt: Date;
		updatedAt: Date;
	};
}

/**
 * Result interface for session validation operations
 */
export interface SessionValidationResult {
	isValid: boolean;
	session: UserSession | null;
	error?: string;
}

/**
 * Validates the current session from a SvelteKit request event
 * @param event - SvelteKit RequestEvent containing cookies and request data
 * @returns Promise<SessionValidationResult> - Validation result with session data
 */
export async function validateSession(event: RequestEvent): Promise<SessionValidationResult> {
	try {
		// Use Better Auth's built-in session validation
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		if (!session) {
			return {
				isValid: false,
				session: null,
				error: 'No active session found'
			};
		}

		// Check if session is expired
		if (session.session.expiresAt < new Date()) {
			// Clean up expired session
			await cleanupExpiredSession(session.session.token);
			return {
				isValid: false,
				session: null,
				error: 'Session has expired'
			};
		}

		return {
			isValid: true,
			session: session as UserSession,
			error: undefined
		};
	} catch (error) {
		console.error('Session validation error:', error);
		return {
			isValid: false,
			session: null,
			error: 'Session validation failed'
		};
	}
}

/**
 * Cleans up an expired session by invalidating it
 * @param sessionToken - The session token to invalidate
 * @returns Promise<void>
 */
export async function cleanupExpiredSession(sessionToken: string): Promise<void> {
	try {
		await auth.api.signOut({
			headers: new Headers({
				Authorization: `Bearer ${sessionToken}`
			})
		});
	} catch (error) {
		console.error('Failed to cleanup expired session:', error);
		// Don't throw error as this is cleanup operation
	}
}
