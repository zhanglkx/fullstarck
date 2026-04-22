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

- Node.js >= 24.0.0
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

## Docker

项目已提供完整的 Docker 化方案，包含：

| 服务       | 镜像                    | 端口（宿主机）      | 说明                               |
| ---------- | ----------------------- | ------------------- | ---------------------------------- |
| `postgres` | `postgres:17-alpine`    | `5432`              | 关系型数据库，带健康检查           |
| `redis`    | `redis:7-alpine`        | `6379`              | 缓存 / 队列，开启持久化与密码      |
| `pgadmin`  | `dpage/pgadmin4:latest` | `5050`              | 数据库 Web 管理（profile `tools`） |
| `api`      | 本地构建（NestJS）      | `3000`              | 多阶段构建的生产镜像               |
| `web`      | 本地构建（Next.js）     | `3001`              | 基于 Next standalone 的精简镜像    |

### 前置条件

- 安装 Docker Desktop / Docker Engine（含 Compose V2）
- 复制环境变量文件：`cp .env.example .env`

### 常用命令

```bash
# 仅启动基础设施（开发本地 API/Web 时使用）
pnpm docker:up:infra

# 启动全部服务（包含 api + web）
pnpm docker:build
pnpm docker:up

# 同时启动可选工具（pgAdmin）
pnpm docker:up:tools

# 查看运行状态与日志
pnpm docker:ps
pnpm docker:logs

# 停止（保留数据卷）
pnpm docker:down

# 停止并清空数据卷（慎用）
pnpm docker:down:volumes
```

### 连接信息

- **API**：http://localhost:3000
- **Web**：http://localhost:3001
- **PostgreSQL**：`postgresql://postgres:postgres@localhost:5432/fullstack`
- **Redis**：`redis://default:redis@localhost:6379`
- **pgAdmin**：http://localhost:5050（账号见 `.env`）

容器内服务通过内部网络 `app-network` 以服务名互通：`api` → `postgres:5432` / `redis:6379`；`web` → `api:3000`。

### PostgreSQL 初始化

首次启动（数据卷为空）时会执行 `docker/postgres/init/` 下的 SQL 脚本，默认启用 `uuid-ossp` 与 `pgcrypto` 扩展，可按需在该目录新增 schema / 种子脚本。

## 开发建议

1. 使用 VSCode 并安装推荐的扩展
2. 保持 Node.js 版本更新
3. 定期运行 `pnpm lint` 检查代码质量
4. 提交前确保代码通过测试
