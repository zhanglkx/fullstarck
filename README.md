# Fullstack Monorepo

这是一个使用 ppnpm workspace 管理的全栈 monorepo 项目。

## 项目结构

```
.
├── apps/
│   ├── api/          # NestJS 后端
│   ├── web/          # Next.js 前端
│   └── mobile/       # Expo (React Native) 客户端
└── packages/         # 共享包
```

## 技术栈

- **前端**: Next.js 15 (App Router)
- **后端**: NestJS 10+
- **客户端**: Expo (React Native)
- **包管理器**: pnpm 9.x

## 开发环境要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动所有项目开发模式
pnpm dev

# 启动特定项目
pnpm --filter api dev
pnpm --filter web dev
pnpm --filter mobile dev
```

## 项目说明

### API (NestJS)

后端服务，提供 RESTful API 和 GraphQL 接口。

### Web (Next.js)

前端应用，使用最新的 App Router 和 Server Components。

### Mobile (Expo)

移动端应用，使用 React Native 和 Expo 框架。
