import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  width: 720,
  height: 900,
  resolution: window.devicePixelRatio || 1,
  backgroundColor: '#FFF8E7',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 360,
      height: 450
    },
    max: {
      width: 1080,
      height: 1350
    }
  },
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true
  },
  scene: [BootScene, MenuScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  audio: {
    disableWebAudio: false
  }
};

const game = new Phaser.Game(config);

// 隐藏加载界面
window.addEventListener('load', () => {
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.opacity = '0';
      loading.style.transition = 'opacity 0.5s';
      setTimeout(() => loading.remove(), 500);
    }
  }, 500);
});
