# 快速入门指南

## 0. 安装 pnpm（如果尚未安装）

```bash
# 使用 npm 全局安装
npm install -g pnpm@latest

# 验证安装
pnpm --version
```

## 1. 安装依赖

```bash
pnpm install
```

## 2. 启动开发服务器

### 方式一：同时启动所有项目

```bash
pnpm dev
```

这将在不同端口启动三个项目：
- API: http://localhost:3000
- Web: http://localhost:3001（或其他可用端口）
- Mobile: Expo 开发服务器

### 方式二：分别启动各个项目

```bash
# 启动后端 API（端口 3000）
pnpm dev:api

# 启动前端 Web（端口 3001）
pnpm dev:web

# 启动移动端（需要 Expo Go 应用或模拟器）
pnpm dev:mobile
```

## 3. 访问项目

- **API 文档**: 启动后端后，可以访问 http://localhost:3000
- **Web 应用**: 启动前端后，在浏览器中打开 http://localhost:3001
- **Mobile 应用**: 
  - 安装 Expo Go 应用（iOS/Android）
  - 扫描终端中显示的二维码
  - 或者在模拟器中运行

## 4. 项目开发

### API (NestJS)

添加新的控制器或服务：

```bash
cd apps/api
nest g controller users
nest g service users
```

### Web (Next.js)

创建新页面：

```bash
# 在 apps/web/src/app/ 目录下创建新的页面
mkdir apps/web/src/app/about
touch apps/web/src/app/about/page.tsx
```

### Mobile (Expo)

编辑 `apps/mobile/App.tsx` 来开发移动端界面。

## 5. 使用共享包

在任意项目中使用共享代码：

```typescript
import { API_BASE_URL, formatDate } from '@fullstack/shared';
```

## 6. 构建生产版本

```bash
# 构建所有项目
pnpm build

# 或分别构建
pnpm build:api
pnpm build:web
pnpm build:mobile
```

## 常见问题

### Q: 如何添加新的依赖？

在特定项目中添加：

```bash
# 为 API 项目添加依赖
pnpm --filter api add axios

# 为 Web 项目添加依赖
pnpm --filter web add swr

# 为所有项目添加共享依赖
pnpm add -w typescript
```

### Q: 如何清理项目？

```bash
# 清理构建产物
pnpm clean

# 清理缓存
pnpm clean:cache
```

### Q: 移动端开发需要什么？

1. 安装 Expo CLI（可选）：`npm install -g expo-cli`
2. 安装 Expo Go 应用到手机或设置模拟器
3. 确保手机和电脑在同一网络

## 推荐开发流程

1. 从 `apps/api` 开始开发后端 API
2. 在 `apps/web` 开发前端界面
3. 在 `apps/mobile` 开发移动端应用
4. 在 `packages/shared` 共享类型和工具函数
5. 定期运行 `pnpm lint` 检查代码质量
