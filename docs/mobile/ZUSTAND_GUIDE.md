# Zustand 状态管理使用指南

## 什么是 Zustand？

Zustand 是一个小巧、快速且可扩展的 React 状态管理库，特别适合 React Native 应用。

**优势**：

- 🪶 **轻量** - 不到 1KB（gzipped）
- ⚡ **简单** - API 简洁，学习曲线平缓
- 🎯 **无样板代码** - 不需要 Provider、Context
- 🔥 **性能优秀** - 基于 Hook，自动优化渲染
- 📦 **TypeScript 友好** - 完整的类型支持

---

## 已创建的 Store

### 1. 认证 Store (`authStore.ts`)

管理用户登录状态和用户信息。

```typescript
import { useAuthStore } from '@/stores';

// 在组件中使用
const { isAuthenticated, user, login, logout } = useAuthStore();

// 登录
await login('email@example.com', 'password');

// 登出
logout();
```

**状态**：

- `isAuthenticated: boolean` - 是否已登录
- `user: User | null` - 用户信息
- `token: string | null` - 认证令牌

**操作**：

- `login(email, password)` - 登录
- `logout()` - 登出
- `setUser(user)` - 设置用户信息
- `setToken(token)` - 设置令牌

---

### 2. 主题 Store (`themeStore.ts`)

管理应用主题（浅色/深色模式）。

```typescript
import { useThemeStore } from '@/stores';

const { colorScheme, isDark, toggleTheme, setColorScheme } = useThemeStore();

// 切换主题
toggleTheme();

// 设置特定主题
setColorScheme('dark');
```

**状态**：

- `colorScheme: 'light' | 'dark' | null` - 当前主题
- `isDark: boolean` - 是否为暗黑模式

**操作**：

- `toggleTheme()` - 切换主题
- `setColorScheme(scheme)` - 设置主题

---

### 3. 计数器 Store (`counterStore.ts`)

简单的计数器示例，展示 Zustand 基本用法。

```typescript
import { useCounterStore } from '@/stores';

const { count, increment, decrement, reset } = useCounterStore();
```

**状态**：

- `count: number` - 计数值

**操作**：

- `increment()` - 加 1
- `decrement()` - 减 1
- `reset()` - 重置为 0
- `setCount(count)` - 设置特定值

---

## 基本使用方法

### 在组件中使用 Store

```tsx
import { useAuthStore } from '@/stores';

export default function ProfileScreen() {
  // 方式 1: 获取整个状态和所有操作
  const { isAuthenticated, user, login, logout } = useAuthStore();

  // 方式 2: 只选择需要的部分（性能更好）
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);

  return (
    <View>
      <Text>{user?.name || '游客'}</Text>
      {isAuthenticated ? (
        <Button title="退出" onPress={logout} />
      ) : (
        <Button title="登录" onPress={() => login('email', 'pass')} />
      )}
    </View>
  );
}
```

---

## 创建新的 Store

### 步骤 1: 创建 Store 文件

在 `src/stores/` 目录创建新文件，例如 `cartStore.ts`：

```typescript
// src/stores/cartStore.ts
import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  // 状态
  items: CartItem[];
  total: number;

  // 操作
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  // 初始状态
  items: [],
  total: 0,

  // 添加商品
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);

      if (existingItem) {
        // 如果已存在，增加数量
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
          total: state.total + item.price,
        };
      }

      // 否则添加新商品
      return {
        items: [...state.items, { ...item, quantity: 1 }],
        total: state.total + item.price,
      };
    }),

  // 删除商品
  removeItem: (id) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return state;

      return {
        items: state.items.filter((i) => i.id !== id),
        total: state.total - item.price * item.quantity,
      };
    }),

  // 清空购物车
  clearCart: () => set({ items: [], total: 0 }),

  // 更新数量
  updateQuantity: (id, quantity) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return state;

      const priceDiff = item.price * (quantity - item.quantity);

      return {
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        total: state.total + priceDiff,
      };
    }),
}));
```

### 步骤 2: 导出 Store

在 `src/stores/index.ts` 中添加：

```typescript
export { useCartStore } from './cartStore';
```

### 步骤 3: 使用新 Store

```tsx
import { useCartStore } from '@/stores';

export default function CartScreen() {
  const { items, total, addItem, removeItem } = useCartStore();

  return (
    <View>
      <Text>商品数量: {items.length}</Text>
      <Text>总价: ${total.toFixed(2)}</Text>
      {items.map((item) => (
        <View key={item.id}>
          <Text>
            {item.name} x {item.quantity}
          </Text>
          <Button title="删除" onPress={() => removeItem(item.id)} />
        </View>
      ))}
    </View>
  );
}
```

---

## 高级用法

### 1. 使用 `get()` 访问当前状态

在操作中访问最新状态：

```typescript
export const useStore = create<State>((set, get) => ({
  count: 0,
  increment: () => {
    const currentCount = get().count; // 获取当前值
    console.log('当前计数:', currentCount);
    set({ count: currentCount + 1 });
  },
}));
```

### 2. 计算派生状态

```typescript
export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  // 计算总数量（不需要存储在状态中）
  getTotalQuantity: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

// 使用
const getTotalQuantity = useCartStore((state) => state.getTotalQuantity);
const totalQty = getTotalQuantity();
```

### 3. 订阅状态变化

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/stores';

export default function App() {
  useEffect(() => {
    // 订阅认证状态变化
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        console.log('认证状态变化:', isAuthenticated);
      },
    );

    return unsubscribe; // 清理订阅
  }, []);
}
```

### 4. 在组件外使用 Store

```typescript
import { useAuthStore } from '@/stores';

// 直接访问状态
const isAuthenticated = useAuthStore.getState().isAuthenticated;

// 直接调用操作
useAuthStore.getState().logout();
```

### 5. 持久化状态（使用 MMKV）

安装依赖：

```bash
pnpm add react-native-mmkv zustand/middleware
```

创建持久化 Store：

```typescript
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    return storage.getString(key) ?? null;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

export const usePersistedStore = create(
  persist<State>(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage', // 存储键名
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
```

---

## 性能优化

### 1. 只选择需要的状态

❌ **不推荐**（会导致不必要的重渲染）：

```typescript
const store = useAuthStore(); // 任何状态变化都会重渲染
```

✅ **推荐**（只在选中的状态变化时重渲染）：

```typescript
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

### 2. 使用浅比较

对于对象或数组，使用 `shallow` 避免不必要的渲染：

```typescript
import { shallow } from 'zustand/shallow';

const { user, isAuthenticated } = useAuthStore(
  (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
  shallow,
);
```

### 3. 拆分大型 Store

将大型 Store 拆分为多个小 Store：

```typescript
// ❌ 不推荐：一个大 Store
const useBigStore = create((set) => ({
  user: null,
  cart: [],
  settings: {},
  // ... 太多状态
}));

// ✅ 推荐：多个小 Store
const useUserStore = create(/* ... */);
const useCartStore = create(/* ... */);
const useSettingsStore = create(/* ... */);
```

---

## 调试技巧

### 1. 使用 devtools 中间件

```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools<State>(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'CounterStore' }, // 在 Redux DevTools 中的名称
  ),
);
```

### 2. 添加日志

```typescript
export const useStore = create<State>((set) => ({
  count: 0,
  increment: () =>
    set((state) => {
      console.log('Before:', state.count);
      const newState = { count: state.count + 1 };
      console.log('After:', newState.count);
      return newState;
    }),
}));
```

---

## 常见模式

### 1. 异步操作

```typescript
export const useDataStore = create<DataState>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('https://api.example.com/data');
      const data = await response.json();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### 2. 重置状态

```typescript
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set(initialState), // 重置为初始状态
}));
```

### 3. 操作组合

```typescript
export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],

  addTodo: (text) => {
    const newTodo = { id: Date.now(), text, completed: false };
    set((state) => ({ todos: [...state.todos, newTodo] }));
  },

  toggleTodo: (id) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    }));
  },

  // 组合操作
  addAndToggleTodo: (text) => {
    const { addTodo, toggleTodo } = get();
    const id = Date.now();
    addTodo(text);
    toggleTodo(id);
  },
}));
```

---

## 项目中的使用示例

查看 `app/(tabs)/profile.tsx` 查看完整示例，包括：

- ✅ 认证状态管理
- ✅ 主题切换
- ✅ 计数器演示

---

## 参考资源

- [Zustand 官方文档](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [React Native 最佳实践](https://github.com/react-native-community/discussions-and-proposals)

---

## 总结

Zustand 提供了一种简单、灵活的状态管理方案：

✅ **简单** - 无需样板代码  
✅ **快速** - 性能优秀  
✅ **灵活** - 支持中间件  
✅ **类型安全** - 完整 TypeScript 支持

开始使用 Zustand，让状态管理变得简单！🎉
