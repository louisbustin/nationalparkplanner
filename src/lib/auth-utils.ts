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
 * Authentication state interface for client-side usage
 */
export interface AuthState {
	isAuthenticated: boolean;
	user: UserSession['user'] | null;
	session: UserSession['session'] | null;
	isLoading: boolean;
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
 * Checks if a session is expired based on the expiration date
 * @param expiresAt - Session expiration date
 * @returns boolean - True if session is expired
 */
export function isSessionExpired(expiresAt: Date): boolean {
	return expiresAt < new Date();
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

/**
 * Extracts user information from a validated session
 * @param session - Validated user session
 * @returns User information object
 */
export function extractUserFromSession(session: UserSession): UserSession['user'] {
	return {
		id: session.user.id,
		name: session.user.name,
		email: session.user.email,
		emailVerified: session.user.emailVerified,
		image: session.user.image,
		createdAt: session.user.createdAt,
		updatedAt: session.user.updatedAt
	};
}

/**
 * Creates an authentication state object for client-side usage
 * @param session - Optional user session
 * @param isLoading - Loading state indicator
 * @returns AuthState object
 */
export function createAuthState(
	session: UserSession | null = null,
	isLoading: boolean = false
): AuthState {
	return {
		isAuthenticated: session !== null,
		user: session ? extractUserFromSession(session) : null,
		session: session?.session || null,
		isLoading
	};
}

/**
 * Validates if a user has permission to access a protected resource
 * @param session - User session to validate
 * @param requiredPermissions - Optional array of required permissions (for future use)
 * @returns boolean - True if user has access
 */
export function hasAccess(
	session: UserSession | null,
	requiredPermissions: string[] = []
): boolean {
	if (!session) {
		return false;
	}

	// Check if session is expired
	if (isSessionExpired(session.session.expiresAt)) {
		return false;
	}

	// For now, any authenticated user has access
	// In the future, this can be extended to check specific permissions
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const _ = requiredPermissions; // Acknowledge parameter for future use
	return true;
}

/**
 * Gets the return URL from request parameters for post-login redirect
 * @param url - Request URL object
 * @returns string - Return URL or default dashboard path
 */
export function getReturnUrl(url: URL): string {
	const returnUrl = url.searchParams.get('returnUrl');

	// Validate return URL to prevent open redirect attacks
	if (returnUrl && isValidReturnUrl(returnUrl)) {
		return returnUrl;
	}

	return '/'; // Default redirect to home page
}

/**
 * Validates if a return URL is safe to redirect to
 * @param url - URL to validate
 * @returns boolean - True if URL is safe for redirect
 */
function isValidReturnUrl(url: string): boolean {
	try {
		const parsedUrl = new URL(url, 'http://localhost'); // Use localhost as base for relative URLs

		// Only allow relative URLs or same-origin URLs
		return parsedUrl.pathname.startsWith('/') && !parsedUrl.pathname.startsWith('//');
	} catch {
		return false;
	}
}

/**
 * Creates a login redirect URL with return URL parameter
 * @param currentPath - Current path to return to after login
 * @returns string - Login URL with return parameter
 */
export function createLoginRedirect(currentPath: string): string {
	const loginUrl = '/auth/login';

	if (currentPath && currentPath !== '/' && isValidReturnUrl(currentPath)) {
		return `${loginUrl}?returnUrl=${encodeURIComponent(currentPath)}`;
	}

	return loginUrl;
}
