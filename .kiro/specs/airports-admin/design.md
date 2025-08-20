# Design Document

## Overview

The Airports Admin system extends the existing National Park Planner application with a comprehensive data management layer for airports information. The design leverages the existing Better Auth authentication system and Drizzle ORM database layer, adding a new `airports` table and admin-only routes for CRUD operations. The system follows the established SvelteKit patterns with server-side validation, type-safe database operations, and Flowbite-Svelte UI components, mirroring the architecture of the existing national parks admin tool.

## Architecture

### Database Layer

The system adds a new `airports` table to the existing PostgreSQL database managed by Drizzle ORM. This table stores comprehensive airport information including IATA/ICAO codes, geographical coordinates, elevation, and timezone data essential for trip planning optimization.

### Authentication & Authorization

The admin system builds upon the existing Better Auth implementation, using the same role-based access control through email-based authorization. The system validates that only the user "louis@eforge.us" can access admin functionality, implemented through the existing server-side middleware and route guards.

### Route Structure

Admin functionality is organized under `/admin/airports` routes, following SvelteKit's file-based routing conventions and mirroring the `/admin/parks` structure. Each route includes proper server-side validation and authorization checks using the existing admin authorization system.

### UI Components

The admin interface utilizes Flowbite-Svelte components for consistency with the existing application design and the national parks admin interface, including tables, forms, modals, and navigation elements.

## Components and Interfaces

### Database Schema

```typescript
// Addition to src/lib/server/db/schema.ts
export const airports = pgTable('airports', {
	id: serial('id').primaryKey(),
	iataCode: text('iata_code').notNull().unique(), // 3-letter code (e.g., LAX)
	icaoCode: text('icao_code').unique(), // 4-letter code (e.g., KLAX)
	name: text('name').notNull(),
	city: text('city').notNull(),
	state: text('state'), // State/region/province
	country: text('country').notNull(),
	latitude: numeric('latitude', { precision: 10, scale: 8 }).notNull(),
	longitude: numeric('longitude', { precision: 11, scale: 8 }).notNull(),
	elevation: integer('elevation'), // feet above sea level
	timezone: text('timezone'), // IANA timezone identifier
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});
```

### Authorization Middleware

The system reuses the existing admin authorization system:

```typescript
// Existing src/lib/server/auth/admin.ts
export function isAdmin(user: User | null): boolean {
	return user?.email === 'louis@eforge.us';
}

export function requireAdmin(user: User | null): void {
	if (!isAdmin(user)) {
		throw error(403, 'Admin access required');
	}
}
```

### Route Structure

```
src/routes/admin/
├── +layout.server.ts          # Existing admin authorization check
├── +layout.svelte             # Updated admin layout with airports navigation
└── airports/
    ├── +page.server.ts        # Load airports list, handle search
    ├── +page.svelte           # Airports list view with table
    ├── create/
    │   ├── +page.server.ts    # Handle airport creation
    │   └── +page.svelte       # Create airport form
    ├── [id]/
    │   ├── +page.server.ts    # Load airport data
    │   ├── +page.svelte       # Airport details view
    │   └── edit/
    │       ├── +page.server.ts # Handle airport updates
    │       └── +page.svelte    # Edit airport form
    └── [id]/delete/
        ├── +page.server.ts    # Handle airport deletion
        └── +page.svelte       # Delete confirmation
```

### Data Access Layer

```typescript
// src/lib/server/db/airports.ts
export interface CreateAirportData {
	iataCode: string;
	icaoCode?: string;
	name: string;
	city: string;
	state?: string;
	country: string;
	latitude: number;
	longitude: number;
	elevation?: number;
	timezone?: string;
}

export interface UpdateAirportData extends Partial<CreateAirportData> {
	id: number;
}

export class AirportsRepository {
	async getAllAirports(): Promise<Airport[]>;
	async getAirportById(id: number): Promise<Airport | null>;
	async getAirportByIataCode(iataCode: string): Promise<Airport | null>;
	async createAirport(data: CreateAirportData): Promise<Airport>;
	async updateAirport(data: UpdateAirportData): Promise<Airport>;
	async deleteAirport(id: number): Promise<void>;
	async searchAirports(query: string): Promise<Airport[]>;
}
```

### Form Validation

```typescript
// src/lib/validation/airports.ts
export const createAirportSchema = z.object({
	iataCode: z
		.string()
		.length(3, 'IATA code must be exactly 3 characters')
		.regex(/^[A-Z]{3}$/, 'IATA code must be 3 uppercase letters'),
	icaoCode: z
		.string()
		.length(4, 'ICAO code must be exactly 4 characters')
		.regex(/^[A-Z]{4}$/, 'ICAO code must be 4 uppercase letters')
		.optional(),
	name: z.string().min(1, 'Airport name is required').max(200),
	city: z.string().min(1, 'City is required').max(100),
	state: z.string().max(100).optional(),
	country: z.string().min(1, 'Country is required').max(100),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	elevation: z.number().int().optional(),
	timezone: z.string().max(50).optional()
});

export const updateAirportSchema = createAirportSchema.partial().extend({
	id: z.number().positive()
});
```

## Data Models

### Airport Entity

```typescript
export interface Airport {
	id: number;
	iataCode: string;
	icaoCode?: string;
	name: string;
	city: string;
	state?: string;
	country: string;
	latitude: number;
	longitude: number;
	elevation?: number;
	timezone?: string;
	createdAt: Date;
	updatedAt: Date;
}
```

### Form Data Types

```typescript
export interface AirportFormData {
	iataCode: string;
	icaoCode: string;
	name: string;
	city: string;
	state: string;
	country: string;
	latitude: string; // Form inputs as strings
	longitude: string;
	elevation: string;
	timezone: string;
}
```

## Error Handling

### Server-Side Validation

- Form data validation using Zod schemas
- Database constraint validation (unique IATA/ICAO codes)
- Coordinate validation for latitude/longitude ranges
- Proper error responses with specific field messages

### Client-Side Feedback

- Form validation errors displayed inline
- Success/failure toast notifications using existing toast system
- Loading states during operations
- Confirmation dialogs for destructive actions

### Authorization Errors

- Reuse existing 403 Forbidden handling for non-admin users
- Redirect to login for unauthenticated users
- Clear error messages for access violations

## Testing Strategy

### Unit Tests

- Database repository functions for airports
- Validation schema tests for airport data
- Reuse existing authorization helper function tests
- Form data transformation utilities

### Integration Tests

- Admin route access control (reusing existing patterns)
- CRUD operations end-to-end for airports
- Form submission workflows
- Database transaction integrity

### Component Tests

- Airport form validation behavior
- Table display and sorting functionality
- Modal interactions for deletion
- Loading state handling

## Security Considerations

### Access Control

- Reuse existing server-side authorization on all admin routes
- Same email-based admin identification system
- Existing session validation for all operations
- CSRF protection through SvelteKit forms

### Data Validation

- Input sanitization and validation for airport codes
- SQL injection prevention through Drizzle ORM
- XSS protection through proper escaping
- Coordinate validation to prevent invalid geographical data

### Audit Trail

- Created/updated timestamps on all airport records
- User identification in operation logs (reusing existing system)
- Database transaction logging
- Admin action monitoring

## Performance Optimization

### Database Queries

- Indexed columns for IATA/ICAO code lookups
- Indexed columns for search operations (name, city, state, country)
- Pagination for large airport lists
- Efficient filtering and sorting
- Connection pooling through existing Drizzle setup

### Client-Side Performance

- Lazy loading of airport details
- Optimistic UI updates
- Efficient re-rendering with Svelte 5
- Minimal JavaScript bundle size (reusing existing components)

### Caching Strategy

- Server-side caching of airport lists
- Browser caching of static assets
- Database query result caching
- Reuse existing caching infrastructure

## Integration with Existing System

### Admin Layout Updates

- Add airports navigation link to existing admin layout
- Maintain consistent styling and navigation patterns
- Reuse existing admin breadcrumb system

### Shared Components

- Reuse existing form components and validation patterns
- Utilize existing toast notification system
- Leverage existing table and modal components
- Maintain consistent error handling patterns

### Database Migration Strategy

- Create new migration file for airports table
- Ensure compatibility with existing schema
- Plan for potential foreign key relationships with future trip planning features
