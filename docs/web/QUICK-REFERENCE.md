# 快速参考：IP 访问修复总结

## 🎯 问题

用 IP 地址访问 Next.js 应用时，客户端组件不工作、API 调用失败。

## 🔍 根本原因

1. **HMR WebSocket 跨域阻止** → 客户端代码无法 hydrate
2. **axios baseURL 配置错误** → 客户端/服务端环境混用

## ✅ 修改的文件（5 个）

| 文件 | 修改内容 | 为什么 |
|-----|---------|--------|
| `next.config.ts` | 添加 `allowedDevOrigins: ['10.32.75.123']` 和 `rewrites` | 修复 HMR 跨域 + API 代理 |
| `src/lib/axios.ts` | 拦截器中动态设置 `baseURL` | 修复客户端/服务端 baseURL 混用 |
| `package.json` | 添加 `dev:network` 脚本 | 支持 IP 访问（`--hostname 0.0.0.0`） |
| `.env.local` | 优化配置说明 | 提升可维护性 |
| `.env.example` | 完善配置模板 | 团队协作 |

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

## 📋 关键代码变更

### 1. next.config.ts
```typescript
// ✅ 新增
allowedDevOrigins: ['10.32.75.123'],  // 允许 IP 访问 HMR
async rewrites() {
  return [{
    source: '/api/:path*',
    destination: 'http://localhost:3000/:path*',  // API 代理
  }];
}
```

### 2. axios.ts
```typescript
// ❌ 修改前：静态 baseURL
const API_BASE_URL = "http://localhost:3000";
export const apiClient = axios.create({ baseURL: API_BASE_URL });

// ✅ 修改后：动态 baseURL
export const apiClient = axios.create({ /* 不设置 baseURL */ });
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = "/api";  // 客户端：通过 Next.js 代理
  } else {
    config.baseURL = "http://localhost:3000";  // 服务端：直接访问
  }
  return config;
});
```

### 3. package.json
```json
// ✅ 新增
"dev:network": "cross-env NODE_OPTIONS='--inspect' next dev -p 3001 --hostname 0.0.0.0"
```

## 🧪 验证测试

```bash
# 1. 测试后端 API
curl "http://localhost:3000/qrcode/check?uuid=test"
# 预期: {"code":500,"data":null,"msg":"二维码不存在"}

# 2. 测试 Next.js 代理
curl "http://localhost:3001/api/qrcode/check?uuid=test"
# 预期: 同上

# 3. 测试 IP 访问
curl "http://10.32.75.123:3001/api/qrcode/check?uuid=test"
# 预期: 同上 ✅
```

## 📚 完整文档

详细技术分析和原理说明，请查看：[IP-ACCESS-FIX.md](./IP-ACCESS-FIX.md)

## 🎯 关键学习点

1. **Next.js 16+ 安全机制**：默认阻止跨域 HMR，需要 `allowedDevOrigins`
2. **axios 模块级陷阱**：静态 `baseURL` 在客户端/服务端共享，必须动态设置
3. **环境判断**：`typeof window !== "undefined"` 区分客户端/服务端
4. **Next.js rewrites**：解决客户端 CORS 问题，无需后端配置

## 🐛 常见问题

**Q: 修改后仍然报错？**  
A: 清除缓存并重启：
```bash
rm -rf .next
pnpm dev:network
# 浏览器硬刷新: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
```

**Q: 如何添加更多 IP？**  
A: 修改 `next.config.ts` 中的 `allowedDevOrigins` 数组

**Q: 生产环境需要修改吗？**  
A: 不需要，这些配置仅影响开发环境

---

**修复日期:** 2026-04-14  
**Next.js 版本:** 16.2.2
