# Fullstack Monorepo

这是一个使用 pnpm workspace 管理的全栈 monorepo 项目。

## 项目结构

```
.
├── apps/
│   ├── api/          # NestJS 后端
│   ├── web/          # Next.js 前端
│   └── mobile/       # Expo (React Native) 客户端
├── packages/
│   └── shared/       # 共享代码包
└── ...配置文件
```

## 技术栈

- **前端**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- **后端**: NestJS 11 + TypeScript 5.7
- **客户端**: Expo 54 + React Native 0.81 + React 19
- **包管理器**: pnpm 10.x (使用 corepack)

## 开发环境要求

- Node.js >= 20.0.0
- pnpm >= 10.0.0
- 对于移动端开发：Expo CLI（可选）

### 安装 pnpm

推荐使用 npm 全局安装 pnpm：

```bash
npm install -g pnpm@latest
```

如果你使用 Volta 管理 Node.js，pnpm 会自动被 Volta 管理。

### 验证安装

```bash
# 检查 pnpm 版本
pnpm --version

# 应该显示 10.33.0 或更高版本
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动所有项目开发模式
pnpm dev

# 启动特定项目
pnpm dev:api        # 启动后端 API
pnpm dev:web        # 启动前端 Web
pnpm dev:mobile     # 启动移动端

# 构建项目
pnpm build          # 构建所有项目
pnpm build:api      # 构建后端
pnpm build:web      # 构建前端

# 代码检查
pnpm lint           # 检查所有项目

# 清理
pnpm clean          # 清理所有构建产物
```

## 项目说明

### API (NestJS)

后端服务，默认运行在 http://localhost:3000

- 提供 RESTful API 接口
- 支持热重载
- 内置 ESLint 和 Prettier 配置

```bash
# 单独启动 API
pnpm dev:api

# 测试
pnpm --filter api test
```

### Web (Next.js)

前端应用，默认运行在 http://localhost:3001

- 使用最新的 App Router
- 支持 Server Components
- 集成 Tailwind CSS 4
- 支持 TypeScript

```bash
# 单独启动 Web
pnpm dev:web

# 构建
pnpm build:web
```

### Mobile (Expo)

移动端应用

- 使用 Expo 框架
- 支持 iOS、Android 和 Web
- TypeScript 支持

```bash
# 单独启动 Mobile
pnpm dev:mobile

# 在模拟器中运行
pnpm --filter mobile ios
pnpm --filter mobile android
```

## 环境变量

复制 `.env.example` 到 `.env` 并根据需要修改：

```bash
cp .env.example .env
```

## 共享包

`packages/shared` 包含跨项目共享的代码：

- 类型定义
- 工具函数
- 常量配置

在其他项目中使用：

```typescript
import { API_BASE_URL, formatDate } from '@fullstack/shared';
```

## 开发建议

1. 使用 VSCode 并安装推荐的扩展
2. 保持 Node.js 版本更新
3. 定期运行 `pnpm lint` 检查代码质量
4. 提交前确保代码通过测试
