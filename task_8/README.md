# JavaScript Type-Safe Validator Library

A powerful, flexible, and type-safe validation library for JavaScript applications using JSDoc for type annotations. This library provides comprehensive validation for primitive types, complex objects, arrays, and nested structures with detailed error reporting.

## Features

- **Type-Safe**: Full JSDoc type annotations for excellent IDE support and type checking
- **Primitive Types**: String, Number, Boolean, Date validation
- **Complex Types**: Object and Array validation with nested schema support
- **Fluent API**: Chainable methods for building complex validation rules
- **Detailed Error Messages**: Comprehensive error reporting with field-specific messages
- **Custom Messages**: Support for custom error messages
- **Optional Fields**: Built-in support for optional field validation
- **Pattern Matching**: Regular expression validation for strings
- **Range Validation**: Min/max validation for numbers and dates
- **Length Validation**: Min/max length validation for strings and arrays

## Installation

Simply include the `schema.js` file in your project:

```javascript
const { Schema } = require('./schema.js');
```

Or import specific validators:

```javascript
const { Schema, StringValidator, NumberValidator } = require('./schema.js');
```

## How to Run and Use This Library

### 1. Running the Test Suite

To verify the library and see comprehensive test coverage:

```bash
node tests.js
```

- This will execute all validation tests and print a summary to the console.
- A detailed test coverage report will be generated in `test_report.txt`.

### 2. Using the Validator Library in Your Project

#### a. Import the Library

If your project is in the same directory, simply require the schema:

```javascript
const { Schema } = require('./schema.js');
```

#### b. Validate Data

Create validators using the fluent API:

```javascript
const userSchema = Schema.object({
  name: Schema.string().minLength(2),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(0).optional(),
  isActive: Schema.boolean()
});

const result = userSchema.validate({
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
  isActive: true
});

if (result.valid) {
  // Use result.value (validated and type-safe)
  console.log('Valid user:', result.value);
} else {
  // Handle validation errors
  console.error('Validation errors:', result.errors);
}
```

#### c. Integrate with Your Application

- Use schemas to validate API requests, form submissions, or any data input.
- Reuse and compose schemas for complex/nested validation.
- Use `.optional()` for optional fields and `.withMessage()` for custom error messages.

#### d. Example: Run Validation from CLI

You can create a file (e.g., `validate-user.js`):

```javascript
const { Schema } = require('./schema.js');
const userSchema = Schema.object({
  name: Schema.string().minLength(2),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
});

const user = { name: 'Bob', email: 'bob@example.com' };
const result = userSchema.validate(user);
console.log(result);
```

Then run:

```bash
node validate-user.js
```

## Basic Usage

### Primitive Type Validation

```javascript
// String validation
const nameValidator = Schema.string()
  .minLength(2)
  .maxLength(50)
  .withMessage('Name must be between 2-50 characters');

const result = nameValidator.validate('John Doe');
console.log(result); // { valid: true, errors: [], value: 'John Doe' }

// Number validation
const ageValidator = Schema.number()
  .min(0)
  .max(120)
  .integer();

// Boolean validation
const activeValidator = Schema.boolean();

// Date validation
const dateValidator = Schema.date()
  .minDate(new Date('2020-01-01'))
  .maxDate(new Date('2030-12-31'));
```

### Pattern Validation

```javascript
const emailValidator = Schema.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Please enter a valid email address');

const phoneValidator = Schema.string()
  .pattern(/^\d{3}-\d{3}-\d{4}$/)
  .withMessage('Phone number must be in format: XXX-XXX-XXXX');
```

### Array Validation

```javascript
// Array of strings
const tagsValidator = Schema.array(Schema.string().minLength(1))
  .minItems(1)
  .maxItems(10);

// Array of numbers
const scoresValidator = Schema.array(Schema.number().min(0).max(100));

const result = tagsValidator.validate(['javascript', 'validation']);
console.log(result.valid); // true
```

### Object Validation

```javascript
const addressSchema = Schema.object({
  street: Schema.string().minLength(1),
  city: Schema.string().minLength(1),
  zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
  country: Schema.string().optional()
});

const userSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2).maxLength(100),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(13).max(120).optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  address: addressSchema.optional(),
  metadata: Schema.object({}).optional()
});
```

### Nested Object Validation

```javascript
const companySchema = Schema.object({
  name: Schema.string().minLength(1),
  employees: Schema.array(
    Schema.object({
      name: Schema.string(),
      role: Schema.string(),
      salary: Schema.number().min(0)
    })
  ),
  headquarters: addressSchema
});
```

## API Reference

### Schema

The main entry point for creating validators.

#### Static Methods

- `Schema.string()` - Creates a StringValidator
- `Schema.number()` - Creates a NumberValidator  
- `Schema.boolean()` - Creates a BooleanValidator
- `Schema.date()` - Creates a DateValidator
- `Schema.array(itemValidator)` - Creates an ArrayValidator
- `Schema.object(schema)` - Creates an ObjectValidator

### Base Validator Methods

All validators inherit these methods:

- `.optional()` - Marks the field as optional
- `.withMessage(message)` - Sets a custom error message
- `.validate(value, fieldName?)` - Validates a value

### StringValidator

- `.minLength(length)` - Sets minimum string length
- `.maxLength(length)` - Sets maximum string length  
- `.pattern(regex)` - Sets regex pattern validation

### NumberValidator

- `.min(value)` - Sets minimum value
- `.max(value)` - Sets maximum value
- `.integer()` - Requires integer values

### DateValidator

- `.minDate(date)` - Sets minimum date
- `.maxDate(date)` - Sets maximum date

### ArrayValidator

- `.minItems(count)` - Sets minimum array length
- `.maxItems(count)` - Sets maximum array length

### ValidationResult

All validation methods return a ValidationResult object:

```typescript
{
  valid: boolean,      // Whether validation passed
  errors: string[],    // Array of error messages
  value: any          // The validated value
}
```

## Error Handling

The library provides detailed error messages with field-specific context:

```javascript
const schema = Schema.object({
  user: Schema.object({
    name: Schema.string().minLength(2),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })
});

const result = schema.validate({
  user: {
    name: 'J',
    email: 'invalid-email'
  }
});

console.log(result.errors);
// [
//   'field.user.name must be at least 2 characters long',
//   'field.user.email format is invalid'
// ]
```

## Advanced Examples

### Form Validation

```javascript
const registrationSchema = Schema.object({
  username: Schema.string()
    .minLength(3)
    .maxLength(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 characters, letters, numbers, and underscores only'),
  
  password: Schema.string()
    .minLength(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  
  confirmPassword: Schema.string(),
  
  email: Schema.string()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage('Please enter a valid email address'),
  
  birthDate: Schema.date()
    .maxDate(new Date())
    .withMessage('Birth date cannot be in the future'),
  
  terms: Schema.boolean()
    .withMessage('You must accept the terms and conditions')
});
```

### API Request Validation

```javascript
const createPostSchema = Schema.object({
  title: Schema.string().minLength(1).maxLength(200),
  content: Schema.string().minLength(10),
  tags: Schema.array(Schema.string().minLength(1)).maxItems(10),
  publishAt: Schema.date().minDate(new Date()).optional(),
  category: Schema.string().pattern(/^(tech|lifestyle|business)$/)
});

function validateCreatePost(data) {
  const result = createPostSchema.validate(data);
  if (!result.valid) {
    throw new Error(`Validation failed: ${result.errors.join(', ')}`);
  }
  return result.value;
}
```

## Best Practices

1. **Use descriptive field names** in your validation calls for better error messages
2. **Provide custom messages** for user-facing validations
3. **Validate at boundaries** - API endpoints, form submissions, external data
4. **Reuse schemas** for consistent validation across your application
5. **Handle validation results** properly in your application logic

## Browser Compatibility

This library uses modern JavaScript features:
- ES6 Classes
- Template literals
- Arrow functions
- Object destructuring

Supports all modern browsers and Node.js environments.

## License

MIT License - feel free to use in your projects! 