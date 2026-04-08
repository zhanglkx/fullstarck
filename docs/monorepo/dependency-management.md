# 依赖版本管理

本文档详细介绍 Monorepo 中的依赖版本管理机制，包括 pnpm workspace 协议、版本策略以及发布流程。

## 目录

- [概述](#概述)
- [pnpm workspace 协议详解](#pnpm-workspace-协议详解)
- [版本策略](#版本策略)
- [版本锁定与更新](#版本锁定与更新)
- [发布流程](#发布流程)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 概述

### 依赖类型

在 Monorepo 中，存在三种类型的依赖：

```
fullstarck/
├── apps/
│   ├── api/          # 应用：依赖 packages 中的子包
│   ├── web/
│   └── mobile/
├── packages/
│   ├── shared/       # 子包：可以被 apps 依赖，也可以依赖其他 packages
│   └── hooks/        # 子包：被其他包依赖
└── node_modules/     # 根目录：所有依赖的扁平化安装位置
```

### 依赖关系图

```
                    ┌─────────────┐
                    │   apps/    │
                    │  (应用层)  │
                    └──────┬──────┘
                           │ 依赖
                           ▼
                    ┌─────────────┐
                    │ packages/   │
                    │  (共享层)   │
                    └──────┬──────┘
                           │ 依赖
                           ▼
                    ┌─────────────┐
                    │   npm/      │
                    │ (外部依赖)  │
                    └─────────────┘
```

---

## pnpm workspace 协议详解

### workspace:\* 协议

指向 workspace 中该包的最新版本。

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:*"
  }
}
```

**特性：**

- 自动解析到 workspace 中的包
- 始终获取本地版本
- 适合开发阶段

**工作原理：**

```
packages/hooks@0.0.1 ──► apps/web 的 node_modules/@fullstack/hooks (符号链接)
                              │
                              └──► packages/hooks/
```

### workspace:^ 协议

指向 workspace 中该包的兼容版本（基于语义化版本）。

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:^1.0.0"
  }
}
```

**特性：**

- 只有当 workspace 中的版本满足 semver 范围时才解析
- 适合需要版本控制的场景

### workspace:~ 协议

更严格的版本匹配，只接受补丁版本更新。

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:~1.0.0"
  }
}
```

### workspace:> 协议

接受大于指定版本的版本。

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:>1.0.0"
  }
}
```

### 对比表

| 协议          | 示例             | 说明                                |
| ------------- | ---------------- | ----------------------------------- |
| `workspace:*` | `*`              | 始终使用 workspace 中最新版本       |
| `workspace:^` | `^1.0.0`         | 兼容 workspace 中的次版本和补丁版本 |
| `workspace:~` | `~1.0.0`         | 只兼容 workspace 中的补丁版本       |
| `workspace:>` | `>1.0.0`         | 大于指定版本                        |
| `workspace:~` | `>=1.0.0 <2.0.0` | 指定版本范围                        |

### 简化写法

pnpm 支持简化写法，不写 `workspace:` 前缀：

```json
{
  "dependencies": {
    "@fullstack/hooks": "*"
  }
}
```

pnpm 会自动优先解析 workspace 中的包。

---

## 版本策略

### 开发阶段

使用 `workspace:*` 进行本地开发：

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:*",
    "@fullstack/shared": "workspace:*"
  }
}
```

**优点：**

- 代码修改即时生效
- 无需手动更新版本号
- 开发体验流畅

### 测试阶段

使用 `workspace:^` 或具体范围：

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:^1.0.0",
    "@fullstack/shared": "workspace:^1.0.0"
  }
}
```

**优点：**

- 允许小版本更新
- 获得安全补丁
- 保持 API 兼容性

### 生产阶段

使用 `^x.y.z` 锁定主版本：

```json
{
  "dependencies": {
    "@fullstack/hooks": "^1.0.0",
    "@fullstack/shared": "^1.0.0"
  }
}
```

**说明：**

- 这是发布到 npm 后的标准做法
- 允许获取补丁和次版本更新
- 不兼容的主版本变化需要手动升级

---

## 版本锁定与更新

### pnpm-lock.yaml

pnpm 使用 `pnpm-lock.yaml` 锁定确切的依赖版本：

```yaml
lockfileVersion: '9.0'

importers:
  '.':
    dependencies:
      '@fullstack/hooks':
        specifier: workspace:*
        version: link:packages/hooks
      '@fullstack/shared':
        specifier: workspace:*
        version: link:packages/shared

  packages/hooks:
    dependencies:
      react:
        specifier: ^19.0.0
        version: 19.0.0

  apps/web:
    dependencies:
      '@fullstack/hooks':
        specifier: workspace:*
        version: link:packages/hooks
```

**注意：**

- 提交 `pnpm-lock.yaml` 到版本控制
- 不要手动编辑

### 更新依赖

```bash
# 更新到最新版本
pnpm up @fullstack/hooks

# 更新到指定版本
pnpm up @fullstack/hooks@1.1.0

# 更新所有依赖
pnpm up

# 更新到 workspace 中的最新版本
pnpm up @fullstack/hooks --filter workspace
```

### 升级版本策略

```bash
# 升级补丁版本 (1.0.0 -> 1.0.1)
pnpm version patch

# 升级次版本 (1.0.0 -> 1.1.0)
pnpm version minor

# 升级主版本 (1.0.0 -> 2.0.0)
pnpm version major
```

---

## 发布流程

### 手动发布

#### 1. 构建所有子包

```bash
pnpm build
```

#### 2. 修改发布状态

将 `private: true` 改为 `false`：

```json
{
  "name": "@fullstack/hooks",
  "private": false,
  "version": "1.0.0"
}
```

#### 3. 发布到 npm

```bash
cd packages/hooks
pnpm publish
```

#### 4. 版本自动转换

发布后，workspace 协议会自动转换为实际版本号：

发布前：

```json
{
  "dependencies": {
    "@fullstack/hooks": "workspace:*"
  }
}
```

发布后：

```json
{
  "dependencies": {
    "@fullstack/hooks": "^1.0.0"
  }
}
```

### 使用 Changesets 管理版本

[Changesets](https://github.com/changesets/changesets) 是推荐的版本管理工具。

#### 1. 安装

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

#### 2. 创建 changeset

```bash
pnpm changeset
```

这会创建一个新的 changeset 文件，描述要发布的变更。

#### 3. 版本更新

```bash
pnpm changeset version
```

这会根据 changeset 更新所有包的版本。

#### 4. 发布

```bash
pnpm publish -r
```

### 发布脚本

在根 `package.json` 中添加发布脚本：

```json
{
  "scripts": {
    "release": "pnpm build && pnpm changeset version && pnpm publish -r"
  }
}
```

---

## 最佳实践

### 1. 正确声明 peerDependencies

对于被其他项目依赖的包，正确声明 peerDependencies：

```json
{
  "name": "@fullstack/hooks",
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
```

**避免将 react 放入 dependencies**，这会导致版本冲突。

### 2. 避免循环依赖

```
packages/hooks ──► packages/shared ◄── apps/web
     ▲                │
     └────────────────┘
     禁止：循环依赖会导致构建失败
```

### 3. 使用严格的构建顺序

在 `turbo.json` 中配置依赖关系：

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 4. 使用 alias 解决版本冲突

如果需要同一包的多个版本，使用 alias：

```json
{
  "dependencies": {
    "lodash-es": "npm:lodash@4.17.21"
  }
}
```

### 5. 使用 onlyBuiltDependencies

控制哪些包需要构建：

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["@nestjs/core", "esbuild"]
  }
}
```

### 6. 配置 .npmrc

在根目录配置 `.npmrc`：

```
# 不自动添加 peerDependencies
legacy-peer-deps=false

# 优先使用 workspace 协议
use-workspace-version=true

# 安装所有 peer dependencies
resolve-peer-dependencies=true
```

---

## 常见问题

### Q1: workspace 协议不生效？

检查是否正确安装：

```bash
pnpm install
```

确认 pnpm 版本 >= 6.0。

### Q2: 依赖版本冲突？

使用 pnpm 的依赖分析：

```bash
pnpm why <package-name>
```

### Q3: 如何强制使用本地版本？

```bash
pnpm add @fullstack/hooks@workspace:*
```

### Q4: 发布后版本变成 npm 版本？

这是正常行为。发布后 pnpm 会自动将 `workspace:*` 转换为实际版本。

### Q5: 如何回滚到 workspace 协议？

```bash
pnpm add @fullstack/hooks@workspace:*
```

---

## 下一步

- [子包创建指南](./subpackage-create.md) - 创建新的子包
- [子包使用指南](./subpackage-use.md) - 了解在不同场景下如何使用子包
