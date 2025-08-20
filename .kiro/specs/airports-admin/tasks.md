# Implementation Plan

- [x] 1. Set up database schema and core data layer
  - Add airports table to database schema with all required fields
  - Create database migration for the new table
  - Implement type-safe database operations using Drizzle ORM
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 1.1 Add airports table to database schema
  - Extend src/lib/server/db/schema.ts with airports table definition
  - Include id, iataCode, icaoCode, name, city, state, country, latitude, longitude, elevation, timezone, createdAt, updatedAt fields
  - Set up proper data types, constraints, and unique indexes for IATA/ICAO codes
  - _Requirements: 1.1, 1.2, 1.3, 4.5_

- [x] 1.2 Create database repository for airports operations
  - Create src/lib/server/db/airports.ts with AirportsRepository class
  - Implement getAllAirports, getAirportById, getAirportByIataCode, createAirport, updateAirport, deleteAirport methods
  - Add searchAirports method for filtering functionality
  - Include proper error handling and type safety
  - _Requirements: 1.4, 7.4, 8.1, 8.2_

- [x] 1.3 Set up validation schemas for airport data
  - Create src/lib/validation/airports.ts with Zod schemas
  - Define createAirportSchema and updateAirportSchema with proper validation rules
  - Include IATA/ICAO code validation, coordinate validation, and required field checks
  - _Requirements: 4.1, 4.4, 5.2, 8.1_

- [x] 2. Update admin layout and navigation
  - Add airports navigation link to existing admin layout
  - Ensure consistent styling and navigation patterns
  - Update admin breadcrumb system for airports section
  - _Requirements: 2.1, 2.2_

- [x] 2.1 Update admin layout with airports navigation
  - Modify src/routes/admin/+layout.svelte to include airports navigation link
  - Add airports menu item to existing admin navigation structure
  - Ensure consistent styling with existing parks navigation
  - _Requirements: 2.1, 2.2_

- [x] 3. Implement airports list view with search and pagination
  - Create airports listing page with table display
  - Add search functionality for IATA code, name, city, state, and country
  - Implement responsive table design with Flowbite-Svelte
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3.1 Create airports list page server logic
  - Create src/routes/admin/airports/+page.server.ts with load function
  - Implement airports data loading and search parameter handling
  - Add pagination logic and multi-field search filtering
  - _Requirements: 7.1, 7.4, 8.1, 8.2, 8.5_

- [x] 3.2 Build airports list UI component
  - Create src/routes/admin/airports/+page.svelte with airports table
  - Use Flowbite-Svelte Table component for data display
  - Add search input with real-time filtering, action buttons, and empty state handling
  - Include edit and delete action buttons for each airport
  - Display IATA code, airport name, city, state/region, country in table columns
  - _Requirements: 7.1, 7.2, 7.3, 7.5, 8.2, 8.3, 8.4_

- [x] 4. Implement create airport functionality
  - Build airport creation form with validation
  - Handle form submission and success/error states
  - Add proper field validation and user feedback
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.1 Create airport creation server actions
  - Create src/routes/admin/airports/create/+page.server.ts with form actions
  - Implement airport creation logic with validation
  - Handle success redirects and error responses
  - Prevent duplicate IATA/ICAO codes
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 4.2 Build airport creation form UI
  - Create src/routes/admin/airports/create/+page.svelte with form
  - Use Flowbite-Svelte form components (Input, Select, Button)
  - Add client-side validation feedback and loading states
  - Include proper form field labels, help text, and IATA/ICAO code formatting
  - _Requirements: 4.1, 4.4_

- [x] 5. Implement edit airport functionality
  - Build airport editing form with pre-populated data
  - Handle form updates and validation
  - Maintain creation timestamps during updates
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5.1 Create airport edit server logic
  - Create src/routes/admin/airports/[id]/edit/+page.server.ts with load and actions
  - Implement airport data loading and update operations
  - Add validation and error handling for edit operations
  - _Requirements: 5.1, 5.2, 5.5_

- [x] 5.2 Build airport edit form UI
  - Create src/routes/admin/airports/[id]/edit/+page.svelte with pre-populated form
  - Use same form components as create page with existing data
  - Add update-specific messaging and cancel functionality
  - _Requirements: 5.1, 5.3, 5.4_

- [x] 6. Implement delete airport functionality
  - Build confirmation dialog for airport deletion
  - Handle deletion with proper validation
  - Add safety checks for airports with associated data
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6.1 Create airport deletion server actions
  - Create src/routes/admin/airports/[id]/delete/+page.server.ts with deletion logic
  - Implement confirmation handling and actual deletion
  - Add checks for associated trip data before deletion
  - _Requirements: 6.2, 6.5_

- [x] 6.2 Build deletion confirmation UI
  - Create src/routes/admin/airports/[id]/delete/+page.svelte with confirmation dialog
  - Use Flowbite-Svelte Modal component for confirmation
  - Display airport details (IATA code, name, city) and deletion consequences
  - _Requirements: 6.1, 6.3, 6.4_

- [x] 7. Add comprehensive error handling and user feedback
  - Implement toast notifications for operations
  - Add loading states and error boundaries
  - Create consistent error messaging across admin interface
  - _Requirements: 4.3, 4.4, 5.3, 5.4, 6.3_

- [x] 7.1 Set up toast notification system for airports
  - Integrate existing toast notifications for success/error feedback
  - Add notifications for create, update, and delete operations
  - Include airport-specific messaging (IATA codes in notifications)
  - _Requirements: 4.3, 5.3, 6.3_

- [x] 7.2 Implement loading states and error boundaries
  - Add loading spinners and disabled states during operations
  - Reuse existing error boundary components for graceful error handling
  - Implement proper form validation error display for airport-specific fields
  - _Requirements: 4.4, 5.4_

- [x] 8. Create comprehensive test suite
  - Write unit tests for repository functions
  - Add integration tests for admin routes
  - Test validation logic for airport-specific data
  - _Requirements: All requirements validation_

- [x] 8.1 Write database repository tests
  - Create tests for all AirportsRepository methods
  - Test CRUD operations, search functionality, and error cases
  - Verify data integrity and constraint validation for IATA/ICAO codes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.5_

- [x] 8.2 Create airport validation tests
  - Test IATA/ICAO code validation rules
  - Verify coordinate validation and required field checks
  - Test duplicate code prevention logic
  - _Requirements: 4.1, 4.4, 4.5, 5.2_

- [x] 8.3 Add form validation and UI tests
  - Test form submission workflows for airports
  - Verify validation error handling for airport-specific fields
  - Test user interaction flows for CRUD operations
  - Test search and filtering functionality
  - _Requirements: 7.4, 8.1, 8.2, 8.3, 8.4_
