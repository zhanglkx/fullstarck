# 子包创建指南

本文档详细介绍如何在 Monorepo 的 `packages/` 目录下创建新的子包（Subpackage）。

## 目录

- [概述](#概述)
- [创建步骤](#创建步骤)
- [package.json 配置](#packagejson-配置)
- [TypeScript 配置](#typescript-配置)
- [构建工具配置](#构建工具配置)
- [示例：创建 @fullstack/hooks](#示例创建-fullstackhooks)
- [验证与发布](#验证与发布)

---

## 概述

### 什么是子包？

子包是 Monorepo 中独立发布的共享代码单元。在本项目中：

| 目录 | 用途 | 示例 |
|------|------|------|
| `apps/` | 可部署的应用 | `api`、`web`、`mobile` |
| `packages/` | 共享的子包 | `@fullstack/shared`、`@fullstack/hooks` |

### 子包命名规范

```
@组织名/包名
```

例如：
- `@fullstack/shared` - 共享工具和类型
- `@fullstack/hooks` - React 自定义 Hooks
- `@fullstack/ui` - UI 组件库
- `@fullstack/config` - 共享配置

---

## 创建步骤

### 1. 创建子包目录

在 `packages/` 下创建子包目录：

```bash
mkdir -p packages/hooks/src
```

### 2. 初始化 package.json

创建 `packages/hooks/package.json`：

```json
{
  "name": "@fullstack/hooks",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "pnpm build --watch",
    "lint": "eslint src/",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.9.3"
  }
}
```

### 3. 配置 TypeScript

创建 `packages/hooks/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

### 4. 创建入口文件

创建 `packages/hooks/src/index.ts`：

```typescript
export { useCounter } from './useCounter';
export { useToggle } from './useToggle';
// 导出更多 hooks...
```

创建具体 hook 文件，例如 `packages/hooks/src/useCounter.ts`：

```typescript
import { useState, useCallback } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}
```

### 5. 添加到 workspace

pnpm workspace 会自动扫描 `packages/*` 目录，验证安装：

```bash
pnpm install
```

---

## package.json 配置

### 核心字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| `name` | 是 | 包名，必须包含作用域 `@组织名/包名` |
| `version` | 是 | 语义化版本号 |
| `private` | 是 | 设为 `true` 防止意外发布到 npm |
| `main` | 是 | CommonJS 入口 |
| `module` | 是 | ESM 入口 |
| `types` | 是 | TypeScript 类型定义 |
| `exports` | 是 | 条件导出，支持多种模块系统 |

### exports 字段详解

`exports` 字段用于条件导出，支持不同的模块系统：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "default": "./dist/index.js"
    }
  }
}
```

**条件说明：**

| 条件 | 用途 |
|------|------|
| `types` | TypeScript 类型定义 |
| `import` | ES Module (import) |
| `require` | CommonJS (require) |
| `default` | 默认 fallback |

---

## TypeScript 配置

### 继承基础配置

项目根目录的 `tsconfig.base.json` 定义了基础配置：

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

子包的 `tsconfig.json` 继承基础配置并做适当调整：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

**关键配置说明：**

| 配置 | 说明 |
|------|------|
| `extends` | 继承基础配置 |
| `outDir` | 输出目录 |
| `rootDir` | 源码根目录 |
| `jsx` | React JSX 配置（UI 库需要）|

---

## 构建工具配置

### 使用 tsup

[tsup](https://github.com/egoist/tsup) 是一个简单高效的构建工具，基于 esbuild。

#### 安装 tsup

```bash
pnpm add -D tsup
```

#### 配置 tsup

在子包目录下创建 `tsup.config.ts`：

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
```

#### 构建脚本

`package.json` 中的构建命令：

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist"
  }
}
```

---

## 示例：创建 @fullstack/hooks

### 完整示例

#### 1. 创建目录结构

```bash
mkdir -p packages/hooks/src
```

#### 2. package.json

```json
{
  "name": "@fullstack/hooks",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "react": "^19.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.9.3"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
```

**注意**：`react` 作为 peerDependency，而不是 dependency。

#### 3. tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 4. tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react'],
});
```

#### 5. src/index.ts

```typescript
export { useCounter } from './useCounter';
export { useToggle } from './useToggle';
export { useLocalStorage } from './useLocalStorage';
```

#### 6. 编写 Hooks

**src/useCounter.ts**
```typescript
import { useState, useCallback } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}
```

**src/useToggle.ts**
```typescript
import { useState, useCallback } from 'react';

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}
```

**src/useLocalStorage.ts**
```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {}
  }, [key, storedValue]);

  return storedValue;
}
```

#### 7. 构建

```bash
pnpm --filter @fullstack/hooks build
```

---

## 验证与发布

### 验证子包

#### 1. 链接到其他项目

在 `packages/shared` 中使用 `@fullstack/hooks`：

```bash
cd packages/shared
pnpm add @fullstack/hooks
```

pnpm 会自动解析到 workspace 中的本地包。

#### 2. 运行构建

```bash
# 构建单个子包
pnpm --filter @fullstack/hooks build

# 构建所有包
pnpm build
```

### 发布到 npm

如果需要将子包发布到 npm：

1. 修改 `package.json`，将 `private` 改为 `false`

2. 配置 npm 认证

3. 发布

```bash
pnpm --filter @fullstack/hooks publish
```

---

## 下一步

- [子包使用指南](./subpackage-use.md) - 了解在不同场景下如何使用子包
- [依赖版本管理](./dependency-management.md) - 了解 workspace 协议和版本管理
