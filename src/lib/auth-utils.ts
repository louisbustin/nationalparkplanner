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
 * Checks if a session is expired based on the expiration date
 * @param expiresAt - Session expiration date
 * @returns boolean - True if session is expired
 */
export function isSessionExpired(expiresAt: Date): boolean {
	return expiresAt < new Date();
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

/**
 * Performs client-side logout with session cleanup
 * @returns Promise<boolean> - True if logout was successful
 */
export async function performLogout(): Promise<boolean> {
	try {
		// Use Better Auth client to sign out
		const { authClient } = await import('./auth-client');

		await authClient.signOut();

		return true;
	} catch (error) {
		console.error('Client-side logout failed:', error);
		return false;
	}
}

/**
 * Clears all client-side authentication data
 * This is used as a fallback when server-side logout fails
 */
export function clearClientAuthData(): void {
	try {
		// Clear any localStorage auth data (if any)
		if (typeof localStorage !== 'undefined') {
			const authKeys = Object.keys(localStorage).filter(
				(key) => key.includes('auth') || key.includes('session') || key.includes('better-auth')
			);
			authKeys.forEach((key) => localStorage.removeItem(key));
		}

		// Clear any sessionStorage auth data (if any)
		if (typeof sessionStorage !== 'undefined') {
			const authKeys = Object.keys(sessionStorage).filter(
				(key) => key.includes('auth') || key.includes('session') || key.includes('better-auth')
			);
			authKeys.forEach((key) => sessionStorage.removeItem(key));
		}
	} catch (error) {
		console.error('Failed to clear client auth data:', error);
	}
}
/**
 * Handles complete logout process with proper state management
 * @param redirectTo - Optional URL to redirect to after logout (defaults to home)
 * @returns Promise<void>
 */
export async function handleLogout(redirectTo: string = '/'): Promise<void> {
	try {
		// Import navigation function
		const { goto } = await import('$app/navigation');

		// Perform client-side logout
		const logoutSuccess = await performLogout();

		if (!logoutSuccess) {
			console.warn('Server-side logout failed, clearing client data');
		}

		// Always clear client-side data to ensure UI consistency
		clearClientAuthData();

		// Redirect to specified page
		await goto(redirectTo, { replaceState: true });
	} catch (error) {
		console.error('Logout process failed:', error);

		// Fallback: clear client data and redirect anyway
		clearClientAuthData();

		try {
			const { goto } = await import('$app/navigation');
			await goto(redirectTo, { replaceState: true });
		} catch (navError) {
			console.error('Navigation after logout failed:', navError);
			// Last resort: reload the page
			if (typeof window !== 'undefined') {
				window.location.href = redirectTo;
			}
		}
	}
}

/**
 * Validates if the current user session is still valid
 * This can be used to check session validity before performing sensitive operations
 * @returns Promise<boolean> - True if session is valid
 */
export async function isCurrentSessionValid(): Promise<boolean> {
	try {
		// For client-side, we'll do a simple check by attempting to get session info
		// This is less reliable than server-side validation but works for client-side needs
		const { authClient } = await import('./auth-client');

		// Try to get user info - if this succeeds, session is likely valid
		const result = await authClient.getSession();

		return !!result.data;
	} catch (error) {
		console.error('Session validation failed:', error);
		return false;
	}
}
