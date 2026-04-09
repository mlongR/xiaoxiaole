import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 背景渐变效果
    const graphics = this.add.graphics();
    for (let i = 0; i < height; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 255, g: 235, b: 200 },
        { r: 255, g: 200, b: 120 },
        height, i
      );
      graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
      graphics.fillRect(0, i, width, 1);
    }

    // 装饰性背景圆圈
    for (let i = 0; i < 10; i++) {
      const circle = this.add.graphics();
      circle.fillStyle(0xFFFFFF, 0.12);
      circle.fillCircle(
        Math.random() * width,
        Math.random() * height,
        40 + Math.random() * 60
      );
    }

    // 标题
    this.add.text(width / 2 + 3, 93, '识字消消乐', {
      fontSize: '56px',
      fontFamily: 'Arial, sans-serif',
      color: '#000000'
    }).setOrigin(0.5).setAlpha(0.15);

    const title = this.add.text(width / 2, 90, '识字消消乐', {
      fontSize: '56px',
      fontFamily: 'Arial, sans-serif',
      color: '#FF5722',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 标题动画
    this.tweens.add({
      targets: title,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 副标题
    this.add.text(width / 2, 155, '📚 在游戏中快乐学习汉字', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#5D4037'
    }).setOrigin(0.5);

    // 可爱的动物装饰
    const decorations = [
      { emoji: '🐼', x: 80, y: 280 },
      { emoji: '🐰', x: width - 80, y: 300 },
      { emoji: '🦊', x: 100, y: height - 200 },
      { emoji: '🐻', x: width - 90, y: height - 180 },
    ];

    decorations.forEach(dec => {
      const text = this.add.text(dec.x, dec.y, dec.emoji, {
        fontSize: '44px'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: text,
        y: dec.y - 15,
        duration: 1800 + Math.random() * 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // 开始按钮
    this.createButton(width / 2, 400, '🎮 开始游戏', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene', { level: 1 });
      });
    }, 0x4CAF50, 0x388E3C);

    // 选择关卡按钮
    this.createButton(width / 2, 490, '📖 选择关卡', () => {
      this.scene.start('GameScene', { level: 1 });
    }, 0xFF9800, 0xF57C00);

    // 说明区域背景
    const infoBg = this.add.graphics();
    infoBg.fillStyle(0xFFFFFF, 0.5);
    infoBg.fillRoundedRect(width / 2 - 200, 570, 400, 150, 20);

    // 说明标题
    this.add.text(width / 2, 595, '🎯 游戏玩法', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#5D4037',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 说明文字
    const instructions = [
      '👆 滑动方块交换位置',
      '🔄 三个相同汉字连成线消除',
      '🎵 消除时播放汉字读音',
      '🎯 达到目标即可过关'
    ];

    instructions.forEach((text, i) => {
      this.add.text(width / 2, 630 + i * 28, text, {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#6D4C41'
      }).setOrigin(0.5);
    });

    // 底部版权
    this.add.text(width / 2, height - 40, '❤️ 专为儿童设计的汉字学习游戏', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#8D6E63'
    }).setOrigin(0.5);

    // 淡入效果
    this.cameras.main.fadeIn(300);
  }

  createButton(x, y, text, callback, bgColor, hoverColor) {
    const button = this.add.container(x, y);

    // 按钮阴影
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.15);
    shadow.fillRoundedRect(-142, -32, 284, 68, 18);
    button.add(shadow);

    // 按钮背景
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-140, -35, 280, 70, 16);
    button.add(bg);

    // 按钮文字
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    button.add(buttonText);

    // 交互
    button.setSize(280, 70);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(hoverColor, 1);
      bg.fillRoundedRect(-140, -35, 280, 70, 16);
      this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(-140, -35, 280, 70, 16);
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });

    button.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(0x000000, 0.2);
      bg.fillRoundedRect(-138, -33, 276, 66, 15);
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(-138, -33, 276, 66, 15);
    });

    button.on('pointerup', callback);

    return button;
  }
}
