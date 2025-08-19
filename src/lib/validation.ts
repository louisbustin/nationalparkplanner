/**
 * Client-side validation utilities for authentication forms
 */

export interface ValidationRule {
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	message: string;
}

export interface ValidationRules {
	[field: string]: ValidationRule;
}

export interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string>;
}

export interface FormState {
	values: Record<string, string>;
	errors: Record<string, string>;
	touched: Record<string, boolean>;
	isSubmitting: boolean;
	isValid: boolean;
}

// Validation rules for authentication forms
export const authValidationRules: ValidationRules = {
	email: {
		required: true,
		pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		message: 'Please enter a valid email address'
	},
	password: {
		required: true,
		minLength: 8,
		pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
		message: 'Password must be at least 8 characters with letters and numbers'
	},
	confirmPassword: {
		required: true,
		message: 'Please confirm your password'
	},
	name: {
		required: true,
		minLength: 2,
		maxLength: 50,
		message: 'Name must be between 2 and 50 characters'
	}
};

// Export individual validation rules for reuse
export const emailValidation = authValidationRules.email;
export const passwordValidation = authValidationRules.password;
export const nameValidation = authValidationRules.name;

/**
 * Validates a single field value against its validation rule
 */
export function validateField(value: string, rule: ValidationRule): string | null {
	// Check required
	if (rule.required && (!value || value.trim() === '')) {
		return rule.message;
	}

	// Skip other validations if field is empty and not required
	if (!value || value.trim() === '') {
		return null;
	}

	// Check minimum length
	if (rule.minLength && value.length < rule.minLength) {
		return rule.message;
	}

	// Check maximum length
	if (rule.maxLength && value.length > rule.maxLength) {
		return rule.message;
	}

	// Check pattern
	if (rule.pattern && !rule.pattern.test(value)) {
		return rule.message;
	}

	return null;
}

/**
 * Validates multiple fields against their rules
 */
export function validateForm(
	values: Record<string, string>,
	rules: ValidationRules,
	customValidations?: Record<
		string,
		(value: string, values: Record<string, string>) => string | null
	>
): ValidationResult {
	const errors: Record<string, string> = {};

	// Validate each field against its rule
	for (const [field, rule] of Object.entries(rules)) {
		const value = values[field] || '';
		const error = validateField(value, rule);
		if (error) {
			errors[field] = error;
		}
	}

	// Run custom validations
	if (customValidations) {
		for (const [field, validator] of Object.entries(customValidations)) {
			const value = values[field] || '';
			const error = validator(value, values);
			if (error) {
				errors[field] = error;
			}
		}
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
}

/**
 * Custom validation for password confirmation
 */
export function validatePasswordConfirmation(
	confirmPassword: string,
	values: Record<string, string>
): string | null {
	const password = values.password || '';
	if (confirmPassword && password && confirmPassword !== password) {
		return 'Passwords do not match';
	}
	return null;
}

/**
 * Gets password strength indicator
 */
export function getPasswordStrength(password: string): {
	score: number;
	feedback: string;
	color: 'red' | 'yellow' | 'green';
} {
	if (!password) {
		return { score: 0, feedback: '', color: 'red' };
	}

	let score = 0;
	const feedback: string[] = [];

	// Length check
	if (password.length >= 8) {
		score += 1;
	} else {
		feedback.push('At least 8 characters');
	}

	// Has letters
	if (/[A-Za-z]/.test(password)) {
		score += 1;
	} else {
		feedback.push('Include letters');
	}

	// Has numbers
	if (/\d/.test(password)) {
		score += 1;
	} else {
		feedback.push('Include numbers');
	}

	// Has special characters (bonus)
	if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		score += 1;
	}

	// Has mixed case (bonus)
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
		score += 1;
	}

	let strengthText = '';
	let color: 'red' | 'yellow' | 'green' = 'red';

	if (score <= 2) {
		strengthText = 'Weak';
		color = 'red';
	} else if (score <= 3) {
		strengthText = 'Fair';
		color = 'yellow';
	} else {
		strengthText = 'Strong';
		color = 'green';
	}

	return {
		score,
		feedback: feedback.length > 0 ? `${strengthText}. ${feedback.join(', ')}` : strengthText,
		color
	};
}
