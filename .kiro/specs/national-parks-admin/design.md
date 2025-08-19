# Design Document

## Overview

The National Parks Admin system extends the existing National Park Planner application with a comprehensive data management layer for national parks information. The design leverages the existing Better Auth authentication system and Drizzle ORM database layer, adding a new `national_parks` table and admin-only routes for CRUD operations. The system follows the established SvelteKit patterns with server-side validation, type-safe database operations, and Flowbite-Svelte UI components.

## Architecture

### Database Layer

The system adds a new `national_parks` table to the existing PostgreSQL database managed by Drizzle ORM. This table stores comprehensive park information including geographical coordinates, establishment dates, and descriptive content.

### Authentication & Authorization

The admin system builds upon the existing Better Auth implementation, adding role-based access control through email-based authorization. The system validates that only the user "louis@eforge.us" can access admin functionality, implemented through server-side middleware and route guards.

### Route Structure

Admin functionality is organized under `/admin/parks` routes, following SvelteKit's file-based routing conventions. Each route includes proper server-side validation and authorization checks.

### UI Components

The admin interface utilizes Flowbite-Svelte components for consistency with the existing application design, including tables, forms, modals, and navigation elements.

## Components and Interfaces

### Database Schema

```typescript
// Addition to src/lib/server/db/schema.ts
export const nationalParks = pgTable('national_parks', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	state: text('state').notNull(),
	description: text('description'),
	latitude: numeric('latitude', { precision: 10, scale: 8 }),
	longitude: numeric('longitude', { precision: 11, scale: 8 }),
	establishedDate: date('established_date'),
	area: numeric('area', { precision: 10, scale: 2 }), // in square miles
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});
```

### Authorization Middleware

```typescript
// src/lib/server/auth/admin.ts
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
├── +layout.server.ts          # Admin authorization check
├── +layout.svelte             # Admin layout with navigation
└── parks/
    ├── +page.server.ts        # Load parks list, handle search
    ├── +page.svelte           # Parks list view with table
    ├── create/
    │   ├── +page.server.ts    # Handle park creation
    │   └── +page.svelte       # Create park form
    ├── [id]/
    │   ├── +page.server.ts    # Load park data
    │   ├── +page.svelte       # Park details view
    │   └── edit/
    │       ├── +page.server.ts # Handle park updates
    │       └── +page.svelte    # Edit park form
    └── [id]/delete/
        ├── +page.server.ts    # Handle park deletion
        └── +page.svelte       # Delete confirmation
```

### Data Access Layer

```typescript
// src/lib/server/db/parks.ts
export interface CreateParkData {
	name: string;
	state: string;
	description?: string;
	latitude?: number;
	longitude?: number;
	establishedDate?: Date;
	area?: number;
}

export interface UpdateParkData extends Partial<CreateParkData> {
	id: number;
}

export class ParksRepository {
	async getAllParks(): Promise<NationalPark[]>;
	async getParkById(id: number): Promise<NationalPark | null>;
	async createPark(data: CreateParkData): Promise<NationalPark>;
	async updatePark(data: UpdateParkData): Promise<NationalPark>;
	async deletePark(id: number): Promise<void>;
	async searchParks(query: string): Promise<NationalPark[]>;
}
```

### Form Validation

```typescript
// src/lib/validation/parks.ts
export const createParkSchema = z.object({
	name: z.string().min(1, 'Park name is required').max(100),
	state: z.string().min(2, 'State is required').max(50),
	description: z.string().optional(),
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
	establishedDate: z.date().optional(),
	area: z.number().positive().optional()
});

export const updateParkSchema = createParkSchema.partial().extend({
	id: z.number().positive()
});
```

## Data Models

### National Park Entity

```typescript
export interface NationalPark {
	id: number;
	name: string;
	state: string;
	description?: string;
	latitude?: number;
	longitude?: number;
	establishedDate?: Date;
	area?: number; // square miles
	createdAt: Date;
	updatedAt: Date;
}
```

### Form Data Types

```typescript
export interface ParkFormData {
	name: string;
	state: string;
	description: string;
	latitude: string; // Form inputs as strings
	longitude: string;
	establishedDate: string;
	area: string;
}
```

## Error Handling

### Server-Side Validation

- Form data validation using Zod schemas
- Database constraint validation
- Duplicate park name prevention within same state
- Proper error responses with specific field messages

### Client-Side Feedback

- Form validation errors displayed inline
- Success/failure toast notifications
- Loading states during operations
- Confirmation dialogs for destructive actions

### Authorization Errors

- 403 Forbidden for non-admin users
- Redirect to login for unauthenticated users
- Clear error messages for access violations

## Testing Strategy

### Unit Tests

- Database repository functions
- Validation schema tests
- Authorization helper functions
- Form data transformation utilities

### Integration Tests

- Admin route access control
- CRUD operations end-to-end
- Form submission workflows
- Database transaction integrity

### Component Tests

- Form validation behavior
- Table display and sorting
- Modal interactions
- Loading state handling

## Security Considerations

### Access Control

- Server-side authorization on all admin routes
- Email-based admin identification
- Session validation for all operations
- CSRF protection through SvelteKit forms

### Data Validation

- Input sanitization and validation
- SQL injection prevention through Drizzle ORM
- XSS protection through proper escaping
- File upload restrictions (if added later)

### Audit Trail

- Created/updated timestamps on all records
- User identification in operation logs
- Database transaction logging
- Admin action monitoring

## Performance Optimization

### Database Queries

- Indexed columns for search operations
- Pagination for large park lists
- Efficient filtering and sorting
- Connection pooling through Drizzle

### Client-Side Performance

- Lazy loading of park details
- Optimistic UI updates
- Efficient re-rendering with Svelte 5
- Minimal JavaScript bundle size

### Caching Strategy

- Server-side caching of park lists
- Browser caching of static assets
- CDN optimization for images (future)
- Database query result caching
