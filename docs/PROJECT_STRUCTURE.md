# 📁 Fullstarck 项目结构详解

## 🎯 目录说明

### 根目录文件

```
fullstarck/
├── README.md                   # 项目主文档（必读）
├── package.json                # 根 package.json，包含所有依赖
├── pnpm-workspace.yaml         # pnpm 工作区配置
├── tsconfig.base.json          # TypeScript 基础配置（共享）
├── nx.json                     # Nx 配置文件
└── .npmrc                      # npm/pnpm 配置
```

### apps/ - 应用目录

所有可独立运行的应用都放在这里：

```
apps/
├── backend/                    # NestJS 后端 API
├── web/                        # Next.js Web 应用
└── mobile/                     # React Native 移动应用
```

### libs/ - 共享库目录

可复用的代码库：

```
libs/
├── api-contracts/              # 共享 DTO 和接口定义
│   └── src/lib/dto/
│       ├── login.dto.ts        # 登录 DTO
│       ├── user.dto.ts         # 用户 DTO
│       └── note.dto.ts         # 手帐 DTO
│
└── shared-utils/               # 共享工具函数
    └── src/lib/
        └── shared-utils.ts
```

### docs/ - 文档目录

所有项目文档集中管理：

```
docs/
├── README.md                   # 文档索引
├── QUICK_START.md              # 快速开始
├── ABSOLUTE_PATHS.md           # 绝对路径配置
├── NOTES_APP.md                # 手帐应用说明
├── IOS_SUCCESS.md              # iOS 运行指南
├── METRO_FIX.md                # Metro 问题修复
└── ...                         # 其他技术文档
```

---

## 🔍 应用详细结构

### Backend 应用结构

```
apps/backend/
├── src/
│   ├── app/
│   │   ├── app.controller.ts       # 主控制器
│   │   ├── app.service.ts          # 主服务
│   │   ├── app.module.ts           # 根模块
│   │   ├── notes.controller.ts     # 手帐控制器
│   │   └── notes.service.ts        # 手帐服务
│   ├── assets/                     # 静态资源
│   └── main.ts                     # 应用入口
├── tsconfig.json                   # TypeScript 配置
├── tsconfig.app.json               # 应用 TS 配置
└── webpack.config.js               # Webpack 配置
```

**关键文件说明**:
- `main.ts`: 配置全局 ValidationPipe、CORS、端口等
- `*.controller.ts`: 处理 HTTP 请求，定义路由
- `*.service.ts`: 业务逻辑层
- `*.module.ts`: NestJS 模块定义

### Web 应用结构

```
apps/web/
├── src/
│   ├── app/                        # App Router 目录
│   │   ├── layout.tsx              # 根布局（导航+页脚）
│   │   ├── page.tsx                # 首页 (/)
│   │   ├── global.css              # 全局样式
│   │   ├── page.module.css         # 首页样式
│   │   ├── dashboard/
│   │   │   └── page.tsx            # 仪表盘 (/dashboard)
│   │   ├── notes/
│   │   │   ├── page.tsx            # 手帐管理 (/notes)
│   │   │   └── notes.module.css
│   │   ├── profile/
│   │   │   └── page.tsx            # 个人中心 (/profile)
│   │   ├── about/
│   │   │   └── page.tsx            # 关于 (/about)
│   │   └── api/
│   │       └── hello/
│   │           └── route.ts        # API 路由 (/api/hello)
│   │
│   └── components/                 # 共享组件
│       ├── Navbar.tsx              # 导航栏
│       └── Footer.tsx              # 页脚
│
├── public/                         # 静态资源
│   └── favicon.ico
├── tsconfig.json                   # TypeScript 配置
├── next.config.js                  # Next.js 配置
└── package.json                    # 依赖配置
```

**关键文件说明**:
- `layout.tsx`: 所有页面共享的布局
- `page.tsx`: 路由页面组件
- `route.ts`: API 路由处理器
- `*.module.css`: CSS Modules 样式

### Mobile 应用结构

```
apps/mobile/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # 主应用组件
│   │   └── NotesApp.tsx            # 手帐应用
│   ├── assets/                     # 资源文件
│   ├── main.tsx                    # React Native 入口
│   └── main-web.tsx                # Web 预览入口
│
├── ios/                            # iOS 原生项目
│   ├── Mobile/
│   │   ├── AppDelegate.swift      # iOS 应用委托
│   │   ├── Info.plist             # iOS 配置
│   │   └── LaunchScreen.storyboard
│   ├── Podfile                     # CocoaPods 依赖
│   └── Mobile.xcworkspace/         # Xcode 工作空间
│
├── android/                        # Android 原生项目
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── java/com/mobile/
│   │   │       ├── MainActivity.kt
│   │   │       └── MainApplication.kt
│   │   └── build.gradle
│   └── build.gradle                # Android 构建配置
│
├── gluestack-ui.config.ts          # Gluestack UI 配置
├── metro.config.js                 # Metro 打包配置
├── .babelrc.js                     # Babel 转译配置
├── tsconfig.json                   # TypeScript 配置
├── vite.config.mts                 # Vite 配置（Web 预览）
└── package.json                    # 依赖配置
```

**关键文件说明**:
- `metro.config.js`: 配置 Monorepo 路径解析
- `.babelrc.js`: 配置绝对路径导入
- `ios/Podfile`: iOS 原生依赖
- `android/build.gradle`: Android 构建配置

---

## 📦 共享库详解

### api-contracts

**用途**: 共享数据传输对象（DTO）和接口定义

```typescript
// libs/api-contracts/src/lib/dto/note.dto.ts
import { IsString, IsOptional, IsBoolean } from 'class-validator'

export class CreateNoteDto {
  @IsString()
  title!: string

  @IsString()
  content!: string

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean
}

export interface NoteDto {
  id: string
  title: string
  content: string
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}
```

**三端使用**:
```typescript
// Backend
import { CreateNoteDto } from '@fullstarck/api-contracts'

// Web
import { NoteDto } from '@fullstarck/api-contracts'

// Mobile
import { CreateNoteDto, NoteDto } from '@fullstarck/api-contracts'
```

### shared-utils

**用途**: 共享工具函数和常量

```typescript
// libs/shared-utils/src/lib/shared-utils.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN')
}

export const API_VERSION = 'v1'
```

---

## 🔧 配置文件说明

### package.json (根)

```json
{
  "name": "@fullstarck/source",
  "pnpm": {
    "overrides": {
      "react": "^19.2.0",      // 强制统一 React 版本
      "react-dom": "^19.2.0"
    }
  }
}
```

**关键配置**:
- `pnpm.overrides`: 解决 React 版本冲突
- `devDependencies`: 所有 Nx 插件和构建工具
- `dependencies`: 共享的运行时依赖

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"      # 所有应用
  - "libs/*"      # 所有库

autoInstallPeers: true
```

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "paths": {
      "@fullstarck/api-contracts": ["libs/api-contracts/src/index.ts"],
      "@fullstarck/shared-utils": ["libs/shared-utils/src/index.ts"]
    }
  }
}
```

**作用**: 定义全局的 TypeScript 路径别名

### nx.json

```json
{
  "targetDefaults": {
    "build": {
      "cache": true,           // 启用构建缓存
      "dependsOn": ["^build"]  // 依赖的库先构建
    }
  }
}
```

**作用**: 配置 Nx 的缓存、并行执行等功能

---

## 🌳 依赖关系图

```
┌─────────────────┐
│     backend     │ ─┐
└─────────────────┘  │
                     │
┌─────────────────┐  │    ┌─────────────────────┐
│       web       │ ─┼───→│  api-contracts      │
└─────────────────┘  │    └─────────────────────┘
                     │              │
┌─────────────────┐  │              │
│     mobile      │ ─┘              ↓
└─────────────────┘         ┌─────────────────────┐
                            │   shared-utils      │
                            └─────────────────────┘
```

**说明**:
- 所有应用依赖 `api-contracts`（共享 DTO）
- `api-contracts` 可选依赖 `shared-utils`
- Nx 会自动管理构建顺序

---

## 🎯 开发规范

### 文件命名

- **组件**: `PascalCase.tsx` (如 `Navbar.tsx`)
- **工具函数**: `camelCase.ts` (如 `formatDate.ts`)
- **样式文件**: `*.module.css` (CSS Modules)
- **DTO**: `*.dto.ts` (如 `login.dto.ts`)
- **接口**: `*.interface.ts` (如 `user.interface.ts`)

### 目录命名

- **应用**: `kebab-case` (如 `apps/my-app`)
- **库**: `kebab-case` (如 `libs/api-contracts`)
- **组件文件夹**: `PascalCase` (如 `components/UserCard/`)

### 导入顺序

```typescript
// 1. 第三方库
import { Controller, Get } from '@nestjs/common'
import { Card, Button } from 'antd'

// 2. 共享库
import { NoteDto } from '@fullstarck/api-contracts'

// 3. 本地绝对路径
import { Navbar } from '@components/Navbar'

// 4. 相对路径
import { formatDate } from './utils'
```

---

## 📊 构建产物

构建后的文件位置：

```
dist/
├── apps/
│   ├── backend/
│   │   └── main.js             # 后端打包文件
│   ├── web/
│   │   └── .next/              # Next.js 构建产物
│   └── mobile/
│       └── web/                # Web 预览构建
│           └── index.html
│
└── libs/
    ├── api-contracts/
    │   ├── index.d.ts          # 类型声明
    │   └── index.js            # 编译后的 JS
    └── shared-utils/
        ├── index.d.ts
        └── index.js
```

---

## 🔄 工作流程

### 1. 开发新功能

```bash
# 1. 创建 DTO（如果需要共享数据结构）
# 编辑 libs/api-contracts/src/lib/dto/my-feature.dto.ts

# 2. 构建 DTO 库
pnpm nx run api-contracts:build

# 3. 后端实现 API
# 编辑 apps/backend/src/app/my-feature.controller.ts

# 4. 前端开发界面
# Web: apps/web/src/app/my-feature/page.tsx
# Mobile: apps/mobile/src/screens/MyFeatureScreen.tsx

# 5. 测试运行
pnpm nx serve backend
pnpm nx run web:dev
pnpm nx run mobile:start
```

### 2. 添加新的共享库

```bash
# 生成新库
pnpm nx g @nx/js:lib my-lib --directory=libs/my-lib

# 在 tsconfig.base.json 添加路径
{
  "paths": {
    "@fullstarck/my-lib": ["libs/my-lib/src/index.ts"]
  }
}

# 使用
import { myFunction } from '@fullstarck/my-lib'
```

### 3. 更新依赖

```bash
# 查看过时的依赖
pnpm outdated

# 更新到最新版本
pnpm update --latest

# 重新安装
pnpm install

# 测试所有应用
pnpm nx run-many --target=build --all
```

---

## 🧩 Nx 工作原理

### 任务依赖

当运行 `pnpm nx serve backend` 时，Nx 会：

1. ✅ 检查 `backend` 依赖哪些库
2. ✅ 自动构建 `api-contracts`（如果未构建或有变更）
3. ✅ 使用缓存（如果没有变更）
4. ✅ 启动 backend 服务

### 缓存机制

```bash
# 首次构建
pnpm nx build backend
# 耗时: 10秒

# 再次构建（无变更）
pnpm nx build backend
# 耗时: <1秒（使用缓存）

# 清除缓存
pnpm nx reset
```

### 受影响分析

```bash
# 查看受影响的项目
pnpm nx affected --target=build

# 只构建受影响的项目
pnpm nx affected --target=build --parallel=3
```

---

## 🎨 样式方案

### Backend
- 无需样式

### Web
- **CSS Modules**: 组件级样式隔离
- **Ant Design**: 主题定制
- **全局样式**: `app/global.css`

```typescript
// 使用 CSS Modules
import styles from './page.module.css'

<div className={styles.container}>...</div>
```

### Mobile
- **StyleSheet**: React Native 内置样式
- **Gluestack UI**: 组件样式
- 不使用 Tailwind（已移除）

```typescript
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  }
})
```

---

## 🔐 环境变量

### 环境文件位置

```
apps/backend/.env           # Backend 环境变量
apps/web/.env.local         # Web 环境变量（不提交）
apps/web/.env.production    # Web 生产环境变量
apps/mobile/src/config/     # Mobile 配置文件
```

### 使用方式

**Backend**:
```typescript
const port = process.env.PORT || 3333
```

**Web**:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

**Mobile**:
```typescript
import Config from 'react-native-config'
const apiUrl = Config.API_URL
```

---

## 📝 代码规范

### ESLint

所有应用都配置了 ESLint，运行：

```bash
pnpm nx lint backend
pnpm nx lint web
pnpm nx lint mobile
```

### TypeScript Strict Mode

所有项目都启用了 TypeScript 严格模式：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true
  }
}
```

---

## 🎓 学习路径

### 初级（1-2 天）

1. ✅ 阅读 [README.md](../README.md)
2. ✅ 运行 [快速开始](./QUICK_START.md)
3. ✅ 学习 [手帐应用](./NOTES_APP.md) 代码

### 中级（3-5 天）

4. ✅ 理解 [绝对路径导入](./ABSOLUTE_PATHS.md)
5. ✅ 研究 [项目结构](./PROJECT_STRUCTURE.md)（本文档）
6. ✅ 开发新的 DTO 和 API

### 高级（1-2 周）

7. ✅ 深入 Nx 任务配置
8. ✅ 自定义 Webpack/Metro 配置
9. ✅ 优化构建性能
10. ✅ 配置 CI/CD

---

## 🛣️ 后续计划

### Phase 1 - 基础功能 ✅
- ✅ Monorepo 搭建
- ✅ 三端应用生成
- ✅ 代码共享机制
- ✅ 示例应用（手帐）

### Phase 2 - 功能增强 🔄
- ⏳ 用户认证（JWT）
- ⏳ 数据库集成
- ⏳ 文件上传
- ⏳ 实时通信

### Phase 3 - 工程化 ⏳
- ⏳ 单元测试
- ⏳ E2E 测试
- ⏳ CI/CD 配置
- ⏳ Docker 容器化

### Phase 4 - 生产部署 ⏳
- ⏳ 性能优化
- ⏳ 安全加固
- ⏳ 监控告警
- ⏳ 生产环境部署

---

## 💡 最佳实践

### 1. 保持库的独立性
- 库不应依赖应用
- 库之间可以互相依赖，但避免循环依赖

### 2. 使用 TypeScript 严格模式
- 启用所有严格检查
- 避免使用 `any` 类型

### 3. 合理使用缓存
- 利用 Nx 的智能缓存
- 定期清理缓存 (`pnpm nx reset`)

### 4. 代码复用
- 共享逻辑放到 `libs/`
- 避免在应用间复制代码

### 5. 绝对路径导入
- 跨目录导入使用绝对路径
- 同目录导入使用相对路径

---

<div align="center">

**🎉 现在你已经完全了解项目结构了！**

继续阅读 [开发指南](./QUICK_START.md) 开始开发吧！

</div>
