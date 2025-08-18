---
inclusion: always
---

# Technology Stack & Development Guidelines

## Core Stack

- **Svelte 5** with runes (`$state`, `$derived`, `$effect`) - Modern reactivity
- **SvelteKit** - Full-stack framework with file-based routing
- **TypeScript** - Strict mode, explicit types preferred
- **TailwindCSS 4.0** - Utility-first styling
- **Flowbite-Svelte** - Primary UI component library
- **Better Auth** - Authentication with email/password
- **Drizzle ORM** - Type-safe database operations
- **Neon PostgreSQL** - Serverless database
- **SST v3** - AWS infrastructure deployment

## Essential References

- [Drizzle ORM](https://orm.drizzle.team/llms.txt)
- [Better Auth](https://www.better-auth.com/llms.txt)
- [Svelte](https://svelte.dev/llms-full.txt)
- **Flowbite-Svelte Components** - Available components:
  - **Forms**: Input, Textarea, Select, Checkbox, Radio, Toggle, Range, FileInput, Search
  - **Buttons**: Button, ButtonGroup, GradientButton, ColorButton
  - **Navigation**: Navbar, Sidebar, Breadcrumb, Pagination, Tabs, Stepper
  - **Layout**: Card, Accordion, List, ListGroup, Timeline, Skeleton
  - **Feedback**: Alert, Toast, Modal, Drawer, Popover, Tooltip, Progress, Spinner
  - **Data Display**: Table, Badge, Avatar, Rating, Carousel, Gallery
  - **Typography**: Heading, P, Blockquote, Hr, Mark, Secondary
  - **Utilities**: DarkMode, DeviceMockups, Indicator, KBD, Toolbar
  - Component documenation can be found here:
    - https://flowbite-svelte.com/llm/components/buttons.md
    - https://flowbite-svelte.com/llm/components/accordion.md
    - https://flowbite-svelte.com/llm/components/alert.md
    - https://flowbite-svelte.com/llm/components/avatar.md
    - https://flowbite-svelte.com/llm/components/badge.md
    - https://flowbite-svelte.com/llm/components/banner.md
    - https://flowbite-svelte.com/llm/components/breadcrumb.md
    - https://flowbite-svelte.com/llm/components/button-group.md
    - https://flowbite-svelte.com/llm/components/card.md
    - https://flowbite-svelte.com/llm/components/carosel.md
    - https://flowbite-svelte.com/llm/components/darkmode.md
    - https://flowbite-svelte.com/llm/components/datepicker.md
    - https://flowbite-svelte.com/llm/components/drawer.md
    - https://flowbite-svelte.com/llm/components/dropdown.md
    - https://flowbite-svelte.com/llm/components/footer.md
    - https://flowbite-svelte.com/llm/components/forms.md
    - https://flowbite-svelte.com/llm/components/gallery.md
    - https://flowbite-svelte.com/llm/components/indicator.md
    - https://flowbite-svelte.com/llm/components/kbd.md
    - https://flowbite-svelte.com/llm/components/list-group.md
    - https://flowbite-svelte.com/llm/components/mega-menu.md
    - https://flowbite-svelte.com/llm/components/modal.md
    - https://flowbite-svelte.com/llm/components/navbar.md
    - https://flowbite-svelte.com/llm/components/pagination.md
    - https://flowbite-svelte.com/llm/components/popover.md
    - https://flowbite-svelte.com/llm/components/progress.md
    - https://flowbite-svelte.com/llm/components/rating.md
    - https://flowbite-svelte.com/llm/components/sidebar.md
    - https://flowbite-svelte.com/llm/components/skeleton.md
    - https://flowbite-svelte.com/llm/components/speed-dial.md
    - https://flowbite-svelte.com/llm/components/spinner.md
    - https://flowbite-svelte.com/llm/components/stepper.md
    - https://flowbite-svelte.com/llm/components/table.md
    - https://flowbite-svelte.com/llm/components/tabs.md
    - https://flowbite-svelte.com/llm/components/timeline.md
    - https://flowbite-svelte.com/llm/components/toast.md
    - https://flowbite-svelte.com/llm/components/tooltip.md
    - https://flowbite-svelte.com/llm/components/typeography.md
    - https://flowbite-svelte.com/llm/components/video.md
    - https://flowbite-svelte.com/llm/forms/checkbox.md
    - https://flowbite-svelte.com/llm/forms/file-input.md
    - https://flowbite-svelte.com/llm/forms/floating-label.md
    - https://flowbite-svelte.com/llm/forms/input-field.md
    - https://flowbite-svelte.com/llm/forms/number-input.md
    - https://flowbite-svelte.com/llm/forms/phone-input.md
    - https://flowbite-svelte.com/llm/forms/radio.md
    - https://flowbite-svelte.com/llm/forms/range.md
    - https://flowbite-svelte.com/llm/forms/search-input.md
    - https://flowbite-svelte.com/llm/forms/select.md
    - https://flowbite-svelte.com/llm/forms/textarea.md
    - https://flowbite-svelte.com/llm/forms/timepicker.md
    - https://flowbite-svelte.com/llm/forms/toggle.md
    - https://flowbite-svelte.com/llm/typography/blockquote.md
    - https://flowbite-svelte.com/llm/typography/heading.md
    - https://flowbite-svelte.com/llm/typography/hr.md
    - https://flowbite-svelte.com/llm/typography/image.md
    - https://flowbite-svelte.com/llm/typography/link.md
    - https://flowbite-svelte.com/llm/typography/list.md
    - https://flowbite-svelte.com/llm/typography/paragraph.md
    - https://flowbite-svelte.com/llm/typography/text.md
    - https://flowbite-svelte.com/llm/utilities/label.md
    - https://flowbite-svelte.com/llm/utilities/toolbar.md

## Code Conventions

### Component Development

- Always use `<script lang="ts">` in Svelte components
- Use Svelte 5 runes for reactivity: `$state`, `$derived`, `$effect`
- Prefer Flowbite-Svelte components over custom implementations
- Use TailwindCSS utility classes, avoid custom CSS
- Leverage SvelteKit's generated types (`PageData`, `ActionData`)

### Database Operations

- All database code in `src/lib/server/db/`
- Use Drizzle query builder for type safety
- Include `createdAt`/`updatedAt` timestamps on all tables
- Use transactions for multi-table operations
- New tables should have autoincrementing `id` primary key

### Authentication Patterns

- Server-side session validation in `hooks.server.ts`
- Client-side auth via Better Auth client
- Protect routes with `+page.server.ts` load functions
- Use SvelteKit form actions for auth operations

### TypeScript Rules

- Strict mode enabled - no `any` types
- Prefer interfaces over types for object shapes
- Explicit return types on all functions
- Use proper error handling with SvelteKit's `error()` function

## Development Commands

```bash
# Development
npm run dev          # Start dev server with HMR
sst dev              # Start SST development mode (for AWS resources)
npm run db:studio    # Open database GUI

# Code Quality
npm run lint         # ESLint + Prettier checks
npm run check        # Svelte type checking
npm run format       # Auto-format code

# Database
npm run db:push      # Push schema changes (development)
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations (production)

# Deployment
sst deploy           # Deploy to AWS (production)
```

## Architecture Rules

### File Organization

- Server-only code: `src/lib/server/`
- Shared utilities: `src/lib/`
- Routes: `src/routes/` (SvelteKit file-based routing)
- Database schema: `src/lib/server/db/schema.ts`

### National Park Planner Specific

- Focus on trip planning and airport optimization features
- Prioritize user experience for multi-park trip planning
- Use SSR for SEO-critical pages (park information, trip planning)

## Environment Variables

Required for development and production:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret key
- `BETTER_AUTH_URL` - Base URL for auth callbacks

Production domain: `nationalparkplanner.us`
