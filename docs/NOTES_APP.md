# 手帐应用示例

这是一个完整的三端示例应用，展示了 Monorepo 中如何共享代码。

## 功能

- ✅ 创建手帐
- ✅ 编辑手帐
- ✅ 删除手帐
- ✅ 标记完成/未完成
- ✅ 下拉刷新（移动端）
- ✅ 使用共享的 DTO 和类型定义

## 运行步骤

### 1. 启动后端

```bash
pnpm nx serve backend
```

后端将在 http://localhost:3000 运行

### 2. 启动 Web 端

```bash
pnpm nx serve web
```

访问 http://localhost:4200/notes 查看手帐应用

### 3. 启动移动端

```bash
# iOS
pnpm nx run mobile:run-ios

# Android
pnpm nx run mobile:run-android

# Web 预览
pnpm nx serve mobile
```

## 代码共享示例

所有三端都使用了共享的类型定义：

```typescript
import { CreateNoteDto, NoteDto } from '@fullstarck/api-contracts'
```

### 后端 (NestJS)
- `apps/backend/src/app/notes.controller.ts` - REST API 控制器
- `apps/backend/src/app/notes.service.ts` - 业务逻辑
- 使用 `class-validator` 进行自动验证

### Web 端 (Next.js)
- `apps/web/src/app/notes/page.tsx` - 手帐列表页面
- 使用 Ant Design 组件
- 使用 CSS Modules 样式

### 移动端 (React Native)
- `apps/mobile/src/app/NotesApp.tsx` - 手帐应用
- 使用 Gluestack UI 组件（无需 Tailwind）
- 完整的 CRUD 功能
- 下拉刷新支持

## API 端点

- `GET /api/notes` - 获取所有手帐
- `GET /api/notes/:id` - 获取单个手帐
- `POST /api/notes` - 创建手帐
- `PUT /api/notes/:id` - 更新手帐
- `DELETE /api/notes/:id` - 删除手帐

## 移动端 UI 组件

使用 Gluestack UI 组件：
- `Card` - 卡片容器
- `Button` - 按钮
- `Input` - 输入框
- `Textarea` - 多行文本
- `Modal` - 模态框
- `Checkbox` - 复选框
- `Spinner` - 加载指示器

**无需配置 Tailwind**，所有样式通过 Gluestack 的主题系统管理。
