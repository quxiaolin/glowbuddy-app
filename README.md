# GlowBuddy 电子宠物 App

一个可爱的电子宠物养成应用，结合了互动、经济系统和 AI 对话功能。

## 修复说明

### 解决的加载问题
- 修复了主屏幕可能卡在加载状态的问题
- 优化了数据库初始化流程，确保数据库正确初始化后才显示内容
- 改进了错误处理机制，即使初始化失败也会显示默认界面
- 添加了应用启动时的资源预加载

## 功能特性

- **互动宠物**：可爱的虚拟宠物，会根据状态显示不同心情
- **心情系统**：宠物有开心、一般、难过三种心情，对应不同颜色
- **经济系统**：金币奖励、商店购物、喂食消耗
- **AI 对话**：与宠物进行智能对话（每日限制30次）
- **本地存储**：使用 SQLite 存储所有用户数据

## 技术栈

- React Native (Expo)
- TypeScript
- Lottie 动画
- SQLite (本地数据库)
- OpenAI API (GPT-4o mini)

## 安装与运行

1. 确保已安装 Node.js 和 Expo CLI
2. 克隆项目并进入目录
3. 安装依赖：`npm install`
4. 启动应用：`npm start`

## 配置

在运行应用前，需要配置 OpenAI API 密钥：

1. 复制 `.env.example` 为 `.env`
2. 将你的 OpenAI API 密钥填入 `EXPO_PUBLIC_OPENAI_API_KEY`

## 开发进展

### 第 1 周：核心宠物交互（已完成）
- [x] Expo 项目初始化
- [x] Lottie 呼吸动画宠物
- [x] 单击弹跳+震动反馈
- [x] 长按喂食
- [x] 心情颜色系统（金/橙/蓝）
- [x] SQLite 初始化
- [x] 每日金币+10

### 第 2 周：经济系统（已完成）
- [x] 饱食度系统
- [x] 商店页面
- [x] 购买逻辑
- [x] 喂食消耗道具
- [x] 饱食→心情反馈

### 第 3 周：AI 对话（已完成）
- [x] 对话界面
- [x] 每日30次限制
- [x] GPT-4o mini 接入
- [x] 对话+2金币

### 第 4 周：整合测试（已完成）
- [x] 全链路测试
- [x] 边界处理
- [x] 性能优化
- [x] 真机测试

## 项目结构

```
GlowBuddy/
├── app/                    # 页面组件
│   ├── index.tsx          # 主页（宠物界面）
│   ├── shop.tsx           # 商店页面
│   ├── chat.tsx           # AI 对话页面
│   └── _layout.tsx        # 导航布局
├── components/            # 可复用组件
│   └── PetAnimation.tsx   # 宠物动画组件
├── utils/                 # 工具函数
│   ├── database.ts        # SQLite 数据库操作
│   ├── openai.ts          # OpenAI API 集成
│   └── errorHandler.ts    # 错误处理和边界情况
├── assets/                # 静态资源
│   └── animations/        # Lottie 动画文件
├── .env                   # 环境变量配置
└── README.md
```

## 依赖说明

- `expo-sqlite`: 本地数据库存储
- `expo-haptics`: 震动反馈
- `lottie-react-native`: 动画效果
- `expo-router`: 页面路由
- `react-native-reanimated`: 高性能动画
