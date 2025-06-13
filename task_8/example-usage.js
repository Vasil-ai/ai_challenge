const { Schema } = require('./schema.js');

// ==============================================================================
// ENHANCED JAVASCRIPT TYPE-SAFE VALIDATOR LIBRARY DEMONSTRATION
// ==============================================================================

console.log('=== Enhanced JavaScript Type-Safe Validator Library ===\n');

// ==============================================================================
// 1. PRIMITIVE VALIDATORS WITH ENHANCED FEATURES
// ==============================================================================

console.log('1. PRIMITIVE VALIDATORS DEMONSTRATION');
console.log('=====================================\n');

// String validator with comprehensive constraints
const usernameValidator = Schema.string()
  .minLength(3)
  .maxLength(20)
  .pattern(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username must be 3-20 characters, alphanumeric and underscores only');

console.log('Username Validation Examples:');
console.log('✓ Valid username:', usernameValidator.validate('john_doe123'));
console.log('✗ Too short:', usernameValidator.validate('jo'));
console.log('✗ Invalid chars:', usernameValidator.validate('john-doe'));

// Number validator with integer constraint
const ageValidator = Schema.number()
  .min(13)
  .max(120)
  .integer()
  .withMessage('Age must be between 13 and 120 years');

console.log('\nAge Validation Examples:');
console.log('✓ Valid age:', ageValidator.validate(25));
console.log('✗ Too young:', ageValidator.validate(12));
console.log('✗ Not integer:', ageValidator.validate(25.5));

// Date validator with range constraints
const eventDateValidator = Schema.date()
  .minDate(new Date())
  .withMessage('Event must be scheduled for a future date');

console.log('\nEvent Date Validation Examples:');
console.log('✓ Future date:', eventDateValidator.validate(new Date('2024-12-31')));
console.log('✗ Past date:', eventDateValidator.validate(new Date('2020-01-01')));

// ==============================================================================
// 2. COMPLEX OBJECT VALIDATION WITH NESTED STRUCTURES
// ==============================================================================

console.log('\n\n2. COMPLEX OBJECT VALIDATION');
console.log('=============================\n');

// Address schema for nested validation
const addressSchema = Schema.object({
  street: Schema.string().minLength(1).withMessage('Street address is required'),
  city: Schema.string().minLength(1).withMessage('City is required'),
  zipCode: Schema.string()
    .pattern(/^\d{5}(-\d{4})?$/)
    .withMessage('ZIP code must be in format 12345 or 12345-6789'),
  country: Schema.string().optional()
});

// Comprehensive user schema with nested objects and arrays
const userSchema = Schema.object({
  // Basic user information
  id: Schema.string().withMessage('User ID is required'),
  username: usernameValidator, // Reusing the validator defined above
  email: Schema.string()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage('Please provide a valid email address'),
  
  // Personal information
  profile: Schema.object({
    firstName: Schema.string().minLength(1).withMessage('First name is required'),
    lastName: Schema.string().minLength(1).withMessage('Last name is required'),
    age: ageValidator, // Reusing the age validator
    bio: Schema.string().maxLength(500).optional()
  }),
  
  // Contact information
  address: addressSchema.optional(),
  phoneNumbers: Schema.array(
    Schema.string().pattern(/^\+?[\d\s-()]+$/)
  ).maxItems(3).optional(),
  
  // User preferences and settings
  preferences: Schema.object({
    theme: Schema.string()
      .pattern(/^(light|dark|auto)$/)
      .withMessage('Theme must be light, dark, or auto'),
    language: Schema.string().pattern(/^[a-z]{2}$/).optional(),
    notifications: Schema.object({
      email: Schema.boolean(),
      sms: Schema.boolean(),
      push: Schema.boolean()
    })
  }).optional(),
  
  // Activity tracking
  tags: Schema.array(Schema.string().minLength(1))
    .minItems(1)
    .maxItems(10)
    .withMessage('User must have 1-10 tags'),
  
  isActive: Schema.boolean(),
  lastLoginAt: Schema.date().optional(),
  createdAt: Schema.date().maxDate(new Date())
});

// Example: Valid user data
const validUser = {
  id: 'user_12345',
  username: 'john_doe123',
  email: 'john.doe@example.com',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    age: 28,
    bio: 'Software developer passionate about clean code and good design.'
  },
  address: {
    street: '123 Main Street',
    city: 'San Francisco',
    zipCode: '94105',
    country: 'USA'
  },
  phoneNumbers: ['+1-555-123-4567'],
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  },
  tags: ['developer', 'javascript', 'nodejs'],
  isActive: true,
  createdAt: new Date('2023-01-15')
};

console.log('Valid User Validation:');
const validResult = userSchema.validate(validUser, 'user');
console.log('Valid:', validResult.valid);
if (validResult.valid) {
  console.log('✓ User data successfully validated');
  console.log('Validated user object keys:', Object.keys(validResult.value));
}

// Example: Invalid user data with multiple errors
const invalidUser = {
  id: '',  // Empty ID
  username: 'jo',  // Too short
  email: 'invalid.email',  // Invalid format
  profile: {
    firstName: '',  // Empty first name
    lastName: 'D',  // Could be valid, but let's see
    age: 12,  // Too young
    bio: 'a'.repeat(600)  // Too long (over 500 chars)
  },
  address: {
    street: '456 Oak Street',
    city: '',  // Empty city
    zipCode: 'invalid',  // Invalid format
    country: 'USA'
  },
  phoneNumbers: ['invalid-phone', '123', '+1-555-123-4567', '+1-555-987-6543'], // Too many + invalid
  preferences: {
    theme: 'purple',  // Invalid theme
    notifications: {
      email: 'yes',  // Should be boolean
      sms: false,
      push: true
    }
  },
  tags: [],  // Too few tags
  isActive: 'true',  // Should be boolean
  createdAt: new Date('2025-01-01')  // Future date
};

console.log('\nInvalid User Validation:');
const invalidResult = userSchema.validate(invalidUser, 'user');
console.log('Valid:', invalidResult.valid);
if (!invalidResult.valid) {
  console.log('✗ Validation failed with the following errors:');
  invalidResult.errors.forEach((error, index) => {
    console.log(`   ${index + 1}. ${error}`);
  });
}

// ==============================================================================
// 3. ARRAY VALIDATION WITH COMPLEX ITEMS
// ==============================================================================

console.log('\n\n3. COMPLEX ARRAY VALIDATION');
console.log('============================\n');

// Array of blog posts with comprehensive validation
const blogPostSchema = Schema.object({
  title: Schema.string()
    .minLength(5)
    .maxLength(100)
    .withMessage('Title must be 5-100 characters long'),
  content: Schema.string()
    .minLength(50)
    .withMessage('Content must be at least 50 characters long'),
  author: Schema.object({
    name: Schema.string().minLength(1),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  }),
  tags: Schema.array(Schema.string().minLength(1))
    .minItems(1)
    .maxItems(5),
  publishedAt: Schema.date().optional(),
  isPublished: Schema.boolean()
});

const blogPostsValidator = Schema.array(blogPostSchema)
  .minItems(1)
  .maxItems(10)
  .withMessage('Must have 1-10 blog posts');

const blogPosts = [
  {
    title: 'Getting Started with JavaScript Validation',
    content: 'In this comprehensive guide, we will explore how to build robust validation systems using JavaScript. We will cover everything from basic type checking to complex nested object validation, providing practical examples and best practices along the way.',
    author: {
      name: 'Jane Developer',
      email: 'jane@techblog.com'
    },
    tags: ['javascript', 'validation', 'tutorial'],
    publishedAt: new Date('2023-06-15'),
    isPublished: true
  },
  {
    title: 'Advanced Schema Design Patterns',
    content: 'Building maintainable and scalable validation schemas requires careful planning and design. This article discusses advanced patterns and techniques for creating reusable, composable validation logic that grows with your application.',
    author: {
      name: 'John Architect',
      email: 'john@techblog.com'
    },
    tags: ['design-patterns', 'architecture', 'validation'],
    publishedAt: new Date('2023-07-20'),
    isPublished: true
  }
];

console.log('Blog Posts Validation:');
const blogResult = blogPostsValidator.validate(blogPosts);
console.log('Valid:', blogResult.valid);
if (blogResult.valid) {
  console.log(`✓ Successfully validated ${blogResult.value.length} blog posts`);
  blogResult.value.forEach((post, index) => {
    console.log(`   ${index + 1}. "${post.title}" by ${post.author.name}`);
  });
}

// ==============================================================================
// 4. ERROR HANDLING AND RECOVERY PATTERNS
// ==============================================================================

console.log('\n\n4. ERROR HANDLING PATTERNS');
console.log('===========================\n');

/**
 * Utility function to validate data and handle errors gracefully
 * @param {Validator} validator - The validator to use
 * @param {*} data - The data to validate
 * @param {string} dataType - Description of the data type for logging
 * @returns {*} The validated data if successful, null if invalid
 */
function validateWithErrorHandling(validator, data, dataType) {
  try {
    const result = validator.validate(data, dataType);
    
    if (result.valid) {
      console.log(`✓ ${dataType} validation successful`);
      return result.value;
    } else {
      console.log(`✗ ${dataType} validation failed:`);
      result.errors.forEach(error => console.log(`   • ${error}`));
      return null;
    }
  } catch (error) {
    console.log(`✗ ${dataType} validation error: ${error.message}`);
    return null;
  }
}

// Demonstrate error handling with various scenarios
console.log('Testing error handling patterns:');

// Valid data
const validatedUser = validateWithErrorHandling(
  userSchema, 
  validUser, 
  'User Profile'
);

// Invalid data
const validatedInvalidUser = validateWithErrorHandling(
  userSchema, 
  invalidUser, 
  'Invalid User Profile'
);

// Edge case: null data
const validatedNullData = validateWithErrorHandling(
  userSchema.optional(), 
  null, 
  'Optional User Profile'
);

console.log('\n=== Validation Demonstration Complete ===');
console.log(`
Key Features Demonstrated:
• ✓ Comprehensive type validation (string, number, boolean, date)
• ✓ Complex constraint validation (length, range, pattern matching)
• ✓ Nested object and array validation
• ✓ Optional field handling
• ✓ Custom error messages
• ✓ Detailed error reporting with field context
• ✓ Error handling and recovery patterns
• ✓ Reusable validator composition
• ✓ Type-safe validation with JSDoc annotations
`); 