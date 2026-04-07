# 命令参考

本文档汇总项目常用的开发命令。

## 目录

- [根目录命令](#根目录命令)
- [API 命令](#api-命令)
- [Web 命令](#web-命令)
- [Mobile 命令](#mobile-命令)
- [子包命令](#子包命令)
- [实用技巧](#实用技巧)

---

## 根目录命令

### 安装与构建

```bash
# 安装所有依赖
pnpm install

# 构建所有项目
pnpm build

# 清理构建产物
pnpm clean

# 删除 node_modules
pnpm clean --deep
```

### 开发模式

```bash
# 启动所有应用
pnpm dev

# 仅启动 API
pnpm dev:api

# 仅启动 Web
pnpm dev:web

# 仅启动 Mobile
pnpm dev:mobile
```

### 测试与检查

```bash
# 运行所有测试
pnpm test

# 运行 lint 检查
pnpm lint

# 格式检查
pnpm format
```

---

## API 命令

### 开发

```bash
# 启动开发模式（热重载）
pnpm --filter api dev

# 生产构建
pnpm --filter api build

# 生产运行
pnpm --filter api start
```

### 测试

```bash
# 运行测试
pnpm --filter api test

# 监听模式
pnpm --filter api test:watch

# 覆盖率
pnpm --filter api test:cov

# E2E 测试
pnpm --filter api test:e2e
```

### 代码质量

```bash
# ESLint（自动修复）
pnpm --filter api lint

# Prettier 格式化
pnpm --filter api format

# 运行单个测试文件
pnpm --filter api test -- src/app.controller.spec.ts

# 按名称运行测试
pnpm --filter api test -- --testNamePattern="should return"
```

---

## Web 命令

### 开发

```bash
# 启动开发服务器
pnpm --filter web dev

# 生产构建
pnpm --filter web build

# 生产运行
pnpm --filter web start
```

### 代码质量

```bash
# ESLint 检查
pnpm --filter web lint
```

---

## Mobile 命令

### 开发

```bash
# 启动 Expo 开发服务器
pnpm --filter mobile start

# 运行 iOS 模拟器
pnpm --filter mobile ios

# 运行 Android 模拟器
pnpm --filter mobile android
```

---

## 子包命令

### 构建子包

```bash
# 构建 shared
pnpm --filter @fullstack/shared build

# 构建 hooks（如已创建）
pnpm --filter @fullstack/hooks build
```

### 开发模式（监听）

```bash
# 监听 shared 变化
pnpm --filter @fullstack/shared dev

# 监听 hooks 变化
pnpm --filter @fullstack/hooks dev
```

---

## 实用技巧

### 使用 pnpm filter

```bash
# 运行特定应用
pnpm --filter api dev
pnpm --filter web dev

# 运行多个
pnpm --filter "api|web" dev
```

### 查看依赖关系

```bash
# 查看包依赖
pnpm why @fullstack/shared

# 查看 workspace 列表
pnpm list -r --depth=0
```

### 快速操作

```bash
# 安装依赖到特定包
pnpm --filter web add lodash

# 添加开发依赖
pnpm --filter api add -D typescript

# 删除依赖
pnpm --filter web remove lodash
```

---

## 环境变量

### 创建环境变量文件

```bash
# 复制示例文件
cp .env.example .env
```

### 常用变量

| 变量 | 说明 |
|------|------|
| `NODE_ENV` | 运行环境 |
| `PORT` | 服务端口 |
| `DATABASE_URL` | 数据库连接 |
