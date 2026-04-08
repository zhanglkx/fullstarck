# Expo + React Native 现代化项目架构与技术选型文档
## —— 面向“最新、最优、未来趋势”的 RN 开发实践指南
> 目标：基于 **Expo** 构建一个现代、可维护、可扩展、性能优秀、工程化完善的 React Native 项目。  
重点覆盖：**路由、导航栏、UI 组件设计、状态管理、数据层、网络层、表单、动画、工程化、测试、发布** 等。  
结论会尽量站在 **2025 年前沿 RN/Expo 技术栈** 的角度来推荐。
>

---

# 1. 总体结论：推荐技术栈
如果你现在要用 **Expo** 开发一个新的 React Native 项目，我推荐你优先采用下面这套：

## 1.1 核心框架
+ **React Native（最新版）**
+ **Expo（最新版）**
+ **Expo Router**：作为首选路由方案
+ **TypeScript**：必须启用严格模式

## 1.2 UI 与设计系统
+ **NativeWind v4 / Tailwind 风格 RN 样式体系**：快速开发、统一风格
+ **Tamagui** 或 **Gluestack UI** 或 “自建 Design System”
    - 如果你追求未来趋势、跨平台统一、性能与设计系统能力：**Tamagui**
    - 如果你更看重 Expo/RN 生态兼容性与组件体验：**Gluestack UI**
    - 如果是大型团队：建议**基于 primitives 自建组件库**

## 1.3 导航与页面组织
+ **Expo Router**
+ 底层仍基于 **React Navigation**
+ 页面组织采用 **文件路由 + 分组路由 + 嵌套路由**

## 1.4 数据获取与缓存
+ **TanStack Query（React Query）**：服务端状态管理首选
+ **axios** 或 **fetch + 封装**
+ 强烈建议配合：
    - 请求拦截
    - Token 刷新
    - 错误统一处理
    - 离线缓存策略

## 1.5 本地状态管理
+ 轻量首选：**Zustand**
+ 如果业务复杂且需要事件驱动/状态机：**XState**
+ 一般不建议新项目优先 Redux，除非大型历史团队已有成熟体系

## 1.6 动画与手势
+ **react-native-reanimated**
+ **react-native-gesture-handler**
+ 这两个已经是现代 RN 动画交互基础设施

## 1.7 列表与高性能渲染
+ **FlashList**：长列表、大数据渲染首选
+ 未来趋势上，FlashList 依旧是高性能列表的优先方案

## 1.8 表单
+ **react-hook-form**
+ **zod**
+ 两者组合是当前 Web/RN 都非常主流的方案

## 1.9 存储
+ 敏感信息：**expo-secure-store**
+ 轻量持久化：**MMKV（如果项目允许原生能力/Dev Client）**
+ 纯 Expo 托管优先：可先用 **SecureStore + AsyncStorage**
+ 趋势上：对高性能本地存储，**MMKV** 依然是强推荐

## 1.10 国际化
+ **i18next + react-i18next**
+ 搭配 Expo Localization

## 1.11 错误监控与分析
+ **Sentry**
+ 埋点分析可选：
    - PostHog
    - Firebase Analytics
    - Amplitude

## 1.12 测试
+ 单元/组件测试：**Jest + React Native Testing Library**
+ E2E：**Detox**（成熟）或跟进新型移动端 E2E 方案
+ 如果是 Expo 项目，建议优先测试“关键业务流”

## 1.13 工程化
+ **ESLint + Prettier**
+ **Husky + lint-staged**
+ **Commitlint + Conventional Commits**
+ **Absolute Import / Path Alias**
+ **环境变量管理**
+ **CI/CD：EAS Build + EAS Submit + GitHub Actions**

---

# 2. 为什么 Expo 项目现在首选 Expo Router？
## 2.1 核心原因
Expo Router 在今天已经不是“可选项”，而是 **Expo 官方推荐的现代路由方式**。  
它的核心优势：

+ **文件系统路由**
+ 基于 React Navigation，生态成熟
+ 路由结构更清晰
+ 支持嵌套布局
+ 支持 Web / Native 一致化路由思维
+ deep linking、动态路由、分组路由更自然
+ 非常适合团队协作与模块化开发

## 2.2 为什么它比纯手写 React Navigation 更适合新项目？
传统 React Navigation 配置方式的问题：

+ 栈、Tab、Drawer 需要写大量配置代码
+ 页面新增后需要手动注册
+ 深层嵌套路由组织容易混乱
+ 大型项目容易变成“navigation spaghetti”

而 Expo Router：

+ 页面即路由
+ layout 统一管理导航
+ 路由与页面天然共址
+ 更适合现代 App Router 思维（类似 Next.js）

**结论**：  

> 如果你是 Expo 新项目，**默认直接用 Expo Router**。  
除非你有强历史包袱，否则不建议新项目回退到纯 React Navigation 手写方案。
>

---

# 3. 推荐项目结构
下面是一套比较先进、可落地、适合中大型项目的目录结构：

```bash
my-app/
├── app/                         # Expo Router 路由目录
│   ├── _layout.tsx
│   ├── +not-found.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── profile.tsx
│   │   └── settings.tsx
│   ├── modal.tsx
│   └── user/
│       └── [id].tsx
│
├── src/
│   ├── components/              # 通用基础组件
│   │   ├── ui/
│   │   ├── form/
│   │   ├── feedback/
│   │   └── layout/
│   ├── features/                # 按业务域拆分
│   │   ├── auth/
│   │   ├── user/
│   │   ├── settings/
│   │   └── home/
│   ├── services/                # API、SDK、第三方服务
│   │   ├── api/
│   │   ├── storage/
│   │   ├── analytics/
│   │   └── sentry/
│   ├── store/                   # Zustand/XState
│   ├── hooks/                   # 通用 hooks
│   ├── lib/                     # 工具函数、常量、实例封装
│   ├── theme/                   # 主题、design tokens
│   ├── types/                   # TS 类型
│   ├── i18n/
│   └── config/
│
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── app.config.ts
├── babel.config.js
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

---

# 4. 路由应该怎么设计？
---

## 4.1 路由设计原则
现代 Expo Router 项目路由设计建议遵循以下原则：

### 原则 1：按“导航语义”拆分 app 目录
例如：

+ `(auth)`：登录注册流程
+ `(tabs)`：主应用底部导航
+ `modal.tsx`：模态页面
+ `settings/*`：设置模块
+ `user/[id].tsx`：动态详情页

### 原则 2：页面放 app，业务逻辑放 src/features
即：

+ `app/` 负责路由入口和页面装配
+ `src/features/` 负责业务状态、服务、组件

例如：

```tsx
// app/(tabs)/profile.tsx
import { ProfileScreen } from '@/src/features/user/screens/ProfileScreen';

export default ProfileScreen;
```

这样做的好处是：

+ 路由和业务解耦
+ 便于测试
+ 便于未来迁移
+ 页面目录更轻

---

## 4.2 layout 的使用方式
### 根布局 `app/_layout.tsx`
负责：

+ 全局 Provider 注入
+ StatusBar
+ Theme Provider
+ QueryClientProvider
+ GestureHandlerRootView
+ SafeAreaProvider
+ 全局 Toast / Portal / Modal 宿主

示例：

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 4.3 Tabs 路由设计
```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#111',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## 4.4 鉴权路由怎么做？
现代项目不建议把所有鉴权逻辑散落在页面里。  
建议：

+ 用 `auth store` 管理登录状态
+ 根 layout 中根据状态决定进入 `(auth)` 还是 `(tabs)`
+ 或者用 route group 配合 redirect

示例思路：

```tsx
// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/store/auth';

export default function IndexPage() {
  const isSignedIn = useAuthStore((s) => s.isSignedIn);

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
```

如果是更复杂的场景：

+ token 恢复中：显示 splash/loading
+ token 失效：自动跳转登录
+ 登录后保留 intended route

---

## 4.5 动态路由
```tsx
// app/user/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function UserDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>User ID: {id}</Text>
    </View>
  );
}
```

跳转：

```tsx
import { router } from 'expo-router';

router.push(`/user/${userId}`);
```

---

# 5. 导航栏应该怎么设计？
这里的“导航栏”包括：

+ 顶部 Header / Navigation Bar
+ 底部 Tab Bar
+ 页面内次级导航
+ 状态栏 StatusBar

---

## 5.1 顶部导航栏设计建议
### 推荐原则
1. **默认使用原生风格 header**
2. 对于品牌化很强的 App，再做自定义 header
3. 不要过度花哨，保持平台一致性
4. 标题、返回、操作按钮要统一

### screenOptions 建议统一配置
```tsx
screenOptions={{
  headerTitleAlign: 'center',
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: '#fff' },
}}
```

### 如果要自定义 Header
建议抽出统一组件：

```tsx
// src/components/layout/AppHeader.tsx
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export function AppHeader({
  title,
  left,
  right,
}: {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View className="h-14 flex-row items-center justify-between px-4 bg-white">
      <View className="w-16">{left}</View>
      <Text className="text-lg font-semibold">{title}</Text>
      <View className="w-16 items-end">{right}</View>
    </View>
  );
}
```

适用场景：

+ 品牌自定义页面
+ 二级详情页
+ 特殊业务顶部工具栏

---

## 5.2 底部 Tab Bar 设计建议
底部 Tab 通常是大多数 App 核心入口。建议：

+ 不超过 **3~5 个 tab**
+ 每个 tab 语义清晰
+ 图标统一风格
+ 激活态明显
+ 少做复杂动画，保持稳定性
+ 支持安全区域

如果需要高定制化 TabBar，可以自定义 tabBar 组件。  
但建议：

+ 先用系统标准
+ 只有在品牌需求强烈时再重写

---

## 5.3 状态栏
使用 `expo-status-bar` 管理即可：

```tsx
import { StatusBar } from 'expo-status-bar';

<StatusBar style="dark" />
```

建议根据主题切换：

+ 浅色背景 → `dark`
+ 深色背景 → `light`

---

# 6. 组件体系应该怎么设计？
如果你追求“未来趋势”，那重点不是选一个 UI 库就结束，而是建立 **Design System（设计系统）**。

---

## 6.1 推荐的组件设计分层
建议将组件分为三层：

### 第一层：基础原子组件（Primitive）
例如：

+ Button
+ Text
+ Input
+ Icon
+ Avatar
+ Badge
+ Spinner
+ Divider

### 第二层：组合组件（Composite）
例如：

+ SearchBar
+ FormField
+ EmptyState
+ ResultView
+ ProductCard
+ UserListItem

### 第三层：业务组件（Feature Components）
例如：

+ LoginForm
+ ProfileHeader
+ SettingsSection
+ OrderSummaryCard

---

## 6.2 为什么不建议完全依赖大型 UI 库？
因为纯依赖 UI 库会遇到几个问题：

+ 品牌统一困难
+ 二次定制成本高
+ 随着业务增长，设计 token 管理困难
+ 组件能力受限于第三方库更新节奏

所以更未来的方案是：

> **基础能力借助 UI 库 / primitives，业务层面自己建立组件系统。**
>

---

## 6.3 推荐组件策略
### 方案 A：速度优先
+ NativeWind
+ 少量自定义 primitives
+ 手写 Button/Input/Card 等组件

适合：

+ 初创项目
+ 追求快速迭代

### 方案 B：设计系统优先
+ Tamagui
+ 统一 tokens / themes / responsive / variants
+ 自建业务组件

适合：

+ 中大型项目
+ 追求长期维护
+ 未来可能做 Web 端统一

### 方案 C：平衡型
+ Gluestack UI + NativeWind + 自建业务组件

适合：

+ 大多数业务项目
+ 希望少踩坑
+ 相对平衡的开发体验

---

# 7. 样式系统应该怎么选？
---

## 7.1 最推荐：NativeWind + 主题 Token
为什么推荐它：

+ 类 Tailwind 开发体验
+ 上手快
+ 原子化风格统一
+ 和前端团队协作沟通成本低
+ 在 Expo 项目中体验比较好

但注意：

+ 不要把所有设计都直接写死在 className 里
+ 核心颜色、间距、圆角、字体，应沉淀到 token

例如：

+ `primary`
+ `text-primary`
+ `bg-surface`
+ `rounded-lg`
+ `px-4 py-3`

---

## 7.2 大型项目建议引入 Design Tokens
建议建立：

```typescript
// src/theme/tokens.ts
export const colors = {
  primary: '#2563eb',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  muted: '#64748b',
  danger: '#ef4444',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};
```

这样未来：

+ 改品牌色
+ 支持暗黑模式
+ 多主题
+ 白牌化产品

都会非常轻松。

---

# 8. 状态管理应该怎么设计？
现代 RN 项目必须区分两种状态：

## 8.1 服务端状态
即来自 API 的数据：

+ 用户信息
+ 列表数据
+ 详情数据
+ 分页数据
+ 缓存数据

这个应交给：

+ **TanStack Query**

不要再用 Zustand/Redux 去手动管理接口 loading/error/data 的全生命周期，成本高、重复多、易错。

---

## 8.2 客户端状态
例如：

+ token
+ 主题模式
+ onboarding 是否完成
+ 当前已选筛选项
+ 临时 UI 状态

这个才适合用：

+ **Zustand**

示例：

```typescript
// src/store/auth.ts
import { create } from 'zustand';

type AuthState = {
  isSignedIn: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isSignedIn: false,
  token: null,
  setToken: (token) =>
    set({
      token,
      isSignedIn: !!token,
    }),
}));
```

---

# 9. 数据请求层怎么设计？
---

## 9.1 推荐架构分层
建议分四层：

1. **request client**
2. **API modules**
3. **query hooks**
4. **screen usage**

结构示例：

```bash
src/
├── services/
│   └── api/
│       ├── client.ts
│       ├── auth.ts
│       ├── user.ts
│       └── types.ts
├── features/
│   └── user/
│       ├── hooks/
│       │   └── useUserQuery.ts
│       └── screens/
```

---

## 9.2 axios client 示例
```typescript
// src/services/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  // 注入 token
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 统一错误处理 / token 刷新
    return Promise.reject(error);
  }
);
```

---

## 9.3 TanStack Query 示例
```typescript
// src/features/user/hooks/useUserQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/src/services/api/user';

export function useUserQuery() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: getUserProfile,
    staleTime: 1000 * 60 * 5,
  });
}
```

---

# 10. 表单怎么设计？
推荐固定组合：

+ **react-hook-form**
+ **zod**
+ `@hookform/resolvers/zod`

示例：

```typescript
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('请输入正确的邮箱'),
  password: z.string().min(6, '密码至少 6 位'),
});
```

```tsx
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(signInSchema),
  defaultValues: {
    email: '',
    password: '',
  },
});
```

这套方案的优点：

+ 类型安全
+ 验证规则集中
+ 与 RN 表单交互兼容良好
+ 易于复用

---

# 11. 动画和交互怎么选？
现代 RN 动画标准答案几乎就是：

+ **Reanimated**
+ **Gesture Handler**

常见场景：

+ 手势拖拽
+ 卡片滑动
+ 底部弹层
+ 页面转场增强
+ Header 滚动折叠
+ Skeleton/Shimmer 动效

如果你需要 BottomSheet：

+ **@gorhom/bottom-sheet** 是非常成熟的选择

这个库在 RN 里几乎是底部弹层事实标准。

---

# 12. 列表和性能优化
## 12.1 长列表必须考虑性能
推荐：

+ **FlashList**

适合：

+ 商品列表
+ 消息列表
+ 内容流
+ 大量卡片元素

示例核心点：

+ 提供 `estimatedItemSize`
+ keyExtractor 稳定
+ 避免 renderItem 内联复杂逻辑
+ 使用 memo 优化 item

---

## 12.2 性能优化原则
+ 减少不必要 rerender
+ 大列表用 FlashList
+ 图片缓存优化
+ 非首屏模块懒加载
+ 减少 Header/Tab 定制复杂度
+ 避免把大量状态放全局
+ Query 缓存与分页设计合理

---

# 13. 图片、图标、字体怎么处理？
## 13.1 图标
推荐：

+ `@expo/vector-icons`
+ 如果追求统一图标体系，可接入 Lucide 图标风格

## 13.2 图片
+ 本地静态图：`Image`
+ 远程图优化：可考虑 `expo-image`

现在更推荐：

+ **expo-image**  
因为性能和缓存策略更现代

## 13.3 字体
+ `expo-font`
+ 启动时预加载
+ 字重命名统一

---

# 14. 权限、设备能力、原生能力
Expo 生态下常见能力：

+ 相机：`expo-camera`
+ 图片选择：`expo-image-picker`
+ 文件系统：`expo-file-system`
+ 通知：`expo-notifications`
+ 定位：`expo-location`
+ 生物识别：`expo-local-authentication`

建议原则：

+ 优先 Expo 官方模块
+ 能不用第三方原生库就不用
+ 保持 Expo Managed / Prebuild 兼容性

---

# 15. 暗黑模式与主题
这是现代 App 的标配。

推荐：

+ 系统主题跟随 + 用户手动切换
+ Theme context / Zustand 保存主题偏好
+ Token 层支持 light/dark

建议：

+ 不要在组件里到处写 if dark
+ 应通过主题 token 统一管理

---

# 16. 错误处理与用户反馈
必须建立统一的反馈体系：

## 16.1 错误分层
+ 网络错误
+ 业务错误
+ 表单错误
+ 权限错误
+ 致命崩溃错误

## 16.2 用户反馈组件
建议统一建设：

+ Toast
+ Alert Dialog
+ Empty State
+ Loading Overlay
+ Skeleton
+ Error Boundary 页面

---

# 17. 工程化建议
---

## 17.1 TypeScript 配置
一定启用严格模式：

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

---

## 17.2 ESLint / Prettier
必须配置统一代码风格。

推荐：

+ import 排序
+ unused import 自动清理
+ hooks 规则严格校验

---

## 17.3 Git 提交流程
建议：

+ Husky
+ lint-staged
+ commitlint
+ Conventional Commits

例如：

+ `feat: add user profile screen`
+ `fix: resolve auth token refresh issue`

---

## 17.4 环境变量
Expo 中建议使用：

+ `EXPO_PUBLIC_*`

例如：

```plain
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
EXPO_PUBLIC_SENTRY_DSN=xxxxx
```

---

# 18. 测试策略
不建议一上来追求 100% 覆盖率，而应追求 **关键路径稳定性**。

## 18.1 建议测试优先级
1. 登录流程
2. 支付/下单流程
3. 列表加载 + 详情跳转
4. 表单提交流程
5. 权限相关流程

## 18.2 推荐测试栈
+ 单元测试：Jest
+ 组件测试：React Native Testing Library
+ E2E：Detox

---

# 19. 发布与 CI/CD
既然用 Expo，就应该充分利用：

+ **EAS Build**
+ **EAS Submit**
+ **EAS Update**

## 19.1 为什么这是最优解？
因为它能极大降低移动端构建和发版门槛。

推荐流程：

+ GitHub Actions 自动触发
+ main 分支打 preview / production build
+ 开发环境用 internal distribution
+ 业务修复使用 OTA（EAS Update），但注意原生能力边界

---

# 20. 我给你的“最优未来趋势方案”
如果你让我给一个**真正适合 2025 年 Expo + RN 新项目**的最佳实践组合，我会这样定：

## 20.1 推荐最终方案（平衡版）
+ Expo
+ Expo Router
+ TypeScript
+ NativeWind
+ 自建基础组件库
+ TanStack Query
+ Zustand
+ React Hook Form + Zod
+ Reanimated + Gesture Handler
+ FlashList
+ expo-image
+ Sentry
+ i18next
+ EAS Build / Submit / Update

这是我认为**大多数项目的最优解**：

+ 足够新
+ 足够稳
+ 足够先进
+ 不会过度复杂
+ 团队落地成本低

---

## 20.2 推荐最终方案（中大型长期演进版）
+ Expo
+ Expo Router
+ TypeScript
+ **Tamagui**
+ TanStack Query
+ Zustand + 局部 XState
+ React Hook Form + Zod
+ Reanimated + Gesture Handler
+ Bottom Sheet
+ FlashList
+ MMKV
+ expo-image
+ Sentry + Analytics
+ 完整 Design Tokens + Theme System
+ Monorepo（如果有多端共享）
+ EAS 全链路

这个适合：

+ 要做长期产品
+ 有设计系统需求
+ 希望未来扩展到 Web / 多端
+ 团队规模中等以上

---

# 21. 不太建议的新项目选择
以下不是不能用，而是**不建议作为“最新最优趋势”的默认首选**：

## 21.1 纯 Redux Toolkit 作为所有状态管理中心
问题：

+ 模板代码相对多
+ 服务端状态管理不如 TanStack Query 自然
+ 对新项目来说不是最轻盈

## 21.2 纯手写 StyleSheet 大量散落
问题：

+ 设计 token 难统一
+ 样式复用和语义化不足
+ 团队维护成本高

## 21.3 纯 React Navigation 手工管理所有导航
问题：

+ 路由复杂时维护性一般
+ 新项目没必要放弃 Expo Router 的优势

## 21.4 重度依赖单一 UI 大而全库
问题：

+ 后期可定制性受限
+ 设计系统演进困难

---

# 22. 推荐你直接落地的标准模板
下面是一套你可以直接当“团队默认标准”的方案：

## 基础依赖
```bash
npx create-expo-app@latest my-app
```

## 推荐安装
```bash
npx expo install expo-router react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated expo-status-bar expo-linking expo-image expo-font

npm i @tanstack/react-query zustand axios zod react-hook-form @hookform/resolvers i18next react-i18next

npm i nativewind tailwindcss

npm i @shopify/flash-list @gorhom/bottom-sheet

npm i @sentry/react-native
```

如果走 Tamagui：

```bash
npm i tamagui @tamagui/config @tamagui/core
```

如果走 Gluestack：

```bash
npm i @gluestack-ui/themed
```

---

# 23. 推荐架构原则总结
---

## 你应该怎么做：
### 路由
+ 用 **Expo Router**
+ `app/` 只做页面路由装配
+ 复杂业务放 `src/features`

### 导航栏
+ 默认原生 Header
+ TabBar 保持简洁
+ 特殊页面才自定义导航栏

### UI 组件
+ 建立三层组件体系：primitives / composite / feature
+ 不要把业务 UI 全交给第三方库
+ 用 design token 管理风格

### 状态管理
+ 服务端状态：TanStack Query
+ 客户端状态：Zustand
+ 超复杂流程：XState

### 表单
+ RHF + Zod

### 动画
+ Reanimated + Gesture Handler
+ BottomSheet 用 gorhom

### 列表
+ FlashList

### 图片
+ expo-image

### 工程化
+ TS strict
+ ESLint/Prettier/Husky/Commitlint
+ Sentry
+ EAS 全链路

---

# 24. 最终建议：如果你现在就要开始
我建议你直接采用下面这个“默认答案”：

## 最适合绝大多数 Expo RN 新项目的栈
+ **Expo**
+ **Expo Router**
+ **TypeScript**
+ **NativeWind**
+ **自建基础组件库**
+ **TanStack Query**
+ **Zustand**
+ **React Hook Form + Zod**
+ **Reanimated + Gesture Handler**
+ **FlashList**
+ **expo-image**
+ **Sentry**
+ **i18next**
+ **EAS**

如果你希望做成中长期高质量产品，再升级为：

+ **Tamagui + Design Tokens + 更完整的主题系统**

---

如果你愿意，我下一步可以继续直接帮你输出下面任意一种内容：

1. **一套完整的 Expo RN 项目初始化命令清单**
2. **完整的项目目录模板（可直接复制）**
3. **完整的 Expo Router 路由示例代码**
4. **完整的导航栏、TabBar、主题系统实现**
5. **完整的“企业级 Expo + RN 最佳实践脚手架文档”**
6. **帮你生成一个可直接开干的 package.json 依赖方案**

如果你要，我可以下一条直接继续给你写成：

> **《Expo + React Native 企业级项目落地模板文档（含代码）》**  
我可以把代码结构、路由、导航、主题、状态管理、网络请求、登录鉴权全部补齐。
>

