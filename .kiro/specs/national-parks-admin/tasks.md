# Implementation Plan

- [x] 1. Set up database schema and core data layer
  - Add national_parks table to database schema with all required fields
  - Create database migration for the new table
  - Implement type-safe database operations using Drizzle ORM
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 1.1 Add national parks table to database schema
  - Extend src/lib/server/db/schema.ts with nationalParks table definition
  - Include id, name, state, description, latitude, longitude, establishedDate, area, createdAt, updatedAt fields
  - Set up proper data types and constraints for each field
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.2 Create database repository for parks operations
  - Create src/lib/server/db/parks.ts with ParksRepository class
  - Implement getAllParks, getParkById, createPark, updatePark, deletePark methods
  - Add searchParks method for filtering functionality
  - Include proper error handling and type safety
  - _Requirements: 1.4, 7.4_

- [x] 1.3 Set up validation schemas for park data
  - Create src/lib/validation/parks.ts with Zod schemas
  - Define createParkSchema and updateParkSchema with proper validation rules
  - Include coordinate validation, date validation, and required field checks
  - _Requirements: 4.1, 4.4, 5.2_

- [x] 2. Implement admin authorization system
  - Create admin authorization middleware and helper functions
  - Set up route protection for admin-only access
  - Implement email-based admin role checking
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2.1 Create admin authorization utilities
  - Create src/lib/server/auth/admin.ts with isAdmin and requireAdmin functions
  - Implement email-based admin checking for "louis@eforge.us"
  - Add proper error handling for unauthorized access
  - _Requirements: 3.1, 3.2_

- [x] 2.2 Set up admin route protection
  - Create src/routes/admin/+layout.server.ts with admin authorization check
  - Implement server-side validation for all admin routes
  - Add proper redirects and error responses for unauthorized users
  - _Requirements: 3.3, 3.4_

- [x] 3. Build admin layout and navigation
  - Create admin-specific layout with navigation menu
  - Implement responsive design using Flowbite-Svelte components
  - Add breadcrumb navigation and admin branding
  - _Requirements: 2.1, 2.2_

- [x] 3.1 Create admin layout component
  - Create src/routes/admin/+layout.svelte with admin navigation
  - Use Flowbite-Svelte Navbar and Sidebar components
  - Include links to parks management and future admin sections
  - _Requirements: 2.1, 2.2_

- [x] 4. Implement parks list view with search and pagination
  - Create parks listing page with table display
  - Add search functionality and action buttons
  - Implement responsive table design with Flowbite-Svelte
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4.1 Create parks list page server logic
  - Create src/routes/admin/parks/+page.server.ts with load function
  - Implement parks data loading and search parameter handling
  - Add pagination logic and search filtering
  - _Requirements: 7.1, 7.4_

- [x] 4.2 Build parks list UI component
  - Create src/routes/admin/parks/+page.svelte with parks table
  - Use Flowbite-Svelte Table component for data display
  - Add search input, action buttons, and empty state handling
  - Include edit and delete action buttons for each park
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 5. Implement create park functionality
  - Build park creation form with validation
  - Handle form submission and success/error states
  - Add proper field validation and user feedback
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5.1 Create park creation server actions
  - Create src/routes/admin/parks/create/+page.server.ts with form actions
  - Implement park creation logic with validation
  - Handle success redirects and error responses
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 5.2 Build park creation form UI
  - Create src/routes/admin/parks/create/+page.svelte with form
  - Use Flowbite-Svelte form components (Input, Textarea, Button)
  - Add client-side validation feedback and loading states
  - Include proper form field labels and help text
  - _Requirements: 4.1, 4.4_

- [x] 6. Implement edit park functionality
  - Build park editing form with pre-populated data
  - Handle form updates and validation
  - Maintain creation timestamps during updates
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.1 Create park edit server logic
  - Create src/routes/admin/parks/[id]/edit/+page.server.ts with load and actions
  - Implement park data loading and update operations
  - Add validation and error handling for edit operations
  - _Requirements: 5.1, 5.2, 5.5_

- [x] 6.2 Build park edit form UI
  - Create src/routes/admin/parks/[id]/edit/+page.svelte with pre-populated form
  - Use same form components as create page with existing data
  - Add update-specific messaging and cancel functionality
  - _Requirements: 5.1, 5.3, 5.4_

- [x] 7. Implement delete park functionality
  - Build confirmation dialog for park deletion
  - Handle deletion with proper validation
  - Add safety checks for parks with associated data
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7.1 Create park deletion server actions
  - Create src/routes/admin/parks/[id]/delete/+page.server.ts with deletion logic
  - Implement confirmation handling and actual deletion
  - Add checks for associated trip data before deletion
  - _Requirements: 6.2, 6.5_

- [x] 7.2 Build deletion confirmation UI
  - Create src/routes/admin/parks/[id]/delete/+page.svelte with confirmation dialog
  - Use Flowbite-Svelte Modal component for confirmation
  - Display park details and deletion consequences
  - _Requirements: 6.1, 6.3, 6.4_

- [ ] 8. Add comprehensive error handling and user feedback
  - Implement toast notifications for operations
  - Add loading states and error boundaries
  - Create consistent error messaging across admin interface
  - _Requirements: 4.3, 4.4, 5.3, 5.4, 6.3_

- [x] 8.1 Set up toast notification system
  - Integrate toast notifications for success/error feedback
  - Use existing toast components or create admin-specific ones
  - Add notifications for create, update, and delete operations
  - _Requirements: 4.3, 5.3, 6.3_

- [x] 8.2 Implement loading states and error boundaries
  - Add loading spinners and disabled states during operations
  - Create error boundary components for graceful error handling
  - Implement proper form validation error display
  - _Requirements: 4.4, 5.4_

- [x] 9. Create comprehensive test suite
  - Write unit tests for repository functions
  - Add integration tests for admin routes
  - Test authorization and validation logic
  - _Requirements: All requirements validation_

- [x] 9.1 Write database repository tests
  - Create tests for all ParksRepository methods
  - Test CRUD operations, search functionality, and error cases
  - Verify data integrity and constraint validation
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 9.2 Create admin authorization tests
  - Test isAdmin and requireAdmin functions
  - Verify route protection and access control
  - Test unauthorized access scenarios
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 9.3 Add form validation and UI tests
  - Test form submission workflows
  - Verify validation error handling
  - Test user interaction flows for CRUD operations
  - _Requirements: 4.1, 4.4, 5.2, 5.4, 6.1, 6.3_
