# 修改总结报告

## 1️⃣ 都改了什么？

### 修改的文件（共 5 个）

| 文件 | 修改内容 |
|-----|---------|
| **next.config.ts** | • 添加 `allowedDevOrigins: ['10.32.75.123']`<br>• 添加 `rewrites` 配置（API 代理）|
| **src/lib/axios.ts** | • 移除静态 `baseURL`<br>• 在请求拦截器中动态设置 `baseURL` |
| **package.json** | • 添加 `dev:network` 脚本（支持 IP 访问）|
| **.env.local** | • 优化配置说明和注释 |
| **.env.example** | • 完善配置模板，方便团队使用 |

---

## 2️⃣ 问题原因是什么？

### 主要问题：HMR WebSocket 跨域阻止

**现象：**
```
⚠ Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "10.32.75.123"
WebSocket connection to 'ws://10.32.75.123:3001/_next/webpack-hmr' failed
```

**原因：**
- Next.js 16+ 默认阻止跨域 HMR 连接（安全机制）
- 用 IP 地址访问时，WebSocket 无法建立连接
- 导致客户端代码无法 hydrate

**影响链：**
```
WebSocket 连接失败
    ↓
客户端 hydration 失败
    ↓
Client Component 无法执行
    ↓
useEffect 不触发
    ↓
API 请求不发送
    ↓
一直显示 "加载中..."
```

### 次要问题：axios baseURL 配置错误

**错误代码：**
```typescript
// ❌ 问题：模块加载时只执行一次
const API_BASE_URL = getApiBaseUrl();  // 在模块加载时固定值

export const apiClient = axios.create({
  baseURL: API_BASE_URL,  // 客户端/服务端共享同一个值
});
```

**导致的问题：**
- 如果模块先在服务端加载 → `baseURL` 固定为 `http://localhost:3000`
- 客户端使用时，仍然是 `http://localhost:3000`
- 浏览器无法从 IP 地址访问 `localhost:3000` → Network Error

---

## 3️⃣ 怎么解决的？

### 解决方案 1：配置 HMR 跨域（修复主问题）

**文件：** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  // ✅ 允许 IP 地址访问 HMR
  allowedDevOrigins: ['10.32.75.123'],
  
  // ✅ 配置 API 代理
  async rewrites() {
    return [{
      source: '/api/:path*',
      destination: 'http://localhost:3000/:path*',
    }];
  },
};
```

**作用：**
1. 允许从 `10.32.75.123` 访问 HMR WebSocket
2. 客户端 `/api/*` 请求通过 Next.js 代理到后端

---

### 解决方案 2：动态设置 baseURL（修复次问题）

**文件：** `src/lib/axios.ts`

```typescript
// ✅ 创建实例时不设置 baseURL
export const apiClient = axios.create({
  timeout: 10000,
  // 不设置 baseURL
});

// ✅ 在拦截器中每次请求时动态判断
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // 客户端：使用 /api（通过 Next.js rewrites 代理）
    config.baseURL = "/api";
  } else {
    // 服务端：直接访问后端
    config.baseURL = "http://localhost:3000";
  }
  return config;
});
```

**关键改进：**
- 每次请求时动态判断环境（`typeof window`）
- 客户端：`/api` → Next.js rewrites → `localhost:3000`
- 服务端：直接 `localhost:3000`

---

### 解决方案 3：添加网络模式启动脚本

**文件：** `package.json`

```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--inspect' next dev -p 3001",
    "dev:network": "cross-env NODE_OPTIONS='--inspect' next dev -p 3001 --hostname 0.0.0.0"
  }
}
```

**说明：**
- `dev`：默认只监听 localhost（日常开发）
- `dev:network`：监听所有网络接口（IP 访问）

---

## 🎯 核心技术点

### 1. Next.js HMR 安全机制
- Next.js 16+ 默认阻止跨域 HMR
- 必须通过 `allowedDevOrigins` 显式允许

### 2. axios 模块级变量陷阱
- 模块级变量只在首次加载时初始化
- 客户端/服务端可能共享同一个值
- **解决：** 使用拦截器动态判断环境

### 3. Next.js rewrites
- 解决客户端 CORS 问题
- 隐藏真实后端地址
- 统一 API 路径

### 4. 环境判断
```typescript
typeof window !== "undefined"  // 客户端
typeof window === "undefined"  // 服务端（Node.js）
```

---

## 📊 请求流程对比

### 修改前（❌ 失败）

```
客户端浏览器 (IP: 10.32.75.123)
    ↓
axios 发起请求
    ↓
baseURL: "http://localhost:3000"  ← 服务端的 localhost
    ↓
❌ 浏览器尝试访问用户电脑的 localhost:3000
    ↓
Network Error / timeout
```

### 修改后（✅ 成功）

```
客户端浏览器 (IP: 10.32.75.123)
    ↓
axios 发起请求
    ↓
baseURL: "/api"  ← 相对路径
    ↓
浏览器请求: http://10.32.75.123:3001/api/qrcode/check
    ↓
Next.js rewrites 代理
    ↓
转发到: http://localhost:3000/qrcode/check  ← 服务器的 localhost
    ↓
✅ 成功返回数据
```

---

## 🚀 使用方法

### 本地开发
```bash
pnpm dev
# 访问: http://localhost:3001
```

### IP 访问（移动设备调试）
```bash
pnpm dev:network
# 访问: http://10.32.75.123:3001
```

---

## 📚 完整文档位置

所有文档已整理到 `/docs` 目录：

```
docs/
├── README.md              # 文档索引
├── QUICK-REFERENCE.md     # 快速参考（2 分钟）
├── IP-ACCESS-FIX.md       # 完整技术分析（10 分钟）
└── TESTING.md             # 测试验证步骤
```

**推荐阅读顺序：**
1. `QUICK-REFERENCE.md` - 快速了解修改内容
2. `IP-ACCESS-FIX.md` - 深入理解技术原理
3. `TESTING.md` - 验证配置是否生效

---

## ✅ 问题已解决

### 验证结果
```bash
✅ 后端 API: http://localhost:3000/qrcode/check → 200 OK
✅ Next.js 代理: http://localhost:3001/api/qrcode/check → 200 OK
✅ IP 访问: http://10.32.75.123:3001/api/qrcode/check → 200 OK
✅ 完整流程: generate → check → state:"pending" ✅
```

### 服务器状态
```
进程运行中
地址: http://10.32.75.123:3001
状态: Ready ✅
```

---

**修复日期:** 2026-04-14  
**Next.js 版本:** 16.2.2  
**问题类型:** 开发环境 IP 访问
