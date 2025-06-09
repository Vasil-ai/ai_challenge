# Running Enigma Tests

## Prerequisites
Ensure you have Node.js and npm installed on your system.

## Installation
Install the test dependencies:
```bash
npm install
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests with coverage report:
```bash
npm run test:coverage
```

### Run tests in watch mode (for development):
```bash
npm run test:watch
```

## Test Coverage
The tests are configured to require at least 60% coverage for:
- Statements
- Branches  
- Functions
- Lines

The current test suite covers:
- Basic encryption/decryption functionality
- Rotor positions and stepping mechanism
- Ring settings
- Plugboard pairs
- Non-alphabetic character handling
- Double-stepping anomaly
- Edge cases (empty input, etc.)

## Test Structure
The tests are organized in `enigma.test.js` and use Jest as the testing framework. Each test creates a fresh Enigma instance with specific settings to ensure isolation between tests. 