const GAME_CONFIG = require('../config/GameConfig');

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

module.exports = Board; 