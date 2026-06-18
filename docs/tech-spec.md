# Flash — 技术规格文档

> 版本：v1.0 | 更新日期：2026-06-18

---

## 一、技术栈

| 层级 | 选型 | 原因 |
|------|------|------|
| 框架 | React Native + Expo | 跨平台、热更新、Expo Go 扫码预览 |
| 语言 | TypeScript | 类型安全，减少低级错误 |
| 语音录制 | expo-av | Expo 官方音频库，稳定可靠 |
| 语音转文字 | expo-speech-recognition | Expo 官方方案，iOS 原生支持 |
| 本地存储 | expo-sqlite | 结构化数据，支持过期查询 |
| 路由 | expo-router | Expo 官方文件路由 |
| 动画 | react-native-reanimated | 流畅的按住反馈和列表动画 |

---

## 二、依赖清单

```json
{
  "expo": "~52.x",
  "expo-av": "~15.x",
  "expo-speech-recognition": "~2.x",
  "expo-sqlite": "~15.x",
  "expo-router": "~4.x",
  "react-native-reanimated": "~3.x",
  "react-native-gesture-handler": "~2.x"
}
```

---

## 三、数据模型

### thoughts 表

```sql
CREATE TABLE IF NOT EXISTS thoughts (
  id TEXT PRIMARY KEY,          -- UUID
  content TEXT NOT NULL,         -- 语音转文字后的文本
  created_at INTEGER NOT NULL,   -- 创建时间戳 (ms)
  expires_at INTEGER NOT NULL,   -- 过期时间戳 (ms)
  duration_hours REAL NOT NULL   -- 存活时长 (1/6/24/72)
);
```

### 过期时间选项

```typescript
const DURATION_OPTIONS = [
  { label: '1小时', hours: 1 },
  { label: '6小时', hours: 6 },
  { label: '24小时', hours: 24, default: true },
  { label: '3天', hours: 72 },
];
```

---

## 四、核心逻辑

### 自动删除机制

```
App 启动 → 扫描 thoughts 表 → DELETE WHERE expires_at < now()
App 从后台切回前台 → 同上扫描删除
列表页渲染时 → 只查询 expires_at > now() 的记录
```

无需后台定时器，利用 App 生命周期即可完成清理。

### 倒计时计算

```typescript
// 剩余毫秒 → "X小时Y分钟后自动消失"
function formatCountdown(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return '即将消失';
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  if (hours === 0) return `${minutes}分钟后自动消失`;
  return `${hours}小时${minutes}分钟后自动消失`;
}
```

---

## 五、语音流程

```
按住按钮 → expo-av 开始录音
         → 按钮视觉放大 + 淡蓝波纹动画
松手     → expo-av 停止录音
         → 音频传给 expo-speech-recognition
         → 返回文字
         → 写入 SQLite
         → 跳转列表页（或 Toast 提示成功）
```

### 权限

- 麦克风权限：`app.json` 中配置 `NSMicrophoneUsageDescription`
- 语音识别权限：`NSSpeechRecognitionUsageDescription`

---

## 六、项目结构

```
app/
├── app.json
├── App.tsx
├── package.json
├── tsconfig.json
├── src/
│   ├── screens/
│   │   ├── RecordScreen.tsx    # 录音页
│   │   └── ListScreen.tsx      # 列表页
│   ├── components/
│   │   ├── RecordButton.tsx    # 大录音按钮
│   │   ├── ThoughtItem.tsx     # 单条念头
│   │   └── DurationPicker.tsx  # 消失时间选择器
│   ├── db/
│   │   └── database.ts         # SQLite 初始化 + 查询
│   ├── hooks/
│   │   ├── useRecorder.ts      # 录音逻辑
│   │   └── useCountdown.ts     # 倒计时 hook
│   └── utils/
│       └── format.ts           # 格式化工具函数
```

---

## 七、开发环境

- Node.js 18+
- Expo CLI
- Expo Go App（安装在 iPhone 上用于预览）
- VS Code
