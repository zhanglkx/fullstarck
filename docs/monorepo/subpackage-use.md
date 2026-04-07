# 子包使用指南

本文档详细介绍如何在 Monorepo 中使用子包，包括在不同项目中的引用方式、版本管理以及本地开发场景。

## 目录

- [概述](#概述)
- [使用场景总览](#使用场景总览)
- [场景一：在 shared 中使用 workspace 开发](#场景一在-shared-中使用-workspace-开发)
- [场景二：在 shared 中使用指定版本](#场景二在-shared-中使用指定版本)
- [场景三：在 shared 中使用本地链接开发](#场景三在-shared-中使用本地链接开发)
- [场景四：在 apps 中使用 workspace 开发](#场景四在-apps-中使用-workspace-开发)
- [场景五：在 apps 中使用指定版本](#场景五在-apps-中使用指定版本)
- [场景六：在 apps 中使用本地链接开发](#场景六在-apps-中使用本地链接开发)
- [跨场景对比](#跨场景对比)
- [最佳实践](#最佳实践)

---

## 概述

在 Monorepo 中，子包（如 `@fullstack/hooks`）可以在多个层级被使用：

```
fullstarck/
├── apps/
│   ├── api/          # NestJS 后端
│   ├── web/          # Next.js 前端
│   └── mobile/       # Expo 移动端
├── packages/
│   ├── shared/       # 共享工具库
│   └── hooks/        # React Hooks 库 (@fullstack/hooks)
└── docs/
```

**使用链路：**

- `apps` 可以直接使用 `packages` 中的任意子包
- `packages` 之间可以相互依赖（如 `shared` 依赖 `hooks`）

---

## 使用场景总览

| 场景 | 使用位置 | 场景描述 | 推荐协议 |
|------|----------|----------|----------|
| 1 | shared | 开发中引用 hooks，使用 workspace 协议 | `workspace:*` |
| 2 | shared | 发布后引用 hooks，使用具体版本 | `^1.0.0` |
| 3 | shared | 本地开发调试，使用 pnpm link | 本地路径 |
| 4 | apps | 开发中引用 hooks，使用 workspace 协议 | `workspace:*` |
| 5 | apps | 发布后引用 hooks，使用具体版本 | `^1.0.0` |
| 6 | apps | 本地开发调试，使用 pnpm link | 本地路径 |

---

## 场景一：在 shared 中使用 workspace 开发

### 场景描述

在 `packages/shared` 中使用 `@fullstack/hooks`，处于开发阶段，希望实时同步 hooks 的代码变更。

### 实现方式

#### 1. 添加依赖

在 `packages/shared` 目录下添加依赖：

```bash
cd packages/shared
pnpm add @fullstack/hooks
```

#### 2. 查看 package.json

pnpm 会自动使用 workspace 协议：

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:*"
  }
}
```

#### 3. 使用 hooks

在 `packages/shared/src` 中使用：

```typescript
// packages/shared/src/utils/index.ts
import { useCounter } from '@fullstack/hooks';

export function CounterComponent() {
  const { count, increment, decrement, reset } = useCounter(10);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### 工作原理

- `workspace:*` 协议告诉 pnpm 优先使用 workspace 中最新版本的包
- pnpm 会创建符号链接指向 `packages/hooks`
- 修改 `packages/hooks` 的代码，`packages/shared` 会立即生效（需要重新构建）

### 注意事项

1. 需要先构建 `@fullstack/hooks`：
   ```bash
   pnpm --filter @fullstack/hooks build
   ```

2. shared 也需要构建以包含 hooks 的代码：
   ```bash
   pnpm --filter @fullstack/shared build
   ```

---

## 场景二：在 shared 中使用指定版本

### 场景描述

`@fullstack/hooks` 已经发布到 npm（或私有仓库），在 `packages/shared` 中使用特定版本。

### 实现方式

#### 1. 发布 hooks 到 npm

先发布 hooks：

```bash
cd packages/hooks
pnpm publish
```

#### 2. 添加带版本的依赖

```bash
cd packages/shared
pnpm add @fullstack/hooks@1.0.0
```

#### 3. package.json 效果

```json
{
  "dependencies": {
    "@fullstack/hooks": "^1.0.0"
  }
}
```

#### 4. 升级版本

```bash
# 升级到最新补丁版本
pnpm add @fullstack/hooks@^1.0.1

# 升级到最新次版本
pnpm add @fullstack/hooks@^1.1.0

# 升级到最新主版本
pnpm add @fullstack/hooks@^2.0.0
```

### 版本号规则

| 版本策略 | 示例 | 说明 |
|----------|------|------|
| 精确版本 | `1.0.0` | 锁定到特定版本 |
|  caret ^ | `^1.0.0` | 兼容次版本和补丁版本变化 |
| tilde ~ | `~1.0.0` | 兼容补丁版本变化 |
| latest | `latest` | 始终使用最新版本 |

**建议**：在生产环境使用 `^x.y.z` 以获得安全补丁，同时保持 API 兼容性。

---

## 场景三：在 shared 中使用本地链接开发

### 场景描述

`@fullstack/hooks` 可能不在当前 monorepo 中，或者需要同时开发多个 monorepo 中的包，使用 pnpm link 进行本地链接。

### 实现方式一：pnpm link

#### 1. 在 hooks 包目录创建全局链接

```bash
cd packages/hooks
pnpm link
```

#### 2. 在 shared 中使用链接

```bash
cd packages/shared
pnpm link @fullstack/hooks
```

#### 3. package.json 效果

```json
{
  "dependencies": {
    "@fullstack/hooks": "link:../../hooks"
  }
}
```

### 实现方式二：pnpm add 直接引用本地路径

```bash
cd packages/shared
pnpm add @fullstack/hooks --filter packages/hooks
```

或者直接编辑 package.json：

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:*"
  }
}
```

然后运行：

```bash
pnpm install
```

### 实现方式三：pnpm workspace 协议（推荐）

如果 hooks 在同一个 workspace 中，直接使用 workspace 协议：

```bash
cd packages/shared
pnpm add @fullstack/hooks@workspace:*
```

或简写：

```bash
pnpm add @fullstack/hooks
```

pnpm 会自动解析到 workspace 中的包。

### 三种方式对比

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| `workspace:*` | 自动解析，无需额外操作 | 需要在同一 workspace | 同一 monorepo |
| `pnpm link` | 可跨 monorepo 链接 | 需要手动操作 | 多仓库同时开发 |
| `link:` 协议 | 明确的本地路径 | 路径硬编码 | 临时调试 |

---

## 场景四：在 apps 中使用 workspace 开发

### 场景描述

直接在 `apps/web`（Next.js）或 `apps/api`（NestJS）中使用 `@fullstack/hooks`。

### 在 apps/web (Next.js) 中使用

#### 1. 添加依赖

```bash
cd apps/web
pnpm add @fullstack/hooks
```

#### 2. package.json 自动解析

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:*"
  }
}
```

#### 3. 在组件中使用

```typescript
// apps/web/src/app/page.tsx
'use client';

import { useCounter } from '@fullstack/hooks';

export default function HomePage() {
  const { count, increment, decrement } = useCounter(0);
  
  return (
    <main>
      <h1>Counter: {count}</h1>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </main>
  );
}
```

### 在 apps/api (NestJS) 中使用

NestJS 是后端框架，通常不需要 React hooks。但如果是使用 shared 中的工具函数，流程类似：

#### 1. 添加 shared 依赖

```bash
cd apps/api
pnpm add @fullstack/shared
```

#### 2. 在服务中使用

```typescript
// apps/api/src/app.service.ts
import { Injectable } from '@nestjs/common';
import { formatDate, ApiResponse } from '@fullstack/shared';

@Injectable()
export class AppService {
  getHello(): ApiResponse<string> {
    return {
      data: formatDate(new Date()),
      message: 'Hello World',
      success: true,
    };
  }
}
```

### 在 apps/mobile (Expo) 中使用

#### 1. 添加依赖

```bash
cd apps/mobile
pnpm add @fullstack/hooks
```

#### 2. 在组件中使用

```typescript
// apps/mobile/App.tsx
import { useToggle } from '@fullstack/hooks';
import { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {
  const { value: isOn, toggle } = useToggle(false);
  
  return (
    <View style={styles.container}>
      <Text>状态: {isOn ? '开' : '关'}</Text>
      <TouchableOpacity onPress={toggle}>
        <Text>切换</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

## 场景五：在 apps 中使用指定版本

### 场景描述

在生产环境或 CI/CD 中，使用已发布的特定版本。

### 实现方式

#### 1. 发布子包

```bash
# 发布 hooks
cd packages/hooks
pnpm publish

# 发布 shared（hooks 作为依赖会自动包含）
cd packages/shared
pnpm publish
```

#### 2. 在 apps 中添加版本依赖

```bash
cd apps/web
pnpm add @fullstack/hooks@1.0.0
pnpm add @fullstack/shared@1.0.0
```

#### 3. package.json 效果

```json
{
  "dependencies": {
    "@fullstack/hooks": "^1.0.0",
    "@fullstack/shared": "^1.0.0"
  }
}
```

### 版本锁定策略

| 策略 | 配置 | 说明 |
|------|------|------|
| 严格锁定 | `1.0.0` | 不更新任何版本 |
| 灵活版本 | `^1.0.0` | 接受兼容更新 |
| 范围版本 | `>=1.0.0 <2.0.0` | 指定版本范围 |

**推荐**：使用 `^x.y.z` 平衡灵活性和稳定性。

---

## 场景六：在 apps 中使用本地链接开发

### 场景描述

需要同时开发 hooks 和 web/mobile/api，实时看到效果。

### 实现方式一：workspace 协议（同一 monorepo）

```bash
cd apps/web
pnpm add @fullstack/hooks@workspace:*
```

### 实现方式二：pnpm link（跨仓库）

假设 hooks 在另一个仓库：

```bash
# 在 hooks 仓库
cd packages/hooks
pnpm link

# 在 web 应用
cd apps/web
pnpm link @fullstack/hooks
```

### 实现方式三：file: 协议

```bash
cd apps/web
pnpm add @fullstack/hooks@file:../packages/hooks
```

pnpm 会复制文件而非链接。

---

## 跨场景对比

### 依赖来源对比

```
┌─────────────────────────────────────────────────────────────────┐
│                        依赖来源                                  │
├─────────────────┬─────────────────┬───────────────────────────┤
│   workspace     │     npm/publish │      本地开发             │
├─────────────────┼─────────────────┼───────────────────────────┤
│ workspace:*     │  ^1.0.0         │  link: 协议               │
│ workspace:^     │  ~1.0.0         │  pnpm link                │
│ workspace:~     │  1.0.0          │  file: 协议               │
│ workspace:>    │  latest         │                           │
└─────────────────┴─────────────────┴───────────────────────────┘
```

### 开发流程对比

| 阶段 | 推荐协议 | 原因 |
|------|----------|------|
| 本地开发 | `workspace:*` | 实时同步，无需手动更新 |
| Code Review | `workspace:*` | CI 会自动构建 |
| 测试环境 | `^x.y.z` | 允许小版本更新 |
| 生产环境 | `^x.y.z` 或锁定 | 平衡稳定性和安全性 |

---

## 最佳实践

### 1. 优先使用 workspace 协议

在 monorepo 内部开发时，始终使用 `workspace:*`：

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:*",
    "@fullstack/shared": "workspace:*"
  }
}
```

### 2. 确保构建顺序

子包需要在使用前构建：

```bash
# 正确顺序：先构建依赖，再构建使用方
pnpm --filter @fullstack/hooks build
pnpm --filter @fullstack/shared build
pnpm --filter web build
```

### 3. 使用 Turborepo 优化构建

配置 `turbo.json` 定义构建管道：

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

### 4. 善用 peerDependencies

对于 React 库，正确声明 peerDependencies：

```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

### 5. 避免循环依赖

```
apps/api  ─────┐
      ▲       │
      │       ▼
packages/shared ◄── packages/hooks
       ▲
       │
       └── 不要让 shared 依赖 apps
```

### 6. 使用 changeset 管理版本

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

发布时：

```bash
pnpm changeset version
pnpm publish -r
```

---

## 下一步

- [依赖版本管理](./dependency-management.md) - 深入了解 workspace 协议
- [创建子包指南](./subpackage-create.md) - 创建新的子包
