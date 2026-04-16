# 项目文档

本目录包含项目的各类说明文档，按照功能分类存储。

## 文档目录

### 功能特性文档

| 文档                                                 | 说明                                       |
| ---------------------------------------------------- | ------------------------------------------ |
| [服务器状态监控](./features/SERVER_STATE_MONITOR.md) | 服务器 CPU、内存、磁盘监控功能的实现与使用 |
| [骨架屏实现文档](./features/SKELETON.md)             | Ant Design Skeleton 组件的使用与页面骨架屏 |

### Monorepo 指南

| 文档                                                | 说明                                   |
| --------------------------------------------------- | -------------------------------------- |
| [Monorepo 架构指南](./monorepo/index.md)            | 项目架构概览、目录结构、技术选型       |
| [子包创建指南](./monorepo/subpackage-create.md)     | 如何在 packages/ 下创建新的子包        |
| [子包使用指南](./monorepo/subpackage-use.md)        | 在 shared 和 apps 中使用子包的各种场景 |
| [依赖版本管理](./monorepo/dependency-management.md) | workspace 协议、版本策略、发布流程     |

### API 文档

| 文档                                                   | 说明                                    |
| ------------------------------------------------------ | --------------------------------------- |
| [模块生成器](./api/generate-module.md)                 | 使用 NestJS 模块生成器快速创建模块      |
| [统一响应格式](./api/unified-response.md)              | API 响应拦截器与统一数据格式            |
| [后端改进分步指南](./api/backend-improvement-guide.md) | 日志、JWT、数据库、安全、测试等落地步骤 |

### Web 应用文档

| 文档                                     | 说明                                           |
| ---------------------------------------- | ---------------------------------------------- |
| [Web 应用概览](./web/README.md)          | Next.js 16 Web 应用架构、技术栈与页面结构      |
| [IP 访问修复](./web/IP-ACCESS-FIX.md)    | Next.js 16 IP 地址访问问题的完整分析与解决方案 |
| [IP 访问验证](./web/IP-ACCESS-VERIFY.md) | IP 访问修复后的验证测试步骤                    |

### Mobile 应用文档

| 文档                                              | 说明                             |
| ------------------------------------------------- | -------------------------------- |
| [Mobile 应用概览](./mobile/README.md)             | Expo 55 移动应用架构与配置说明   |
| [Expo Router 指南](./mobile/EXPO_ROUTER_GUIDE.md) | Expo Router 文件路由系统使用指南 |
| [Zustand 状态管理](./mobile/ZUSTAND_GUIDE.md)     | Zustand 轻量级状态管理库使用指南 |
| [技术选型参考](./mobile/tech-selection.md)        | 移动端现代技术栈推荐（综合整理） |

### 开发指南

| 文档                                       | 说明                       |
| ------------------------------------------ | -------------------------- |
| [快速入门](./guides/GETTING_STARTED.md)    | 开发环境配置与项目启动步骤 |
| [移动端开发指南](./guides/MOBILE_GUIDE.md) | 移动端应用开发完整指南     |

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

- 所有说明类文档（非 AGENTS.md、README.md、CLAUDE.md）放在 `docs/` 目录
- 文档按主题分类到对应子目录：
  - `features/` - 功能特性文档
  - `monorepo/` - 架构与包管理文档
  - `api/` - 后端 API 文档
  - `web/` - Web 前端文档
  - `mobile/` - 移动端文档
  - `guides/` - 开发指南
  - `reference/` - 参考手册
- 使用中文编写
- 保持排版整洁，代码示例清晰
- **创建文档时，优先补充已有文档，不存在相关文档时再创建新文档**

---

## 相关链接

- [项目 README](../README.md) - 项目基本信息
- [CLAUDE.md](../CLAUDE.md) - Claude Code 项目指引
- [AGENTS.md](../AGENTS.md) - AI 编码助手配置
