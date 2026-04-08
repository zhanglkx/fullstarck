# Expo React Native 现代技术栈完整指南 (2026)
## 技术栈总览
```plain
核心框架:    Expo SDK 53+ (New Architecture Default)
路由导航:    Expo Router v4 (File-based Routing)
状态管理:    Zustand v5 + TanStack Query v5
样式方案:    NativeWind v4 (Tailwind CSS for RN)
UI组件库:    React Native Reusables (shadcn/ui风格)
动画库:      React Native Reanimated v3 + Skia
表单处理:    React Hook Form + Zod
网络请求:    TanStack Query v5 + ky
本地存储:    MMKV v3
测试框架:    Jest + React Native Testing Library
```

---

## 一、项目初始化
### 1.1 创建项目
```bash
# 使用最新 Expo 模板创建项目
npx create-expo-app@latest MyApp --template tabs

# 进入项目目录
cd MyApp

# 安装依赖
npm install
```

### 1.2 完整依赖安装
```bash
# 核心路由 (Expo Router v4 已内置)
npx expo install expo-router expo-constants expo-linking

# 样式方案
npm install nativewind@^4.0.0
npm install --save-dev tailwindcss@^3.4.0

# 状态管理
npm install zustand@^5.0.0
npm install @tanstack/react-query@^5.0.0

# UI 组件
npm install react-native-reusables

# 动画
npx expo install react-native-reanimated@^3.0.0
npx expo install @shopify/react-native-skia

# 手势处理
npx expo install react-native-gesture-handler@^2.0.0

# 底部弹窗/Sheet
npm install @gorhom/bottom-sheet@^5.0.0

# 表单验证
npm install react-hook-form zod @hookform/resolvers

# 本地存储
npx expo install react-native-mmkv@^3.0.0

# 网络请求
npm install ky@^1.0.0

# 图标
npm install lucide-react-native

# 安全区域
npx expo install react-native-safe-area-context

# 闪屏和字体
npx expo install expo-splash-screen expo-font

# 图片
npx expo install expo-image@^2.0.0
```

---

## 二、项目结构设计
```plain
MyApp/
├── app/                          # Expo Router 路由目录 (核心)
│   ├── _layout.tsx               # 根布局
│   ├── +not-found.tsx            # 404 页面
│   ├── (auth)/                   # 认证路由组 (不显示在URL)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Tab 导航路由组
│   │   ├── _layout.tsx           # Tab 导航配置
│   │   ├── index.tsx             # Home Tab
│   │   ├── explore.tsx           # Explore Tab
│   │   └── profile.tsx           # Profile Tab
│   └── (modals)/                 # 模态页面路由组
│       ├── _layout.tsx
│       └── settings.tsx
├── src/
│   ├── components/               # 通用组件
│   │   ├── ui/                   # 基础 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   └── shared/               # 业务共享组件
│   │       ├── Header.tsx
│   │       └── ErrorBoundary.tsx
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useColorScheme.ts
│   │   └── useAuth.ts
│   ├── stores/                   # Zustand 状态管理
│   │   ├── authStore.ts
│   │   └── settingsStore.ts
│   ├── services/                 # API 服务层
│   │   ├── api.ts                # API 基础配置
│   │   └── userService.ts
│   ├── lib/                      # 工具库
│   │   ├── queryClient.ts        # TanStack Query 配置
│   │   ├── storage.ts            # MMKV 封装
│   │   └── utils.ts
│   ├── types/                    # TypeScript 类型定义
│   │   └── index.ts
│   └── constants/                # 常量配置
│       ├── theme.ts
│       └── config.ts
├── assets/                       # 静态资源
│   ├── fonts/
│   └── images/
├── tailwind.config.js            # Tailwind 配置
├── babel.config.js               # Babel 配置
├── metro.config.js               # Metro 配置
└── app.json                      # Expo 配置
```

---

## 三、路由配置 (Expo Router v4)
### 3.1 根布局配置
```tsx
// app/_layout.tsx
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { useColorScheme } from '@/hooks/useColorScheme'
import '../global.css' // NativeWind

// 防止闪屏自动隐藏
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'ios_from_right', // 统一动画
            contentStyle: {
              backgroundColor: colorScheme === 'dark' ? '#09090b' : '#ffffff',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(modals)/settings"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
```

### 3.2 Tab 导航配置
```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { Home, Compass, User } from 'lucide-react-native'
import { useColorScheme } from '@/hooks/useColorScheme'
import { cn } from '@/lib/utils'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1', // indigo-500
        tabBarInactiveTintColor: isDark ? '#71717a' : '#a1a1aa',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        ),
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
        },
        // 使用 Reanimated 的 tab 动画
        tabBarItemStyle: {
          paddingTop: Platform.OS === 'ios' ? 8 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon Icon={Home} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon Icon={Compass} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon Icon={User} color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}

// Tab 图标组件 (带动画)
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  useEffect,
} from 'react-native-reanimated'
import type { LucideIcon } from 'lucide-react-native'

interface TabIconProps {
  Icon: LucideIcon
  color: string
  size: number
  focused: boolean
}

function TabIcon({ Icon, color, size, focused }: TabIconProps) {
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1, {
      damping: 15,
      stiffness: 300,
    })
  }, [focused])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Icon color={color} size={size} strokeWidth={focused ? 2.5 : 1.8} />
    </Animated.View>
  )
}
```

### 3.3 认证路由守卫
```tsx
// app/(auth)/_layout.tsx
import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '@/stores/authStore'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // 已登录则重定向到主页
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  )
}
```

### 3.4 动态路由使用示例
```tsx
// app/(tabs)/explore/[id].tsx
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  return (
    <>
      {/* 动态设置 Screen Header */}
      <Stack.Screen
        options={{
          title: `Detail ${id}`,
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      {/* 页面内容 */}
    </>
  )
}

// 导航到动态路由
router.push(`/(tabs)/explore/${itemId}`)
// 或使用类型安全的方式
router.push({ pathname: '/(tabs)/explore/[id]', params: { id: '123' } })
```

---

## 四、NativeWind v4 样式配置
### 4.1 配置文件
```javascript
// tailwind.config.js
const { hairlineWidth } = require('nativewind/theme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 自定义设计 Token - 与 shadcn/ui 保持一致
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      fontFamily: {
        sans: ['Inter-Regular'],
        medium: ['Inter-Medium'],
        semibold: ['Inter-SemiBold'],
        bold: ['Inter-Bold'],
      },
    },
  },
  plugins: [],
}
```

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'react-native-reanimated/plugin', // 必须放最后
    ],
  }
}
```

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './global.css' })
```

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}
```

---

## 五、核心 UI 组件设计
### 5.1 Button 组件
```tsx
// src/components/ui/Button.tsx
import { forwardRef } from 'react'
import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { cn } from '@/lib/utils'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface ButtonProps extends PressableProps {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  children: React.ReactNode
}

const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      loading = false,
      disabled,
      children,
      onPress,
      ...props
    },
    ref
  ) => {
    const scale = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))

    const handlePressIn = () => {
      scale.value = withSpring(0.96, { damping: 20, stiffness: 400 })
    }

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 20, stiffness: 400 })
    }

    const isDisabled = disabled || loading

    return (
      <AnimatedPressable
        ref={ref}
        style={animatedStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={isDisabled ? undefined : onPress}
        className={cn(
          // 基础样式
          'flex-row items-center justify-center rounded-xl active:opacity-90',
          // Variant 样式
          {
            'bg-primary': variant === 'default',
            'bg-destructive': variant === 'destructive',
            'border border-border bg-background': variant === 'outline',
            'bg-transparent': variant === 'ghost' || variant === 'link',
          },
          // Size 样式
          {
            'h-9 px-3 gap-1.5': size === 'sm',
            'h-12 px-5 gap-2': size === 'md',
            'h-14 px-8 gap-3': size === 'lg',
            'h-12 w-12': size === 'icon',
          },
          // 禁用状态
          isDisabled && 'opacity-50',
          className
        )}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'default' ? '#fff' : '#6366f1'}
          />
        ) : (
          <Text
            className={cn(
              'font-semibold',
              {
                'text-primary-foreground text-base': variant === 'default',
                'text-destructive-foreground text-base':
                  variant === 'destructive',
                'text-foreground text-base': variant === 'outline',
                'text-foreground text-base': variant === 'ghost',
                'text-primary underline text-base': variant === 'link',
              },
              {
                'text-sm': size === 'sm',
                'text-base': size === 'md',
                'text-lg': size === 'lg',
              }
            )}
          >
            {children}
          </Text>
        )}
      </AnimatedPressable>
    )
  }
)

Button.displayName = 'Button'
export { Button }
```

### 5.2 Input 组件
```tsx
// src/components/ui/Input.tsx
import { forwardRef, useState } from 'react'
import {
  TextInput,
  View,
  Text,
  type TextInputProps,
  type ViewStyle,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated'
import { cn } from '@/lib/utils'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      containerClassName,
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const focused = useSharedValue(0)

    const borderAnimStyle = useAnimatedStyle(() => ({
      borderColor: interpolateColor(
        focused.value,
        [0, 1],
        [error ? '#ef4444' : '#e4e4e7', '#6366f1']
      ),
    }))

    return (
      <View className={cn('gap-1.5', containerClassName)}>
        {label && (
          <Text className="text-sm font-medium text-foreground">{label}</Text>
        )}
        <Animated.View
          style={[borderAnimStyle, { borderWidth: 1.5 }]}
          className={cn(
            'flex-row items-center rounded-xl bg-background px-3',
            error && 'border-destructive',
            className
          )}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className="flex-1 py-3.5 text-base text-foreground font-sans"
            placeholderTextColor="#a1a1aa"
            onFocus={(e) => {
              focused.value = withTiming(1, { duration: 200 })
              onFocus?.(e)
            }}
            onBlur={(e) => {
              focused.value = withTiming(0, { duration: 200 })
              onBlur?.(e)
            }}
            {...props}
          />
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </Animated.View>
        {error && (
          <Text className="text-sm text-destructive">{error}</Text>
        )}
      </View>
    )
  }
)

Input.displayName = 'Input'
export { Input }
```

### 5.3 Card 组件
```tsx
// src/components/ui/Card.tsx
import { View, type ViewProps } from 'react-native'
import { cn } from '@/lib/utils'

interface CardProps extends ViewProps {
  children: React.ReactNode
}

function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-border bg-card p-4 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </View>
  )
}

function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <View className={cn('mb-3', className)} {...props}>
      {children}
    </View>
  )
}

function CardContent({ className, children, ...props }: CardProps) {
  return (
    <View className={cn('', className)} {...props}>
      {children}
    </View>
  )
}

function CardFooter({ className, children, ...props }: CardProps) {
  return (
    <View className={cn('mt-3 flex-row items-center', className)} {...props}>
      {children}
    </View>
  )
}

export { Card, CardHeader, CardContent, CardFooter }
```

### 5.4 自定义 Header 组件
```tsx
// src/components/shared/Header.tsx
import { View, Text, Pressable, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { BlurView } from 'expo-blur'
import { cn } from '@/lib/utils'
import { useColorScheme } from '@/hooks/useColorScheme'

interface HeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  rightAction?: React.ReactNode
  transparent?: boolean
  className?: string
}

export function Header({
  title,
  subtitle,
  showBack = false,
  rightAction,
  transparent = false,
  className,
}: HeaderProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const content = (
    <View
      style={{ paddingTop: insets.top }}
      className={cn('px-4 pb-3', className)}
    >
      <View className="flex-row items-center justify-between">
        {/* 左侧区域 */}
        <View className="w-10">
          {showBack && (
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full bg-secondary"
            >
              <ArrowLeft size={20} color={isDark ? '#fff' : '#09090b'} />
            </Pressable>
          )}
        </View>
        {/* 中间标题 */}
        <View className="flex-1 items-center">
          {title && (
            <Text className="text-base font-semibold text-foreground">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="text-xs text-muted-foreground">{subtitle}</Text>
          )}
        </View>
        {/* 右侧操作区 */}
        <View className="w-10 items-end">
          {rightAction}
        </View>
      </View>
    </View>
  )

  if (transparent) {
    return (
      <BlurView
        intensity={60}
        tint={isDark ? 'dark' : 'light'}
        className="absolute left-0 right-0 top-0 z-50"
      >
        {content}
      </BlurView>
    )
  }

  return (
    <View className="bg-background border-b border-border">{content}</View>
  )
}
```

---

## 六、状态管理
### 6.1 Zustand Store 设计
```typescript
// src/stores/authStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { storage } from '@/lib/storage'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

// MMKV 适配器 for Zustand persist
const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name)
    return value ?? null
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value)
  },
  removeItem: (name: string) => {
    storage.delete(name)
  },
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,

      // Actions
      setUser: (user) =>
        set((state) => {
          state.user = user
        }),

      setToken: (token) =>
        set((state) => {
          state.token = token
        }),

      login: (user, token) =>
        set((state) => {
          state.user = user
          state.token = token
          state.isAuthenticated = true
        }),

      logout: () =>
        set((state) => {
          state.user = null
          state.token = null
          state.isAuthenticated = false
        }),

      updateUser: (updates) =>
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updates)
          }
        }),
    })),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => mmkvStorage),
      // 只持久化必要字段
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

### 6.2 Settings Store
```typescript
// src/stores/settingsStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { storage } from '@/lib/storage'

type ColorScheme = 'light' | 'dark' | 'system'
type Language = 'en' | 'zh' | 'ja'

interface SettingsState {
  colorScheme: ColorScheme
  language: Language
  notifications: boolean
  haptics: boolean
}

interface SettingsActions {
  setColorScheme: (scheme: ColorScheme) => void
  setLanguage: (lang: Language) => void
  toggleNotifications: () => void
  toggleHaptics: () => void
}

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    immer((set) => ({
      colorScheme: 'system',
      language: 'en',
      notifications: true,
      haptics: true,

      setColorScheme: (scheme) =>
        set((state) => {
          state.colorScheme = scheme
        }),

      setLanguage: (lang) =>
        set((state) => {
          state.language = lang
        }),

      toggleNotifications: () =>
        set((state) => {
          state.notifications = !state.notifications
        }),

      toggleHaptics: () =>
        set((state) => {
          state.haptics = !state.haptics
        }),
    })),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)
```

---

## 七、数据请求层
### 7.1 TanStack Query 配置
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5分钟缓存
      staleTime: 1000 * 60 * 5,
      // 10分钟内存缓存
      gcTime: 1000 * 60 * 10,
      // 重试1次
      retry: 1,
      // 窗口重新聚焦时重新请求
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
```

### 7.2 API 基础配置
```typescript
// src/services/api.ts
import ky from 'ky'
import { useAuthStore } from '@/stores/authStore'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.example.com'

export const apiClient = ky.create({
  prefixUrl: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        // 401 自动登出
        if (response.status === 401) {
          useAuthStore.getState().logout()
        }
        return response
      },
    ],
    beforeError: [
      (error) => {
        console.error('[API Error]', error.response?.status, error.message)
        return error
      },
    ],
  },
})

// 类型安全的响应包装
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export async function fetchApi<T>(
  url: string,
  options?: Parameters<typeof apiClient.get>[1]
): Promise<T> {
  const response = await apiClient.get(url, options).json<ApiResponse<T>>()
  return response.data
}
```

### 7.3 Service 和 Query Hooks
```typescript
// src/services/userService.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, fetchApi } from './api'

// 类型定义
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
}

interface UpdateUserPayload {
  name?: string
  avatar?: string
}

// Query Keys 集中管理
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
}

// Hooks
export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => fetchApi<User>('user/profile'),
    staleTime: 1000 * 60 * 10,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchApi<User>(`users/${id}`),
    enabled: !!id,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      apiClient.patch('user/profile', { json: payload }).json<User>(),
    onSuccess: (updatedUser) => {
      // 乐观更新缓存
      queryClient.setQueryData(userKeys.profile(), updatedUser)
    },
    onError: (error) => {
      console.error('Update user failed:', error)
    },
  })
}
```

---

## 八、表单处理
```tsx
// 登录表单示例
// app/(auth)/login.tsx
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native'
import { useState } from 'react'

// Zod Schema 定义
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少8位')
    .max(100, '密码过长'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      // 调用登录 API
      console.log('Login:', data)
      router.replace('/(tabs)')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View
          style={{ paddingTop: insets.top + 48 }}
          className="flex-1 px-6"
        >
          {/* 标题 */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground">
              欢迎回来
            </Text>
            <Text className="mt-2 text-base text-muted-foreground">
              登录你的账户以继续
            </Text>
          </View>
          {/* 表单 */}
          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="邮箱"
                  placeholder="name@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon={<Mail size={18} color="#a1a1aa" />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="密码"
                  placeholder="至少8位"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  leftIcon={<Lock size={18} color="#a1a1aa" />}
                  rightIcon={
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={() => setShowPassword(!showPassword)}
                      className="h-8 w-8"
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="#a1a1aa" />
                      ) : (
                        <Eye size={18} color="#a1a1aa" />
                      )}
                    </Button>
                  }
                />
              )}
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              size="lg"
              className="mt-2"
            >
              登录
            </Button>
          </View>
          {/* 注册跳转 */}
          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-muted-foreground">还没有账户？</Text>
            <Button
              variant="link"
              onPress={() => router.push('/(auth)/register')}
            >
              立即注册
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
```

---

## 九、本地存储配置
```typescript
// src/lib/storage.ts
import { MMKV } from 'react-native-mmkv'

// 基础存储实例
export const storage = new MMKV({
  id: 'app-storage',
  // 加密存储 (生产环境建议从安全存储获取 key)
  // encryptionKey: 'your-encryption-key',
})

// 类型安全的存储封装
export const Storage = {
  // String
  getString: (key: string) => storage.getString(key),
  setString: (key: string, value: string) => storage.set(key, value),

  // Number
  getNumber: (key: string) => storage.getNumber(key),
  setNumber: (key: string, value: number) => storage.set(key, value),

  // Boolean
  getBool: (key: string) => storage.getBoolean(key),
  setBool: (key: string, value: boolean) => storage.set(key, value),

  // JSON Object
  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },
  setObject: <T>(key: string, value: T) => {
    storage.set(key, JSON.stringify(value))
  },

  // 删除
  remove: (key: string) => storage.delete(key),
  clearAll: () => storage.clearAll(),

  // 检查
  contains: (key: string) => storage.contains(key),
}

// 存储 Key 枚举 (避免魔法字符串)
export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  ONBOARDED: 'onboarded',
  THEME: 'theme',
} as const
```

---

## 十、动画系统
### 10.1 通用动画组件
```tsx
// src/components/ui/AnimatedView.tsx
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
  LinearTransition,
  type AnimatedProps,
} from 'react-native-reanimated'
import { type ViewProps } from 'react-native'

interface AnimatedViewProps extends ViewProps {
  entering?: 'fade' | 'slide' | 'zoom'
  exiting?: 'fade' | 'slide' | 'zoom'
  delay?: number
  children: React.ReactNode
}

const enteringMap = {
  fade: FadeIn,
  slide: SlideInRight,
  zoom: ZoomIn,
}

const exitingMap = {
  fade: FadeOut,
  slide: SlideOutLeft,
  zoom: ZoomOut,
}

export function AnimatedView({
  entering = 'fade',
  exiting = 'fade',
  delay = 0,
  children,
  ...props
}: AnimatedViewProps) {
  return (
    <Animated.View
      entering={enteringMap[entering].delay(delay).springify()}
      exiting={exitingMap[exiting]}
      layout={LinearTransition.springify()}
      {...props}
    >
      {children}
    </Animated.View>
  )
}
```

### 10.2 Skeleton Loading
```tsx
// src/components/ui/Skeleton.tsx
import { useEffect } from 'react'
import { View, type ViewProps } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated'
import { cn } from '@/lib/utils'

interface SkeletonProps extends ViewProps {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={animatedStyle}
      className={cn('rounded-lg bg-muted', className)}
      {...props}
    />
  )
}

// 使用示例: 卡片骨架屏
export function CardSkeleton() {
  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </View>
      </View>
      <View className="mt-4 gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </View>
    </View>
  )
}
```

---

## 十一、Dark Mode 支持
```typescript
// src/hooks/useColorScheme.ts
import { useColorScheme as useRNColorScheme } from 'react-native'
import { useSettingsStore } from '@/stores/settingsStore'

export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useRNColorScheme()
  const userScheme = useSettingsStore((state) => state.colorScheme)

  if (userScheme === 'system') {
    return systemScheme ?? 'light'
  }

  return userScheme
}

// 使用 NativeWind 的 useColorScheme Hook
// 在组件中配合 NativeWind 使用
import { useColorScheme } from 'nativewind'

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme()

  return (
    <Pressable
      onPress={() =>
        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')
      }
    />
  )
}
```

---

## 十二、工具函数
```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// NativeWind className 合并工具
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化工具
export const format = {
  date: (date: Date | string, locale = 'zh-CN') => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  },

  currency: (amount: number, currency = 'CNY', locale = 'zh-CN') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount)
  },

  number: (num: number, locale = 'zh-CN') => {
    return new Intl.NumberFormat(locale).format(num)
  },
}

// 延迟函数
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// 防抖
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
```

---

## 十三、app.json 配置
```json
{
  "expo": {
    "name": "MyApp",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourcompany.myapp",
      "infoPlist": {
        "NSCameraUsageDescription": "需要访问相机以上传头像",
        "NSPhotoLibraryUsageDescription": "需要访问相册以选择图片"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.myapp",
      "edgeToEdgeEnabled": true
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-font",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

---

## 十四、完整页面示例 (Home Screen)
```tsx
// app/(tabs)/index.tsx
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Bell, Search } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUserProfile, userKeys } from '@/services/userService'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { AnimatedView } from '@/components/ui/AnimatedView'
import { cn } from '@/lib/utils'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data: user, isLoading } = useUserProfile()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    setRefreshing(false)
  }, [])

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header 区域 */}
        <View
          style={{ paddingTop: insets.top + 8 }}
          className="flex-row items-center justify-between px-5 pb-4"
        >
          <View>
            <Text className="text-sm text-muted-foreground font-medium">
              早上好 👋
            </Text>
            <Text className="text-2xl font-bold text-foreground">
              {isLoading ? '加载中...' : user?.name ?? '用户'}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Button
              variant="outline"
              size="icon"
              onPress={() => router.push('/search')}
            >
              <Search size={20} color="#71717a" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onPress={() => router.push('/(modals)/notifications')}
            >
              <Bell size={20} color="#71717a" />
            </Button>
          </View>
        </View>
        {/* 内容区域 */}
        <View className="px-5 gap-4">
          {/* 用户卡片 */}
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <AnimatedView entering="fade" delay={100}>
              <Card className="flex-row items-center gap-4">
                <Image
                  source={{ uri: user?.avatar ?? 'https://i.pravatar.cc/100' }}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                  contentFit="cover"
                />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {user?.name}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {user?.email}
                  </Text>
                </View>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push('/(tabs)/profile')}
                >
                  查看
                </Button>
              </Card>
            </AnimatedView>
          )}

          {/* 快捷操作 */}
          <AnimatedView entering="fade" delay={200}>
            <Text className="mb-3 text-lg font-semibold text-foreground">
              快捷操作
            </Text>
            <View className="flex-row gap-3">
              {quickActions.map((action, index) => (
                <Pressable
                  key={action.id}
                  onPress={() => router.push(action.href as never)}
                  className="flex-1 items-center rounded-2xl bg-secondary p-4 gap-2 active:opacity-70"
                >
                  <View
                    className={cn(
                      'h-12 w-12 items-center justify-center rounded-full',
                      action.bgColor
                    )}
                  >
                    <action.Icon size={22} color={action.iconColor} />
                  </View>
                  <Text className="text-xs font-medium text-foreground text-center">
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </AnimatedView>
          {/* 列表区域 */}
          <AnimatedView entering="fade" delay={300}>
            <Text className="mb-3 text-lg font-semibold text-foreground">
              最近动态
            </Text>
            <View className="gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="gap-2">
                  <Text className="text-sm font-medium text-foreground">
                    动态标题 {i + 1}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    这是动态的描述内容，展示一些简短的信息。
                  </Text>
                </Card>
              ))}
            </View>
          </AnimatedView>
        </View>
      </ScrollView>
    </View>
  )
}

// 快捷操作数据
import { Compass, User, Settings, Heart } from 'lucide-react-native'

const quickActions = [
  {
    id: '1',
    label: '探索',
    href: '/(tabs)/explore',
    Icon: Compass,
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: '#3b82f6',
  },
  {
    id: '2',
    label: '个人',
    href: '/(tabs)/profile',
    Icon: User,
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: '#a855f7',
  },
  {
    id: '3',
    label: '收藏',
    href: '/favorites',
    Icon: Heart,
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    iconColor: '#ec4899',
  },
  {
    id: '4',
    label: '设置',
    href: '/(modals)/settings',
    Icon: Settings,
    bgColor: 'bg-zinc-100 dark:bg-zinc-800',
    iconColor: '#71717a',
  },
]
```

---

## 十五、技术选型决策说明
```plain
┌─────────────────────────────────────────────────────────┐
│                   技术决策对比表                          │
├──────────────┬──────────────────┬───────────────────────┤
│   功能        │   推荐选择        │   不推荐(已过时)        │
├──────────────┼──────────────────┼───────────────────────┤
│ 路由         │ Expo Router v4   │ React Navigation 单独用 │
│ 样式         │ NativeWind v4    │ StyleSheet / Styled   │
│ 状态管理      │ Zustand v5       │ Redux / MobX          │
│ 服务端状态    │ TanStack Query   │ SWR / RTK Query       │
│ 动画         │ Reanimated v3    │ Animated API (原生)    │
│ 图片         │ expo-image       │ Image (RN原生)         │
│ 存储         │ MMKV             │ AsyncStorage          │
│ 表单         │ RHF + Zod        │ Formik                │
│ 图标         │ lucide-react-native│ react-native-vector  │
│ HTTP客户端   │ ky               │ axios                 │
│ 架构         │ New Architecture │ Old Architecture      │
└──────────────┴──────────────────┴───────────────────────┘
```

---

> **核心原则**: 
>
> 1. **文件路由优先** - Expo Router 让路由即文件结构，直观且类型安全
> 2. **New Architecture** - JSI + Fabric + Concurrent Features 全面启用
> 3. **Tailwind 思维** - NativeWind 实现 Web/Native 样式统一
> 4. **轻量状态** - Zustand 替代 Redux，服务端状态交给 TanStack Query
> 5. **性能优先** - MMKV 比 AsyncStorage 快10倍，expo-image 优先缓存
>

