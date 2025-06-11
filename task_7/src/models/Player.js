const GAME_CONFIG = require('../config/GameConfig');
const Board = require('./Board');
const Ship = require('./Ship');

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

module.exports = Player; 