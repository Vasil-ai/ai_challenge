const { SeaBattleGame } = require('./seabattle.js');

// Start the game
const game = new SeaBattleGame();
game.start().catch(console.error); 