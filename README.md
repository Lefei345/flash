# ⚡ Flash — 极简念头捕捉器

> 按住说话，松手就存。24 小时后自动消失。

## 🎯 核心理念

想到什么说什么。不重要的自然消失，重要的自然会处理。不给大脑留负担。

## ✨ 功能

- 🎤 **语音输入** — 按住说话 → 自动转文字 → 编辑确认 → 保存
- ⌨️ **打字输入** — 安静环境下直接打字
- 📋 **念头流** — 按紧急度排序，可置顶，可标记完成
- ⏰ **智能时间** — 预设 / 明天几点 / 自选年月日时分
- ⚠️ **到期提醒** — 震动 + 提示音 + 弹窗
- 🎨 **自定义背景色** — 6 色可选
- ← → **左右滑动** — 切换页面

## 🛠 技术栈

| 层 | 技术 |
|---|---|
| 框架 | React Native + Expo SDK 54 |
| 语言 | TypeScript |
| 语音 | expo-audio（录音）+ 百度语音 API（转文字） |
| 存储 | expo-sqlite（本地，无需联网） |
| 提醒 | expo-notifications + 自定义 WAV 提示音 |
| 动画 | Animated + PanResponder |

## 📱 运行

```bash
npm install
npx expo start
```

用 Expo Go 扫码即可预览。

## 📂 项目结构

```
app/
├── App.tsx                    # 主入口，页面路由 + 到期提醒
├── src/
│   ├── screens/
│   │   ├── RecordScreen.tsx   # 录音页（语音/打字/时间选择）
│   │   └── ListScreen.tsx     # 念头流（排序/置顶/删除）
│   ├── components/
│   │   ├── RecordButton.tsx   # 大圆形录音按钮
│   │   ├── ThoughtItem.tsx    # 单条念头卡片
│   │   ├── DurationPicker.tsx # 时间选择器
│   │   └── BgColorPicker.tsx  # 背景色选择
│   ├── hooks/
│   │   ├── useRecorder.ts     # 录音逻辑
│   │   └── useCountdown.ts    # 倒计时
│   ├── db/
│   │   └── database.ts        # SQLite 数据层
│   └── utils/
│       ├── transcribe.ts      # 百度语音 API 调用
│       ├── notifications.ts   # 本地通知
│       └── alertSound.ts      # 提示音生成
└── docs/                      # 产品/技术/设计文档
```

## 👤 作者

Lefei— 一个不想给大脑留负担的人
