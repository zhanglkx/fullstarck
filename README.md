# 🚀 Fullstarck Monorepo

<div align="center">

**现代化全栈 Monorepo 项目模板**

基于 Nx、pnpm 构建的生产就绪全栈解决方案

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.6-000000?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1.9-E0234E?logo=nestjs)](https://nestjs.com/)
[![React Native](https://img.shields.io/badge/React_Native-0.82.1-61DAFB?logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Nx](https://img.shields.io/badge/Nx-22.1.3-143055?logo=nx)](https://nx.dev/)

</div>

---

## 📖 目录

- [项目简介](#-项目简介)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [核心特性](#-核心特性)
- [快速开始](#-快速开始)
- [开发指南](#-开发指南)
- [绝对路径导入](#-绝对路径导入)
- [API 文档](#-api-文档)
- [部署](#-部署)
- [文档](#-文档)
- [许可证](#-许可证)

---

## 🎯 项目简介

**Fullstarck Monorepo** 是一个完整的全栈项目模板，整合了：

- **🔥 Backend**: NestJS RESTful API，支持数据验证、CORS、依赖注入
- **💻 Web**: Next.js 16 (App Router) + Ant Design 5，现代化的 Web 应用
- **📱 Mobile**: React Native 0.82 + Gluestack UI，支持 iOS/Android 原生应用

通过 **Nx Monorepo** 架构实现：
- ✅ 代码共享（DTOs、工具函数）
- ✅ 类型安全（全栈 TypeScript）
- ✅ 增量构建（智能缓存）
- ✅ 统一开发体验（ESLint、Prettier）

---

## 🛠️ 技术栈

### Backend (NestJS)

| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | 11.1.9 | 后端框架 |
| TypeScript | 5.9.3 | 类型安全 |
| class-validator | 0.14.3 | DTO 验证 |
| class-transformer | 0.5.1 | 数据转换 |
| RxJS | 7.8.2 | 响应式编程 |

### Web (Next.js)

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.0.6 | React 框架 |
| React | 19.2.0 | UI 库 |
| Ant Design | 5.29.1 | UI 组件库 |
| CSS Modules | - | 样式方案 |
| Turbopack | - | 快速构建 |

### Mobile (React Native)

| 技术 | 版本 | 用途 |
|------|------|------|
| React Native | 0.82.1 | 移动端框架 |
| React | 19.2.0 | UI 库 |
| Gluestack UI | 1.1.73 | UI 组件库 |
| Metro | 0.83.3 | 打包工具 |
| New Architecture | ✅ | 性能优化 |

### Monorepo 工具

| 技术 | 版本 | 用途 |
|------|------|------|
| Nx | 22.1.3 | Monorepo 管理 |
| pnpm | 10.20.0 | 包管理器 |
| TypeScript | 5.9.3 | 类型系统 |

---

## 📁 项目结构

```
fullstarck/
├── apps/                           # 应用目录
│   ├── backend/                    # NestJS 后端
│   │   ├── src/
│   │   │   ├── app/                # 应用核心
│   │   │   │   ├── app.controller.ts
│   │   │   │   ├── app.module.ts
│   │   │   │   ├── notes.controller.ts
│   │   │   │   └── notes.service.ts
│   │   │   └── main.ts             # 入口文件
│   │   ├── tsconfig.json
│   │   └── webpack.config.js
│   │
│   ├── web/                        # Next.js Web 应用
│   │   ├── src/
│   │   │   ├── app/                # App Router 页面
│   │   │   │   ├── layout.tsx      # 根布局
│   │   │   │   ├── page.tsx        # 首页
│   │   │   │   ├── dashboard/      # 仪表盘
│   │   │   │   ├── notes/          # 手帐管理
│   │   │   │   ├── profile/        # 个人中心
│   │   │   │   └── about/          # 关于页面
│   │   │   └── components/         # 共享组件
│   │   │       ├── Navbar.tsx
│   │   │       └── Footer.tsx
│   │   ├── tsconfig.json
│   │   └── next.config.js
│   │
│   └── mobile/                     # React Native 移动应用
│       ├── src/
│       │   ├── app/
│       │   │   ├── App.tsx         # 主应用
│       │   │   └── NotesApp.tsx    # 手帐应用
│       │   └── main.tsx            # 入口文件
│       ├── ios/                    # iOS 项目
│       ├── android/                # Android 项目
│       ├── metro.config.js
│       └── tsconfig.json
│
├── libs/                           # 共享库
│   ├── api-contracts/              # 共享 DTO
│   │   └── src/
│   │       └── lib/dto/
│   │           ├── login.dto.ts    # 登录 DTO
│   │           ├── user.dto.ts     # 用户 DTO
│   │           └── note.dto.ts     # 手帐 DTO
│   │
│   └── shared-utils/               # 共享工具函数
│       └── src/lib/
│
├── docs/                           # 项目文档
│   ├── QUICK_START.md              # 快速开始指南
│   ├── ABSOLUTE_PATHS.md           # 绝对路径配置
│   ├── NOTES_APP.md                # 手帐应用文档
│   ├── DEPENDENCY_UPDATE.md        # 依赖更新记录
│   ├── IOS_SUCCESS.md              # iOS 运行指南
│   ├── METRO_FIX.md                # Metro 问题修复
│   ├── SUCCESS_REPORT.md           # 项目运行报告
│   ├── WEB_PAGES_ENHANCEMENT.md    # Web 页面优化
│   └── ...                         # 其他技术文档
│
├── package.json                    # 根 package.json
├── pnpm-workspace.yaml             # pnpm 工作区配置
├── tsconfig.base.json              # TypeScript 基础配置
├── nx.json                         # Nx 配置
└── README.md                       # 项目说明（本文件）
```

---

## ✨ 核心特性

### 🎨 现代化技术栈
- **最新版本**: 所有依赖都是 2024-2025 最新版本
- **React 19**: 使用最新的 React 特性
- **New Architecture**: React Native 启用新架构
- **Turbopack**: Next.js 快速构建工具

### 🔒 类型安全
- **全栈 TypeScript**: 100% TypeScript 覆盖
- **共享 DTO**: 通过 `@fullstarck/api-contracts` 实现三端类型共享
- **编译时检查**: 在开发阶段捕获类型错误
- **智能提示**: 完整的 IDE 类型提示支持

### 🔄 代码共享
- **DTO 共享**: 数据传输对象在前后端复用
- **工具函数**: 通用逻辑抽取到 `@fullstarck/shared-utils`
- **类型定义**: Interface 和 Type 跨项目使用
- **验证规则**: class-validator 装饰器在后端验证，前端获取类型

### ⚡ 开发体验
- **绝对路径导入**: 三端都支持 `@/*` 路径别名
- **热重载**: 所有应用支持 Hot Reload/Fast Refresh
- **增量构建**: Nx 智能缓存，只构建变更部分
- **并行执行**: 多个任务可并行运行

### 🎯 企业级特性
- **数据验证**: 使用 class-validator 进行请求验证
- **CORS 配置**: 跨域资源共享已配置
- **错误处理**: 统一的错误处理机制
- **环境变量**: 支持多环境配置

---

## 🚀 快速开始

### 前置要求

确保已安装以下工具：

| 工具 | 版本要求 | 安装方式 |
|------|---------|---------|
| Node.js | 22+ | [下载](https://nodejs.org/) 或 `volta install node@22` |
| pnpm | 10+ | `npm install -g pnpm` |
| Xcode | 15+ | App Store（仅 iOS 开发） |
| Android Studio | 最新 | [下载](https://developer.android.com/studio)（仅 Android 开发） |

### 安装

```bash
# 1. 克隆项目（如果从 git 仓库）
git clone <repository-url>
cd fullstarck

# 2. 安装依赖
pnpm install

# 3. 构建共享库
pnpm nx run api-contracts:build
```

### 运行应用

#### 终端 1: 后端 API

```bash
pnpm nx serve backend
```

🌐 访问: http://localhost:3333/api

**可用端点**:
- `GET /api` - 健康检查
- `GET /api/notes` - 获取所有手帐
- `POST /api/notes` - 创建手帐
- `PUT /api/notes/:id` - 更新手帐
- `DELETE /api/notes/:id` - 删除手帐
- `POST /api/auth/login` - 用户登录

#### 终端 2: Web 应用

```bash
pnpm nx run web:dev
```

🌐 访问: http://localhost:3000

**可用页面**:
- `/` - 首页（项目介绍）
- `/dashboard` - 仪表盘（数据统计）
- `/notes` - 手帐管理（CRUD 功能）
- `/profile` - 个人中心
- `/about` - 关于项目

#### 终端 3: Metro Bundler（移动端）

```bash
pnpm nx run mobile:start
```

📱 Metro 运行在: http://localhost:8081

#### 终端 4: iOS 模拟器（可选）

```bash
# 首次运行需要安装 CocoaPods 依赖
cd apps/mobile/ios
/opt/homebrew/opt/cocoapods/bin/pod install
cd ../../..

# 运行 iOS 应用
pnpm nx run mobile:run-ios --simulator="iPhone 16 Pro"
```

📱 应用将在 iOS 模拟器中打开

#### Android 模拟器（可选）

```bash
# 确保 Android 模拟器已启动
pnpm nx run mobile:run-android
```

---

## 💻 开发指南

### 代码共享示例

#### 1. 创建共享 DTO

```typescript
// libs/api-contracts/src/lib/dto/product.dto.ts
import { IsString, IsNumber, Min } from 'class-validator'

export class CreateProductDto {
  @IsString()
  name!: string

  @IsNumber()
  @Min(0)
  price!: number
}

export interface ProductDto {
  id: string
  name: string
  price: number
  createdAt: Date
}
```

#### 2. 后端使用（NestJS）

```typescript
// apps/backend/src/app/products.controller.ts
import { Controller, Post, Body } from '@nestjs/common'
import { CreateProductDto, ProductDto } from '@fullstarck/api-contracts'

@Controller('products')
export class ProductsController {
  @Post()
  create(@Body() dto: CreateProductDto): ProductDto {
    // dto 会自动验证
    return {
      id: '1',
      ...dto,
      createdAt: new Date(),
    }
  }
}
```

#### 3. Web 端使用（Next.js）

```typescript
// apps/web/src/app/products/page.tsx
'use client'

import { CreateProductDto, ProductDto } from '@fullstarck/api-contracts'

export default function ProductsPage() {
  const handleCreate = async (data: CreateProductDto) => {
    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    const product: ProductDto = await response.json()
    // 完整的类型安全！
  }
}
```

#### 4. Mobile 端使用（React Native）

```typescript
// apps/mobile/src/screens/ProductsScreen.tsx
import { CreateProductDto, ProductDto } from '@fullstarck/api-contracts'
import axios from 'axios'

const createProduct = async (data: CreateProductDto): Promise<ProductDto> => {
  const response = await axios.post('/api/products', data)
  return response.data
  // 完整的类型安全！
}
```

### 绝对路径导入

所有三端都支持绝对路径导入，避免复杂的相对路径。

#### Backend

```typescript
import { AppService } from '@/app/app.service'
import { NotesController } from '@backend/notes/notes.controller'
```

#### Web

```typescript
import { Navbar } from '@components/Navbar'
import { formatDate } from '@utils/date'
import NotesPage from '@app/notes/page'
```

#### Mobile

```typescript
import { Header } from '@components/Header'
import { HomeScreen } from '@screens/HomeScreen'
import { useAuth } from '@hooks/useAuth'
import Logo from '@assets/logo.png'
```

详细配置请查看: [docs/ABSOLUTE_PATHS.md](./docs/ABSOLUTE_PATHS.md)

---

## 🏗️ 常用命令

### 开发

```bash
# 启动所有服务（需要多个终端）
pnpm nx serve backend          # 后端 API
pnpm nx run web:dev            # Web 应用
pnpm nx run mobile:start       # Metro Bundler

# 运行移动端
pnpm nx run mobile:run-ios     # iOS
pnpm nx run mobile:run-android # Android
```

### 构建

```bash
# 构建单个应用
pnpm nx build backend
pnpm nx build web
pnpm nx build mobile

# 构建所有应用
pnpm nx run-many --target=build --all

# 构建受影响的应用
pnpm nx affected --target=build
```

### 测试

```bash
# 运行单元测试（已移除测试文件）
# 如需测试，可以重新生成

# 类型检查
pnpm nx run backend:typecheck
pnpm nx run web:typecheck
pnpm nx run mobile:typecheck
```

### Lint

```bash
# Lint 单个应用
pnpm nx lint backend
pnpm nx lint web
pnpm nx lint mobile

# Lint 所有应用
pnpm nx run-many --target=lint --all
```

### 其他

```bash
# 查看项目依赖图
pnpm nx graph

# 清除缓存
pnpm nx reset

# 查看受影响的项目
pnpm nx affected --target=build

# 生成新的库
pnpm nx g @nx/js:lib my-lib --directory=libs/my-lib
```

---

## 🎨 页面展示

### Web 应用

| 页面 | 路径 | 功能 |
|------|------|------|
| **首页** | `/` | Hero 区域、技术栈展示、核心特性介绍 |
| **仪表盘** | `/dashboard` | 数据统计、进度可视化、快速操作 |
| **手帐管理** | `/notes` | CRUD 功能、实时更新、状态管理 |
| **个人中心** | `/profile` | 用户信息、活动记录、成就徽章 |
| **关于项目** | `/about` | 项目介绍、技术栈详情、开发路线 |

### 移动端

- **欢迎页面**: 项目介绍、Gluestack UI 展示
- **手帐应用**: 完整的 CRUD 功能
- **原生体验**: iOS/Android 原生组件

---

## 🔧 配置说明

### 环境变量

#### Backend

```bash
# apps/backend/.env
PORT=3333
NODE_ENV=development
```

#### Web

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

#### Mobile

```typescript
// apps/mobile/src/config/api.ts
export const API_URL = __DEV__ 
  ? 'http://localhost:3333/api' 
  : 'https://api.production.com'
```

### 端口配置

| 服务 | 端口 | 配置文件 |
|------|------|---------|
| Backend | 3333 | `apps/backend/src/main.ts` |
| Web | 3000 | Next.js 默认 |
| Metro | 8081 | React Native 默认 |

---

## 📚 API 文档

### Notes API

#### GET /api/notes
获取所有手帐

**响应**:
```json
[
  {
    "id": "uuid",
    "title": "标题",
    "content": "内容",
    "isCompleted": false,
    "createdAt": "2025-12-01T00:00:00.000Z",
    "updatedAt": "2025-12-01T00:00:00.000Z"
  }
]
```

#### POST /api/notes
创建新手帐

**请求体**:
```json
{
  "title": "标题",
  "content": "内容",
  "isCompleted": false
}
```

#### PUT /api/notes/:id
更新手帐

#### DELETE /api/notes/:id
删除手帐

---

## 🚀 部署

### Backend

```bash
# 构建
pnpm nx build backend

# 启动生产服务器
NODE_ENV=production node dist/apps/backend/main.js
```

### Web

```bash
# 构建
pnpm nx build web

# 启动生产服务器
cd apps/web
pnpm next start
```

### Mobile

```bash
# iOS
pnpm nx build mobile --platform=ios --configuration=Release

# Android
pnpm nx build mobile --platform=android --configuration=Release
```

---

## 📖 文档

详细文档请查看 `docs/` 目录：

| 文档 | 说明 |
|------|------|
| [快速开始](./docs/QUICK_START.md) | 快速运行指南 |
| [绝对路径配置](./docs/ABSOLUTE_PATHS.md) | 绝对路径导入配置 |
| [手帐应用](./docs/NOTES_APP.md) | 手帐应用详细说明 |
| [iOS 运行指南](./docs/IOS_SUCCESS.md) | iOS 模拟器运行步骤 |
| [Metro 配置](./docs/METRO_FIX.md) | Metro Bundler 问题修复 |
| [依赖更新](./docs/DEPENDENCY_UPDATE.md) | 依赖版本更新记录 |
| [Web 页面优化](./docs/WEB_PAGES_ENHANCEMENT.md) | Web 页面功能说明 |
| [项目运行报告](./docs/SUCCESS_REPORT.md) | 完整的运行验证报告 |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## ❓ 常见问题

### 1. Metro Bundler 启动失败

**问题**: `(0 , _util.styleText) is not a function`

**解决**: 升级 Node.js 到 22+
```bash
volta install node@22
volta pin node@22
```

### 2. iOS Pod Install 失败

**问题**: `undefined method 'visionos'`

**解决**: 使用最新版本的 CocoaPods
```bash
/opt/homebrew/opt/cocoapods/bin/pod install
```

### 3. 端口冲突

**问题**: `EADDRINUSE: address already in use`

**解决**: 修改端口或关闭占用端口的进程
```bash
# 查看占用端口的进程
lsof -i :3333

# 修改端口（apps/backend/src/main.ts）
const port = process.env.PORT || 3333
```

### 4. TypeScript 找不到模块

**问题**: `Cannot find module '@fullstarck/api-contracts'`

**解决**: 
```bash
# 重新构建共享库
pnpm nx run api-contracts:build

# 重启 TypeScript 服务器
# VSCode: Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

---

## 📊 项目状态

### 完成功能

- ✅ Monorepo 架构搭建
- ✅ 三端应用生成（Backend、Web、Mobile）
- ✅ 共享库配置（api-contracts、shared-utils）
- ✅ 绝对路径导入支持
- ✅ 手帐应用（完整 CRUD）
- ✅ Web 多页面（5 个页面 + 导航布局）
- ✅ iOS/Android 支持
- ✅ 热重载功能
- ✅ 类型安全验证
- ✅ 依赖更新到最新版本

### 待完成功能

- ⏳ 用户认证系统
- ⏳ 数据库集成（PostgreSQL/MongoDB）
- ⏳ 文件上传功能
- ⏳ 实时通知（WebSocket）
- ⏳ 单元测试和 E2E 测试
- ⏳ Docker 容器化
- ⏳ CI/CD 配置
- ⏳ 生产环境部署

---

## 🎓 学习资源

### 官方文档

- [Nx 文档](https://nx.dev/)
- [NestJS 文档](https://docs.nestjs.com/)
- [Next.js 文档](https://nextjs.org/docs)
- [React Native 文档](https://reactnative.dev/)
- [Ant Design 文档](https://ant.design/)
- [Gluestack UI 文档](https://ui.gluestack.io/)

### 推荐阅读

- [Monorepo 最佳实践](https://nx.dev/concepts/more-concepts/monorepo-patterns)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React 19 更新](https://react.dev/blog/2024/04/25/react-19)

---

## 🙏 致谢

本项目使用了以下优秀的开源项目：

- [Nx](https://nx.dev/) - Monorepo 管理工具
- [NestJS](https://nestjs.com/) - 渐进式 Node.js 框架
- [Next.js](https://nextjs.org/) - React 框架
- [React Native](https://reactnative.dev/) - 移动端框架
- [Ant Design](https://ant.design/) - Web UI 组件库
- [Gluestack UI](https://ui.gluestack.io/) - React Native UI 组件库
- [pnpm](https://pnpm.io/) - 快速的包管理器

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- GitHub: [https://github.com/fullstarck](https://github.com/fullstarck)
- 问题反馈: [Issues](https://github.com/fullstarck/issues)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️ by Fullstarck Team

</div>
