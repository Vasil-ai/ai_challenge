/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the validation passed
 * @property {string[]} errors - Array of error messages if validation failed
 * @property {*} value - The validated value (may be transformed during validation)
 * 
 * @example
 * // Successful validation
 * { valid: true, errors: [], value: "hello" }
 * 
 * @example  
 * // Failed validation
 * { valid: false, errors: ["field must be a string"], value: 123 }
 */

/**
 * Base validator class providing common functionality for all validators.
 * This abstract class defines the core validation interface and shared methods.
 * 
 * Key features:
 * - Fluent API with method chaining
 * - Optional field support
 * - Custom error messages
 * - Consistent validation result format
 * 
 * @abstract
 * @example
 * // All validators extend this base class
 * const validator = Schema.string().minLength(3).optional().withMessage('Custom error');
 */
class Validator {
  /**
   * Creates a new validator instance with default settings.
   * All fields are required by default unless marked as optional.
   */
  constructor() {
    /** @private {boolean} Whether this field is required */
    this._required = true;
    /** @private {string|null} Custom error message to use instead of default */
    this._customMessage = null;
  }

  /**
   * Marks this field as optional, allowing undefined/null values to pass validation.
   * Optional fields that are undefined will return successful validation results.
   * 
   * @returns {Validator} Returns this validator for method chaining
   * 
   * @example
   * const optionalName = Schema.string().optional();
   * console.log(optionalName.validate(undefined)); // { valid: true, errors: [], value: undefined }
   * console.log(optionalName.validate("John"));    // { valid: true, errors: [], value: "John" }
   */
  optional() {
    this._required = false;
    return this;
  }

  /**
   * Sets a custom error message that will be used instead of the default error message
   * when validation fails. This is useful for providing user-friendly error messages.
   * 
   * @param {string} message - The custom error message to display on validation failure
   * @returns {Validator} Returns this validator for method chaining
   * 
   * @example
   * const validator = Schema.string()
   *   .minLength(3)
   *   .withMessage('Username must be at least 3 characters long');
   * 
   * console.log(validator.validate('ab')); 
   * // { valid: false, errors: ['Username must be at least 3 characters long'], value: 'ab' }
   */
  withMessage(message) {
    if (typeof message !== 'string') {
      throw new Error('Custom message must be a string');
    }
    this._customMessage = message;
    return this;
  }

  /**
   * Validates a value against this validator's rules.
   * This is an abstract method that must be implemented by subclasses.
   * 
   * @param {*} value - The value to validate
   * @param {string} [fieldName='field'] - The field name used in error messages for context
   * @returns {ValidationResult} Object containing validation result, errors, and processed value
   * 
   * @abstract
   * @throws {Error} Throws error if called directly on base Validator class
   */
  validate(value, fieldName = 'field') {
    throw new Error('validate method must be implemented by validator subclass');
  }

  /**
   * Checks if a value is considered empty (undefined or null).
   * This is used internally to determine if optional field validation should be bypassed.
   * 
   * @param {*} value - The value to check for emptiness
   * @returns {boolean} True if value is undefined or null, false otherwise
   * @protected
   * 
   * @example
   * this._isEmpty(undefined); // true
   * this._isEmpty(null);      // true  
   * this._isEmpty('');        // false (empty string is not considered empty)
   * this._isEmpty(0);         // false (zero is not considered empty)
   */
  _isEmpty(value) {
    return value === undefined || value === null;
  }

  /**
   * Creates a standardized error result object with the provided error message.
   * Uses custom message if set, otherwise uses the provided default message.
   * 
   * @param {string} message - The default error message
   * @param {*} value - The value that failed validation
   * @returns {ValidationResult} Standardized error result object
   * @protected
   * 
   * @example
   * return this._createError('Value must be a string', 123);
   * // Returns: { valid: false, errors: ['Value must be a string'], value: 123 }
   */
  _createError(message, value) {
    return {
      valid: false,
      errors: [this._customMessage || message],
      value
    };
  }

  /**
   * Creates a standardized success result object with the validated value.
   * The value may be transformed during validation (e.g., string dates converted to Date objects).
   * 
   * @param {*} value - The successfully validated value
   * @returns {ValidationResult} Standardized success result object
   * @protected
   * 
   * @example
   * return this._createSuccess('validated string');
   * // Returns: { valid: true, errors: [], value: 'validated string' }
   */
  _createSuccess(value) {
    return {
      valid: true,
      errors: [],
      value
    };
  }
}

/**
 * String validator providing comprehensive string validation capabilities.
 * 
 * Supports validation for:
 * - Type checking (ensures value is a string)
 * - Length constraints (minimum and maximum length)
 * - Pattern matching (regular expression validation)
 * - Custom error messages
 * - Optional field handling
 * 
 * @extends Validator
 * 
 * @example
 * // Basic string validation
 * const nameValidator = Schema.string().minLength(2).maxLength(50);
 * 
 * @example
 * // Email validation with pattern
 * const emailValidator = Schema.string()
 *   .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
 *   .withMessage('Please enter a valid email address');
 * 
 * @example
 * // Username validation with multiple constraints
 * const usernameValidator = Schema.string()
 *   .minLength(3)
 *   .maxLength(20)
 *   .pattern(/^[a-zA-Z0-9_]+$/)
 *   .withMessage('Username must be 3-20 characters, letters, numbers, and underscores only');
 */
class StringValidator extends Validator {
  /**
   * Creates a new StringValidator with default settings.
   * All string constraints are initially unset.
   */
  constructor() {
    super();
    /** @private {number|null} Minimum required string length */
    this._minLength = null;
    /** @private {number|null} Maximum allowed string length */
    this._maxLength = null;
    /** @private {RegExp|null} Regular expression pattern for validation */
    this._pattern = null;
  }

  /**
   * Sets the minimum required length for the string.
   * String must have at least this many characters to pass validation.
   * 
   * @param {number} length - Minimum number of characters required (must be >= 0)
   * @returns {StringValidator} Returns this validator for method chaining
   * @throws {Error} Throws if length is not a non-negative number
   * 
   * @example
   * const validator = Schema.string().minLength(3);
   * console.log(validator.validate('ab'));    // { valid: false, errors: [...], value: 'ab' }
   * console.log(validator.validate('abc'));   // { valid: true, errors: [], value: 'abc' }
   */
  minLength(length) {
    if (typeof length !== 'number' || length < 0 || !Number.isInteger(length)) {
      throw new Error('minLength must be a non-negative integer');
    }
    this._minLength = length;
    return this;
  }

  /**
   * Sets the maximum allowed length for the string.
   * String must have no more than this many characters to pass validation.
   * 
   * @param {number} length - Maximum number of characters allowed (must be >= 0)
   * @returns {StringValidator} Returns this validator for method chaining
   * @throws {Error} Throws if length is not a non-negative number
   * 
   * @example
   * const validator = Schema.string().maxLength(10);
   * console.log(validator.validate('short'));       // { valid: true, errors: [], value: 'short' }
   * console.log(validator.validate('way too long')); // { valid: false, errors: [...], value: 'way too long' }
   */
  maxLength(length) {
    if (typeof length !== 'number' || length < 0 || !Number.isInteger(length)) {
      throw new Error('maxLength must be a non-negative integer');
    }
    this._maxLength = length;
    return this;
  }

  /**
   * Sets a regular expression pattern that the string must match.
   * Useful for validating formats like emails, phone numbers, etc.
   * 
   * @param {RegExp} pattern - Regular expression pattern to match against
   * @returns {StringValidator} Returns this validator for method chaining
   * @throws {Error} Throws if pattern is not a RegExp object
   * 
   * @example
   * // Email pattern validation
   * const emailValidator = Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
   * 
   * @example
   * // Phone number pattern (XXX-XXX-XXXX)
   * const phoneValidator = Schema.string().pattern(/^\d{3}-\d{3}-\d{4}$/);
   * 
   * @example
   * // Alphanumeric only
   * const alphanumericValidator = Schema.string().pattern(/^[a-zA-Z0-9]+$/);
   */
  pattern(pattern) {
    if (!(pattern instanceof RegExp)) {
      throw new Error('pattern must be a RegExp object');
    }
    this._pattern = pattern;
    return this;
  }

  /**
   * Validates a value as a string according to the configured constraints.
   * 
   * Validation process:
   * 1. Check if value is empty (null/undefined) and handle based on required flag
   * 2. Verify value is a string type
   * 3. Check minimum length constraint
   * 4. Check maximum length constraint  
   * 5. Check regular expression pattern match
   * 
   * @param {*} value - The value to validate
   * @param {string} [fieldName='field'] - Field name used in error messages
   * @returns {ValidationResult} Validation result with success/failure status
   * 
   * @example
   * const validator = Schema.string().minLength(2).maxLength(10).pattern(/^[a-z]+$/);
   * 
   * // Valid cases
   * validator.validate('hello');     // { valid: true, errors: [], value: 'hello' }
   * 
   * // Invalid cases  
   * validator.validate(123);         // { valid: false, errors: ['field must be a string'], value: 123 }
   * validator.validate('a');         // { valid: false, errors: ['field must be at least 2 characters long'], value: 'a' }
   * validator.validate('toolongtext'); // { valid: false, errors: ['field must be at most 10 characters long'], value: 'toolongtext' }
   * validator.validate('HELLO');     // { valid: false, errors: ['field format is invalid'], value: 'HELLO' }
   */
  validate(value, fieldName = 'field') {
    // Handle empty values (null/undefined)
    if (this._isEmpty(value)) {
      return this._required 
        ? this._createError(`${fieldName} is required`, value)
        : this._createSuccess(value);
    }

    // Type validation - must be a string
    if (typeof value !== 'string') {
      return this._createError(`${fieldName} must be a string`, value);
    }

    // Minimum length validation
    if (this._minLength !== null && value.length < this._minLength) {
      return this._createError(
        `${fieldName} must be at least ${this._minLength} character${this._minLength === 1 ? '' : 's'} long`, 
        value
      );
    }

    // Maximum length validation
    if (this._maxLength !== null && value.length > this._maxLength) {
      return this._createError(
        `${fieldName} must be at most ${this._maxLength} character${this._maxLength === 1 ? '' : 's'} long`, 
        value
      );
    }

    // Pattern validation using regular expression
    if (this._pattern && !this._pattern.test(value)) {
      return this._createError(`${fieldName} format is invalid`, value);
    }

    // All validations passed
    return this._createSuccess(value);
  }
}

/**
 * Number validator providing comprehensive numeric validation capabilities.
 * 
 * Supports validation for:
 * - Type checking (ensures value is a number and not NaN)
 * - Range constraints (minimum and maximum values)
 * - Integer validation (whole numbers only)
 * - Custom error messages
 * - Optional field handling
 * 
 * @extends Validator
 * 
 * @example
 * // Basic number validation with range
 * const ageValidator = Schema.number().min(0).max(120);
 * 
 * @example
 * // Integer-only validation
 * const scoreValidator = Schema.number().integer().min(0).max(100);
 * 
 * @example
 * // Price validation with custom message
 * const priceValidator = Schema.number()
 *   .min(0)
 *   .withMessage('Price must be a positive number');
 */
class NumberValidator extends Validator {
  /**
   * Creates a new NumberValidator with default settings.
   * All numeric constraints are initially unset.
   */
  constructor() {
    super();
    /** @private {number|null} Minimum allowed value (inclusive) */
    this._min = null;
    /** @private {number|null} Maximum allowed value (inclusive) */
    this._max = null;
    /** @private {boolean} Whether to require integer values only */
    this._integer = false;
  }

  /**
   * Sets the minimum allowed value for the number (inclusive).
   * Number must be greater than or equal to this value to pass validation.
   * 
   * @param {number} min - Minimum allowed value (inclusive)
   * @returns {NumberValidator} Returns this validator for method chaining
   * @throws {Error} Throws if min is not a valid number
   * 
   * @example
   * const validator = Schema.number().min(0);
   * console.log(validator.validate(-1));  // { valid: false, errors: [...], value: -1 }
   * console.log(validator.validate(0));   // { valid: true, errors: [], value: 0 }
   * console.log(validator.validate(5));   // { valid: true, errors: [], value: 5 }
   */
  min(min) {
    if (typeof min !== 'number' || isNaN(min)) {
      throw new Error('min must be a valid number');
    }
    this._min = min;
    return this;
  }

  /**
   * Sets the maximum allowed value for the number (inclusive).
   * Number must be less than or equal to this value to pass validation.
   * 
   * @param {number} max - Maximum allowed value (inclusive)
   * @returns {NumberValidator} Returns this validator for method chaining
   * @throws {Error} Throws if max is not a valid number
   * 
   * @example
   * const validator = Schema.number().max(100);
   * console.log(validator.validate(100)); // { valid: true, errors: [], value: 100 }
   * console.log(validator.validate(101)); // { valid: false, errors: [...], value: 101 }
   */
  max(max) {
    if (typeof max !== 'number' || isNaN(max)) {
      throw new Error('max must be a valid number');
    }
    this._max = max;
    return this;
  }

  /**
   * Requires the number to be an integer (whole number).
   * Decimal values will fail validation when this constraint is set.
   * 
   * @returns {NumberValidator} Returns this validator for method chaining
   * 
   * @example
   * const validator = Schema.number().integer();
   * console.log(validator.validate(5));    // { valid: true, errors: [], value: 5 }
   * console.log(validator.validate(5.5));  // { valid: false, errors: [...], value: 5.5 }
   * console.log(validator.validate(-3));   // { valid: true, errors: [], value: -3 }
   */
  integer() {
    this._integer = true;
    return this;
  }

  /**
   * Validates a value as a number according to the configured constraints.
   * 
   * Validation process:
   * 1. Check if value is empty (null/undefined) and handle based on required flag
   * 2. Verify value is a number type and not NaN
   * 3. Check integer constraint if enabled
   * 4. Check minimum value constraint
   * 5. Check maximum value constraint
   * 
   * @param {*} value - The value to validate
   * @param {string} [fieldName='field'] - Field name used in error messages
   * @returns {ValidationResult} Validation result with success/failure status
   * 
   * @example
   * const validator = Schema.number().min(0).max(100).integer();
   * 
   * // Valid cases
   * validator.validate(50);      // { valid: true, errors: [], value: 50 }
   * validator.validate(0);       // { valid: true, errors: [], value: 0 }
   * validator.validate(100);     // { valid: true, errors: [], value: 100 }
   * 
   * // Invalid cases
   * validator.validate('50');    // { valid: false, errors: ['field must be a number'], value: '50' }
   * validator.validate(NaN);     // { valid: false, errors: ['field must be a number'], value: NaN }
   * validator.validate(50.5);    // { valid: false, errors: ['field must be an integer'], value: 50.5 }
   * validator.validate(-1);      // { valid: false, errors: ['field must be at least 0'], value: -1 }
   * validator.validate(101);     // { valid: false, errors: ['field must be at most 100'], value: 101 }
   */
  validate(value, fieldName = 'field') {
    // Handle empty values (null/undefined)
    if (this._isEmpty(value)) {
      return this._required 
        ? this._createError(`${fieldName} is required`, value)
        : this._createSuccess(value);
    }

    // Type validation - must be a number and not NaN
    if (typeof value !== 'number' || isNaN(value)) {
      return this._createError(`${fieldName} must be a number`, value);
    }

    // Integer validation - must be a whole number if required
    if (this._integer && !Number.isInteger(value)) {
      return this._createError(`${fieldName} must be an integer`, value);
    }

    // Minimum value validation
    if (this._min !== null && value < this._min) {
      return this._createError(`${fieldName} must be at least ${this._min}`, value);
    }

    // Maximum value validation
    if (this._max !== null && value > this._max) {
      return this._createError(`${fieldName} must be at most ${this._max}`, value);
    }

    // All validations passed
    return this._createSuccess(value);
  }
}

/**
 * Boolean validator providing boolean type validation.
 * 
 * Supports validation for:
 * - Type checking (ensures value is a boolean)
 * - Custom error messages
 * - Optional field handling
 * 
 * @extends Validator
 * 
 * @example 
 * // Basic boolean validation
 * const activeValidator = Schema.boolean();
 * 
 * @example
 * // Optional boolean with custom message
 * const consentValidator = Schema.boolean()
 *   .optional()
 *   .withMessage('Please indicate your consent');
 * 
 * @example
 * // Required boolean for terms acceptance
 * const termsValidator = Schema.boolean()
 *   .withMessage('You must accept the terms and conditions');
 */
class BooleanValidator extends Validator {
  /**
   * Creates a new BooleanValidator.
   * No additional configuration options are available for boolean validation.
   */
  constructor() {
    super();
  }

  /**
   * Validates a value as a boolean according to the configured constraints.
   * 
   * Validation process:
   * 1. Check if value is empty (null/undefined) and handle based on required flag
   * 2. Verify value is a boolean type (true or false)
   * 
   * @param {*} value - The value to validate
   * @param {string} [fieldName='field'] - Field name used in error messages
   * @returns {ValidationResult} Validation result with success/failure status
   * 
   * @example
   * const validator = Schema.boolean();
   * 
   * // Valid cases
   * validator.validate(true);    // { valid: true, errors: [], value: true }
   * validator.validate(false);   // { valid: true, errors: [], value: false }
   * 
   * // Invalid cases
   * validator.validate('true');  // { valid: false, errors: ['field must be a boolean'], value: 'true' }
   * validator.validate(1);       // { valid: false, errors: ['field must be a boolean'], value: 1 }
   * validator.validate(0);       // { valid: false, errors: ['field must be a boolean'], value: 0 }
   * validator.validate('yes');   // { valid: false, errors: ['field must be a boolean'], value: 'yes' }
   */
  validate(value, fieldName = 'field') {
    // Handle empty values (null/undefined)
    if (this._isEmpty(value)) {
      return this._required 
        ? this._createError(`${fieldName} is required`, value)
        : this._createSuccess(value);
    }

    // Type validation - must be a boolean (true or false)
    if (typeof value !== 'boolean') {
      return this._createError(`${fieldName} must be a boolean`, value);
    }

    // All validations passed
    return this._createSuccess(value);
  }
}

/**
 * Date validator providing comprehensive date validation capabilities.
 * 
 * Supports validation for:
 * - Type checking (ensures value is a Date object or valid date string)
 * - Date range constraints (minimum and maximum dates)
 * - Date parsing from strings
 * - Custom error messages
 * - Optional field handling
 * 
 * @extends Validator
 * 
 * @example
 * // Basic date validation
 * const birthdateValidator = Schema.date().maxDate(new Date());
 * 
 * @example
 * // Date range validation  
 * const eventDateValidator = Schema.date()
 *   .minDate(new Date('2023-01-01'))
 *   .maxDate(new Date('2023-12-31'));
 * 
 * @example
 * // Future date validation with custom message
 * const appointmentValidator = Schema.date()
 *   .minDate(new Date())
 *   .withMessage('Appointment must be scheduled for a future date');
 */
class DateValidator extends Validator {
  /**
   * Creates a new DateValidator with default settings.
   * All date constraints are initially unset.
   */
  constructor() {
    super();
    /** @private {Date|null} Minimum allowed date (inclusive) */
    this._minDate = null;
    /** @private {Date|null} Maximum allowed date (inclusive) */
    this._maxDate = null;
  }

  /**
   * Sets the minimum allowed date (inclusive).
   * Date must be greater than or equal to this date to pass validation.
   * 
   * @param {Date} date - Minimum allowed date (inclusive)
   * @returns {DateValidator} Returns this validator for method chaining
   * @throws {Error} Throws if date is not a valid Date object
   * 
   * @example
   * const validator = Schema.date().minDate(new Date('2023-01-01'));
   * console.log(validator.validate(new Date('2022-12-31'))); // { valid: false, errors: [...], value: ... }
   * console.log(validator.validate(new Date('2023-01-01'))); // { valid: true, errors: [], value: ... }
   * console.log(validator.validate(new Date('2023-06-15'))); // { valid: true, errors: [], value: ... }
   */
  minDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('minDate must be a valid Date object');
    }
    this._minDate = date;
    return this;
  }

  /**
   * Sets the maximum allowed date (inclusive).
   * Date must be less than or equal to this date to pass validation.
   * 
   * @param {Date} date - Maximum allowed date (inclusive)
   * @returns {DateValidator} Returns this validator for method chaining
   * @throws {Error} Throws if date is not a valid Date object
   * 
   * @example
   * const validator = Schema.date().maxDate(new Date('2023-12-31'));
   * console.log(validator.validate(new Date('2023-12-31'))); // { valid: true, errors: [], value: ... }
   * console.log(validator.validate(new Date('2024-01-01'))); // { valid: false, errors: [...], value: ... }
   */
  maxDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('maxDate must be a valid Date object');
    }
    this._maxDate = date;
    return this;
  }

  /**
   * Validates a value as a date according to the configured constraints.
   * 
   * Accepts Date objects and valid date strings that can be parsed by Date constructor.
   * Returns a Date object in the validation result if successful.
   * 
   * Validation process:
   * 1. Check if value is empty (null/undefined) and handle based on required flag
   * 2. Convert value to Date object if it's a string
   * 3. Verify the resulting date is valid (not NaN)
   * 4. Check minimum date constraint
   * 5. Check maximum date constraint
   * 
   * @param {*} value - The value to validate (Date object or date string)
   * @param {string} [fieldName='field'] - Field name used in error messages
   * @returns {ValidationResult} Validation result with Date object as value if successful
   * 
   * @example
   * const validator = Schema.date().minDate(new Date('2023-01-01')).maxDate(new Date('2023-12-31'));
   * 
   * // Valid cases
   * validator.validate(new Date('2023-06-15'));     // { valid: true, errors: [], value: Date object }
   * validator.validate('2023-06-15');               // { valid: true, errors: [], value: Date object }
   * validator.validate('2023-06-15T10:30:00Z');     // { valid: true, errors: [], value: Date object }
   * 
   * // Invalid cases
   * validator.validate('invalid-date');             // { valid: false, errors: ['field must be a valid date'], value: 'invalid-date' }
   * validator.validate(123);                        // { valid: false, errors: ['field must be a date'], value: 123 }
   * validator.validate(new Date('2022-12-31'));     // { valid: false, errors: ['field must be after ...'], value: Date object }
   * validator.validate(new Date('2024-01-01'));     // { valid: false, errors: ['field must be before ...'], value: Date object }
   */
  validate(value, fieldName = 'field') {
    // Handle empty values (null/undefined)
    if (this._isEmpty(value)) {
      return this._required 
        ? this._createError(`${fieldName} is required`, value)
        : this._createSuccess(value);
    }

    // Convert value to Date object
    let date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else {
      return this._createError(`${fieldName} must be a date`, value);
    }

    // Verify the date is valid (not NaN)
    if (isNaN(date.getTime())) {
      return this._createError(`${fieldName} must be a valid date`, value);
    }

    // Minimum date validation
    if (this._minDate && date < this._minDate) {
      const minDateStr = this._minDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      return this._createError(`${fieldName} must be after ${minDateStr}`, value);
    }

    // Maximum date validation
    if (this._maxDate && date > this._maxDate) {
      const maxDateStr = this._maxDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      return this._createError(`${fieldName} must be before ${maxDateStr}`, value);
    }

    // All validations passed - return the Date object
    return this._createSuccess(date);
  }
}

/**
 * Array validator providing comprehensive array validation capabilities.
 * 
 * Supports validation for:
 * - Type checking (ensures value is an array)
 * - Length constraints (minimum and maximum number of items)
 * - Item-level validation (validates each array element against a validator)
 * - Custom error messages
 * - Optional field handling
 * 
 * @template T The type of items in the array
 * @extends Validator
 * 
 * @example
 * // Array of strings with length constraints
 * const tagsValidator = Schema.array(Schema.string().minLength(1))
 *   .minItems(1)
 *   .maxItems(5);
 * 
 * @example
 * // Array of numbers within a range
 * const scoresValidator = Schema.array(Schema.number().min(0).max(100))
 *   .minItems(3);
 * 
 * @example
 * // Optional array of email addresses
 * const emailListValidator = Schema.array(
 *   Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
 * ).optional().withMessage('Must be a list of valid email addresses');
 */
class ArrayValidator extends Validator {
  /**
   * Creates a new ArrayValidator with the specified item validator.
   * 
   * @param {Validator} itemValidator - Validator used to validate each array item
   * @throws {Error} Throws if itemValidator is not a Validator instance
   */
  constructor(itemValidator) {
    super();
    
    if (!(itemValidator instanceof Validator)) {
      throw new Error('itemValidator must be a Validator instance');
    }
    
    /** @private {Validator} Validator used for each array item */
    this.itemValidator = itemValidator;
    /** @private {number|null} Minimum number of items required */
    this._minItems = null;
    /** @private {number|null} Maximum number of items allowed */
    this._maxItems = null;
  }

  /**
   * Sets the minimum number of items required in the array.
   * Array must contain at least this many items to pass validation.
   * 
   * @param {number} count - Minimum number of items required (must be >= 0)
   * @returns {ArrayValidator} Returns this validator for method chaining
   * @throws {Error} Throws if count is not a non-negative integer
   * 
   * @example
   * const validator = Schema.array(Schema.string()).minItems(2);
   * console.log(validator.validate(['a']));        // { valid: false, errors: [...], value: ['a'] }
   * console.log(validator.validate(['a', 'b']));   // { valid: true, errors: [], value: ['a', 'b'] }
   */
  minItems(count) {
    if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
      throw new Error('minItems must be a non-negative integer');
    }
    this._minItems = count;
    return this;
  }

  /**
   * Sets the maximum number of items allowed in the array.
   * Array must contain no more than this many items to pass validation.
   * 
   * @param {number} count - Maximum number of items allowed (must be >= 0)
   * @returns {ArrayValidator} Returns this validator for method chaining
   * @throws {Error} Throws if count is not a non-negative integer
   * 
   * @example
   * const validator = Schema.array(Schema.string()).maxItems(3);
   * console.log(validator.validate(['a', 'b', 'c']));      // { valid: true, errors: [], value: ['a', 'b', 'c'] }
   * console.log(validator.validate(['a', 'b', 'c', 'd'])); // { valid: false, errors: [...], value: ['a', 'b', 'c', 'd'] }
   */
  maxItems(count) {
    if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
      throw new Error('maxItems must be a non-negative integer');
    }
    this._maxItems = count;
    return this;
  }

  /**
   * Validates a value as an array according to the configured constraints.
   * 
   * Each array item is validated using the itemValidator provided in the constructor.
   * If any item fails validation, the entire array validation fails.
   * 
   * Validation process:
   * 1. Check if value is empty (null/undefined) and handle based on required flag
   * 2. Verify value is an array type
   * 3. Check minimum items constraint
   * 4. Check maximum items constraint
   * 5. Validate each array item using the item validator
   * 
   * @param {*} value - The value to validate
   * @param {string} [fieldName='field'] - Field name used in error messages
   * @returns {ValidationResult} Validation result with array of validated items if successful
   * 
   * @example
   * const validator = Schema.array(Schema.string().minLength(1)).minItems(1).maxItems(3);
   * 
   * // Valid cases
   * validator.validate(['hello']);              // { valid: true, errors: [], value: ['hello'] }
   * validator.validate(['a', 'b', 'c']);        // { valid: true, errors: [], value: ['a', 'b', 'c'] }
   * 
   * // Invalid cases
   * validator.validate('not-array');            // { valid: false, errors: ['field must be an array'], value: 'not-array' }
   * validator.validate([]);                     // { valid: false, errors: ['field must have at least 1 item'], value: [] }
   * validator.validate(['a', 'b', 'c', 'd']);   // { valid: false, errors: ['field must have at most 3 items'], value: [...] }
   * validator.validate(['valid', '']);          // { valid: false, errors: ['field[1] must be at least 1 character long'], value: [...] }
   */
  validate(value, fieldName = 'field') {
    // Handle empty values (null/undefined)
    if (this._isEmpty(value)) {
      return this._required 
        ? this._createError(`${fieldName} is required`, value)
        : this._createSuccess(value);
    }

    // Type validation - must be an array
    if (!Array.isArray(value)) {
      return this._createError(`${fieldName} must be an array`, value);
    }

    // Minimum items validation
    if (this._minItems !== null && value.length < this._minItems) {
      const itemText = this._minItems === 1 ? 'item' : 'items';
      return this._createError(`${fieldName} must have at least ${this._minItems} ${itemText}`, value);
    }

    // Maximum items validation
    if (this._maxItems !== null && value.length > this._maxItems) {
      const itemText = this._maxItems === 1 ? 'item' : 'items';
      return this._createError(`${fieldName} must have at most ${this._maxItems} ${itemText}`, value);
    }

    // Validate each array item
    const errors = [];
    const validatedItems = [];

    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i], `${fieldName}[${i}]`);
      if (!itemResult.valid) {
        errors.push(...itemResult.errors);
      }
      validatedItems.push(itemResult.value);
    }

    // Return error if any items failed validation
    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        value
      };
    }

    // All validations passed - return array of validated items
    return this._createSuccess(validatedItems);
  }
}

/**
 * Object validator providing comprehensive object validation capabilities.
 * 
 * Supports validation for:
 * - Type checking (ensures value is an object and not an array)
 * - Schema-based field validation (validates each property against its validator)
 * - Nested object validation (supports deeply nested structures)
 * - Optional field handling (fields can be marked as optional)
 * - Custom error messages
 * - Field-specific error reporting
 * 
 * @template T The type of object being validated
 * @extends Validator
 * 
 * @example
 * // Basic object validation
 * const userValidator = Schema.object({
 *   name: Schema.string().minLength(1),
 *   age: Schema.number().min(0).optional(),
 *   email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
 * });
 * 
 * @example
 * // Nested object validation
 * const profileValidator = Schema.object({
 *   user: Schema.object({
 *     name: Schema.string(),
 *     email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
 *   }),
 *   preferences: Schema.object({
 *     theme: Schema.string().pattern(/^(light|dark)$/).optional(),
 *     notifications: Schema.boolean()
 *   }).optional()
 * });
 * 
 * @example
 * // Object with array fields
 * const postValidator = Schema.object({
 *   title: Schema.string().minLength(1).maxLength(100),
 *   content: Schema.string().minLength(10),
 *   tags: Schema.array(Schema.string().minLength(1)).maxItems(10),
 *   publishedAt: Schema.date().optional()
 * });
 */
class ObjectValidator extends Validator {
  /**
   * Creates a new ObjectValidator with the specified schema.
   * 
   * @param {Record<string, Validator>} schema - Object defining the validation rules for each property
   * @throws {Error} Throws if schema is not a valid object or contains non-Validator values
   * 
   * @example
   * const validator = new ObjectValidator({
   *   name: Schema.string(),
   *   age: Schema.number().optional()
   * });
   */
  constructor(schema) {
    super();
    
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
      throw new Error('schema must be a non-null object');
    }
    
    // Validate that all schema values are Validator instances
    for (const [key, validator] of Object.entries(schema)) {
      if (!(validator instanceof Validator)) {
        throw new Error(`schema.${key} must be a Validator instance`);
      }
    }
    
    /** @private {Record<string, Validator>} Schema defining validation rules for each property */
    this.schema = schema;
  }

  /**
   * Validates a value as an object according to the configured schema.
   * 
   * Each property in the schema is validated against its corresponding validator.
   * If any property fails validation, the entire object validation fails.
   * Optional properties that are undefined will be excluded from the result.
   * 
   * Validation process:
   * 1. Check if value is empty (null/undefined) and handle based on required flag
   * 2. Verify value is an object type (and not an array)
   * 3. Validate each schema property using its validator
   * 4. Collect all validation errors and return combined result
   * 
   * @param {*} value - The value to validate
   * @param {string} [fieldName='field'] - Field name used in error messages
   * @returns {ValidationResult} Validation result with validated object if successful
   * 
   * @example
   * const validator = Schema.object({
   *   name: Schema.string().minLength(1),
   *   age: Schema.number().min(0).optional(),
   *   email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
   * });
   * 
   * // Valid cases
   * validator.validate({
   *   name: 'John Doe',
   *   age: 30,
   *   email: 'john@example.com'
   * }); // { valid: true, errors: [], value: { name: 'John Doe', age: 30, email: 'john@example.com' } }
   * 
   * validator.validate({
   *   name: 'Jane',
   *   email: 'jane@example.com'
   *   // age is optional and omitted
   * }); // { valid: true, errors: [], value: { name: 'Jane', email: 'jane@example.com' } }
   * 
   * // Invalid cases
   * validator.validate('not-an-object');     // { valid: false, errors: ['field must be an object'], value: 'not-an-object' }
   * validator.validate(['array']);           // { valid: false, errors: ['field must be an object'], value: ['array'] }
   * validator.validate({
   *   name: '',                              // fails minLength(1)
   *   age: -5,                               // fails min(0)
   *   email: 'invalid-email'                 // fails pattern validation
   * }); // { valid: false, errors: ['field.name must be at least 1 character long', 'field.age must be at least 0', 'field.email format is invalid'], value: {...} }
   */
  validate(value, fieldName = 'field') {
    // Handle empty values (null/undefined)
    if (this._isEmpty(value)) {
      return this._required 
        ? this._createError(`${fieldName} is required`, value)
        : this._createSuccess(value);
    }

    // Type validation - must be an object (but not an array)
    if (typeof value !== 'object' || Array.isArray(value)) {
      return this._createError(`${fieldName} must be an object`, value);
    }

    const errors = [];
    const validatedObject = {};

    // Validate each property in the schema
    for (const [key, validator] of Object.entries(this.schema)) {
      const fieldResult = validator.validate(value[key], `${fieldName}.${key}`);
      
      // Collect any validation errors
      if (!fieldResult.valid) {
        errors.push(...fieldResult.errors);
      }
      
      // Include validated value in result (exclude undefined optional fields)
      if (fieldResult.value !== undefined) {
        validatedObject[key] = fieldResult.value;
      }
    }

    // Return error if any properties failed validation
    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        value
      };
    }

    // All validations passed - return validated object
    return this._createSuccess(validatedObject);
  }
}

/**
 * Schema builder class providing factory methods for creating validators.
 * 
 * This is the main entry point for the validation library. It provides static methods
 * to create all types of validators with a fluent, chainable API.
 * 
 * Key features:
 * - Factory methods for all validator types
 * - Type-safe validator creation  
 * - Fluent API design
 * - Comprehensive validation support
 * 
 * @example
 * // Basic usage
 * const nameValidator = Schema.string().minLength(2).maxLength(50);
 * const ageValidator = Schema.number().min(0).max(120).integer();
 * const emailValidator = Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
 * 
 * @example
 * // Complex schema
 * const userSchema = Schema.object({
 *   name: Schema.string().minLength(1),
 *   email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
 *   age: Schema.number().min(13).optional(),
 *   tags: Schema.array(Schema.string()).maxItems(5).optional(),
 *   isActive: Schema.boolean()
 * });
 * 
 * @example
 * // Validation usage
 * const result = userSchema.validate(userData);
 * if (result.valid) {
 *   console.log('User data is valid:', result.value);
 * } else {
 *   console.log('Validation errors:', result.errors);
 * }
 */
class Schema {
  /**
   * Creates a string validator for validating string values.
   * 
   * String validators support:
   * - Length constraints (minLength, maxLength)
   * - Pattern matching (regular expressions)
   * - Custom error messages
   * - Optional field handling
   * 
   * @returns {StringValidator} A new StringValidator instance
   * 
   * @example
   * // Basic string validation
   * const nameValidator = Schema.string().minLength(2).maxLength(100);
   * 
   * @example
   * // Email validation with pattern
   * const emailValidator = Schema.string()
   *   .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
   *   .withMessage('Please enter a valid email address');
   * 
   * @example
   * // Optional string field
   * const middleNameValidator = Schema.string().optional();
   */
  static string() {
    return new StringValidator();
  }
  
  /**
   * Creates a number validator for validating numeric values.
   * 
   * Number validators support:
   * - Range constraints (min, max)
   * - Integer validation
   * - Custom error messages
   * - Optional field handling
   * 
   * @returns {NumberValidator} A new NumberValidator instance
   * 
   * @example
   * // Age validation
   * const ageValidator = Schema.number().min(0).max(120).integer();
   * 
   * @example
   * // Price validation
   * const priceValidator = Schema.number()
   *   .min(0)
   *   .withMessage('Price must be a positive number');
   * 
   * @example
   * // Optional score field
   * const scoreValidator = Schema.number().min(0).max(100).optional();
   */
  static number() {
    return new NumberValidator();
  }
  
  /**
   * Creates a boolean validator for validating boolean values.
   * 
   * Boolean validators support:
   * - Type checking (true/false only)
   * - Custom error messages
   * - Optional field handling
   * 
   * @returns {BooleanValidator} A new BooleanValidator instance
   * 
   * @example
   * // Terms acceptance validation
   * const termsValidator = Schema.boolean()
   *   .withMessage('You must accept the terms and conditions');
   * 
   * @example
   * // Optional preference field
   * const newsletterValidator = Schema.boolean().optional();
   * 
   * @example
   * // Simple boolean validation
   * const isActiveValidator = Schema.boolean();
   */
  static boolean() {
    return new BooleanValidator();
  }
  
  /**
   * Creates a date validator for validating Date objects and date strings.
   * 
   * Date validators support:
   * - Date range constraints (minDate, maxDate)
   * - String to Date conversion
   * - Custom error messages
   * - Optional field handling
   * 
   * @returns {DateValidator} A new DateValidator instance
   * 
   * @example
   * // Birth date validation (past dates only)
   * const birthDateValidator = Schema.date().maxDate(new Date());
   * 
   * @example
   * // Event date validation (future dates only)
   * const eventDateValidator = Schema.date()
   *   .minDate(new Date())
   *   .withMessage('Event must be scheduled for a future date');
   * 
   * @example
   * // Optional date field
   * const lastLoginValidator = Schema.date().optional();
   */
  static date() {
    return new DateValidator();
  }
  
  /**
   * Creates an object validator for validating object structures.
   * 
   * Object validators support:
   * - Schema-based validation (each property validated separately)
   * - Nested object validation
   * - Optional field handling
   * - Custom error messages
   * 
   * @template T The type of object being validated
   * @param {Record<string, Validator>} schema - Object defining validation rules for each property
   * @returns {ObjectValidator<T>} A new ObjectValidator instance
   * @throws {Error} Throws if schema is invalid or contains non-Validator values
   * 
   * @example
   * // User object validation
   * const userValidator = Schema.object({
   *   name: Schema.string().minLength(1),
   *   email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
   *   age: Schema.number().min(13).optional()
   * });
   * 
   * @example
   * // Nested object validation
   * const profileValidator = Schema.object({
   *   user: Schema.object({
   *     name: Schema.string(),
   *     email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
   *   }),
   *   settings: Schema.object({
   *     theme: Schema.string().pattern(/^(light|dark)$/).optional(),
   *     notifications: Schema.boolean()
   *   }).optional()
   * });
   * 
   * @example
   * // Optional object field
   * const addressValidator = Schema.object({
   *   street: Schema.string(),
   *   city: Schema.string(),
   *   zipCode: Schema.string().pattern(/^\d{5}$/)
   * }).optional();
   */
  static object(schema) {
    return new ObjectValidator(schema);
  }
  
  /**
   * Creates an array validator for validating array structures.
   * 
   * Array validators support:
   * - Item-level validation (each element validated separately)
   * - Length constraints (minItems, maxItems)
   * - Custom error messages
   * - Optional field handling
   * 
   * @template T The type of items in the array
   * @param {Validator<T>} itemValidator - Validator used to validate each array item
   * @returns {ArrayValidator<T>} A new ArrayValidator instance
   * @throws {Error} Throws if itemValidator is not a Validator instance
   * 
   * @example
   * // Array of strings
   * const tagsValidator = Schema.array(Schema.string().minLength(1))
   *   .minItems(1)
   *   .maxItems(5);
   * 
   * @example
   * // Array of objects
   * const usersValidator = Schema.array(
   *   Schema.object({
   *     name: Schema.string(),
   *     email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
   *   })
   * ).minItems(1);
   * 
   * @example
   * // Optional array field
   * const scoresValidator = Schema.array(Schema.number().min(0).max(100))
   *   .optional();
   */
  static array(itemValidator) {
    return new ArrayValidator(itemValidator);
  }
}

// Define a complex schema
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
  country: Schema.string()
});

const userSchema = Schema.object({
  id: Schema.string().withMessage('ID must be a string'),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  address: addressSchema.optional(),
  metadata: Schema.object({}).optional()
});

// Validate data
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  tags: ["developer", "designer"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "12345",
    country: "USA"
  }
};

const result = userSchema.validate(userData);

// Example usage and testing
console.log('Validation result:', result);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Schema,
    Validator,
    StringValidator,
    NumberValidator,
    BooleanValidator,
    DateValidator,
    ArrayValidator,
    ObjectValidator
  };
}
