# 移动端技术选型参考

> 综合 OpenAI 和 Claude Code 的建议，整理出的 Expo + React Native 现代技术栈参考。
> 原始建议来源已合并，仅保留与本项目相关的核心推荐。

## 推荐技术栈总览

| 分类 | 推荐方案 | 说明 |
|------|---------|------|
| 核心框架 | Expo SDK 54+ / React Native 0.84+ | New Architecture 默认启用 |
| 路由导航 | Expo Router v4 | 文件系统路由，已在项目中使用 |
| 本地状态 | Zustand v5 | 轻量级，已在项目中使用 |
| 服务端状态 | TanStack Query v5 | 缓存、重试、离线支持 |
| 样式方案 | NativeWind v4 | Tailwind CSS for React Native |
| UI 组件 | React Native Reusables / Gluestack UI | shadcn/ui 风格组件 |
| 表单处理 | React Hook Form + Zod | 类型安全的表单验证 |
| 动画 | React Native Reanimated v3 | 高性能原生动画 |
| 手势 | React Native Gesture Handler | 原生手势处理 |
| 高性能列表 | FlashList | 替代 FlatList |
| 本地存储 | MMKV v3 | 高性能 KV 存储 |
| 网络请求 | axios / ky + TanStack Query | 封装拦截器 |
| 测试 | Jest + React Native Testing Library | 单元/组件测试 |
| E2E 测试 | Detox | 端到端测试 |
| 错误监控 | Sentry | 生产环境异常上报 |
| CI/CD | EAS Build + EAS Submit | Expo 官方构建服务 |

## 当前项目已采用

- Expo Router v4 (文件系统路由)
- Zustand v5 (状态管理: auth、theme、counter stores)
- TypeScript 严格模式
- React Native New Architecture

## 下一步建议优先级

### P0 - 基础设施（建议尽快引入）

1. **TanStack Query** - 服务端状态管理
   - 替代手动 fetch + useState 模式
   - 自带缓存、重试、乐观更新
   ```bash
   pnpm --filter mobile add @tanstack/react-query
   ```

2. **MMKV** - 持久化存储
   - Zustand persist 中间件配合 MMKV
   - 替代 AsyncStorage，性能提升 30x
   ```bash
   npx expo install react-native-mmkv
   ```

3. **统一 API 层** - 封装网络请求
   - 创建 `src/lib/api-client.ts`
   - 请求/响应拦截器
   - Token 管理
   - 错误统一处理

### P1 - 开发体验提升

4. **NativeWind v4** - 样式方案
   - Tailwind CSS 语法写 RN 样式
   - 支持暗色模式
   ```bash
   pnpm --filter mobile add nativewind
   pnpm --filter mobile add -D tailwindcss
   ```

5. **React Hook Form + Zod** - 表单处理
   - 类型安全的表单验证
   - 复用后端验证规则
   ```bash
   pnpm --filter mobile add react-hook-form zod @hookform/resolvers
   ```

### P2 - 高级特性

6. **React Native Reanimated** - 动画
7. **FlashList** - 高性能列表
8. **Sentry** - 错误监控
9. **EAS Build** - CI/CD

## 架构建议

### 推荐目录结构

```
apps/mobile/
├── app/                    # Expo Router 路由（已有）
│   ├── (tabs)/            # Tab 导航
│   ├── (auth)/            # 认证流程（分组路由）
│   └── _layout.tsx        # 根布局
├── src/
│   ├── api/               # API 接口定义（待创建）
│   ├── components/        # 通用组件
│   │   ├── ui/           # 基础 UI 组件
│   │   └── business/     # 业务组件
│   ├── hooks/             # 自定义 hooks
│   ├── lib/               # 工具库（axios、storage）
│   ├── stores/            # Zustand stores（已有）
│   ├── theme/             # 主题/样式 tokens
│   └── types/             # TypeScript 类型
└── assets/                # 静态资源
```

### 数据层架构

```
UI 组件
  ↓ useQuery / useMutation
TanStack Query (缓存层)
  ↓
API Client (拦截器、Token、错误处理)
  ↓
HTTP 请求 (axios / ky)
  ↓
后端 API
```

---

**整理日期:** 2026-04-15
**来源:** OpenAI GPT-4o + Claude Code 技术选型建议合并整理
