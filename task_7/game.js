const SeaBattleGame = require('./src/game/SeaBattleGame');

// Start the game
const game = new SeaBattleGame();
game.start().catch(console.error); 