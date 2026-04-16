# Web 应用文档

## 概述

Web 应用基于 **Next.js 16** + **React 19** + **Ant Design 6** 构建，使用 App Router 和 Server Components。

### 技术栈

| 技术         | 版本 | 用途                       |
| ------------ | ---- | -------------------------- |
| Next.js      | 16   | 框架（App Router）         |
| React        | 19   | UI 库（Server Components） |
| Ant Design   | 6    | UI 组件库                  |
| Axios        | -    | HTTP 客户端                |
| ECharts      | -    | 图表可视化                 |
| SCSS Modules | -    | 样式方案                   |

### 页面结构

```
app/
├── page.tsx              # 首页
├── layout.tsx            # 根布局（AntdProvider 包裹）
├── api-test/page.tsx     # API 测试页（Server Component 示例）
├── serverstate/page.tsx  # 服务器状态监控（CPU/内存/磁盘）
├── npmdata/page.tsx      # NPM 下载量图表（ECharts）
└── qrcode/
    ├── page.tsx          # 二维码生成
    └── confirm/page.tsx  # 二维码确认扫码
```

### 核心架构

- **API 层**: `src/lib/axios.ts` + `src/lib/api-client.ts` + `src/api/` 按领域组织
- **SSR/CSR 适配**: axios 拦截器动态设置 baseURL（服务端直连 / 客户端走 rewrites 代理）
- **组件**: `src/components/AntdProvider.tsx` 提供主题配置，`src/components/skeletons/` 提供骨架屏
- **样式**: SCSS Modules + Ant Design 组件样式

## 文档列表

| 文档                                 | 说明                                           |
| ------------------------------------ | ---------------------------------------------- |
| [IP 访问修复](./IP-ACCESS-FIX.md)    | Next.js 16 IP 地址访问问题的完整分析与解决方案 |
| [IP 访问验证](./IP-ACCESS-VERIFY.md) | IP 访问修复后的验证测试步骤                    |

## 开发命令

```bash
pnpm dev:web              # 启动开发服务器（localhost:3001）
pnpm --filter web build   # 构建生产版本
pnpm --filter web lint    # ESLint 检查
```

---

**最后更新:** 2026-04-15
