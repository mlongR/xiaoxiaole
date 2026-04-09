# -*- coding: utf-8 -*-
"""
汉字音频生成脚本 - 使用百度智能云语音合成

使用方法:
1. 安装依赖: pip install baidu-aip
2. 注册百度智能云账号: https://cloud.baidu.com/
3. 创建语音合成应用，获取 APP_ID, API_KEY, SECRET_KEY
4. 将密钥填入下方配置区域
5. 运行: python generate_audio.py
"""

from aip import AipSpeech
import os

# ========== 填入你的密钥 ==========
APP_ID = '7614665'
API_KEY = 'U0924ICnVMjAd9vhenFUiaSC'
SECRET_KEY = '5BKwFafPQakG8FnJldjiH7ZBJ7PTU4Hv'
# ================================

# 创建客户端
client = AipSpeech(APP_ID, API_KEY, SECRET_KEY)

# 所有需要的汉字（按关卡分组）
all_chars = [
    # 第1关：数字
    '一', '二', '三', '四', '五',
    # 第2关：自然
    '天', '地', '日', '月', '水', '火',
    # 第3关：身体
    '人', '口', '手', '足', '目', '耳',
    # 第4关：颜色
    '红', '黄', '蓝', '绿', '白', '黑',
    # 第5关：动物
    '鸟', '鱼', '虫', '马', '牛', '羊', '犬',
    # 第6关：食物
    '米', '面', '果', '菜', '肉', '蛋', '豆',
    # 第7关：家庭
    '爸', '妈', '爷', '奶', '哥', '姐', '弟',
    # 第8关：动作
    '走', '跑', '跳', '坐', '站', '睡', '吃', '喝',
    # 第9关：形容词
    '大', '小', '多', '少', '高', '低', '快', '慢'
]

# 汉字到拼音的映射
pinyin_map = {
    # 数字
    '一': 'yi', '二': 'er', '三': 'san', '四': 'si', '五': 'wu',
    # 自然
    '天': 'tian', '地': 'di', '日': 'ri', '月': 'yue', '水': 'shui', '火': 'huo',
    # 身体
    '人': 'ren', '口': 'kou', '手': 'shou', '足': 'zu', '目': 'mu', '耳': 'err',
    # 颜色
    '红': 'hong', '黄': 'huang', '蓝': 'lan', '绿': 'lv', '白': 'bai', '黑': 'hei',
    # 动物
    '鸟': 'niao', '鱼': 'yu', '虫': 'chong', '马': 'ma', '牛': 'niu', '羊': 'yang', '犬': 'quan',
    # 食物
    '米': 'mi', '面': 'mian', '果': 'guo', '菜': 'cai', '肉': 'rou', '蛋': 'dan', '豆': 'dou',
    # 家庭
    '爸': 'ba', '妈': 'maa', '爷': 'ye', '奶': 'nai', '哥': 'ge', '姐': 'jie', '弟': 'dii',
    # 动作
    '走': 'zou', '跑': 'pao', '跳': 'tiao', '坐': 'zuo', '站': 'zhan', '睡': 'shui', '吃': 'chi', '喝': 'he',
    # 形容词
    '大': 'da', '小': 'xiao', '多': 'duo', '少': 'shao', '高': 'gao', '低': 'diii', '快': 'kuai', '慢': 'man'
}

# 确保目录存在
output_dir = 'assets/audio/pinyin'
os.makedirs(output_dir, exist_ok=True)

# 批量生成
success = 0
skipped = 0
failed = []

print('=' * 50)
print('汉字音频生成器')
print('=' * 50)
print()

for i, char in enumerate(all_chars, 1):
    pinyin = pinyin_map.get(char, char)
    output_path = os.path.join(output_dir, f'{pinyin}.mp3')

    # 如果文件已存在，跳过
    if os.path.exists(output_path):
        print(f'[{i}/{len(all_chars)}] 跳过: {char} ({pinyin}.mp3 已存在)')
        skipped += 1
        continue

    # 调用百度语音合成
    result = client.synthesis(char, 'zh', 1, {
        'vol': 5,    # 音量 (0-15)
        'pit': 10,    # 音调 (0-15)，稍高更儿童化
        'spd': 2,    # 语速 (0-15)，稍慢便于学习
        'per': 103     # 发音人：4=情感女声-小美（儿童友好）
    })

    # 保存文件
    if not isinstance(result, dict):
        with open(output_path, 'wb') as f:
            f.write(result)
        print(f'[{i}/{len(all_chars)}] ✓ 生成: {char} -> {pinyin}.mp3')
        success += 1
    else:
        error_msg = result.get('err_msg', '未知错误') if isinstance(result, dict) else '未知错误'
        print(f'[{i}/{len(all_chars)}] ✗ 失败: {char} - {error_msg}')
        failed.append(char)

print()
print('=' * 50)
print(f'生成完成!')
print(f'  成功: {success}')
print(f'  跳过: {skipped}')
print(f'  失败: {len(failed)}')
if failed:
    print(f'  失败的汉字: {", ".join(failed)}')
print('=' * 50)
