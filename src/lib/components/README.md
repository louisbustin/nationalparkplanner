# Form Components

This directory contains reusable form components and validation utilities for the National Park Planner authentication system.

## Components

### FormField

A reusable form field component with Flowbite Input integration and validation feedback.

**Props:**

- `label: string` - Field label text
- `type?: 'email' | 'password' | 'text'` - Input type (default: 'text')
- `placeholder?: string` - Placeholder text
- `required?: boolean` - Whether field is required (default: false)
- `error?: string` - External error message to display
- `value: string` - Bound input value
- `rule?: ValidationRule` - Validation rule for the field
- `showPasswordStrength?: boolean` - Show password strength indicator (default: false)
- `disabled?: boolean` - Whether field is disabled (default: false)
- `autocomplete?: string` - Autocomplete attribute

**Features:**

- Real-time validation with visual feedback
- Password strength indicator for password fields
- Flowbite styling integration
- Accessibility support with proper labels

### AuthForm

A wrapper component for authentication forms with loading states and error handling.

**Props:**

- `title: string` - Form title
- `submitText: string` - Submit button text
- `isLoading?: boolean` - Loading state (default: false)
- `errors?: Record<string, string>` - Field-specific errors
- `generalError?: string` - General form error message
- `onsubmit?: (event: SubmitEvent) => void | Promise<void>` - Form submission handler
- `children?: any` - Form content (using snippets)

**Features:**

- Loading spinner during form submission
- Error message display
- Disabled submit button during loading
- Card-based layout with Flowbite styling

## Utilities

### Validation (`validation.ts`)

Provides client-side validation utilities with TypeScript interfaces.

**Key Functions:**

- `validateField(value, rule)` - Validates a single field
- `validateForm(values, rules, customValidations)` - Validates entire form
- `validatePasswordConfirmation(confirmPassword, values)` - Password confirmation validation
- `getPasswordStrength(password)` - Password strength analysis

**Validation Rules:**

- Email: Valid email format required
- Password: Minimum 8 characters with letters and numbers
- Name: 2-50 characters required
- Confirm Password: Must match password field

### Form State Management (`form-state.svelte.ts`)

Reactive form state management for Svelte 5 using runes.

**Key Features:**

- Reactive state with `$state` and `$derived`
- Automatic validation
- Field-level error handling
- Form submission state management
- Helper methods for common operations

**Usage:**

```typescript
const form = createFormState({
	initialValues: { email: '', password: '' },
	validationRules: authValidationRules,
	customValidations: { confirmPassword: validatePasswordConfirmation }
});

// Get field props for binding
const emailProps = form.getFieldProps('email');
```

## Example Usage

```svelte
<script lang="ts">
	import { FormField, AuthForm, authValidationRules, createFormState } from '$lib/components';

	const form = createFormState({
		initialValues: { email: '', password: '' },
		validationRules: authValidationRules
	});

	async function handleSubmit(event: SubmitEvent) {
		if (!form.validate()) return;
		// Handle form submission
	}
</script>

<AuthForm
	title="Sign In"
	submitText="Sign In"
	isLoading={form.isSubmitting}
	onsubmit={handleSubmit}
>
	{#snippet children()}
		<FormField label="Email" type="email" required {...form.getFieldProps('email')} />
		<FormField label="Password" type="password" required {...form.getFieldProps('password')} />
	{/snippet}
</AuthForm>
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **7.1**: Password security requirements and validation with real-time feedback
- **7.2**: Password confirmation matching and validation
- **8.4**: Loading states and user feedback during form operations

The components provide a solid foundation for building authentication forms with proper validation, error handling, and user experience considerations.
