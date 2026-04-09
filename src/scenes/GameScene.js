import Phaser from 'phaser';
import Board from '../objects/Board.js';
import Tile, { resetColorMap } from '../objects/Tile.js';
import MatchDetector from '../utils/MatchDetector.js';
import AudioManager from '../utils/AudioManager.js';
import levelsData from '../../data/levels.json';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.currentLevel = data.level || 1;
  }

  create() {
    // 重置颜色映射
    resetColorMap();

    this.isAnimating = false;
    this.matchCount = 0;
    this.comboCount = 0;
    this.matchedChars = [];

    // 获取关卡数据
    const levelConfig = levelsData.levels.find(l => l.id === this.currentLevel);
    this.levelConfig = levelConfig;

    // 初始化工具
    this.matchDetector = new MatchDetector(levelConfig.boardSize);
    this.audioManager = new AudioManager(this);

    // 创建UI
    this.createUI();

    // 创建棋盘
    this.board = new Board(
      this,
      this.cameras.main.width / 2,
      420,
      levelConfig.boardSize,
      levelConfig.characters
    );

    // 淡入效果
    this.cameras.main.fadeIn(300);

    // 显示教程（如果是第一关）
    if (levelConfig.tutorial) {
      this.showTutorial();
    }
  }

  createUI() {
    const width = this.cameras.main.width;

    // 顶部背景
    const topBg = this.add.graphics();
    topBg.fillStyle(0x4CAF50, 1);
    topBg.fillRoundedRect(15, 15, width - 30, 110, 20);

    // 关卡标题
    this.add.text(width / 2, 45, `第${this.currentLevel}关 · ${this.levelConfig.name}`, {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 目标显示
    this.targetText = this.add.text(width / 2, 90, `🎯 目标: 0 / ${this.levelConfig.target}`, {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#E8F5E9'
    }).setOrigin(0.5);

    // 返回按钮
    const backBtn = this.add.container(50, 70);
    const backBg = this.add.graphics();
    backBg.fillStyle(0x388E3C, 1);
    backBg.fillRoundedRect(-40, -20, 80, 40, 10);
    backBtn.add(backBg);

    const backText = this.add.text(0, 0, '← 返回', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    backBtn.add(backText);

    backBtn.setSize(80, 40);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => {
      backBg.clear();
      backBg.fillStyle(0x2E7D32, 1);
      backBg.fillRoundedRect(-40, -20, 80, 40, 10);
    });
    backBtn.on('pointerout', () => {
      backBg.clear();
      backBg.fillStyle(0x388E3C, 1);
      backBg.fillRoundedRect(-40, -20, 80, 40, 10);
    });
    backBtn.on('pointerup', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MenuScene');
      });
    });

    // 底部汉字预览
    this.createCharacterPreview();
  }

  createCharacterPreview() {
    const width = this.cameras.main.width;
    const y = this.cameras.main.height - 100;

    // 背景
    const previewBg = this.add.graphics();
    previewBg.fillStyle(0xF5F5F5, 1);
    previewBg.fillRoundedRect(15, y - 30, width - 30, 95, 15);
    previewBg.lineStyle(2, 0xE0E0E0, 1);
    previewBg.strokeRoundedRect(15, y - 30, width - 30, 95, 15);

    // 提示文字
    this.add.text(width / 2, y - 10, '📚 本关汉字（点击可试听）', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#666666'
    }).setOrigin(0.5);

    // 显示所有汉字
    const chars = this.levelConfig.characters;
    const spacing = Math.min(60, (width - 80) / chars.length);
    const startX = width / 2 - ((chars.length - 1) * spacing) / 2;

    chars.forEach((char, i) => {
      // 汉字背景圆圈
      const charBg = this.add.graphics();
      charBg.fillStyle(0xFFFFFF, 1);
      charBg.fillCircle(startX + i * spacing, y + 35, 25);
      charBg.lineStyle(2, 0x4CAF50, 1);
      charBg.strokeCircle(startX + i * spacing, y + 35, 25);

      const charText = this.add.text(startX + i * spacing, y + 35, char, {
        fontSize: '26px',
        fontFamily: 'Microsoft YaHei, Arial, sans-serif',
        color: '#333333',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 点击播放读音
      const hitArea = this.add.graphics();
      hitArea.fillStyle(0x000000, 0);
      hitArea.fillCircle(startX + i * spacing, y + 35, 25);
      hitArea.setInteractive(new Phaser.Geom.Circle(startX + i * spacing, y + 35, 25), Phaser.Geom.Circle.Contains);

      const onCharClick = () => {
        this.audioManager.playCharacterSound(char);
        this.tweens.add({
          targets: [charText, charBg],
          scale: 1.2,
          duration: 100,
          yoyo: true
        });
      };

      charText.setInteractive({ useHandCursor: true });
      charText.on('pointerdown', onCharClick);
      hitArea.on('pointerdown', onCharClick);
    });
  }

  showTutorial() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 存储所有教程元素以便销毁
    const tutorialElements = [];

    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    tutorialElements.push(overlay);

    // 教程框背景
    const tutorialBg = this.add.graphics();
    tutorialBg.fillStyle(0xFFFFFF, 1);
    tutorialBg.fillRoundedRect(width / 2 - 220, height / 2 - 160, 440, 320, 25);
    tutorialBg.fillStyle(0x4CAF50, 1);
    tutorialBg.fillRoundedRect(width / 2 - 220, height / 2 - 160, 440, 60, { tl: 25, tr: 25, bl: 0, br: 0 });
    tutorialElements.push(tutorialBg);

    // 教程标题
    const titleText = this.add.text(width / 2, height / 2 - 130, '🎮 游戏说明', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    tutorialElements.push(titleText);

    const instructions = [
      '👆 滑动方块交换位置',
      '🔄 或点击选择后点击相邻方块',
      '✨ 三个相同汉字连成线消除',
      '🎵 消除时播放汉字读音'
    ];

    instructions.forEach((text, i) => {
      const instrText = this.add.text(width / 2, height / 2 - 60 + i * 38, text, {
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif',
        color: '#333333'
      }).setOrigin(0.5);
      tutorialElements.push(instrText);
    });

    // 开始按钮
    const startBtnContainer = this.add.container(width / 2, height / 2 + 120);

    const startBtnBg = this.add.graphics();
    startBtnBg.fillStyle(0x4CAF50, 1);
    startBtnBg.fillRoundedRect(-80, -28, 160, 56, 14);
    startBtnContainer.add(startBtnBg);

    const startBtnText = this.add.text(0, 0, '开始游戏', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    startBtnContainer.add(startBtnText);

    startBtnContainer.setSize(160, 56);
    startBtnContainer.setInteractive({ useHandCursor: true });

    startBtnContainer.on('pointerover', () => {
      startBtnBg.clear();
      startBtnBg.fillStyle(0x66BB6A, 1);
      startBtnBg.fillRoundedRect(-80, -28, 160, 56, 14);
    });

    startBtnContainer.on('pointerout', () => {
      startBtnBg.clear();
      startBtnBg.fillStyle(0x4CAF50, 1);
      startBtnBg.fillRoundedRect(-80, -28, 160, 56, 14);
    });

    startBtnContainer.on('pointerdown', () => {
      tutorialElements.forEach(el => el.destroy());
      startBtnContainer.destroy();
    });
  }

  async swapTiles(tile1, tile2) {
    this.isAnimating = true;
    this.comboCount = 0;

    // 记录原始位置
    const pos1 = { x: tile1.x, y: tile1.y };
    const pos2 = { x: tile2.x, y: tile2.y };
    const originalPos1 = { x: tile1.originalX, y: tile1.originalY };
    const originalPos2 = { x: tile2.originalX, y: tile2.originalY };

    // 先播放交换动画
    tile1.playSwapAnimation(pos2.x, pos2.y);
    tile2.playSwapAnimation(pos1.x, pos1.y);

    // 交换网格数据
    const temp = this.board.grid[tile1.row][tile1.col];
    this.board.grid[tile1.row][tile1.col] = this.board.grid[tile2.row][tile2.col];
    this.board.grid[tile2.row][tile2.col] = temp;

    // 检查是否会产生匹配
    const matches = this.matchDetector.findAllMatches(this.board.grid);

    if (matches.length > 0) {
      // 有效交换，更新 tiles 数组中的位置
      const tempRow = tile1.row;
      const tempCol = tile1.col;
      tile1.row = tile2.row;
      tile1.col = tile2.col;
      tile2.row = tempRow;
      tile2.col = tempCol;

      this.board.tiles[tile1.row][tile1.col] = tile1;
      this.board.tiles[tile2.row][tile2.col] = tile2;

      // 更新原始位置
      tile1.originalX = pos2.x;
      tile1.originalY = pos2.y;
      tile2.originalX = pos1.x;
      tile2.originalY = pos1.y;

      this.time.delayedCall(300, () => {
        this.processMatches();
      });
    } else {
      // 无效交换，换回网格数据
      this.board.grid[tile2.row][tile2.col] = this.board.grid[tile1.row][tile1.col];
      this.board.grid[tile1.row][tile1.col] = temp;

      // 等待交换动画完成后，播放回退动画
      this.time.delayedCall(300, () => {
        // 抖动效果
        this.tweens.add({
          targets: [tile1, tile2],
          scale: 0.9,
          duration: 50,
          yoyo: true,
          repeat: 1
        });

        // 回退动画
        tile1.playInvalidSwapAnimation(originalPos1.x, originalPos1.y);
        tile2.playInvalidSwapAnimation(originalPos2.x, originalPos2.y);

        this.time.delayedCall(300, () => {
          this.isAnimating = false;
        });
      });
    }
  }

  async processMatches() {
    let matches = this.matchDetector.findAllMatches(this.board.grid);

    while (matches.length > 0) {
      this.comboCount++;

      if (this.comboCount > 1) {
        this.audioManager.playComboSound();
      }

      // 将匹配分组成独立的匹配组
      const matchGroups = this.matchDetector.groupMatchesSequentially(matches);

      // 依次处理每一组
      for (const group of matchGroups) {
        // 播放这个汉字的读音
        this.audioManager.playCharacterSound(group.char);
        this.matchedChars.push(group.char);

        // 更新计数
        this.matchCount += group.positions.length;
        this.targetText.setText(`🎯 目标: ${this.matchCount} / ${this.levelConfig.target}`);

        // 检查是否过关
        if (this.matchCount >= this.levelConfig.target) {
          this.time.delayedCall(500, () => {
            this.showLevelComplete();
          });
        }

        // 播放匹配音效
        this.audioManager.playMatchSound();

        // 消除这组方块
        await this.animateMatchGroup(group);

        // 短暂延迟，让玩家看清消除效果
        await this.delay(150);
      }

      // 下落填充
      await this.dropAndFill();

      // 检查新的匹配
      matches = this.matchDetector.findAllMatches(this.board.grid);
    }

    // 检查是否有可行移动，如果没有则洗牌
    this.board.checkAndShuffle();

    this.isAnimating = false;
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }

  // 消除一组匹配
  animateMatchGroup(group) {
    return new Promise(resolve => {
      let completed = 0;
      const total = group.positions.length;

      group.positions.forEach(pos => {
        const tile = this.board.getTileAt(pos.row, pos.col);
        if (tile) {
          tile.playMatchAnimation(() => {
            completed++;
            if (completed >= total) {
              // 清除网格数据
              group.positions.forEach(p => {
                this.board.grid[p.row][p.col] = null;
                this.board.tiles[p.row][p.col] = null;
              });
              resolve();
            }
          });
        } else {
          completed++;
          if (completed >= total) {
            resolve();
          }
        }
      });

      // 如果没有任何方块需要消除
      if (total === 0) {
        resolve();
      }
    });
  }

  animateMatches(matches) {
    return new Promise(resolve => {
      let completed = 0;
      const total = matches.length;

      if (total === 0) {
        resolve();
        return;
      }

      matches.forEach(match => {
        const tile = this.board.getTileAt(match.row, match.col);
        if (tile) {
          tile.playMatchAnimation(() => {
            completed++;
            if (completed >= total) {
              matches.forEach(m => {
                this.board.grid[m.row][m.col] = null;
                this.board.tiles[m.row][m.col] = null;
              });
              resolve();
            }
          });
        } else {
          completed++;
          if (completed >= total) {
            resolve();
          }
        }
      });
    });
  }

  async dropAndFill() {
    return new Promise(resolve => {
      const boardSize = this.levelConfig.boardSize;
      const animations = [];

      for (let col = 0; col < boardSize; col++) {
        let emptySpaces = 0;

        for (let row = boardSize - 1; row >= 0; row--) {
          if (this.board.grid[row][col] === null) {
            emptySpaces++;
          } else if (emptySpaces > 0) {
            const tile = this.board.getTileAt(row, col);
            const newRow = row + emptySpaces;

            if (tile) {
              this.board.grid[newRow][col] = this.board.grid[row][col];
              this.board.grid[row][col] = null;
              this.board.tiles[newRow][col] = tile;
              this.board.tiles[row][col] = null;
              tile.row = newRow;

              const targetY = this.board.offset + newRow * this.board.tileSize;
              tile.originalY = targetY;
              animations.push(new Promise(res => {
                tile.playFallAnimation(targetY, 0, res);
              }));
            }
          }
        }

        for (let i = 0; i < emptySpaces; i++) {
          const row = emptySpaces - 1 - i;
          const char = this.board.characters[Math.floor(Math.random() * this.board.characters.length)];
          this.board.grid[row][col] = char;

          const x = this.board.offset + col * this.board.tileSize;
          const startY = this.board.offset - (i + 1) * this.board.tileSize;
          const targetY = this.board.offset + row * this.board.tileSize;

          const tile = new Tile(this, x, startY, char, this.board.tileSize);
          tile.row = row;
          tile.col = col;
          tile.originalX = x;
          tile.originalY = targetY;

          this.board.tiles[row][col] = tile;
          this.board.add(tile);

          animations.push(new Promise(res => {
            tile.playFallAnimation(targetY, i * 50, res);
          }));
        }
      }

      Promise.all(animations).then(() => {
        resolve();
      });
    });
  }

  showLevelComplete() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.audioManager.playWinSound();

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    const completeBg = this.add.graphics();
    completeBg.fillStyle(0xFFFFFF, 1);
    completeBg.fillRoundedRect(width / 2 - 180, height / 2 - 150, 360, 300, 25);
    completeBg.fillStyle(0xFF9800, 1);
    completeBg.fillRoundedRect(width / 2 - 180, height / 2 - 150, 360, 60, { tl: 25, tr: 25, bl: 0, br: 0 });

    this.add.text(width / 2, height / 2 - 120, '🎉 恭喜过关！', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 40, `✨ 消除了 ${this.matchCount} 个汉字`, {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#333333'
    }).setOrigin(0.5);

    const uniqueChars = [...new Set(this.matchedChars)].slice(0, 6).join(' ');
    this.add.text(width / 2, height / 2 + 10, `📚 学习了: ${uniqueChars}`, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#FF9800'
    }).setOrigin(0.5);

    const nextBtn = this.add.container(width / 2, height / 2 + 90);

    const nextBtnBg = this.add.graphics();
    nextBtnBg.fillStyle(0x4CAF50, 1);
    nextBtnBg.fillRoundedRect(-80, -28, 160, 56, 14);
    nextBtn.add(nextBtnBg);

    const nextBtnText = this.add.text(0, 0, '下一关 →', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    nextBtn.add(nextBtnText);

    nextBtn.setSize(160, 56);
    nextBtn.setInteractive({ useHandCursor: true });
    nextBtn.on('pointerup', () => {
      this.scene.restart({ level: this.currentLevel + 1 });
    });
  }
}
