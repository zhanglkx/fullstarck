# 文档目录

本目录包含 Next.js 应用的开发文档和问题解决方案。

## 📚 文档列表

### 1. [快速参考 (QUICK-REFERENCE.md)](./QUICK-REFERENCE.md)
**快速查阅 IP 访问问题的修复总结**
- ⏱️ 阅读时间：2 分钟
- 📖 内容：问题总结、修改清单、关键代码、验证方法
- 🎯 适用场景：快速查阅、团队分享

### 2. [完整分析 (IP-ACCESS-FIX.md)](./IP-ACCESS-FIX.md)
**IP 访问问题的深度技术分析和解决方案**
- ⏱️ 阅读时间：10 分钟
- 📖 内容：问题根因、技术原理、请求流程、最佳实践
- 🎯 适用场景：深入学习、架构设计、技术分享

### 3. [测试验证 (TESTING.md)](./TESTING.md)
**服务器配置验证和测试步骤**
- ⏱️ 阅读时间：3 分钟
- 📖 内容：验证结果、测试命令、预期输出、故障排查
- 🎯 适用场景：问题验证、自测、CI/CD

---

## 🚀 快速开始

### 本地开发（默认）
```bash
pnpm dev
# 访问: http://localhost:3001
```

### 网络模式（IP 访问）
```bash
pnpm dev:network
# 访问: http://10.32.75.123:3001
```

---

## 📋 修改总结

本次修复涉及以下文件：

| 文件 | 修改类型 | 说明 |
|-----|---------|------|
| `next.config.ts` | ✏️ 修改 | 添加 HMR 跨域配置 + API 代理 |
| `src/lib/axios.ts` | ✏️ 修改 | 动态设置 baseURL |
| `package.json` | ➕ 新增 | 添加 `dev:network` 脚本 |
| `.env.local` | ✏️ 优化 | 完善配置说明 |
| `.env.example` | ✏️ 优化 | 完善配置模板 |

---

## 🎯 关键问题

### 问题
用 IP 地址访问 Next.js 应用时，客户端组件不工作。

### 根本原因
1. HMR WebSocket 跨域阻止
2. axios baseURL 配置错误

### 解决方案
1. 配置 `allowedDevOrigins` 允许 IP 访问
2. axios 拦截器动态设置 baseURL

---

## 🔗 相关链接

- [Next.js allowedDevOrigins 文档](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins)
- [Next.js Rewrites 文档](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites)
- [Axios Interceptors 文档](https://axios-http.com/docs/interceptors)

---

## 📝 维护记录

| 日期 | 内容 | 作者 |
|------|------|------|
| 2026-04-14 | 修复 IP 访问问题，创建文档 | Claude |

---

**文档版本:** 1.0  
**更新日期:** 2026-04-14  
**适用版本:** Next.js 16.2.2
