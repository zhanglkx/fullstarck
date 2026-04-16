# Mobile App - 完整功能文档

## 📱 项目概述

这是一个基于 **Expo 55** 和 **React Native** 的现代移动应用，使用最新的技术栈和最佳实践。

---

## 🎯 已实现功能

### ✅ 1. Expo Router - 文件系统路由

- 基于文件的路由系统
- Tab 导航（3 个主要页面）
- 404 页面处理
- 类型安全的路由导航

### ✅ 2. Zustand - 状态管理

- 认证状态管理
- 主题管理（浅色/深色模式）
- 计数器演示
- 完整的 TypeScript 类型支持

### ✅ 3. 应用页面

#### 🏠 首页 (`/`)

- API 健康检查
- 后端连接状态显示
- 快速开始指南
- API 端点列表

#### 🧭 探索页 (`/explore`)

- 技术栈展示
- 项目结构说明
- 功能特性列表

#### 👤 我的 (`/profile`)

- 用户信息展示
- 认证状态管理演示
- 主题切换功能
- 计数器交互演示
- 登录/登出功能

---

## 📁 项目结构

```
apps/mobile/
├── app/                          # Expo Router 路由
│   ├── _layout.tsx              # 根布局
│   ├── +not-found.tsx          # 404 页面
│   └── (tabs)/                 # Tab 导航组
│       ├── _layout.tsx         # Tab 配置
│       ├── index.tsx           # 首页
│       ├── explore.tsx         # 探索页
│       └── profile.tsx         # 我的页
├── src/
│   ├── stores/                  # Zustand Store
│   │   ├── authStore.ts        # 认证状态
│   │   ├── themeStore.ts       # 主题状态
│   │   ├── counterStore.ts     # 计数器状态
│   │   └── index.ts            # 导出所有 Store
│   └── hooks/                   # 自定义 Hooks（待添加）
├── docs/                         # 文档
│   ├── EXPO_ROUTER_GUIDE.md    # Expo Router 详细指南
│   └── ZUSTAND_GUIDE.md        # Zustand 使用指南
├── assets/                       # 静态资源
├── babel.config.js              # Babel 配置
├── metro.config.js              # Metro 打包配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 依赖管理
```

---

## 🛠️ 技术栈

### 核心框架

- **Expo SDK 55** - 最新版本，启用 New Architecture
- **React Native 0.83** - 原生渲染引擎
- **React 19** - 最新 React 版本
- **TypeScript 5.9** - 类型安全

### 路由导航

- **Expo Router 55** - 文件系统路由
- **React Navigation** - 底层导航库

### 状态管理

- **Zustand 5.0** - 轻量级状态管理

### UI 组件

- **Ionicons** - 图标库
- **React Native 核心组件** - View, Text, ScrollView 等

---

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
# 在 mobile 目录
pnpm dev

# 或在根目录
pnpm dev:mobile
```

### 在设备上运行

- **iOS 模拟器**: 按 `i`
- **Android 模拟器**: 按 `a`
- **浏览器**: 按 `w`
- **Expo Go App**: 扫描二维码

---

## 📚 文档指南

### 1. Expo Router 文件组织

查看 [docs/EXPO_ROUTER_GUIDE.md](EXPO_ROUTER_GUIDE.md) 了解：

- 文件系统路由规则
- 特殊文件命名（`_layout`, `+not-found`, `(tabs)`）
- 动态路由和参数传递
- 布局嵌套和导航配置

### 2. Zustand 状态管理

查看 [docs/ZUSTAND_GUIDE.md](ZUSTAND_GUIDE.md) 了解：

- 基本使用方法
- 创建自定义 Store
- 性能优化技巧
- 高级用法和最佳实践

---

## 🎨 样式约定

- 使用 `StyleSheet.create()` 创建样式
- 颜色使用十六进制值（如 `#007AFF`）
- 遵循 iOS 和 Android 设计规范
- 响应式布局，适配不同屏幕尺寸

---

## 🔧 开发工具

### ESLint

```bash
pnpm lint          # 检查代码规范
pnpm lint --fix    # 自动修复问题
```

### TypeScript

- 启用严格模式
- 路径别名：`@/` → `src/`
- 完整的类型检查

---

## 📦 依赖版本

```json
{
  "expo": "~55.0.12",
  "react": "19.2.0",
  "react-native": "0.83.4",
  "expo-router": "~55.0.11",
  "zustand": "^5.0.12",
  "react-native-gesture-handler": "~2.30.1",
  "react-native-safe-area-context": "~5.6.2",
  "react-native-screens": "~4.23.0"
}
```

---

## 🎯 下一步开发建议

### 1. 数据请求层

```bash
pnpm add @tanstack/react-query axios
```

- 集成 TanStack Query 处理 API 请求
- 配置请求拦截器和错误处理
- 实现缓存策略

### 2. 样式系统

```bash
pnpm add nativewind tailwindcss
```

- 添加 NativeWind（Tailwind CSS for RN）
- 统一设计 Token
- 主题切换实现

### 3. 表单处理

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

- 集成表单验证
- 类型安全的表单处理
- 错误处理和显示

### 4. 动画效果

```bash
npx expo install react-native-reanimated
```

- 添加流畅的动画过渡
- 手势交互
- 高性能渲染

### 5. 本地存储

```bash
pnpm add react-native-mmkv
```

- 持久化 Store 状态
- 缓存数据
- 安全存储敏感信息

---

## 🐛 常见问题

### 1. 应用闪退

**原因**: 缺少 `babel.config.js` 或配置错误  
**解决**: 已创建正确的配置文件

### 2. 端口被占用

**解决**: 运行 `pkill -f "expo start"` 清理进程

### 3. 依赖版本冲突

**解决**: 使用 `npx expo install` 安装兼容版本

---

## 📖 参考资源

- [Expo 文档](https://docs.expo.dev/)
- [Expo Router 文档](https://docs.expo.dev/router/introduction/)
- [React Native 文档](https://reactnative.dev/)
- [Zustand 文档](https://docs.pmnd.rs/zustand)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)

---

## 🎉 特性亮点

✅ **类型安全** - 完整的 TypeScript 支持  
✅ **现代化** - 使用最新的技术栈  
✅ **易维护** - 清晰的目录结构  
✅ **高性能** - 优化的渲染和状态管理  
✅ **可扩展** - 模块化设计，易于添加功能  
✅ **文档完善** - 详细的使用指南

---

## 📞 获取帮助

遇到问题？查看：

1. 项目文档（`docs/` 目录）
2. Expo 官方文档
3. GitHub Issues
4. 社区讨论

祝开发愉快！🚀
