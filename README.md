# Fullstarck Monorepo

这是一个基于 Nx 的 Monorepo 项目，包含 NestJS 后端、Next.js Web 端和 React Native 移动端。

## 📦 项目结构

```
fullstarck/
├── apps/
│   ├── backend/          # NestJS 后端 API
│   ├── web/             # Next.js Web 应用 (Ant Design + CSS Modules)
│   └── mobile/          # React Native 移动应用 (Gluestack UI)
├── libs/
│   ├── api-contracts/   # 共享 DTO (使用 class-validator)
│   └── shared-utils/    # 共享工具函数
└── package.json
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 运行应用

#### 1. 运行后端 (NestJS)

```bash
pnpm nx serve backend
```

后端将在 http://localhost:3000 运行

#### 2. 运行 Web 端 (Next.js)

```bash
pnpm nx serve web
```

Web 应用将在 http://localhost:4200 运行

#### 3. 运行移动端 (React Native)

```bash
# iOS
pnpm nx run mobile:run-ios

# Android
pnpm nx run mobile:run-android

# Web 预览（使用 Vite）
pnpm nx serve mobile
```

> **关于 Vite**: Vite 配置用于 Web 预览 (react-native-web)，不影响原生应用。原生应用仍使用 Metro bundler。

## 🎯 主要特性

### 1. 代码共享

所有三个应用都可以使用共享库：

```typescript
// 在任何应用中导入共享 DTO
import { LoginDto, UserDto, CreateNoteDto, NoteDto } from '@fullstarck/api-contracts'

// 在任何应用中导入共享工具
import { formatDate, capitalize } from '@fullstarck/shared-utils'
```

### 2. 类型安全

使用 class-validator 在后端和前端之间共享验证逻辑：

```typescript
// libs/api-contracts/src/lib/dto/login.dto.ts
export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string
}
```

### 3. UI 框架

- **Web**: Ant Design 5 + CSS Modules
- **Mobile**: Gluestack UI (无需 Tailwind)

### 4. React 版本统一

通过 pnpm overrides 强制统一 React 版本，避免多实例问题：

```json
{
  "pnpm": {
    "overrides": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    }
  }
}
```

## 📝 API 示例

### 后端 API 端点

```typescript
// POST http://localhost:3000/api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Notes API
GET    /api/notes       - 获取所有手帐
GET    /api/notes/:id   - 获取单个手帐
POST   /api/notes       - 创建手帐
PUT    /api/notes/:id   - 更新手帐
DELETE /api/notes/:id   - 删除手帐
```

## 🛠️ 开发命令

### 构建

```bash
# 构建所有应用
pnpm nx run-many -t build

# 构建特定应用
pnpm nx build backend
pnpm nx build web
pnpm nx build mobile
```

### Lint

```bash
# Lint 所有代码
pnpm nx run-many -t lint

# Lint 特定应用
pnpm nx lint backend
```

### 查看项目图

```bash
pnpm nx graph
```

## 📚 技术栈

### 后端
- NestJS 11.x
- TypeScript
- class-validator & class-transformer

### Web 端
- Next.js 16 (App Router)
- React 19
- Ant Design 5
- CSS Modules

### 移动端
- React Native 0.79
- Gluestack UI (不使用 Tailwind)
- React 19

### Monorepo 工具
- Nx 22
- pnpm 10

## 🔍 关键配置文件

- `package.json` - pnpm overrides 配置
- `pnpm-workspace.yaml` - workspace 配置
- `apps/mobile/metro.config.js` - Metro bundler 配置（原生应用）
- `apps/mobile/vite.config.mts` - Vite 配置（Web 预览）
- `apps/mobile/.babelrc.js` - Babel 转译配置
- `apps/mobile/gluestack-ui.config.ts` - Gluestack UI 配置
- `apps/web/next.config.js` - Next.js 配置
- `libs/api-contracts/tsconfig.lib.json` - 启用装饰器支持
- `apps/backend/src/main.ts` - NestJS ValidationPipe 配置

## ⚙️ Metro 与 Vite

本项目移动端使用双构建工具：

- **Metro**: 用于 iOS/Android 原生应用构建
- **Vite**: 用于 Web 预览（通过 react-native-web）

两者互不干扰，Metro 配置已优化支持 Monorepo：
- ✅ 正确解析 libs 目录
- ✅ 正确解析根目录的 node_modules
- ✅ 支持 .svg 文件
- ✅ 支持 .cjs 和 .mjs 扩展名

## 🎨 Gluestack UI 特性

移动端使用 Gluestack UI，提供：
- 🎯 类型安全的组件
- 🎨 美观的默认主题
- ♿ 内置无障碍支持
- 📱 响应式设计
- 🚀 高性能

**不需要 Tailwind/NativeWind**，所有样式通过 Gluestack 的配置系统管理。

## 🐛 故障排除

### Metro 缓存问题

```bash
pnpm nx reset
pnpm nx run mobile:start --reset-cache
```

### iOS Pod 安装问题

```bash
cd apps/mobile/ios
pod install
cd ../../..
```

### pnpm 依赖问题

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📄 许可证

MIT
