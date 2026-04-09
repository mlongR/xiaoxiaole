import Phaser from 'phaser';
import Tile from './Tile.js';
import MatchDetector from '../utils/MatchDetector.js';

export default class Board extends Phaser.GameObjects.Container {
  constructor(scene, x, y, boardSize, characters) {
    super(scene, x, y);

    this.scene = scene;
    this.boardSize = boardSize;
    this.characters = characters;
    this.grid = [];
    this.tiles = [];
    this.selectedTile = null;

    // 匹配检测器
    this.matchDetector = new MatchDetector(boardSize);

    // 计算格子大小
    const boardWidth = 500;
    this.tileSize = boardWidth / boardSize;
    this.offset = -boardWidth / 2 + this.tileSize / 2;

    // 初始化棋盘
    this.initializeBoard();

    scene.add.existing(this);
  }

  initializeBoard() {
    this.createSolvableBoard();
    this.renderBoard();
  }

  getRandomChar() {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  wouldCreateMatch(row, col, char) {
    if (col >= 2 &&
        this.grid[row][col - 1] === char &&
        this.grid[row][col - 2] === char) {
      return true;
    }

    if (row >= 2 &&
        this.grid[row - 1] &&
        this.grid[row - 1][col] === char &&
        this.grid[row - 2] &&
        this.grid[row - 2][col] === char) {
      return true;
    }

    return false;
  }

  hasPossibleMove() {
    return this.matchDetector.findPossibleMove(this.grid) !== null;
  }

  createSolvableBoard() {
    for (let row = 0; row < this.boardSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        let char;
        let attempts = 0;
        do {
          char = this.getRandomChar();
          attempts++;
        } while (this.wouldCreateMatch(row, col, char) && attempts < 50);
        this.grid[row][col] = char;
      }
    }

    const char1 = this.characters[0];
    const char2 = this.characters[1];

    this.grid[0][0] = char1;
    this.grid[0][1] = char1;
    this.grid[1][0] = char1;
    if (this.boardSize > 2) {
      this.grid[0][2] = char2;
      this.grid[1][2] = char1;
    }

    if (!this.hasPossibleMove()) {
      this.grid[0][0] = char1;
      this.grid[0][1] = char1;
      this.grid[1][0] = char1;
      this.grid[0][2] = char2;
    }
  }

  renderBoard() {
    for (let row = 0; row < this.tiles.length; row++) {
      if (this.tiles[row]) {
        for (let col = 0; col < this.tiles[row].length; col++) {
          if (this.tiles[row][col]) {
            this.tiles[row][col].destroy();
          }
        }
      }
    }
    this.tiles = [];

    for (let row = 0; row < this.boardSize; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        const x = this.offset + col * this.tileSize;
        const y = this.offset + row * this.tileSize;
        const char = this.grid[row][col];

        const tile = new Tile(this.scene, x, y, char, this.tileSize);
        tile.row = row;
        tile.col = col;
        tile.originalX = x;
        tile.originalY = y;

        this.tiles[row][col] = tile;
        this.add(tile);
      }
    }
  }

  // 处理滑动交换
  handleSwipe(tile, direction) {
    if (this.scene.isAnimating) return;

    let targetRow = tile.row;
    let targetCol = tile.col;

    switch (direction) {
      case 'left':
        targetCol--;
        break;
      case 'right':
        targetCol++;
        break;
      case 'up':
        targetRow--;
        break;
      case 'down':
        targetRow++;
        break;
    }

    // 检查目标位置是否有效
    if (targetRow < 0 || targetRow >= this.boardSize ||
        targetCol < 0 || targetCol >= this.boardSize) {
      // 无效位置，回退
      tile.snapBackToOriginal();
      return;
    }

    const targetTile = this.getTileAt(targetRow, targetCol);
    if (!targetTile) {
      tile.snapBackToOriginal();
      return;
    }

    // 执行交换
    this.scene.swapTiles(tile, targetTile);
  }

  handleTileClick(tile) {
    // 保留点击选择功能（作为备选交互方式）
    if (this.scene.isAnimating) return;

    if (!this.selectedTile) {
      this.selectedTile = tile;
      tile.select();
      this.audioManagerPlayClick();
    } else if (this.selectedTile === tile) {
      tile.deselect();
      this.selectedTile = null;
    } else if (this.isAdjacent(this.selectedTile, tile)) {
      this.scene.swapTiles(this.selectedTile, tile);
      this.selectedTile.deselect();
      this.selectedTile = null;
    } else {
      this.selectedTile.deselect();
      this.selectedTile = tile;
      tile.select();
      this.audioManagerPlayClick();
    }
  }

  audioManagerPlayClick() {
    if (this.scene.audioManager) {
      this.scene.audioManager.playClickSound();
    }
  }

  isAdjacent(tile1, tile2) {
    const rowDiff = Math.abs(tile1.row - tile2.row);
    const colDiff = Math.abs(tile1.col - tile2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  getTileAt(row, col) {
    if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
      return this.tiles[row][col];
    }
    return null;
  }

  checkAndShuffle() {
    if (!this.hasPossibleMove()) {
      this.shuffleBoard();
      this.showShuffleHint();
      return true;
    }
    return false;
  }

  showShuffleHint() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    const hintBg = this.scene.add.graphics();
    hintBg.fillStyle(0x000000, 0.7);
    hintBg.fillRoundedRect(width / 2 - 100, height / 2 - 30, 200, 60, 15);
    hintBg.setDepth(1000);

    const hintText = this.scene.add.text(width / 2, height / 2, '🔄 重新排列...', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(1001);

    this.scene.tweens.add({
      targets: [hintBg, hintText],
      alpha: { from: 1, to: 0 },
      duration: 1000,
      delay: 500,
      onComplete: () => {
        hintBg.destroy();
        hintText.destroy();
      }
    });
  }

  shuffleBoard() {
    const allChars = [];
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        allChars.push(this.grid[row][col]);
      }
    }

    for (let i = allChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
    }

    let idx = 0;
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        this.grid[row][col] = allChars[idx++];
      }
    }

    if (!this.hasPossibleMove()) {
      const char1 = this.characters[0];
      const char2 = this.characters[1];
      this.grid[0][0] = char1;
      this.grid[0][1] = char1;
      this.grid[1][0] = char1;
      this.grid[0][2] = char2;
    }

    this.renderBoard();
  }
}
