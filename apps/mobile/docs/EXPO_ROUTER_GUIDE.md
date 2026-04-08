# Expo Router 文件系统路由详解

## 1. 核心概念：文件即路由

Expo Router 使用 **文件系统路由**，类似 Next.js 的 App Router。

```
app/
├── _layout.tsx          → 不会成为路由，是布局组件
├── index.tsx            → 路由: /
├── about.tsx            → 路由: /about
├── user/
│   ├── _layout.tsx      → 不会成为路由，是 /user 下的布局
│   ├── [id].tsx         → 动态路由: /user/123
│   └── settings.tsx     → 路由: /user/settings
└── (tabs)/              → 分组路由，括号不出现在 URL 中
    ├── _layout.tsx      → Tab 导航布局
    ├── index.tsx        → 路由: /
    └── profile.tsx      → 路由: /profile
```

---

## 2. 特殊文件命名规则

### 2.1 下划线 `_` 前缀
**用途**: 标记"不是路由"的特殊文件

- **`_layout.tsx`** - 布局文件
  - 为当前目录及子目录提供共享布局
  - 可以嵌套，形成布局层级
  - 不会创建实际路由

```tsx
// app/_layout.tsx - 根布局
export default function RootLayout() {
  return <Stack>{/* 所有页面的容器 */}</Stack>;
}

// app/(tabs)/_layout.tsx - Tab 布局
export default function TabLayout() {
  return <Tabs>{/* 底部导航栏 */}</Tabs>;
}
```

### 2.2 加号 `+` 前缀
**用途**: 强制作为路由页面（即使名字可能被忽略）

- **`+not-found.tsx`** - 404 页面
  - 如果没有 `+`，`not-found.tsx` 可能被视为普通文件
  - 加 `+` 确保它被识别为匹配路由
  - 当访问不存在的路由时显示

- **`+html.tsx`** - 自定义 HTML 模板（Web 端）

```tsx
// app/+not-found.tsx
export default function NotFound() {
  return <Text>404 - 页面不存在</Text>;
}
```

### 2.3 括号 `()` 分组
**用途**: 组织路由但不影响 URL 路径

- **`(tabs)/`** - 分组名称
  - 括号内的名称**不会**出现在 URL 中
  - 仅用于组织代码结构
  - 可以有独立的 `_layout.tsx`

```
app/
├── (tabs)/
│   ├── index.tsx    → URL: /        （不是 /tabs）
│   └── profile.tsx  → URL: /profile （不是 /tabs/profile）
└── (auth)/
    ├── login.tsx    → URL: /login   （不是 /auth/login）
    └── signup.tsx   → URL: /signup
```

**为什么使用分组？**
- 不同的导航结构（Tabs vs Stack）
- 不同的权限要求（已登录 vs 未登录）
- 不同的布局样式

### 2.4 方括号 `[]` 动态路由
**用途**: 动态路径参数

```tsx
// app/user/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>用户 ID: {id}</Text>;
}

// 访问 /user/123 → id = "123"
```

---

## 3. 本项目的文件组织

```
app/
├── _layout.tsx              # 根布局 - 所有页面的容器
│                            # 提供 Stack 导航
│
├── +not-found.tsx          # 404 页面 - 未匹配路由时显示
│                            # + 确保被识别为路由
│
└── (tabs)/                 # Tab 分组 - 底部导航的页面
    ├── _layout.tsx         # Tab 导航配置 - 定义 3 个 Tab
    ├── index.tsx           # 首页 Tab - URL: /
    ├── explore.tsx         # 探索 Tab - URL: /explore
    └── profile.tsx         # 我的 Tab - URL: /profile
```

### 路由映射关系

| 文件路径 | URL 路径 | 说明 |
|---------|---------|------|
| `app/(tabs)/index.tsx` | `/` | 首页（括号不影响 URL） |
| `app/(tabs)/explore.tsx` | `/explore` | 探索页 |
| `app/(tabs)/profile.tsx` | `/profile` | 个人页 |
| `app/+not-found.tsx` | `/any-404-path` | 404 页面 |

---

## 4. _layout.tsx 的作用层级

```tsx
// app/_layout.tsx - 第 1 层：根布局
export default function RootLayout() {
  return (
    <Stack>              {/* 管理页面堆栈 */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// app/(tabs)/_layout.tsx - 第 2 层：Tab 布局
export default function TabLayout() {
  return (
    <Tabs>               {/* 管理底部导航 */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// app/(tabs)/index.tsx - 第 3 层：页面内容
export default function HomePage() {
  return <View>{/* 首页内容 */}</View>;
}
```

**渲染层级**：
```
RootLayout (Stack)
  └─ TabLayout (Tabs)
      ├─ HomePage
      ├─ ExplorePage
      └─ ProfilePage
```

---

## 5. 常见使用场景

### 场景 1: 添加新的 Tab 页面

1. 在 `app/(tabs)/` 创建 `settings.tsx`
2. 在 `app/(tabs)/_layout.tsx` 添加配置：

```tsx
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

### 场景 2: 添加认证流程

```
app/
├── (auth)/              # 未登录用户的路由组
│   ├── _layout.tsx     # 认证流程布局
│   ├── login.tsx       # /login
│   └── signup.tsx      # /signup
└── (tabs)/             # 已登录用户的路由组
    └── ...
```

### 场景 3: 添加详情页

```
app/
└── (tabs)/
    ├── explore/
    │   ├── index.tsx      # /explore - 列表页
    │   └── [id].tsx       # /explore/123 - 详情页
    └── _layout.tsx
```

---

## 6. 命名规则速查表

| 前缀/符号 | 用途 | 示例 | 说明 |
|---------|------|------|------|
| `_` | 特殊文件（非路由） | `_layout.tsx` | 布局组件 |
| `+` | 强制路由 | `+not-found.tsx` | 404 页面 |
| `()` | 分组（不影响 URL） | `(tabs)/` | 组织代码 |
| `[]` | 动态参数 | `[id].tsx` | 动态路由 |
| `...` | 捕获所有 | `[...slug].tsx` | 匹配多层路径 |

---

## 7. 调试技巧

### 查看路由结构

在开发服务器运行时，访问：
```
http://localhost:8081/_sitemap
```

会显示所有已注册的路由。

### 检查路由匹配

```tsx
import { usePathname, useSegments } from 'expo-router';

export default function Page() {
  const pathname = usePathname();  // 当前路径
  const segments = useSegments();  // 路径段数组
  
  console.log('当前路由:', pathname);
  console.log('路径段:', segments);
}
```

---

## 总结

- **`_layout.tsx`** = 布局容器（不是路由）
- **`+not-found.tsx`** = 404 页面（+ 强制识别）
- **`(tabs)/`** = 分组（括号不出现在 URL）
- **`[id].tsx`** = 动态路由（方括号接收参数）

这种设计让路由结构更清晰、更易维护！
