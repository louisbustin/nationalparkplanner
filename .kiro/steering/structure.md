---
inclusion: always
---

# Project Structure & Architecture Guidelines

## File Organization Rules

### Core Directory Structure

```
src/
├── lib/
│   ├── components/       # Reusable Svelte components
│   ├── server/          # Server-only code (database, auth utils)
│   │   ├── db/          # Database operations and schema
│   │   └── auth/        # Server-side auth utilities
│   ├── validation/      # Zod schemas for form validation
│   └── [utilities].ts   # Shared client/server utilities
├── routes/              # SvelteKit file-based routing
│   ├── admin/          # Admin-only routes (protected)
│   ├── auth/           # Authentication routes
│   └── [feature]/      # Feature-specific routes
└── app.html            # Root HTML template
```

### File Placement Guidelines

- **Server-only code**: Must be in `src/lib/server/` to prevent client bundling
- **Database operations**: `src/lib/server/db/[entity].ts` pattern
- **Validation schemas**: `src/lib/validation/[entity].ts` using Zod
- **Reusable components**: `src/lib/components/` with proper exports in `index.ts`
- **Route protection**: Use `+layout.server.ts` for auth guards

## Database Conventions

### Schema Design

- All tables use autoincrementing `id` as primary key (except auth tables)
- Include `createdAt` and `updatedAt` timestamps on all entities
- Use Drizzle ORM with PostgreSQL dialect
- Schema location: `src/lib/server/db/schema.ts`

### Database Operations

- Create separate files for each entity: `src/lib/server/db/parks.ts`
- Use transactions for multi-table operations
- Always handle database errors with proper error types
- Export typed query functions, not raw SQL

## Authentication Architecture

### Better Auth Integration

- Configuration: `src/lib/auth.ts`
- Server hooks: `src/hooks.server.ts` for session validation
- Client utilities: `src/lib/auth-client.ts`
- Admin protection: Check `user.role === 'admin'` in server load functions

### Route Protection Patterns

```typescript
// +layout.server.ts for protected sections
export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/signin');
	}
	return { user: locals.user };
};
```

## Component Development

### Svelte 5 Patterns

- Use runes: `$state`, `$derived`, `$effect` for reactivity
- Always include `<script lang="ts">` in components
- Prefer Flowbite-Svelte components over custom implementations
- Use TypeScript interfaces for component props

### Form Handling

- Use SvelteKit form actions in `+page.server.ts`
- Validate with Zod schemas from `src/lib/validation/`
- Handle loading states with custom stores
- Display errors using Flowbite Alert components

## Code Style Requirements

### TypeScript Rules

- Strict mode enabled - no `any` types allowed
- Explicit return types on all functions
- Use interfaces for object shapes, types for unions
- Leverage SvelteKit's generated types (`PageData`, `ActionData`)

### Import Conventions

- Use SvelteKit aliases: `$lib`, `$app/environment`, etc.
- Group imports: external packages, then internal modules
- Prefer named exports over default exports

## Testing Patterns

### Test Organization

- Component tests: `*.test.ts` files alongside components
- Integration tests: `*.integration.test.ts` for full workflows
- Server tests: Test database operations and auth flows
- Use Vitest for all testing

### Test Naming

- Describe behavior, not implementation
- Use "should" statements for expectations
- Group related tests with `describe` blocks

## Admin Interface Conventions

### Route Structure

- Admin routes under `/admin` with layout protection
- CRUD operations follow RESTful patterns:
  - List: `/admin/[entity]`
  - Create: `/admin/[entity]/create`
  - Edit: `/admin/[entity]/[id]/edit`
  - Delete: `/admin/[entity]/[id]/delete`

### Form Patterns

- Use consistent form layouts with Flowbite components
- Implement proper loading states and error handling
- Validate on both client and server sides
- Provide clear success/error feedback
