// Main exports for the SeaBattle game classes
const GAME_CONFIG = require('./config/GameConfig');
const Ship = require('./models/Ship');
const Board = require('./models/Board');
const Player = require('./models/Player');
const CPUPlayer = require('./models/CPUPlayer');
const GameUI = require('./ui/GameUI');
const SeaBattleGame = require('./game/SeaBattleGame');

module.exports = {
  GAME_CONFIG,
  Ship,
  Board,
  Player,
  CPUPlayer,
  GameUI,
  SeaBattleGame
}; 