const GAME_CONFIG = require('../config/GameConfig');
const Player = require('./Player');

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

module.exports = CPUPlayer; 