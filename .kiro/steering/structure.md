# Project Structure

## Root Level

- **Configuration files** - Package management, build tools, and deployment config
- **Environment files** - `.env` for local development, `.env.example` as template
- **Database schema** - `auth-schema.ts` and `drizzle.config.ts` for database setup

## Source Code (`src/`)

```
src/
├── app.html          # HTML template
├── app.css           # Global styles
├── app.d.ts          # App-wide TypeScript declarations
├── hooks.server.ts   # SvelteKit server hooks (auth integration)
├── lib/              # Shared library code
│   ├── auth.ts       # Better Auth configuration
│   ├── auth-client.ts # Client-side auth utilities
│   ├── assets/       # Static assets (favicon, etc.)
│   └── server/       # Server-only code
│       └── db/       # Database layer
│           ├── index.ts  # Database connection
│           └── schema.ts # Drizzle schema definitions
└── routes/           # SvelteKit file-based routing
```

## Build Outputs

- **`.svelte-kit/`** - SvelteKit build artifacts and generated files
- **`.sst/`** - SST deployment artifacts and platform code
- **`node_modules/`** - Dependencies

## Key Conventions

### Database Schema

- Located in `src/lib/server/db/schema.ts`
- Uses Drizzle ORM with PostgreSQL dialect
- Authentication tables: `user`, `session`, `account`, `verification`
- All include `createdAt`/`updatedAt` timestamps
- Any tables beside the authentication tables will have an autoincrementing primary key titled `id`.

### Authentication

- Better Auth configured in `src/lib/auth.ts`
- Server integration via `src/hooks.server.ts`
- Email/password authentication enabled
- Drizzle adapter for database persistence

### File Organization

- **Server-only code** goes in `src/lib/server/`
- **Shared utilities** in `src/lib/`
- **Routes** follow SvelteKit file-based routing in `src/routes/`
- **Static assets** in `src/lib/assets/` and `static/`

### TypeScript

- Strict mode enabled
- Module resolution set to "bundler"
- SvelteKit provides path aliases (`$lib`, `$app`, etc.)
- Type definitions extend from `.svelte-kit/tsconfig.json`

### Testing Structure

- **Client tests** - `*.svelte.{test,spec}.{js,ts}` files (browser environment)
- **Server tests** - `*.{test,spec}.{js,ts}` files (Node environment)
- Test setup files at project root
