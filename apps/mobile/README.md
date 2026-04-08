# Mobile App - Expo Router + TabBar

## 项目结构

```
apps/mobile/
├── app/                      # Expo Router 路由目录
│   ├── _layout.tsx          # 根布局配置
│   ├── +not-found.tsx       # 404 页面
│   └── (tabs)/              # Tab 导航分组
│       ├── _layout.tsx      # Tab 导航配置
│       ├── index.tsx        # 首页 Tab
│       ├── explore.tsx      # 探索 Tab
│       └── profile.tsx      # 我的 Tab
├── src/                     # 源代码目录
│   └── hooks/               # 自定义 Hooks
├── assets/                  # 静态资源
├── index.ts                 # 入口文件
├── app.json                 # Expo 配置
├── metro.config.js          # Metro 打包配置
└── tsconfig.json            # TypeScript 配置
```

## 技术栈

- **Expo SDK 55** - 最新版本，启用 New Architecture
- **Expo Router** - 基于文件系统的路由
- **React Native 0.83** - 原生渲染
- **React 19** - 最新 React 版本
- **TypeScript** - 类型安全
- **Ionicons** - 图标库

## 启动应用

```bash
# 开发模式
pnpm dev:mobile

# 或直接在 mobile 目录
cd apps/mobile
pnpm dev
```

## 路由导航

### Tab 导航

应用包含三个主要 Tab：

1. **首页** (`/`) - API 健康检查和快速开始指南
2. **探索** (`/explore`) - 技术栈展示
3. **我的** (`/profile`) - 个人中心

### 代码导航

在代码中使用 Expo Router 的 API 进行导航：

```typescript
import { router } from 'expo-router';

// 跳转到指定路由
router.push('/explore');

// 返回上一页
router.back();

// 替换当前路由
router.replace('/profile');
```

### 链接导航

使用 Link 组件：

```typescript
import { Link } from 'expo-router';

<Link href="/explore">
  <Text>前往探索页</Text>
</Link>
```

## 添加新页面

### 添加新的 Tab

1. 在 `app/(tabs)/` 目录创建新文件，例如 `settings.tsx`
2. 在 `app/(tabs)/_layout.tsx` 中添加新的 Tab 配置：

```typescript
<Tabs.Screen
  name="settings"
  options={{
    title: '设置',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="settings-outline" size={size} color={color} />
    ),
  }}
/>
```

### 添加普通页面

直接在 `app/` 目录创建文件，例如 `app/details.tsx`，它会自动成为 `/details` 路由。

### 动态路由

创建文件名包含方括号的文件，例如 `app/user/[id].tsx`：

```typescript
import { useLocalSearchParams } from 'expo-router';

export default function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>用户 ID: {id}</Text>;
}
```

## TypeScript 路径别名

配置了 `@/` 作为 `src/` 目录的别名：

```typescript
import { useCustomHook } from '@/hooks/useCustomHook';
```

## 样式指南

项目使用 React Native StyleSheet API，遵循以下约定：

- 使用语义化的样式名称
- 将样式定义在组件底部
- 使用平台特定样式时使用 `Platform.select()`

## API 配置

修改 API 地址请查看：
- 开发环境：`http://localhost:3000`
- 生产环境：在 `@fullstack/shared` 包中配置 `API_BASE_URL`

## 兼容性

- **iOS**: 15.4+
- **Android**: SDK 24+ (Android 7.0+)
- **Node.js**: 20.0.0+
- **pnpm**: 10.33.0

## 下一步

1. 添加状态管理（推荐 Zustand）
2. 添加数据请求层（推荐 TanStack Query）
3. 添加样式系统（推荐 NativeWind）
4. 添加表单处理（推荐 React Hook Form + Zod）
5. 添加动画（推荐 React Native Reanimated）

## 参考文档

- [Expo Router 文档](https://docs.expo.dev/router/introduction/)
- [Expo SDK 文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
