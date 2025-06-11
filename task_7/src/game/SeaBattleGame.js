const GAME_CONFIG = require('../config/GameConfig');
const Player = require('../models/Player');
const CPUPlayer = require('../models/CPUPlayer');
const GameUI = require('../ui/GameUI');

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

module.exports = SeaBattleGame; 