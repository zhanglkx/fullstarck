# 移动端开发指南

## 运行环境要求

- ✅ Xcode 已安装
- ✅ iOS 模拟器可用
- ✅ Expo SDK 已安装

## 运行方式

### 方式一：直接在 iOS 模拟器中运行（推荐）

```bash
# 在项目根目录
pnpm dev:mobile

# 或者进入 mobile 目录
cd apps/mobile
pnpm ios
```

这将自动：

1. 启动 Expo 开发服务器
2. 打开 iOS 模拟器（如果未打开）
3. 在模拟器中安装并运行应用

### 方式二：交互式启动

```bash
cd apps/mobile
pnpm start
```

然后按键盘快捷键：

- 按 `i` - 在 iOS 模拟器中打开
- 按 `a` - 在 Android 模拟器中打开（需安装 Android Studio）
- 按 `w` - 在 Web 浏览器中打开

### 方式三：使用 Expo Go 应用（真机测试）

1. 在 iPhone 上安装 Expo Go 应用（从 App Store）
2. 运行 `pnpm start`
3. 扫描终端中显示的二维码

## 可用的 iOS 模拟器

当前系统可用的模拟器：

- iPhone 17 Pro ✅
- iPhone 17 Pro Max
- iPhone Air
- iPhone 17
- iPhone 16e
- iPad Pro 13-inch (M5)
- iPad Pro 11-inch (M5)
- iPad mini (A17 Pro)
- iPad (A16)
- iPad Air 13-inch (M3)

## 指定模拟器运行

```bash
# 指定设备运行
pnpm ios --device "iPhone 17 Pro Max"

# 查看所有可用设备
xcrun simctl list devices
```

## 开发流程

### 1. 启动开发服务器

```bash
pnpm dev:mobile
```

### 2. 热重载

- 修改代码后会自动刷新应用
- 支持快速刷新（Fast Refresh）
- 保持应用状态

### 3. 调试工具

- **开发者菜单**：在模拟器中按 `Cmd + D`
- **远程调试**：在开发者菜单中选择 "Debug Remote JS"
- **性能监控**：在开发者菜单中选择 "Show Performance Monitor"

### 4. 常用快捷键

在终端运行 Expo 时：

- `i` - 打开 iOS 模拟器
- `a` - 打开 Android 模拟器
- `w` - 打开 Web 浏览器
- `r` - 重新加载应用
- `m` - 切换菜单
- `j` - 打开调试器
- `?` - 显示所有命令

在 iOS 模拟器中：

- `Cmd + D` - 打开开发者菜单
- `Cmd + R` - 重新加载应用

## 项目结构

```
apps/mobile/
├── App.tsx           # 应用入口
├── app.json          # Expo 配置
├── assets/           # 静态资源
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
└── package.json      # 依赖配置
```

## 常见问题

### Q: 模拟器启动失败？

**解决方案**：

```bash
# 打开 Xcode 并接受许可协议
sudo xcodebuild -license accept

# 重置模拟器
xcrun simctl shutdown all
xcrun simctl erase all

# 重新打开模拟器
open -a Simulator
```

### Q: Expo 无法连接到模拟器？

**解决方案**：

```bash
# 清除 Expo 缓存
cd apps/mobile
pnpm start --clear

# 或删除缓存目录
rm -rf .expo
```

### Q: 如何使用真机测试？

**解决方案**：

1. iPhone 和 Mac 在同一 WiFi 网络
2. 在 iPhone 上安装 Expo Go 应用
3. 运行 `pnpm start`
4. 用相机扫描终端中的二维码

### Q: 如何查看日志？

**解决方案**：

```bash
# 在另一个终端窗口
pnpm start

# 日志会实时显示在终端中
```

## 连接后端 API

在移动端访问后端 API：

```typescript
// 使用本地网络 IP 地址
const API_URL = 'http://localhost:3000'; // 模拟器中可用

// 或使用局域网 IP（真机测试）
const API_URL = 'http://192.168.1.24:3000'; // 真机需要用这个
```

## 下一步

1. 编辑 `apps/mobile/App.tsx` 开始开发
2. 添加新的屏幕和组件
3. 连接后端 API
4. 使用共享包 `@fullstack/shared`

## 有用的资源

- [Expo 官方文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
- [Expo SDK 参考](https://docs.expo.dev/versions/latest/)
- [iOS 模拟器使用指南](https://developer.apple.com/documentation/xcode/running-your-app-in-the-simulator)
