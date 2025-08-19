import { describe, it, expect } from 'vitest';
import {
	validateField,
	validateForm,
	validatePasswordConfirmation,
	getPasswordStrength,
	authValidationRules,
	emailValidation,
	passwordValidation,
	nameValidation
} from './validation';

describe('validation utilities', () => {
	describe('validateField', () => {
		it('should validate required fields', () => {
			const rule = { required: true, message: 'Field is required' };

			expect(validateField('', rule)).toBe('Field is required');
			expect(validateField('   ', rule)).toBe('Field is required');
			expect(validateField('value', rule)).toBeNull();
		});

		it('should validate minimum length', () => {
			const rule = { minLength: 5, message: 'Too short' };

			expect(validateField('1234', rule)).toBe('Too short');
			expect(validateField('12345', rule)).toBeNull();
			expect(validateField('123456', rule)).toBeNull();
		});

		it('should validate maximum length', () => {
			const rule = { maxLength: 5, message: 'Too long' };

			expect(validateField('123456', rule)).toBe('Too long');
			expect(validateField('12345', rule)).toBeNull();
			expect(validateField('1234', rule)).toBeNull();
		});

		it('should validate patterns', () => {
			const rule = { pattern: /^\d+$/, message: 'Numbers only' };

			expect(validateField('abc', rule)).toBe('Numbers only');
			expect(validateField('123abc', rule)).toBe('Numbers only');
			expect(validateField('123', rule)).toBeNull();
		});

		it('should skip validations for empty non-required fields', () => {
			const rule = { minLength: 5, pattern: /^\d+$/, message: 'Invalid' };

			expect(validateField('', rule)).toBeNull();
			expect(validateField('   ', rule)).toBeNull();
		});

		it('should validate complex rules', () => {
			const rule = {
				required: true,
				minLength: 3,
				maxLength: 10,
				pattern: /^[a-zA-Z]+$/,
				message: 'Invalid name'
			};

			expect(validateField('', rule)).toBe('Invalid name');
			expect(validateField('ab', rule)).toBe('Invalid name');
			expect(validateField('verylongname', rule)).toBe('Invalid name');
			expect(validateField('name123', rule)).toBe('Invalid name');
			expect(validateField('John', rule)).toBeNull();
		});
	});

	describe('validateForm', () => {
		const rules = {
			email: emailValidation,
			password: passwordValidation,
			name: nameValidation
		};

		it('should validate all fields successfully', () => {
			const values = {
				email: 'test@example.com',
				password: 'password123',
				name: 'John Doe'
			};

			const result = validateForm(values, rules);
			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual({});
		});

		it('should return errors for invalid fields', () => {
			const values = {
				email: 'invalid-email',
				password: 'weak',
				name: 'A'
			};

			const result = validateForm(values, rules);
			expect(result.isValid).toBe(false);
			expect(result.errors.email).toBe(emailValidation.message);
			expect(result.errors.password).toBe(passwordValidation.message);
			expect(result.errors.name).toBe(nameValidation.message);
		});

		it('should handle missing values', () => {
			const values = {};

			const result = validateForm(values, rules);
			expect(result.isValid).toBe(false);
			expect(Object.keys(result.errors)).toHaveLength(3);
		});

		it('should run custom validations', () => {
			const values = {
				email: 'test@example.com',
				password: 'password123',
				confirmPassword: 'different',
				name: 'John Doe'
			};

			const customValidations = {
				confirmPassword: validatePasswordConfirmation
			};

			const result = validateForm(values, rules, customValidations);
			expect(result.isValid).toBe(false);
			expect(result.errors.confirmPassword).toBe('Passwords do not match');
		});
	});

	describe('validatePasswordConfirmation', () => {
		it('should validate matching passwords', () => {
			const values = { password: 'password123' };

			expect(validatePasswordConfirmation('password123', values)).toBeNull();
		});

		it('should return error for non-matching passwords', () => {
			const values = { password: 'password123' };

			expect(validatePasswordConfirmation('different', values)).toBe('Passwords do not match');
		});

		it('should handle empty values', () => {
			const values = { password: '' };

			expect(validatePasswordConfirmation('', values)).toBeNull();
			expect(validatePasswordConfirmation('something', values)).toBeNull();
		});

		it('should handle missing password', () => {
			const values = {};

			expect(validatePasswordConfirmation('something', values)).toBeNull();
		});
	});

	describe('getPasswordStrength', () => {
		it('should return empty state for empty password', () => {
			const result = getPasswordStrength('');
			expect(result.score).toBe(0);
			expect(result.feedback).toBe('');
			expect(result.color).toBe('red');
		});

		it('should calculate weak password strength', () => {
			const result = getPasswordStrength('123');
			expect(result.score).toBeLessThanOrEqual(2);
			expect(result.color).toBe('red');
			expect(result.feedback).toContain('Weak');
		});

		it('should calculate fair password strength', () => {
			const result = getPasswordStrength('password123');
			expect(result.score).toBe(3);
			expect(result.color).toBe('yellow');
			expect(result.feedback).toContain('Fair');
		});

		it('should calculate strong password strength', () => {
			const result = getPasswordStrength('MyPassword123!');
			expect(result.score).toBeGreaterThan(3);
			expect(result.color).toBe('green');
			expect(result.feedback).toContain('Strong');
		});

		it('should provide specific feedback for missing requirements', () => {
			const result = getPasswordStrength('short');
			expect(result.feedback).toContain('At least 8 characters');
			expect(result.feedback).toContain('Include numbers');
		});

		it('should give bonus points for special characters and mixed case', () => {
			const withSpecial = getPasswordStrength('Password123!');
			const withoutSpecial = getPasswordStrength('Password123');

			expect(withSpecial.score).toBeGreaterThan(withoutSpecial.score);
		});
	});

	describe('exported validation rules', () => {
		it('should export individual validation rules', () => {
			expect(emailValidation).toBeDefined();
			expect(emailValidation.pattern).toBeInstanceOf(RegExp);
			expect(emailValidation.required).toBe(true);

			expect(passwordValidation).toBeDefined();
			expect(passwordValidation.minLength).toBe(8);
			expect(passwordValidation.pattern).toBeInstanceOf(RegExp);

			expect(nameValidation).toBeDefined();
			expect(nameValidation.minLength).toBe(2);
			expect(nameValidation.maxLength).toBe(50);
		});

		it('should have consistent authValidationRules', () => {
			expect(authValidationRules.email).toEqual(emailValidation);
			expect(authValidationRules.password).toEqual(passwordValidation);
			expect(authValidationRules.name).toEqual(nameValidation);
			expect(authValidationRules.confirmPassword).toBeDefined();
		});
	});
});
