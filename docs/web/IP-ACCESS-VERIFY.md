# 测试结果和解决方案

## ✅ 服务器配置验证（全部通过）

### 1. 后端 API（3000 端口）

```bash
curl "http://localhost:3000/qrcode/generate"
# ✅ 200 OK，3ms 响应

curl "http://localhost:3000/qrcode/check?uuid=xxx"
# ✅ 200 OK，state: "pending"
```

### 2. Next.js 代理（3001 端口）

```bash
curl "http://localhost:3001/api/qrcode/generate"
# ✅ 200 OK，通过代理正常

curl "http://localhost:3001/api/qrcode/check?uuid=xxx"
# ✅ 200 OK，代理工作正常
```

### 3. IP 地址访问

```bash
curl "http://10.32.75.123:3001/api/qrcode/check?uuid=xxx"
# ✅ 200 OK，IP 访问正常
```

## 🔧 已修复的配置

### 1. next.config.ts

- ✅ 添加 `allowedDevOrigins: ['10.32.75.123']` 解决 HMR WebSocket 跨域
- ✅ 配置 rewrites：`/api/:path*` → `http://localhost:3000/:path*`

### 2. axios.ts

- ✅ 客户端：baseURL = `/api`（通过 Next.js 代理）
- ✅ 服务端：baseURL = `http://localhost:3000`（直接访问）

### 3. package.json

- ✅ `dev`: 默认本地开发（localhost）
- ✅ `dev:network`: 支持 IP 访问（添加 `--hostname 0.0.0.0`）

## 🎯 最终测试步骤

### 1. 停止所有服务

```bash
# 停止前端
lsof -ti :3001 | xargs kill -9

# 清除缓存
rm -rf .next
```

### 2. 启动服务器

```bash
pnpm dev
```

### 3. 浏览器测试

1. 访问: `http://10.32.75.123:3001/qrcode`
2. **硬刷新**: Cmd+Shift+R（Mac）或 Ctrl+Shift+R（Windows）
3. 打开 DevTools (F12)
4. 检查 Console 和 Network 标签

### 预期结果

- ✅ 页面显示二维码和 UUID
- ✅ Console 有 "请求发送" 和 "响应收到" 日志
- ✅ Network 显示 `/api/qrcode/check` 请求成功（Status 200）
- ✅ "加载中..." 变成 "pending"
- ✅ WebSocket HMR 连接成功（无跨域警告）

## 🐛 如果还有问题

### 浏览器缓存问题

如果硬刷新后仍有问题，清除浏览器缓存：

1. Chrome: DevTools → Network → Disable cache（勾选）
2. 或者: 设置 → 隐私和安全 → 清除浏览数据 → 缓存的图像和文件

### 检查实际请求

在 Network 标签中找到失败的请求，查看：

- Request URL: 应该是 `http://10.32.75.123:3001/api/qrcode/check?uuid=xxx`
- Status: 应该是 200
- Response: 应该有 `{"code":200,"data":{"state":"pending"},...}`

如果 Request URL 是 `http://localhost:3000/...`，说明浏览器还在运行旧代码。
