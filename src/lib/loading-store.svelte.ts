/**
 * Loading state store for managing loading indicators across the application
 */

class LoadingStore {
	private loadingStates = $state<Record<string, boolean>>({});

	/**
	 * Check if a specific operation is loading
	 */
	isLoading(key: string): boolean {
		return this.loadingStates[key] || false;
	}

	/**
	 * Check if any operation is loading
	 */
	get hasAnyLoading(): boolean {
		return Object.values(this.loadingStates).some((loading) => loading);
	}

	/**
	 * Get all current loading states
	 */
	get states(): Record<string, boolean> {
		return { ...this.loadingStates };
	}

	/**
	 * Set loading state for a specific operation
	 */
	setLoading(key: string, loading: boolean): void {
		if (loading) {
			this.loadingStates[key] = true;
		} else {
			delete this.loadingStates[key];
		}
	}

	/**
	 * Start loading for a specific operation
	 */
	start(key: string): void {
		this.setLoading(key, true);
	}

	/**
	 * Stop loading for a specific operation
	 */
	stop(key: string): void {
		this.setLoading(key, false);
	}

	/**
	 * Clear all loading states
	 */
	clear(): void {
		Object.keys(this.loadingStates).forEach((key) => {
			delete this.loadingStates[key];
		});
	}

	/**
	 * Execute an async operation with automatic loading state management
	 */
	async withLoading<T>(key: string, operation: () => Promise<T>): Promise<T> {
		try {
			this.start(key);
			return await operation();
		} finally {
			this.stop(key);
		}
	}
}

// Global loading store instance
export const loadingStore = new LoadingStore();

// Common loading keys for consistency
export const LOADING_KEYS = {
	LOGIN: 'auth.login',
	REGISTER: 'auth.register',
	LOGOUT: 'auth.logout',
	PROFILE_UPDATE: 'profile.update',
	PROFILE_LOAD: 'profile.load',
	SESSION_CHECK: 'auth.session_check'
} as const;
