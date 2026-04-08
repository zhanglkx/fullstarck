# Monorepo 架构指南

本文档概述本项目的 Monorepo 架构设计，包括目录结构、技术选型以及核心概念。

## 目录

- [架构概览](#架构概览)
- [目录结构](#目录结构)
- [技术栈](#技术栈)
- [核心概念](#核心概念)
- [工作流程](#工作流程)

---

## 架构概览

本项目采用 **pnpm workspace** 管理的全栈 Monorepo：

```
fullstarck/
├── apps/              # 可部署的应用
│   ├── api/           # NestJS 后端
│   ├── web/           # Next.js 前端
│   └── mobile/        # Expo 移动端
├── packages/          # 共享子包
│   └── shared/        # 共享工具和类型
├── docs/              # 项目文档
└── pnpm-workspace.yaml
```

### 分层设计

```
┌─────────────────────────────────────────┐
│              应用层 (apps)               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │   api   │  │   web   │  │  mobile │ │
│  └─────────┘  └─────────┘  └─────────┘ │
├─────────────────────────────────────────┤
│             子包层 (packages)            │
│  ┌─────────────────────────────────────┐│
│  │           @fullstack/shared         ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│            基础设施层                     │
│  ┌─────────────────────────────────────┐│
│  │  pnpm workspace + TypeScript        ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## 目录结构

### apps/ - 应用层

包含所有可独立部署的应用程序：

| 应用          | 技术栈     | 端口 | 说明                |
| ------------- | ---------- | ---- | ------------------- |
| `apps/api`    | NestJS 11  | 3000 | REST API 后端       |
| `apps/web`    | Next.js 16 | 3001 | React 前端          |
| `apps/mobile` | Expo 54    | -    | React Native 移动端 |

### packages/ - 子包层

包含所有共享代码：

| 子包              | 说明                               |
| ----------------- | ---------------------------------- |
| `packages/shared` | 共享工具函数、类型定义、格式化函数 |

子包命名规范：`@组织名/包名`

### docs/ - 文档层

项目文档分类存储：

```
docs/
├── README.md              # 文档索引
├── monorepo/
│   ├── index.md           # 本文档
│   ├── subpackage-create.md
│   ├── subpackage-use.md
│   └── dependency-management.md
└── reference/
    └── commands.md
```

---

## 技术栈

### 核心工具

| 工具       | 版本      | 用途     |
| ---------- | --------- | -------- |
| pnpm       | 10.33.0   | 包管理器 |
| Node.js    | >= 20.0.0 | 运行时   |
| TypeScript | 5.x       | 类型系统 |

### 应用技术栈

| 应用   | 框架    | 版本 |
| ------ | ------- | ---- |
| API    | NestJS  | 11.x |
| Web    | Next.js | 16.x |
| Mobile | Expo    | 54.x |

### 构建工具

| 工具  | 用途                     |
| ----- | ------------------------ |
| tsup  | 子包构建（基于 esbuild） |
| turbo | 构建编排（可选）         |

---

## 核心概念

### Workspace 协议

pnpm workspace 提供特殊的依赖协议：

```json
{
  "dependencies": {
    "@fullstack/shared": "workspace:*"
  }
}
```

这使得本地包可以像 npm 包一样被引用和共享。

### 子包命名

所有子包使用作用域（scoped）命名：

```
@fullstack/shared   # 共享工具
@fullstack/hooks    # React Hooks
@fullstack/ui       # UI 组件库
```

### 构建与发布

子包构建后生成：

- `dist/index.js` - CommonJS 版本
- `dist/index.mjs` - ES Module 版本
- `dist/index.d.ts` - TypeScript 类型定义

---

## 工作流程

### 开发流程

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发
pnpm dev              # 启动所有应用
pnpm dev:api          # 仅启动 API
pnpm dev:web          # 仅启动 Web

# 3. 构建
pnpm build            # 构建所有项目
pnpm build:api        # 仅构建 API
```

### 创建新子包

详见 [子包创建指南](./subpackage-create.md)

### 使用子包

详见 [子包使用指南](./subpackage-use.md)

---

## 相关文档

- [子包创建指南](./subpackage-create.md)
- [子包使用指南](./subpackage-use.md)
- [依赖版本管理](./dependency-management.md)
