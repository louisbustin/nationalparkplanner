/**
 * Form utility functions for consistent styling and behavior
 */

/**
 * Get consistent disabled styling for form inputs
 */
export function getDisabledInputClass(isDisabled: boolean): string {
	return isDisabled ? 'opacity-50 cursor-not-allowed' : '';
}

/**
 * Get input color based on error state
 */
export function getInputColor(hasError: boolean): 'red' | undefined {
	return hasError ? 'red' : undefined;
}

/**
 * Combine input classes for consistent styling
 */
export function getInputClasses(
	isDisabled: boolean,
	hasError: boolean
): {
	color: 'red' | undefined;
	class: string;
} {
	return {
		color: getInputColor(hasError),
		class: getDisabledInputClass(isDisabled)
	};
}

/**
 * Format form validation errors for display
 */
export function formatFieldError(
	fieldErrors: Record<string, string> | undefined,
	field: string
): string | undefined {
	if (!fieldErrors) return undefined;
	return fieldErrors[field];
}

/**
 * Check if a field has validation errors
 */
export function hasFieldError(
	fieldErrors: Record<string, string> | undefined,
	field: string
): boolean {
	return !!formatFieldError(fieldErrors, field);
}
