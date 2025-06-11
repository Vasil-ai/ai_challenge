const readline = require('readline');

// Game configuration constants
const GAME_CONFIG = {
  BOARD_SIZE: 10,
  NUM_SHIPS: 3,
  SHIP_LENGTH: 3,
  SYMBOLS: {
    WATER: '~',
    SHIP: 'S',
    HIT: 'X',
    MISS: 'O'
  }
};

// Ship class to represent individual ships
class Ship {
  constructor() {
    this.locations = [];
    this.hits = [];
  }

  addLocation(location) {
    this.locations.push(location);
    this.hits.push('');
  }

  hit(location) {
    const index = this.locations.indexOf(location);
    if (index >= 0 && this.hits[index] !== 'hit') {
      this.hits[index] = 'hit';
      return true;
    }
    return false;
  }

  isSunk() {
    return this.hits.every(hit => hit === 'hit');
  }

  isAlreadyHit(location) {
    const index = this.locations.indexOf(location);
    return index >= 0 && this.hits[index] === 'hit';
  }
}

// Board class to manage game board state and display
class Board {
  constructor(showShips = false) {
    this.size = GAME_CONFIG.BOARD_SIZE;
    this.showShips = showShips;
    this.grid = this.createEmptyGrid();
  }

  createEmptyGrid() {
    return Array(this.size).fill(null).map(() => 
      Array(this.size).fill(GAME_CONFIG.SYMBOLS.WATER)
    );
  }

  isValidCoordinate(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  placeShip(row, col) {
    if (this.isValidCoordinate(row, col)) {
      this.grid[row][col] = GAME_CONFIG.SYMBOLS.SHIP;
    }
  }

  markHit(row, col) {
    if (this.isValidCoordinate(row, col)) {
      this.grid[row][col] = GAME_CONFIG.SYMBOLS.HIT;
    }
  }

  markMiss(row, col) {
    if (this.isValidCoordinate(row, col)) {
      this.grid[row][col] = GAME_CONFIG.SYMBOLS.MISS;
    }
  }

  getDisplayGrid() {
    if (this.showShips) {
      return this.grid;
    }
    // Hide ships for opponent board
    return this.grid.map(row => 
      row.map(cell => cell === GAME_CONFIG.SYMBOLS.SHIP ? GAME_CONFIG.SYMBOLS.WATER : cell)
    );
  }
}

// Base Player class
class Player {
  constructor(name, showShips = false) {
    this.name = name;
    this.board = new Board(showShips);
    this.ships = [];
    this.numShips = GAME_CONFIG.NUM_SHIPS;
    this.guesses = [];
  }

  placeShipsRandomly() {
    let placedShips = 0;
    
    while (placedShips < this.numShips) {
      const ship = this.generateRandomShip();
      if (ship) {
        this.ships.push(ship);
        placedShips++;
      }
    }
    
    console.log(`${this.numShips} ships placed randomly for ${this.name}.`);
  }

  generateRandomShip() {
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    let startRow, startCol;

    if (orientation === 'horizontal') {
      startRow = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
      startCol = Math.floor(Math.random() * (GAME_CONFIG.BOARD_SIZE - GAME_CONFIG.SHIP_LENGTH + 1));
    } else {
      startRow = Math.floor(Math.random() * (GAME_CONFIG.BOARD_SIZE - GAME_CONFIG.SHIP_LENGTH + 1));
      startCol = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
    }

    // Check for collisions
    const shipPositions = [];
    for (let i = 0; i < GAME_CONFIG.SHIP_LENGTH; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      
      if (!this.board.isValidCoordinate(row, col) || 
          this.board.grid[row][col] !== GAME_CONFIG.SYMBOLS.WATER) {
        return null; // Collision detected
      }
      
      shipPositions.push({ row, col });
    }

    // Place the ship
    const ship = new Ship();
    shipPositions.forEach(({ row, col }) => {
      const location = `${row}${col}`;
      ship.addLocation(location);
      this.board.placeShip(row, col);
    });

    return ship;
  }

  receiveAttack(guess) {
    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);
    
    let hitShip = null;
    for (const ship of this.ships) {
      if (ship.hit(guess)) {
        this.board.markHit(row, col);
        hitShip = ship;
        break;
      } else if (ship.isAlreadyHit(guess)) {
        return { result: 'already_hit', ship: null };
      }
    }

    if (hitShip) {
      if (hitShip.isSunk()) {
        this.numShips--;
        return { result: 'sunk', ship: hitShip };
      }
      return { result: 'hit', ship: hitShip };
    }

    this.board.markMiss(row, col);
    return { result: 'miss', ship: null };
  }

  hasShipsRemaining() {
    return this.numShips > 0;
  }
}

// CPU Player with AI logic
class CPUPlayer extends Player {
  constructor() {
    super('CPU', false);
    this.mode = 'hunt';
    this.targetQueue = [];
  }

  makeGuess(opponentGuesses) {
    let guess;
    
    if (this.mode === 'target' && this.targetQueue.length > 0) {
      guess = this.targetQueue.shift();
      console.log(`CPU targets: ${guess}`);
      
      if (opponentGuesses.includes(guess)) {
        if (this.targetQueue.length === 0) {
          this.mode = 'hunt';
        }
        return this.makeGuess(opponentGuesses); // Try again
      }
    } else {
      this.mode = 'hunt';
      guess = this.generateRandomGuess(opponentGuesses);
    }

    return guess;
  }

  generateRandomGuess(previousGuesses) {
    let guess;
    do {
      const row = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
      const col = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
      guess = `${row}${col}`;
    } while (previousGuesses.includes(guess));
    
    return guess;
  }

  processAttackResult(guess, result) {
    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    switch (result.result) {
      case 'hit':
        console.log(`CPU HIT at ${guess}!`);
        this.mode = 'target';
        this.addAdjacentTargets(row, col);
        break;
      case 'sunk':
          console.log('CPU sunk your battleship!');
        this.mode = 'hunt';
        this.targetQueue = [];
        break;
      case 'miss':
        console.log(`CPU MISS at ${guess}.`);
        if (this.mode === 'target' && this.targetQueue.length === 0) {
          this.mode = 'hunt';
        }
        break;
      }
    }

  addAdjacentTargets(row, col) {
    const adjacentPositions = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 }
    ];

    adjacentPositions.forEach(({ r, c }) => {
      if (this.board.isValidCoordinate(r, c)) {
        const target = `${r}${c}`;
        if (!this.targetQueue.includes(target)) {
          this.targetQueue.push(target);
        }
      }
    });
  }
}

// Game UI class to handle input/output
class GameUI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  printBoards(opponentBoard, playerBoard) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    const header = '  ' + Array.from({ length: GAME_CONFIG.BOARD_SIZE }, (_, i) => i).join(' ');
    console.log(`${header}     ${header}`);

    const opponentGrid = opponentBoard.getDisplayGrid();
    const playerGrid = playerBoard.getDisplayGrid();

    for (let i = 0; i < GAME_CONFIG.BOARD_SIZE; i++) {
      const opponentRow = `${i} ${opponentGrid[i].join(' ')}`;
      const playerRow = `${i} ${playerGrid[i].join(' ')}`;
      console.log(`${opponentRow}    ${playerRow}`);
    }
    console.log('\n');
  }

  async getPlayerGuess() {
    return new Promise((resolve) => {
      this.rl.question('Enter your guess (e.g., 00): ', (answer) => {
        resolve(answer);
      });
    });
  }

  close() {
    this.rl.close();
  }
}

// Main Game class
class SeaBattleGame {
  constructor() {
    this.player = new Player('Player', true);
    this.cpu = new CPUPlayer();
    this.ui = new GameUI();
    this.isGameOver = false;
  }

  initialize() {
    console.log('Boards created.');
    this.player.placeShipsRandomly();
    this.cpu.placeShipsRandomly();
    console.log("\nLet's play Sea Battle!");
    console.log(`Try to sink the ${this.cpu.numShips} enemy ships.`);
  }

  validatePlayerGuess(guess) {
    if (!guess || guess.length !== 2) {
      console.log('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
      return false;
    }

    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    if (isNaN(row) || isNaN(col) || 
        row < 0 || row >= GAME_CONFIG.BOARD_SIZE || 
        col < 0 || col >= GAME_CONFIG.BOARD_SIZE) {
      console.log(`Oops, please enter valid row and column numbers between 0 and ${GAME_CONFIG.BOARD_SIZE - 1}.`);
      return false;
    }

    if (this.player.guesses.includes(guess)) {
      console.log('You already guessed that location!');
      return false;
  }

  return true;
}

  processPlayerTurn(guess) {
    this.player.guesses.push(guess);
    const result = this.cpu.receiveAttack(guess);
    
    switch (result.result) {
      case 'hit':
        console.log('PLAYER HIT!');
        break;
      case 'sunk':
        console.log('You sunk an enemy battleship!');
        break;
      case 'miss':
        console.log('PLAYER MISS.');
        break;
      case 'already_hit':
        console.log('You already hit that spot!');
        break;
    }

    return result.result !== 'already_hit';
  }

  processCPUTurn() {
    console.log("\n--- CPU's Turn ---");
    const guess = this.cpu.makeGuess(this.cpu.guesses);
    this.cpu.guesses.push(guess);
    
    const result = this.player.receiveAttack(guess);
    this.cpu.processAttackResult(guess, result);
  }

  checkGameEnd() {
    if (!this.cpu.hasShipsRemaining()) {
      console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
      this.ui.printBoards(this.cpu.board, this.player.board);
      this.isGameOver = true;
      return true;
    }

    if (!this.player.hasShipsRemaining()) {
    console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
      this.ui.printBoards(this.cpu.board, this.player.board);
      this.isGameOver = true;
      return true;
    }

    return false;
  }

  async gameLoop() {
    while (!this.isGameOver) {
      if (this.checkGameEnd()) break;

      this.ui.printBoards(this.cpu.board, this.player.board);
      
      // Player turn
      let validGuess = false;
      while (!validGuess) {
        const guess = await this.ui.getPlayerGuess();
        if (this.validatePlayerGuess(guess)) {
          validGuess = this.processPlayerTurn(guess);
        }
      }

      if (this.checkGameEnd()) break;

      // CPU turn
      this.processCPUTurn();
    }

    this.ui.close();
  }

  async start() {
    this.initialize();
    await this.gameLoop();
  }
}

// Export classes for testing
module.exports = {
  Ship,
  Board,
  Player,
  CPUPlayer,
  GameUI,
  SeaBattleGame,
  GAME_CONFIG
};
