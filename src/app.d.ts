// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { UserSession } from '$lib/auth-utils';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserSession['user'] | null;
			session: UserSession | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
