import { describe, it, expect } from 'vitest';
import { validateField, authValidationRules, getPasswordStrength } from '$lib/validation';

describe('FormField validation', () => {
	it('should validate email correctly', () => {
		const rule = authValidationRules.email;

		expect(validateField('test@example.com', rule)).toBeNull();
		expect(validateField('invalid-email', rule)).toBe(rule.message);
		expect(validateField('', rule)).toBe(rule.message);
	});

	it('should validate password correctly', () => {
		const rule = authValidationRules.password;

		expect(validateField('password123', rule)).toBeNull();
		expect(validateField('weak', rule)).toBe(rule.message);
		expect(validateField('', rule)).toBe(rule.message);
	});

	it('should validate name correctly', () => {
		const rule = authValidationRules.name;

		expect(validateField('John Doe', rule)).toBeNull();
		expect(validateField('A', rule)).toBe(rule.message);
		expect(validateField('', rule)).toBe(rule.message);
	});

	it('should calculate password strength correctly', () => {
		const weak = getPasswordStrength('123');
		expect(weak.color).toBe('red');
		expect(weak.score).toBeLessThan(3);

		const strong = getPasswordStrength('MyPassword123!');
		expect(strong.color).toBe('green');
		expect(strong.score).toBeGreaterThan(3);
	});
});
