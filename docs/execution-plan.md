# Flash — 分步执行计划

> 版本：v1.0 | 更新日期：2026-06-18

---

## 执行原则

1. **一次只做一个阶段**，完成后验证 → 用户确认 → 再继续
2. 每个阶段结束时 App 必须**可运行**，不做半成品提交
3. 代码优先简单直接，不过早优化

---

## 阶段总览

| 阶段 | 名称 | 预计文件数 | 目标 |
|------|------|-----------|------|
| 0 | 项目初始化 | 5 | 空白 App 能在手机上跑起来 |
| 1 | 录音按钮 | 3 | 按住能录音、松手能停 |
| 2 | 语音转文字+存储 | 4 | 说完自动存成文字 |
| 3 | 列表展示 | 3 | 看到所有念头+倒计时 |
| 4 | 删除机制 | 2 | 自动过期+手动左滑删 |
| 5 | 收尾润色 | 2 | 时长选择+触感反馈+图标 |

---

## 阶段 0：项目初始化

**目标**：创建 Expo 项目，能在 iPhone 上通过 Expo Go 扫码预览

### 步骤
1. 执行 `npx create-expo-app@latest flash-app --template blank-typescript`
2. 安装核心依赖：expo-router, expo-sqlite, expo-av, expo-speech-recognition, react-native-reanimated, react-native-gesture-handler
3. 配置 app.json（权限描述、图标等）
4. 启动开发服务器 `npx expo start`
5. 用户在 iPhone Expo Go 中扫码确认能看到 Hello World

### 验证
- ✅ `npx expo start` 启动成功
- ✅ iPhone Expo Go 扫码后显示空白页面

---

## 阶段 1：录音页面

**目标**：一个能按住录音、松手停止的页面

### 步骤
1. 创建 `src/screens/RecordScreen.tsx` — 录音主页面布局
2. 创建 `src/components/RecordButton.tsx` — 大圆形按钮，支持 onPressIn / onPressOut
3. 创建 `src/hooks/useRecorder.ts` — 封装 expo-av 录音逻辑
4. App.tsx 中渲染 RecordScreen

### 关键依赖
- `expo-av` 的 `Audio.Recording`
- `react-native-reanimated` 的缩放动画

### 验证
- ✅ 按住按钮有缩放动画 + 颜色变化
- ✅ 松手后动画恢复
- ✅ 控制台能打印录音文件路径（本阶段不处理文字转换）

---

## 阶段 2：语音转文字 + 存储

**目标**：录音 → 自动转文字 → 写入 SQLite

### 步骤
1. 创建 `src/db/database.ts` — 初始化 SQLite，建表
2. 在 useRecorder 中集成 expo-speech-recognition
3. 录音结束后自动调语音识别
4. 识别结果写入 thoughts 表
5. 成功后显示简单提示

### 关键依赖
- `expo-speech-recognition`
- `expo-sqlite`

### 验证
- ✅ 说一句话 → 松手 → 文字出现在数据库中
- ✅ 数据库表结构正确

---

## 阶段 3：列表页面

**目标**：展示所有未过期的念头，实时倒计时

### 步骤
1. 创建 `src/screens/ListScreen.tsx`
2. 创建 `src/components/ThoughtItem.tsx` — 单条念头卡片
3. 创建 `src/hooks/useCountdown.ts` — 倒计时 Hook（每秒更新）
4. 配置页面间导航（RecordScreen ↔ ListScreen）

### 验证
- ✅ 列表按时间倒序显示
- ✅ 每条显示文字 + 实时倒计时
- ✅ 空状态显示引导文案
- ✅ 两个页面可以来回切换

---

## 阶段 4：删除机制

**目标**：自动过期删除 + 手动左滑删除

### 步骤
1. 在 App 启动/回前台时执行过期清理
2. 列表查询只取未过期记录
3. 实现左滑手势删除（react-native-gesture-handler Swipeable）

### 验证
- ✅ 过期记录不会出现在列表中
- ✅ 左滑露出删除按钮，点击可删除
- ✅ 删除有动画

---

## 阶段 5：收尾润色

**目标**：完整的用户体验

### 步骤
1. 创建 `src/components/DurationPicker.tsx` — 消失时间胶囊选择器
2. 录音完成后加入 haptic feedback
3. 配置 App 图标和启动屏颜色
4. 整体 UI 走查，对齐设计规范
5. README 更新

### 验证
- ✅ 可选择不同消失时长
- ✅ 录音有震动反馈
- ✅ 视觉与设计规范一致
