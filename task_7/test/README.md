# Test Directory

This directory contains all unit tests for the SeaBattle game.

## Test Files

- **`seabattle.test.js`** - Comprehensive test suite covering all game classes and functionality

## Test Structure

The test suite is organized into the following test groups:

### Configuration Tests
- `GAME_CONFIG` - Validates game configuration constants

### Model Tests
- `Ship` - Ship behavior and state management
- `Board` - Game board operations and display
- `Player` - Base player functionality
- `CPUPlayer` - AI player logic and behavior

### UI Tests
- `GameUI` - User interface and input/output handling

### Game Logic Tests
- `SeaBattleGame` - Main game controller and flow

## Running Tests

From the project root directory:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Test Coverage

Current test coverage: **74.47%**

- **44 total tests** with 100% pass rate
- **All core game functionality** thoroughly tested
- **Edge cases and error handling** covered
- **Modular architecture** enables focused testing

## Test Organization Benefits

1. **Separation of Concerns**: Tests are isolated from source code
2. **Clear Structure**: Easy to locate and maintain tests
3. **Better Coverage Analysis**: Detailed reporting by module
4. **Professional Standards**: Follows industry best practices
5. **IDE Support**: Enhanced test runner integration

## Adding New Tests

When adding new functionality:

1. Add corresponding tests to `seabattle.test.js`
2. Follow existing naming conventions
3. Group related tests using `describe()` blocks
4. Use descriptive test names with `test()` or `it()`
5. Aim for comprehensive coverage of new features 