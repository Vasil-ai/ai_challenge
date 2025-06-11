# SeaBattle Game

A modern ES6+ implementation of the classic Battleship game with comprehensive unit testing and modular architecture.

## Features

- Modern JavaScript (ES6+) with classes and modules
- Clean modular file structure with separation of concerns
- Object-oriented architecture
- Comprehensive unit test suite with Jest
- 74.27% test coverage (exceeds 60% requirement)
- AI opponent with hunt and target modes
- Full backward compatibility

## File Structure

```
seabattle-game/
├── src/
│   ├── config/
│   │   └── GameConfig.js          # Game configuration constants
│   ├── models/
│   │   ├── Ship.js                # Ship class
│   │   ├── Board.js               # Board management
│   │   ├── Player.js              # Base player class
│   │   └── CPUPlayer.js           # AI player implementation
│   ├── ui/
│   │   └── GameUI.js              # User interface handling
│   ├── game/
│   │   └── SeaBattleGame.js       # Main game controller
│   └── index.js                   # Main export file
├── test/
│   └── seabattle.test.js          # Comprehensive test suite
├── game.js                        # Game launcher
├── test_report.txt                # Detailed coverage report
├── refactoring.md                 # Refactoring documentation
└── package.json                   # Project configuration
```

## Architecture

### Configuration Layer
- **`GameConfig.js`**: Centralized game constants and settings

### Model Layer
- **`Ship.js`**: Individual ship behavior and state
- **`Board.js`**: Game board management and display
- **`Player.js`**: Base player functionality
- **`CPUPlayer.js`**: AI logic with hunt/target modes

### UI Layer
- **`GameUI.js`**: User interface and input/output handling

### Game Layer
- **`SeaBattleGame.js`**: Main game controller and flow management

## Gameplay

You play against a CPU opponent. Both players place their ships on a 10x10 grid. Players take turns guessing coordinates to hit the opponent's ships. The first player to sink all of the opponent's ships wins.

- `~` represents water (unknown).
- `S` represents your ships on your board.
- `X` represents a hit (on either board).
- `O` represents a miss (on either board).

## Installation

```bash
npm install
```

## Running the Game

```bash
npm start
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Import Usage

```javascript
// Import specific classes
const SeaBattleGame = require('./src/game/SeaBattleGame');
const Ship = require('./src/models/Ship');

// Import all classes (recommended)
const { SeaBattleGame, Ship, Board } = require('./src');
``` 