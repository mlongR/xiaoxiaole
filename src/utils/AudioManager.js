export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.characterMap = {
      '一': 'yi',
      '二': 'er',
      '三': 'san',
      '四': 'si',
      '五': 'wu',
      '天': 'tian',
      '地': 'di',
      '日': 'ri',
      '月': 'yue',
      '水': 'shui',
      '火': 'huo',
      '人': 'ren',
      '口': 'kou',
      '手': 'shou',
      '足': 'zu',
      '目': 'mu',
      '耳': 'err',
      '红': 'hong',
      '黄': 'huang',
      '蓝': 'lan',
      '绿': 'lv',
      '白': 'bai',
      '黑': 'hei',
      '鸟': 'niao',
      '鱼': 'yu',
      '虫': 'chong',
      '马': 'ma',
      '牛': 'niu',
      '羊': 'yang',
      '犬': 'quan',
      '米': 'mi',
      '面': 'mian',
      '果': 'guo',
      '菜': 'cai',
      '肉': 'rou',
      '蛋': 'dan',
      '豆': 'dou',
      '爸': 'ba',
      '妈': 'maa',
      '爷': 'ye',
      '奶': 'nai',
      '哥': 'ge',
      '姐': 'jie',
      '弟': 'dii',
      '走': 'zou',
      '跑': 'pao',
      '跳': 'tiao',
      '坐': 'zuo',
      '站': 'zhan',
      '睡': 'shui',
      '吃': 'chi',
      '喝': 'he',
      '大': 'da',
      '小': 'xiao',
      '多': 'duo',
      '少': 'shao',
      '高': 'gao',
      '低': 'diii',
      '快': 'kuai',
      '慢': 'man'
    };
  }

  /**
   * 播放汉字读音
   * @param {string} char - 汉字
   */
  playCharacterSound(char) {
    const pinyin = this.characterMap[char];
    if (pinyin) {
      const audioKey = `audio_${pinyin}`;
      try {
        if (this.scene.cache.audio.exists(audioKey)) {
          this.scene.sound.play(audioKey, { volume: 0.8 });
        } else {
          // 音频文件不存在，静默处理
          console.log(`[提示] 音频文件缺失: ${audioKey} (${char})`);
        }
      } catch (e) {
        console.log(`[提示] 音频播放失败: ${char}`);
      }
    }
  }

  /**
   * 播放匹配音效
   */
  playMatchSound() {
    try {
      if (this.scene.cache.audio.exists('match')) {
        this.scene.sound.play('match', { volume: 0.6 });
      }
    } catch (e) {
      // 静默处理
    }
  }

  /**
   * 播放连击音效
   */
  playComboSound() {
    try {
      if (this.scene.cache.audio.exists('combo')) {
        this.scene.sound.play('combo', { volume: 0.7 });
      }
    } catch (e) {
      // 静默处理
    }
  }

  /**
   * 播放点击音效
   */
  playClickSound() {
    try {
      if (this.scene.cache.audio.exists('click')) {
        this.scene.sound.play('click', { volume: 0.5 });
      }
    } catch (e) {
      // 静默处理
    }
  }

  /**
   * 播放胜利音效
   */
  playWinSound() {
    try {
      if (this.scene.cache.audio.exists('win')) {
        this.scene.sound.play('win', { volume: 0.8 });
      }
    } catch (e) {
      // 静默处理
    }
  }
}
