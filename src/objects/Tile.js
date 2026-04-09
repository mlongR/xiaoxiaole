import Phaser from 'phaser';

// 漂亮的颜色配置
const TILE_COLORS = [
  { bg: 0xFFCDD2, border: 0xE57373, text: '#C62828' },
  { bg: 0xF8BBD9, border: 0xEC407A, text: '#AD1457' },
  { bg: 0xE1BEE7, border: 0xAB47BC, text: '#6A1B9A' },
  { bg: 0xC5CAE9, border: 0x5C6BC0, text: '#283593' },
  { bg: 0xBBDEFB, border: 0x42A5F5, text: '#1565C0' },
  { bg: 0xB2EBF2, border: 0x26C6DA, text: '#00838F' },
  { bg: 0xB2DFDB, border: 0x26A69A, text: '#00695C' },
  { bg: 0xC8E6C9, border: 0x66BB6A, text: '#2E7D32' },
  { bg: 0xDCEDC8, border: 0x9CCC65, text: '#558B2F' },
  { bg: 0xFFF9C4, border: 0xFFEE58, text: '#F9A825' },
  { bg: 0xFFE0B2, border: 0xFFA726, text: '#EF6C00' },
  { bg: 0xFFCCBC, border: 0xFF7043, text: '#D84315' },
  { bg: 0xD7CCC8, border: 0x8D6E63, text: '#4E342E' },
  { bg: 0xCFD8DC, border: 0x78909C, text: '#37474F' },
  { bg: 0xF3E5F5, border: 0xBA68C8, text: '#7B1FA2' },
  { bg: 0xEDE7F6, border: 0x9575CD, text: '#512DA8' },
];

const charColorMap = new Map();
let nextColorIndex = 0;

export default class Tile extends Phaser.GameObjects.Container {
  constructor(scene, x, y, char, tileSize) {
    super(scene, x, y);

    this.char = char;
    this.tileSize = tileSize;
    this.row = 0;
    this.col = 0;
    this.isSelected = false;
    this.isMatched = false;
    this.isDragging = false;
    this.hasSwapped = false; // 是否已经执行了滑动交换

    // 原始位置（用于回退）
    this.originalX = x;
    this.originalY = y;

    // 为汉字分配唯一颜色
    let colorIndex;
    if (charColorMap.has(char)) {
      colorIndex = charColorMap.get(char);
    } else {
      colorIndex = nextColorIndex % TILE_COLORS.length;
      charColorMap.set(char, colorIndex);
      nextColorIndex++;
    }
    this.colorConfig = TILE_COLORS[colorIndex];

    // 背景格子
    this.bg = scene.add.graphics();
    this.drawBackground(this.colorConfig.bg, this.colorConfig.border);
    this.add(this.bg);

    // 汉字文本
    this.charText = scene.add.text(0, 0, char, {
      fontSize: `${tileSize * 0.5}px`,
      fontFamily: 'Microsoft YaHei, Arial, sans-serif',
      color: this.colorConfig.text,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(this.charText);

    // 选中效果边框
    this.selectedBorder = scene.add.graphics();
    this.selectedBorder.setVisible(false);
    this.add(this.selectedBorder);

    // 发光效果
    this.glow = scene.add.graphics();
    this.glow.setVisible(false);
    this.addAt(this.glow, 0);

    // 可交互
    const hitArea = tileSize * 0.95;
    this.setSize(hitArea, hitArea);
    this.setInteractive({ useHandCursor: true, draggable: true });

    // 拖拽相关
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragThreshold = tileSize * 0.25;

    // 指针按下事件
    this.on('pointerdown', (pointer) => {
      if (this.scene.isAnimating) return;
      this.isDragging = false;
      this.hasSwapped = false;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
      this.originalX = this.x;
      this.originalY = this.y;
    });

    // 拖拽事件
    this.on('drag', (pointer, dragX, dragY) => {
      if (this.scene.isAnimating || this.hasSwapped) return;

      const deltaX = pointer.x - this.dragStartX;
      const deltaY = pointer.y - this.dragStartY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > this.dragThreshold && !this.isDragging) {
        this.isDragging = true;

        // 确定滑动方向
        let direction = null;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        // 通知 Board 处理滑动交换
        if (this.parentContainer && this.parentContainer.handleSwipe) {
          this.hasSwapped = true;
          this.parentContainer.handleSwipe(this, direction);
        }
      }
    });

    // 指针抬起事件 - 处理点击选择
    this.on('pointerup', (pointer) => {
      if (this.scene.isAnimating) return;

      // 如果没有拖拽（是点击操作）
      if (!this.isDragging && !this.hasSwapped) {
        // 调用 Board 的点击处理
        if (this.parentContainer && this.parentContainer.handleTileClick) {
          this.parentContainer.handleTileClick(this);
        }
      }
    });

    // 拖拽结束事件
    this.on('dragend', () => {
      // 如果没有执行交换，回到原位
      if (!this.hasSwapped) {
        this.snapBackToOriginal();
      }
    });

    // 悬停效果
    this.on('pointerover', () => {
      if (!this.isSelected && !this.isMatched && !this.isDragging) {
        this.drawBackground(this.colorConfig.bg, this.colorConfig.border, true);
      }
    });

    this.on('pointerout', () => {
      if (!this.isSelected && !this.isMatched && !this.isDragging) {
        this.drawBackground(this.colorConfig.bg, this.colorConfig.border, false);
      }
    });
  }

  snapBackToOriginal() {
    this.scene.tweens.add({
      targets: this,
      x: this.originalX,
      y: this.originalY,
      duration: 150,
      ease: 'Power2'
    });
  }

  drawBackground(fillColor, strokeColor, isHover = false) {
    const size = this.tileSize * 0.88;
    const radius = 12;
    this.bg.clear();

    if (!isHover) {
      this.bg.fillStyle(0x000000, 0.1);
      this.bg.fillRoundedRect(-size / 2 + 3, -size / 2 + 3, size, size, radius);
    }

    this.bg.fillStyle(fillColor, 1);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, radius);

    this.bg.lineStyle(isHover ? 4 : 3, strokeColor, 1);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, radius);

    if (isHover) {
      this.bg.lineStyle(2, 0xFFFFFF, 0.5);
      this.bg.strokeRoundedRect(-size / 2 + 2, -size / 2 + 2, size - 4, size / 2, { tl: radius - 2, tr: radius - 2, bl: 0, br: 0 });
    }
  }

  select() {
    this.isSelected = true;
    this.drawBackground(0xFFFFCC, this.colorConfig.border);

    this.glow.clear();
    this.glow.fillStyle(0xFFFF00, 0.3);
    const size = this.tileSize * 1.1;
    this.glow.fillCircle(0, 0, size / 2);
    this.glow.setVisible(true);

    this.selectedBorder.clear();
    this.selectedBorder.lineStyle(4, 0xFF5722, 1);
    const borderSize = this.tileSize * 0.95;
    this.selectedBorder.strokeRoundedRect(-borderSize / 2, -borderSize / 2, borderSize, borderSize, 14);
    this.selectedBorder.setVisible(true);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 150,
      ease: 'Back.easeOut'
    });
  }

  deselect() {
    this.isSelected = false;
    this.glow.setVisible(false);
    this.selectedBorder.setVisible(false);
    this.drawBackground(this.colorConfig.bg, this.colorConfig.border);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: 'Power2'
    });
  }

  playMatchAnimation(callback) {
    this.isMatched = true;

    const glow = this.scene.add.graphics();
    glow.fillStyle(0xFFFF00, 0.6);
    glow.fillCircle(0, 0, this.tileSize * 0.8);
    this.addAt(glow, 0);

    for (let i = 0; i < 6; i++) {
      const star = this.scene.add.text(0, 0, '✨', { fontSize: '20px' }).setOrigin(0.5);
      star.setAlpha(0);
      this.add(star);

      const angle = (i / 6) * Math.PI * 2;
      const distance = this.tileSize * 1.5;
      this.scene.tweens.add({
        targets: star,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        alpha: 1,
        scale: { from: 0.5, to: 1.2 },
        duration: 400,
        delay: 100,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });
    }

    this.scene.tweens.add({
      targets: glow,
      alpha: 0.8,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      yoyo: true,
      repeat: 1
    });

    this.scene.tweens.add({
      targets: this.charText,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 350,
      ease: 'Power2'
    });

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }

  playSwapAnimation(targetX, targetY, callback) {
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: 280, // 增加动画时间
      ease: 'Power2',
      onComplete: callback
    });
  }

  playFallAnimation(targetY, delay, callback) {
    this.scene.tweens.add({
      targets: this,
      y: targetY,
      duration: 400, // 增加动画时间
      delay: delay,
      ease: 'Bounce.easeOut',
      onComplete: callback
    });
  }

  // 播放无效交换的回退动画
  playInvalidSwapAnimation(originalX, originalY, callback) {
    this.scene.tweens.add({
      targets: this,
      x: originalX,
      y: originalY,
      duration: 280, // 增加动画时间
      ease: 'Power2',
      onComplete: callback
    });
  }
}

export function resetColorMap() {
  charColorMap.clear();
  nextColorIndex = 0;
}
