# 项目文档

本目录包含项目的各类说明文档，按照功能分类存储。

## 文档目录

### Monorepo 指南

| 文档                                                | 说明                                   |
| --------------------------------------------------- | -------------------------------------- |
| [Monorepo 架构指南](./monorepo/index.md)            | 项目架构概览、目录结构、技术选型       |
| [子包创建指南](./monorepo/subpackage-create.md)     | 如何在 packages/ 下创建新的子包        |
| [子包使用指南](./monorepo/subpackage-use.md)        | 在 shared 和 apps 中使用子包的各种场景 |
| [依赖版本管理](./monorepo/dependency-management.md) | workspace 协议、版本策略、发布流程     |

### 参考文档

| 文档                                | 说明             |
| ----------------------------------- | ---------------- |
| [命令参考](./reference/commands.md) | 常用开发命令汇总 |

---

## 快速链接

### 常用操作

- **安装依赖**: `pnpm install`
- **启动开发**: `pnpm dev`
- **构建项目**: `pnpm build`
- **运行测试**: `pnpm test`

### 子包相关

1. [创建新子包](./monorepo/subpackage-create.md) - 完整步骤指南
2. [使用子包](./monorepo/subpackage-use.md) - 6 种使用场景详解
3. [版本管理](./monorepo/dependency-management.md) - workspace 协议详解

---

## 文档规范

- 所有说明类文档（非 AGENTS.md、README.md）放在 `docs/` 目录
- 文档按主题分类到子目录
- 使用中文编写
- 保持排版整洁，代码示例清晰

---

## 相关链接

- [项目 README](../README.md) - 项目基本信息
- [快速入门](../GETTING_STARTED.md) - 开发环境配置
- [AGENTS.md](../AGENTS.md) - AI 编码助手指南
