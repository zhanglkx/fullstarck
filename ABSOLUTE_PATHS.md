# 🎯 绝对路径导入配置完成

## ✅ 已配置的三端

### 1. Backend (NestJS)

**配置文件：**
- `apps/backend/tsconfig.app.json`
- `apps/backend/webpack.config.js`

**可用的路径别名：**
```typescript
import { SomeService } from '@backend/services/some.service'
import { SomeController } from '@/controllers/some.controller'
import { SomeDto } from '@/dto/some.dto'
```

**等价于：**
```typescript
import { SomeService } from './services/some.service'
import { SomeController } from './controllers/some.controller'
import { SomeDto } from './dto/some.dto'
```

### 2. Web (Next.js)

**配置文件：**
- `apps/web/tsconfig.json`
- `apps/web/next.config.js`

**可用的路径别名：**
```typescript
import { Navbar } from '@components/Navbar'
import { Button } from '@/components/Button'
import NotesPage from '@app/notes/page'
import { formatDate } from '@lib/utils'
import { API_URL } from '@utils/constants'
```

**等价于：**
```typescript
import { Navbar } from '../../components/Navbar'
import { Button } from '../../../components/Button'
import NotesPage from '../notes/page'
import { formatDate } from '../../lib/utils'
import { API_URL } from '../../utils/constants'
```

### 3. Mobile (React Native)

**配置文件：**
- `apps/mobile/tsconfig.app.json`
- `apps/mobile/.babelrc.js`
- 安装了 `babel-plugin-module-resolver`

**可用的路径别名：**
```typescript
import { Header } from '@components/Header'
import { HomeScreen } from '@screens/HomeScreen'
import { useAuth } from '@hooks/useAuth'
import { formatCurrency } from '@utils/formatters'
import Logo from '@assets/logo.png'
```

**等价于：**
```typescript
import { Header } from '../../components/Header'
import { HomeScreen } from '../screens/HomeScreen'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../utils/formatters'
import Logo from '../../assets/logo.png'
```

## 📁 路径别名对照表

### Backend

| 别名 | 映射路径 | 说明 |
|------|---------|------|
| `@backend/*` | `apps/backend/src/*` | Backend 根目录 |
| `@/*` | `apps/backend/src/*` | 简写形式 |

### Web

| 别名 | 映射路径 | 说明 |
|------|---------|------|
| `@/*` | `apps/web/src/*` | Web 根目录 |
| `@components/*` | `apps/web/src/components/*` | 组件目录 |
| `@app/*` | `apps/web/src/app/*` | App Router 页面 |
| `@lib/*` | `apps/web/src/lib/*` | 库函数 |
| `@utils/*` | `apps/web/src/utils/*` | 工具函数 |

### Mobile

| 别名 | 映射路径 | 说明 |
|------|---------|------|
| `@/*` | `apps/mobile/src/*` | Mobile 根目录 |
| `@components/*` | `apps/mobile/src/components/*` | 组件目录 |
| `@screens/*` | `apps/mobile/src/screens/*` | 屏幕/页面 |
| `@utils/*` | `apps/mobile/src/utils/*` | 工具函数 |
| `@hooks/*` | `apps/mobile/src/hooks/*` | React Hooks |
| `@assets/*` | `apps/mobile/src/assets/*` | 静态资源 |

## 🎯 使用示例

### Backend 示例

```typescript
// apps/backend/src/app/app.controller.ts

// ❌ 之前：相对路径
import { AppService } from './app.service'
import { NotesService } from '../notes/notes.service'

// ✅ 现在：绝对路径
import { AppService } from '@/app/app.service'
import { NotesService } from '@/notes/notes.service'
```

### Web 示例

```typescript
// apps/web/src/app/dashboard/page.tsx

// ❌ 之前：相对路径
import { Navbar } from '../../../components/Navbar'
import { Footer } from '../../../components/Footer'

// ✅ 现在：绝对路径
import { Navbar } from '@components/Navbar'
import { Footer } from '@components/Footer'
```

### Mobile 示例

```typescript
// apps/mobile/src/app/NotesApp.tsx

// ❌ 之前：相对路径
import { Header } from '../components/Header'
import { useNotes } from '../hooks/useNotes'

// ✅ 现在：绝对路径
import { Header } from '@components/Header'
import { useNotes } from '@hooks/useNotes'
```

## 🔧 配置详情

### 1. TypeScript 配置

所有项目的 `tsconfig.json` 都添加了：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      // ... 其他别名
    }
  }
}
```

### 2. 构建工具配置

#### Backend (Webpack)
```javascript
// apps/backend/webpack.config.js
resolve: {
  alias: {
    '@backend': join(__dirname, 'src'),
    '@': join(__dirname, 'src'),
  }
}
```

#### Web (Next.js Webpack)
```javascript
// apps/web/next.config.js
webpack: (config) => {
  config.resolve.alias = {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    // ... 其他别名
  }
}
```

#### Mobile (Babel)
```javascript
// apps/mobile/.babelrc.js
plugins: [
  ['module-resolver', {
    alias: {
      '@': './src',
      '@components': './src/components',
      // ... 其他别名
    }
  }]
]
```

## ✅ 优势

1. **更清晰** - 一眼就能看出导入来自哪里
2. **更短** - 避免 `../../../../` 这样的路径
3. **更安全** - 移动文件时不需要更新导入路径
4. **更统一** - 三端使用相同的导入风格
5. **更易维护** - 重构时更容易追踪依赖

## 🎓 最佳实践

### 1. 优先使用更具体的别名

```typescript
// ✅ 推荐
import { Button } from '@components/Button'

// ⚠️ 可以，但不够具体
import { Button } from '@/components/Button'
```

### 2. 同一目录下的文件使用相对路径

```typescript
// 在 src/components/Header.tsx 中

// ✅ 推荐：同目录使用相对路径
import { Button } from './Button'

// ⚠️ 不推荐：同目录使用绝对路径
import { Button } from '@components/Button'
```

### 3. 跨目录导入使用绝对路径

```typescript
// 在 src/app/dashboard/page.tsx 中

// ✅ 推荐
import { Navbar } from '@components/Navbar'

// ❌ 不推荐
import { Navbar } from '../../components/Navbar'
```

## 🔄 迁移指南

### 渐进式迁移

不需要一次性更新所有导入！可以：

1. **新代码使用绝对路径**
2. **重构时逐步更新旧代码**
3. **混合使用不影响功能**

### 批量更新（可选）

可以使用 IDE 的查找替换功能：

```
查找：from '../../../components/
替换为：from '@components/
```

## 📝 注意事项

1. **IDE 支持**：VSCode 和 WebStorm 都能正确识别这些路径别名
2. **自动导入**：IDE 的自动导入会优先使用配置的别名
3. **类型检查**：TypeScript 完全支持，有完整的类型提示
4. **热重载**：所有三端的热重载都正常工作

## 🎉 总结

现在三端都支持绝对路径导入了！

- ✅ Backend：`@backend/*` 或 `@/*`
- ✅ Web：`@/*`, `@components/*`, `@app/*`, `@lib/*`, `@utils/*`
- ✅ Mobile：`@/*`, `@components/*`, `@screens/*`, `@utils/*`, `@hooks/*`, `@assets/*`

**开始享受更清晰的代码吧！** 🚀
