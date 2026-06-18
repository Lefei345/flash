# Flash — AI 开发助手指引

## 项目概述

Flash 是一个极简念头捕捉器 iOS App。
- **核心理念**：不给大脑留负担
- **三大功能**：语音丢念头 → 念头流列表 → 24小时自动消失
- **目标用户**：任何被碎片想法困扰的人

## 关键文件路径

| 文件 | 路径 | 说明 |
|------|------|------|
| 产品需求 | [docs/requirements.md](docs/requirements.md) | 功能定义、用户故事、范围边界 |
| 技术规格 | [docs/tech-spec.md](docs/tech-spec.md) | 技术栈、数据模型、核心逻辑 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 色彩、字体、布局、动效 |
| 执行计划 | [docs/execution-plan.md](docs/execution-plan.md) | 分阶段执行步骤 |
| 开发日志 | [devlog/](devlog/) | 每日开发记录 |

## 工作原则

1. **阶段制开发**：严格按照 `docs/execution-plan.md` 中的阶段顺序执行，一次只做一个阶段
2. **阶段完成后暂停**：每个阶段完成后等待用户确认，再进入下一阶段
3. **每日日志**：每次开始工作前，查看 `devlog/` 中最新的日志了解进度；结束前更新当天的开发日志
4. **规范先行**：修改代码前先阅读 `docs/` 中对应的规范文件
5. **稳定优先**：每个阶段结束时 App 必须可以正常运行，不做破坏性改动
6. **简单直接**：代码以清晰为首要目标，不过早优化，不过度抽象

## 启动流程

每次被调用时：
1. 阅读 `devlog/` 中最新日期的日志，了解当前进度
2. 阅读 `docs/execution-plan.md`，确定当前应执行的阶段
3. 向用户确认后开始工作

## 技术栈速查

- React Native + Expo (TypeScript)
- expo-av（语音录制）
- expo-speech-recognition（语音转文字）
- expo-sqlite（本地存储）
- react-native-reanimated + react-native-gesture-handler（动画与手势）
