# Next.js IP 地址访问问题分析与解决方案

## 📋 问题描述

使用 `http://10.32.75.123:3001/qrcode` 访问 Next.js 应用时出现以下问题：

1. ✅ 页面能够正常渲染（SSR 成功）
2. ❌ 客户端组件不执行（Client Component 无响应）
3. ❌ API 请求失败（404/500/Network Error）
4. ❌ Antd 组件样式丢失
5. ❌ 控制台报错：WebSocket HMR 连接失败

**现象对比：**
| 访问方式 | 页面渲染 | 客户端组件 | API 调用 | 样式 | HMR |
|---------|---------|-----------|---------|-----|-----|
| `localhost:3001` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `10.32.75.123:3001` | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🔍 问题根本原因

### 1. HMR WebSocket 跨域阻止（主因）

**错误日志：**

```
⚠ Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "10.32.75.123".
WebSocket connection to 'ws://10.32.75.123:3001/_next/webpack-hmr' failed
```

**原因：**

- Next.js 16+ 默认阻止跨域 HMR 连接（安全机制）
- 用 IP 访问时，WebSocket 无法建立连接
- 导致客户端代码无法 hydrate，React 组件无法挂载

**影响链：**

```
WebSocket HMR 连接失败
    ↓
客户端 hydration 失败
    ↓
Client Component 无法正常执行
    ↓
useEffect 不触发
    ↓
API 请求不发送
    ↓
页面一直显示 "加载中..."
```

### 2. axios baseURL 配置错误（次因）

**原始错误代码：**

```typescript
// ❌ 错误：模块加载时只执行一次，导致客户端/服务端共享同一个 baseURL
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '/api'; // 客户端
  }
  return 'http://localhost:3000'; // 服务端
};
const API_BASE_URL = getApiBaseUrl(); // ⚠️ 只在模块加载时执行一次

export const apiClient = axios.create({
  baseURL: API_BASE_URL, // ⚠️ 静态值，无法动态切换
});
```

**问题：**

- 如果模块先在服务端加载，`baseURL` 被固定为 `http://localhost:3000`
- 之后在客户端使用时，仍然是 `http://localhost:3000`
- 浏览器无法从 IP 地址访问 `localhost:3000`，导致 Network Error

### 3. Next.js 默认监听配置

**默认行为：**

```bash
next dev -p 3001
# 默认只监听 127.0.0.1:3001（localhost）
# 无法通过 IP 地址访问
```

---

## ✅ 解决方案

### 修改 1：`next.config.ts` - 允许 IP 访问的 HMR

**文件：** `/apps/web/next.config.ts`

**修改前：**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 空配置
};

export default nextConfig;
```

**修改后：**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ 允许通过 IP 地址访问开发服务器（修复 HMR WebSocket 跨域问题）
  allowedDevOrigins: ['10.32.75.123'],

  // ✅ API 代理配置（客户端 /api 请求代理到后端）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
};

export default nextConfig;
```

**作用：**

1. `allowedDevOrigins`：允许指定 IP 的 WebSocket HMR 连接
2. `rewrites`：将客户端 `/api/*` 请求代理到后端 `localhost:3000`

---

### 修改 2：`axios.ts` - 动态设置 baseURL

**文件：** `/apps/web/src/lib/axios.ts`

**修改前：**

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL, // ❌ 静态值
  timeout: 10000,
});
```

**修改后：**

```typescript
// ✅ 不在创建实例时设置 baseURL
export const apiClient: AxiosInstance = axios.create({
  // baseURL 留空，在拦截器中动态设置
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 请求拦截器：每次请求时动态判断环境
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 动态设置 baseURL（每次请求时判断环境）
    if (typeof window !== 'undefined') {
      // 客户端：使用 /api 前缀（通过 Next.js rewrites 代理）
      config.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    } else {
      // 服务端：直接访问后端地址
      config.baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    }

    console.log('请求发送:', config);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  },
);
```

**关键改进：**

- 每次请求时根据 `typeof window` 动态判断环境
- 客户端：`/api` → Next.js rewrites → `http://localhost:3000`
- 服务端：直接 `http://localhost:3000`

---

### 修改 3：`package.json` - 添加网络模式启动脚本

**文件：** `/apps/web/package.json`

**修改前：**

```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--inspect' next dev -p 3001"
  }
}
```

**修改后：**

```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--inspect' next dev -p 3001",
    "dev:network": "cross-env NODE_OPTIONS='--inspect' next dev -p 3001 --hostname 0.0.0.0"
  }
}
```

**说明：**

- `dev`：默认模式，只监听 localhost（日常开发）
- `dev:network`：网络模式，监听所有网络接口（支持 IP 访问）
- `--hostname 0.0.0.0`：监听所有网络接口，允许通过 IP 访问

---

### 修改 4：`.env.local` - 优化配置说明

**文件：** `/apps/web/.env.local`

**修改后：**

```bash
# ===========================
# 前端配置（客户端可见）
# ===========================

# API 基础 URL（客户端使用）
# 默认使用相对路径 /api（通过 Next.js rewrites 代理）
# NEXT_PUBLIC_API_URL=/api

# ===========================
# 后端配置（服务端使用）
# ===========================

# 后端 API 地址（SSR 服务端使用）
# 默认: http://localhost:3000
# API_BASE_URL=http://localhost:3000

# ===========================
# 开发环境配置
# ===========================

# 如果需要通过 IP 访问（如移动设备调试），使用:
# npm run dev:network
# 然后访问: http://你的IP:3001
```

---

### 修改 5：`.env.example` - 团队协作模板

**文件：** `/apps/web/.env.example`

**修改后：**

```bash
# ===========================
# 环境变量配置模板
# 复制为 .env.local 并根据需要修改
# ===========================

# ===========================
# 前端配置（客户端可见）
# ===========================

# API 基础 URL（客户端使用）
# 开发环境推荐使用相对路径（通过 Next.js rewrites 自动代理）
# NEXT_PUBLIC_API_URL=/api

# ===========================
# 后端配置（仅服务端可见）
# ===========================

# 后端 API 地址（SSR 服务端调用）
API_BASE_URL=http://localhost:3000

# ===========================
# 开发模式说明
# ===========================
# 本地开发: npm run dev (默认 localhost:3001)
# 网络访问: npm run dev:network (支持 IP 访问，如 10.32.75.123:3001)
```

---

## 📊 修改总结

### 修改的文件

| 文件             | 修改内容                               | 目的                       |
| ---------------- | -------------------------------------- | -------------------------- |
| `next.config.ts` | 添加 `allowedDevOrigins` 和 `rewrites` | 修复 HMR 跨域 + API 代理   |
| `axios.ts`       | 拦截器动态设置 `baseURL`               | 修复客户端/服务端 API 调用 |
| `package.json`   | 添加 `dev:network` 脚本                | 支持 IP 访问               |
| `.env.local`     | 优化配置说明                           | 提升可维护性               |
| `.env.example`   | 完善配置模板                           | 团队协作                   |

### 技术要点

1. **HMR WebSocket 跨域**：Next.js 16+ 安全机制，需要显式配置 `allowedDevOrigins`
2. **axios baseURL 陷阱**：模块级变量只执行一次，必须在拦截器中动态设置
3. **Next.js rewrites**：解决客户端 CORS 问题，统一 API 路径
4. **环境判断**：`typeof window !== "undefined"` 区分客户端/服务端

---

## 🚀 使用方法

### 本地开发（localhost）

```bash
pnpm dev
# 访问: http://localhost:3001
```

### 网络调试（IP 访问）

```bash
pnpm dev:network
# 访问: http://10.32.75.123:3001
```

### 测试验证

```bash
# 1. 测试后端 API
curl "http://localhost:3000/qrcode/check?uuid=test"

# 2. 测试 Next.js 代理
curl "http://localhost:3001/api/qrcode/check?uuid=test"

# 3. 测试 IP 访问
curl "http://10.32.75.123:3001/api/qrcode/check?uuid=test"
```

---

## 📚 技术原理

### Next.js 请求流程

#### Server Component（服务端渲染）

```
浏览器请求页面
    ↓
Next.js Server (3001 端口)
    ↓
fetchApiData() 在服务端执行
    ↓
axios 发起请求（服务端环境）
    ↓
baseURL = "http://localhost:3000"  ← 拦截器动态设置
    ↓
直接访问后端 API (3000 端口)
    ↓
返回数据，渲染 HTML
    ↓
发送给浏览器
```

#### Client Component（客户端交互）

```
浏览器加载页面
    ↓
React hydration（客户端环境）
    ↓
useEffect 触发 fetchInitialStatus()
    ↓
axios 发起请求（客户端环境）
    ↓
baseURL = "/api"  ← 拦截器动态设置
    ↓
浏览器发送请求到 /api/qrcode/check
    ↓
Next.js rewrites 代理
    ↓
转发到 http://localhost:3000/qrcode/check
    ↓
返回数据，更新状态
```

### 为什么客户端不能直接访问 `localhost:3000`？

**场景：** 用 `http://10.32.75.123:3001` 访问

```
❌ 错误方案：客户端直接访问后端
浏览器 (10.32.75.123:3001 页面)
    ↓
发起请求: http://localhost:3000/qrcode/check
    ↓
❌ 浏览器的 localhost 是用户电脑，不是服务器！
    ↓
Network Error / timeout

✅ 正确方案：通过 Next.js 代理
浏览器 (10.32.75.123:3001 页面)
    ↓
发起请求: http://10.32.75.123:3001/api/qrcode/check
    ↓
Next.js 服务器 (3001) rewrites
    ↓
转发到后端: http://localhost:3000/qrcode/check  ← 服务器的 localhost
    ↓
✅ 成功返回数据
```

---

## 🐛 常见问题

### Q1: 修改后仍然报错？

**A:** 清除缓存并重启：

```bash
# 停止服务器 (Ctrl+C)
rm -rf .next
pnpm dev:network
# 浏览器硬刷新: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
```

### Q2: 如何添加更多 IP 地址？

**A:** 修改 `next.config.ts`：

```typescript
allowedDevOrigins: [
  '10.32.75.123',
  '192.168.1.100',  // 添加更多 IP
  'your-domain.com',  // 也可以是域名
],
```

### Q3: 生产环境需要修改吗？

**A:** 不需要。这些配置仅影响开发环境：

- `allowedDevOrigins` 只在 `next dev` 时生效
- `rewrites` 在生产环境通常由 Nginx/CDN 处理
- 生产环境使用环境变量配置真实 API 地址

### Q4: 为什么不直接用 `--hostname 0.0.0.0`？

**A:** 安全考虑：

- 默认 `localhost` 模式更安全（只有本机可访问）
- `0.0.0.0` 暴露到所有网络接口
- 提供两个命令让开发者按需选择

---

## 🎯 企业级最佳实践

### 1. 配置分层

```
next.config.ts       ← 框架层配置（代理、HMR）
.env.local          ← 本地开发配置（不提交）
.env.example        ← 配置模板（提交到 Git）
axios.ts            ← 运行时配置（动态适配）
```

### 2. 环境隔离

```typescript
// 客户端：通过代理，隐藏真实后端地址
config.baseURL = "/api"  → Next.js rewrites → 后端

// 服务端：直接访问，无 CORS
config.baseURL = "http://localhost:3000"
```

### 3. 安全性

- 默认只监听 localhost
- 按需开启 IP 访问（`dev:network`）
- 生产环境通过环境变量配置

### 4. 可维护性

- 配置集中管理
- 详细注释说明
- 团队协作模板

---

## 📖 相关文档

- [Next.js allowedDevOrigins](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins)
- [Next.js Rewrites](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

---

**修复日期:** 2026-04-14  
**Next.js 版本:** 16.2.2  
**适用场景:** 开发环境 IP 访问、移动设备调试、局域网协作
