# 骨架屏实现文档

## 概述

本项目为所有需要加载数据的页面实现了精美的骨架屏（Skeleton），替代了传统的 Spin 加载器。骨架屏能够更好地提升用户体验，让用户在等待数据加载时看到页面的大致结构。

## 实现的骨架屏组件

### 1. ServerStateSkeleton - 服务器状态监控骨架屏

**位置**: `apps/web/src/components/skeletons/ServerStateSkeleton.tsx`

**特点**:

- 模拟服务器监控页面的完整布局
- 包含头部卡片、系统信息、CPU/内存状态和磁盘信息的骨架
- 使用圆形骨架模拟环形进度条
- 响应式设计，适配移动端

**使用场景**: `/serverstate` 页面

### 2. NpmDataSkeleton - NPM 数据统计骨架屏

**位置**: `apps/web/src/components/skeletons/NpmDataSkeleton.tsx`

**特点**:

- 模拟 NPM 数据查询页面的布局
- 包含标题、搜索表单和图表区域的骨架
- 渐变背景与原页面保持一致
- 表单输入框和按钮的骨架展示

**使用场景**: `/npmdata` 页面

### 3. QRCodeConfirmSkeleton - 二维码确认骨架屏

**位置**: `apps/web/src/components/skeletons/QRCodeConfirmSkeleton.tsx`

**特点**:

- 模拟二维码确认页面的中心布局
- 包含标题、二维码图片和按钮的骨架
- 卡片式设计，居中显示
- 渐变背景

**使用场景**: `/qrcode/confirm` 页面

## 技术实现

### 使用的 Ant Design Skeleton 组件

- `Skeleton.Input` - 输入框骨架
- `Skeleton.Button` - 按钮骨架
- `Skeleton.Avatar` - 圆形/方形骨架（用于头像或圆形进度条）
- `Skeleton.Image` - 图片骨架
- `Skeleton` - 通用骨架（带段落）

### 配置要点

```tsx
// 激活动画效果
<Skeleton active />

// 自定义大小
<Skeleton.Input size="large" style={{ width: 300 }} />

// 圆形骨架
<Skeleton.Avatar size={150} shape="circle" />

// 段落骨架
<Skeleton paragraph={{ rows: 3 }} />
```

## 页面集成

### 服务器监控页面 (serverstate/page.tsx)

**修改前**:

```tsx
if (loading) {
  return (
    <div className={styles.container}>
      <div className={styles.spinContainer}>
        <Spin size="large" description="加载服务器信息中..." />
      </div>
    </div>
  );
}
```

**修改后**:

```tsx
import { ServerStateSkeleton } from '@/components/skeletons';

if (loading) {
  return <ServerStateSkeleton />;
}
```

### NPM 数据页面 (npmdata/page.tsx)

**修改前**:

```tsx
{
  loading && (
    <div className={styles.chartCard}>
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>正在加载数据...</p>
      </div>
    </div>
  );
}
```

**修改后**:

```tsx
import { NpmDataSkeleton } from '@/components/skeletons';

{
  loading && <NpmDataSkeleton />;
}
```

### 二维码确认页面 (qrcode/confirm/page.tsx)

**修改前**:

```tsx
if (loading) {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <Spin size="large" />
    </div>
  );
}

// Suspense fallback
<Suspense fallback={
  <div style={{ textAlign: "center", padding: "50px" }}>
    <Spin size="large" />
  </div>
}>
```

**修改后**:

```tsx
import { QRCodeConfirmSkeleton } from "@/components/skeletons";

if (loading) {
  return <QRCodeConfirmSkeleton />;
}

// Suspense fallback
<Suspense fallback={<QRCodeConfirmSkeleton />}>
```

## 修复的问题

### 1. 替换已废弃的 Ant Design API

- `Spin` 组件的 `tip` 属性 → `description`
- `Progress` 组件的 `width` 属性 → `size`
- `Divider` 组件的 `type="vertical"` → `orientation="vertical"`
- `Skeleton.Input` 的 `size="default"` → `size="medium"`

### 2. 修复 NPM 数据 API 响应解析

**问题**: 后端返回的数据结构为嵌套的格式，需要正确解析

**解决方案**:

```tsx
// 定义正确的类型
interface ApiWrappedResponse {
  code: number;
  data: NpmDataResponse;
  msg: string;
}

// 正确访问数据
const result = await apiGet<ApiWrappedResponse>("/npmdata/downloads", {...});
if (!result.data.success) {
  throw new Error("API 返回失败");
}
setData(result.data);
```

## 样式设计

所有骨架屏组件都配有对应的 SCSS 模块文件，样式与原页面保持一致：

- 渐变背景
- 卡片圆角和阴影
- 响应式布局
- 一致的间距和对齐

## 优势

1. **更好的用户体验**: 用户可以预览页面结构，减少等待焦虑
2. **视觉连续性**: 骨架屏与实际内容的布局一致，加载过渡更平滑
3. **专业性**: 现代 Web 应用的标准做法
4. **性能感知**: 即使加载时间相同，骨架屏让用户感觉更快

## 未来改进

- 可以考虑添加更多自定义动画效果
- 根据实际数据加载速度优化骨架屏的复杂度
- 为更多页面添加骨架屏支持

## 维护指南

1. 当修改页面布局时，同步更新对应的骨架屏组件
2. 保持骨架屏与实际内容的结构一致
3. 使用 Ant Design 的 Skeleton 组件，保持设计系统的一致性
4. 注意 Ant Design 的版本更新，及时处理废弃的 API
