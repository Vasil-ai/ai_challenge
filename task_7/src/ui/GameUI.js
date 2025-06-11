const readline = require('readline');
const GAME_CONFIG = require('../config/GameConfig');

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

module.exports = GameUI; 