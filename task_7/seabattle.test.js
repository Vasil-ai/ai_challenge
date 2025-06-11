const {
  Ship,
  Board,
  Player,
  CPUPlayer,
  GameUI,
  SeaBattleGame,
  GAME_CONFIG
} = require('./seabattle.js');

// Mock readline for GameUI tests
const mockRl = {
  question: jest.fn(),
  close: jest.fn()
};

jest.mock('readline', () => ({
  createInterface: jest.fn(() => mockRl)
}));

describe('GAME_CONFIG', () => {
  test('should have correct default values', () => {
    expect(GAME_CONFIG.BOARD_SIZE).toBe(10);
    expect(GAME_CONFIG.NUM_SHIPS).toBe(3);
    expect(GAME_CONFIG.SHIP_LENGTH).toBe(3);
    expect(GAME_CONFIG.SYMBOLS.WATER).toBe('~');
    expect(GAME_CONFIG.SYMBOLS.SHIP).toBe('S');
    expect(GAME_CONFIG.SYMBOLS.HIT).toBe('X');
    expect(GAME_CONFIG.SYMBOLS.MISS).toBe('O');
  });
});

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship();
  });

  test('should initialize with empty locations and hits arrays', () => {
    expect(ship.locations).toEqual([]);
    expect(ship.hits).toEqual([]);
  });

  test('should add location correctly', () => {
    ship.addLocation('00');
    expect(ship.locations).toContain('00');
    expect(ship.hits).toContain('');
  });

  test('should register hit correctly', () => {
    ship.addLocation('00');
    ship.addLocation('01');
    
    const result = ship.hit('00');
    expect(result).toBe(true);
    expect(ship.hits[0]).toBe('hit');
  });

  test('should not register hit on non-existent location', () => {
    ship.addLocation('00');
    const result = ship.hit('99');
    expect(result).toBe(false);
  });

  test('should not register duplicate hits', () => {
    ship.addLocation('00');
    ship.hit('00');
    const result = ship.hit('00');
    expect(result).toBe(false);
  });

  test('should determine if ship is sunk', () => {
    ship.addLocation('00');
    ship.addLocation('01');  
    ship.addLocation('02');
    
    expect(ship.isSunk()).toBe(false);
    
    ship.hit('00');
    ship.hit('01');
    expect(ship.isSunk()).toBe(false);
    
    ship.hit('02');
    expect(ship.isSunk()).toBe(true);
  });

  test('should check if location is already hit', () => {
    ship.addLocation('00');
    expect(ship.isAlreadyHit('00')).toBe(false);
    
    ship.hit('00');
    expect(ship.isAlreadyHit('00')).toBe(true);
    expect(ship.isAlreadyHit('99')).toBe(false);
  });
});

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board();
  });

  test('should initialize with correct size and water symbols', () => {
    expect(board.size).toBe(GAME_CONFIG.BOARD_SIZE);
    expect(board.grid.length).toBe(GAME_CONFIG.BOARD_SIZE);
    expect(board.grid[0].length).toBe(GAME_CONFIG.BOARD_SIZE);
    expect(board.grid[0][0]).toBe(GAME_CONFIG.SYMBOLS.WATER);
  });

  test('should validate coordinates correctly', () => {
    expect(board.isValidCoordinate(0, 0)).toBe(true);
    expect(board.isValidCoordinate(9, 9)).toBe(true);
    expect(board.isValidCoordinate(-1, 0)).toBe(false);
    expect(board.isValidCoordinate(0, -1)).toBe(false);
    expect(board.isValidCoordinate(10, 0)).toBe(false);
    expect(board.isValidCoordinate(0, 10)).toBe(false);
  });

  test('should place ship correctly', () => {
    board.placeShip(0, 0);
    expect(board.grid[0][0]).toBe(GAME_CONFIG.SYMBOLS.SHIP);
  });

  test('should not place ship on invalid coordinates', () => {
    board.placeShip(-1, 0);
    board.placeShip(10, 10);
    expect(board.grid[0][0]).toBe(GAME_CONFIG.SYMBOLS.WATER);
  });

  test('should mark hit correctly', () => {
    board.markHit(0, 0);
    expect(board.grid[0][0]).toBe(GAME_CONFIG.SYMBOLS.HIT);
  });

  test('should mark miss correctly', () => {
    board.markMiss(0, 0);
    expect(board.grid[0][0]).toBe(GAME_CONFIG.SYMBOLS.MISS);
  });

  test('should hide ships when showShips is false', () => {
    const hiddenBoard = new Board(false);
    hiddenBoard.placeShip(0, 0);
    hiddenBoard.markHit(1, 1);
    
    const displayGrid = hiddenBoard.getDisplayGrid();
    expect(displayGrid[0][0]).toBe(GAME_CONFIG.SYMBOLS.WATER);
    expect(displayGrid[1][1]).toBe(GAME_CONFIG.SYMBOLS.HIT);
  });

  test('should show ships when showShips is true', () => {
    const visibleBoard = new Board(true);
    visibleBoard.placeShip(0, 0);
    
    const displayGrid = visibleBoard.getDisplayGrid();
    expect(displayGrid[0][0]).toBe(GAME_CONFIG.SYMBOLS.SHIP);
  });
});

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player('TestPlayer', true);
  });

  test('should initialize with correct properties', () => {
    expect(player.name).toBe('TestPlayer');
    expect(player.ships).toEqual([]);
    expect(player.numShips).toBe(GAME_CONFIG.NUM_SHIPS);
    expect(player.guesses).toEqual([]);
    expect(player.board).toBeInstanceOf(Board);
  });

  test('should receive attack and return miss', () => {
    const result = player.receiveAttack('00');
    expect(result.result).toBe('miss');
    expect(result.ship).toBe(null);
  });

  test('should receive attack and return hit', () => {
    const ship = new Ship();
    ship.addLocation('00');
    ship.addLocation('01');
    ship.addLocation('02');
    player.ships.push(ship);
    player.board.placeShip(0, 0);
    
    const result = player.receiveAttack('00');
    expect(result.result).toBe('hit');
    expect(result.ship).toBe(ship);
  });

  test('should receive attack and return sunk', () => {
    const ship = new Ship();
    ship.addLocation('00');
    player.ships.push(ship);
    player.board.placeShip(0, 0);
    
    const result = player.receiveAttack('00');
    expect(result.result).toBe('sunk');
    expect(player.numShips).toBe(GAME_CONFIG.NUM_SHIPS - 1);
  });

  test('should return already_hit for duplicate attacks', () => {
    const ship = new Ship();
    ship.addLocation('00');
    ship.hit('00');
    player.ships.push(ship);
    player.board.placeShip(0, 0);
    
    const result = player.receiveAttack('00');
    expect(result.result).toBe('already_hit');
  });



  test('should correctly report if ships remain', () => {
    expect(player.hasShipsRemaining()).toBe(true);
    player.numShips = 0;
    expect(player.hasShipsRemaining()).toBe(false);
  });
});

describe('CPUPlayer', () => {
  let cpu;

  beforeEach(() => {
    cpu = new CPUPlayer();
  });

  test('should initialize with correct properties', () => {
    expect(cpu.name).toBe('CPU');
    expect(cpu.mode).toBe('hunt');
    expect(cpu.targetQueue).toEqual([]);
  });

  test('should generate random guess in hunt mode', () => {
    const guess = cpu.makeGuess([]);
    expect(typeof guess).toBe('string');
    expect(guess.length).toBe(2);
  });

  test('should avoid previous guesses', () => {
    const previousGuesses = ['11'];
    const guess = cpu.makeGuess(previousGuesses);
    expect(guess).not.toBe('11');
  });

  test('should target from queue in target mode', () => {
    cpu.mode = 'target';
    cpu.targetQueue = ['33', '44'];
    
    jest.spyOn(console, 'log').mockImplementation();
    const guess = cpu.makeGuess([]);
    expect(guess).toBe('33');
    expect(cpu.targetQueue).toEqual(['44']);
    console.log.mockRestore();
  });

  test('should process hit result and switch to target mode', () => {
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    
    cpu.processAttackResult('22', { result: 'hit' });
    
    expect(cpu.mode).toBe('target');
    expect(cpu.targetQueue.length).toBeGreaterThan(0);
    expect(mockConsoleLog).toHaveBeenCalledWith('CPU HIT at 22!');
    
    mockConsoleLog.mockRestore();
  });

  test('should process sunk result and reset to hunt mode', () => {
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    
    cpu.mode = 'target';
    cpu.targetQueue = ['11', '22'];
    cpu.processAttackResult('33', { result: 'sunk' });
    
    expect(cpu.mode).toBe('hunt');
    expect(cpu.targetQueue).toEqual([]);
    expect(mockConsoleLog).toHaveBeenCalledWith('CPU sunk your battleship!');
    
    mockConsoleLog.mockRestore();
  });

  test('should process miss result', () => {
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    
    cpu.processAttackResult('44', { result: 'miss' });
    expect(mockConsoleLog).toHaveBeenCalledWith('CPU MISS at 44.');
    
    mockConsoleLog.mockRestore();
  });

  test('should add adjacent targets correctly', () => {
    cpu.addAdjacentTargets(5, 5);
    
    const expectedTargets = ['45', '65', '54', '56'];
    expectedTargets.forEach(target => {
      expect(cpu.targetQueue).toContain(target);
    });
  });

  test('should not add invalid adjacent targets', () => {
    cpu.addAdjacentTargets(0, 0);
    
    const validTargets = cpu.targetQueue.filter(target => {
      const row = parseInt(target[0]);
      const col = parseInt(target[1]);
      return row >= 0 && row < 10 && col >= 0 && col < 10;
    });
    
    expect(validTargets.length).toBe(cpu.targetQueue.length);
  });
});

describe('GameUI', () => {
  let gameUI;

  beforeEach(() => {
    gameUI = new GameUI();
    jest.clearAllMocks();
  });

  test('should initialize readline interface', () => {
    expect(gameUI.rl).toBe(mockRl);
  });

  test('should print boards correctly', () => {
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    
    const board1 = new Board(false);
    const board2 = new Board(true);
    
    gameUI.printBoards(board1, board2);
    
    expect(mockConsoleLog).toHaveBeenCalled();
    const calls = mockConsoleLog.mock.calls;
    expect(calls.some(call => call[0].includes('OPPONENT BOARD'))).toBe(true);
    expect(calls.some(call => call[0].includes('YOUR BOARD'))).toBe(true);
    
    mockConsoleLog.mockRestore();
  });

  test('should get player guess as promise', async () => {
    mockRl.question.mockImplementation((prompt, callback) => {
      callback('42');
    });
    
    const guess = await gameUI.getPlayerGuess();
    expect(guess).toBe('42');
    expect(mockRl.question).toHaveBeenCalledWith('Enter your guess (e.g., 00): ', expect.any(Function));
  });

  test('should close readline interface', () => {
    gameUI.close();
    expect(mockRl.close).toHaveBeenCalled();
  });
});

describe('SeaBattleGame', () => {
  let game;

  beforeEach(() => {
    game = new SeaBattleGame();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('should initialize with correct properties', () => {
    expect(game.player).toBeInstanceOf(Player);
    expect(game.cpu).toBeInstanceOf(CPUPlayer);
    expect(game.ui).toBeInstanceOf(GameUI);
    expect(game.isGameOver).toBe(false);
  });

  test('should validate player guess correctly', () => {
    expect(game.validatePlayerGuess('00')).toBe(true);
    expect(game.validatePlayerGuess('99')).toBe(true);
    expect(game.validatePlayerGuess('0')).toBe(false);
    expect(game.validatePlayerGuess('000')).toBe(false);
    expect(game.validatePlayerGuess('ab')).toBe(false);
    expect(game.validatePlayerGuess('a0')).toBe(false);
    expect(game.validatePlayerGuess(null)).toBe(false);
    expect(game.validatePlayerGuess('')).toBe(false);
  });

  test('should reject duplicate guesses', () => {
    game.player.guesses = ['00'];
    expect(game.validatePlayerGuess('00')).toBe(false);
  });

  test('should reject out of bounds guesses', () => {
    expect(game.validatePlayerGuess('aa')).toBe(false);
  });

  test('should process player turn and return true for valid move', () => {
    const result = game.processPlayerTurn('00');
    expect(result).toBe(true);
    expect(game.player.guesses).toContain('00');
  });

  test('should process player turn and handle hits', () => {
    const ship = new Ship();
    ship.addLocation('00');
    ship.addLocation('01');
    ship.addLocation('02');
    game.cpu.ships = [ship];
    game.cpu.board.placeShip(0, 0);
    game.cpu.board.placeShip(0, 1);
    game.cpu.board.placeShip(0, 2);
    
    const result = game.processPlayerTurn('00');
    expect(result).toBe(true);
    expect(console.log).toHaveBeenCalledWith('PLAYER HIT!');
  });

  test('should check game end conditions', () => {
    expect(game.checkGameEnd()).toBe(false);
    
    game.cpu.numShips = 0;
    expect(game.checkGameEnd()).toBe(true);
    expect(game.isGameOver).toBe(true);
    
    game.isGameOver = false;
    game.cpu.numShips = 3;
    game.player.numShips = 0;
    expect(game.checkGameEnd()).toBe(true);
    expect(game.isGameOver).toBe(true);
  });

  test('should process CPU turn', () => {
    jest.spyOn(game.cpu, 'makeGuess').mockReturnValue('11');
    jest.spyOn(game.cpu, 'processAttackResult').mockImplementation();
    
    game.processCPUTurn();
    
    expect(game.cpu.guesses).toContain('11');
    expect(game.cpu.makeGuess).toHaveBeenCalled();
    expect(game.cpu.processAttackResult).toHaveBeenCalled();
  });

  test('should initialize game correctly', () => {
    jest.spyOn(game.player, 'placeShipsRandomly').mockImplementation();
    jest.spyOn(game.cpu, 'placeShipsRandomly').mockImplementation();
    
    game.initialize();
    
    expect(console.log).toHaveBeenCalledWith('Boards created.');
    expect(console.log).toHaveBeenCalledWith("\nLet's play Sea Battle!");
    expect(game.player.placeShipsRandomly).toHaveBeenCalled();
    expect(game.cpu.placeShipsRandomly).toHaveBeenCalled();
  });
}); 