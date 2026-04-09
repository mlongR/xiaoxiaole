import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 显示加载进度
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      font: '20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x4CAF50, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 忽略加载错误，继续游戏
    this.load.on('loaderror', (file) => {
      console.log(`[提示] 资源加载失败（可忽略）: ${file.key}`);
    });

    // 加载所有汉字读音音频
    const pinyinList = [
      // 第1关：数字
      'yi', 'er', 'san', 'si', 'wu',
      // 第2关：自然
      'tian', 'di', 'ri', 'yue', 'shui', 'huo',
      // 第3关：身体
      'ren', 'kou', 'shou', 'zu', 'mu', 'err',
      // 第4关：颜色
      'hong', 'huang', 'lan', 'lv', 'bai', 'hei',
      // 第5关：动物
      'niao', 'yu', 'chong', 'ma', 'niu', 'yang', 'quan',
      // 第6关：食物
      'mi', 'mian', 'guo', 'cai', 'rou', 'dan', 'dou',
      // 第7关：家庭
      'ba', 'maa', 'ye', 'nai', 'ge', 'jie', 'dii',
      // 第8关：动作
      'zou', 'pao', 'tiao', 'zuo', 'zhan', 'shui', 'chi', 'he',
      // 第9关：形容词
      'da', 'xiao', 'duo', 'shao', 'gao', 'diii', 'kuai', 'man'
    ];
    pinyinList.forEach(pinyin => {
      this.load.audio(`audio_${pinyin}`, `assets/audio/pinyin/${pinyin}.mp3`);
    });

    // 加载音效
    try {
      this.load.audio('match', 'assets/audio/effects/match.mp3');
      this.load.audio('combo', 'assets/audio/effects/combo.mp3');
      this.load.audio('click', 'assets/audio/effects/click.mp3');
      this.load.audio('win', 'assets/audio/effects/win.mp3');
    } catch (e) {
      // 忽略加载错误
    }
  }

  create() {
    this.scene.start('MenuScene');
  }
}
