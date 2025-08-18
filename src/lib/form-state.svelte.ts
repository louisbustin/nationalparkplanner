/**
 * Reactive form state management for Svelte 5
 */

import type { ValidationRules, FormState } from '$lib/validation';
import { validateForm } from '$lib/validation';

export interface FormStateOptions {
	initialValues?: Record<string, string>;
	validationRules?: ValidationRules;
	customValidations?: Record<
		string,
		(value: string, values: Record<string, string>) => string | null
	>;
}

/**
 * Creates a reactive form state manager
 */
export function createFormState(options: FormStateOptions = {}) {
	const { initialValues = {}, validationRules = {}, customValidations = {} } = options;

	// Reactive state
	let values = $state({ ...initialValues });
	let errors = $state<Record<string, string>>({});
	let touched = $state<Record<string, boolean>>({});
	let isSubmitting = $state(false);

	// Derived state
	const isValid = $derived(() => {
		const validation = validateForm(values, validationRules, customValidations);
		return validation.isValid;
	});

	const formState = $derived({
		values,
		errors,
		touched,
		isSubmitting,
		isValid: isValid()
	});

	// Methods
	function setValue(field: string, value: string) {
		values[field] = value;
		// Clear error when user starts typing
		if (errors[field]) {
			errors[field] = '';
		}
	}

	function setError(field: string, error: string) {
		errors[field] = error;
	}

	function setErrors(newErrors: Record<string, string>) {
		errors = { ...newErrors };
	}

	function clearErrors() {
		errors = {};
	}

	function setTouched(field: string, isTouched: boolean = true) {
		touched[field] = isTouched;
	}

	function setSubmitting(submitting: boolean) {
		isSubmitting = submitting;
	}

	function validate(): boolean {
		const validation = validateForm(values, validationRules, customValidations);
		errors = validation.errors;

		// Mark all fields as touched
		for (const field of Object.keys(validationRules)) {
			touched[field] = true;
		}

		return validation.isValid;
	}

	function reset() {
		values = { ...initialValues };
		errors = {};
		touched = {};
		isSubmitting = false;
	}

	function getFieldProps(field: string) {
		return {
			get value() {
				return values[field] || '';
			},
			set value(newValue: string) {
				setValue(field, newValue);
			},
			error: errors[field] || '',
			rule: validationRules[field]
		};
	}

	return {
		// State
		get state() {
			return formState;
		},
		get values() {
			return values;
		},
		get errors() {
			return errors;
		},
		get touched() {
			return touched;
		},
		get isSubmitting() {
			return isSubmitting;
		},
		get isValid() {
			return isValid();
		},

		// Methods
		setValue,
		setError,
		setErrors,
		clearErrors,
		setTouched,
		setSubmitting,
		validate,
		reset,
		getFieldProps
	};
}
