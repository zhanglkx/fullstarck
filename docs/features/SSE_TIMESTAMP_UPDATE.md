# SSE 时间戳刷新动画

## 功能概述

服务器状态监控页面接收来自后端 SSE 的实时时间戳，并在每次数据更新时以符合 Apple 设计规范的方式显示最后更新时间。

## 实现细节

### 1. 后端实现

**位置**: `apps/api/src/serverstate/serverstate.controller.ts`

```typescript
@Sse('stream')
streamServerStatus(): Observable<MessageEvent> {
  return interval(2000).pipe(
    map(() => {
      const data = {
        cpu: this.serverstateService.cpuStatus(),
        memory: this.serverstateService.getMemInfo(),
        disks: this.serverstateService.getDiskStatus(),
        sys: this.serverstateService.getSysInfo(),
        timestamp: Date.now(), // 服务器端时间戳（毫秒）
      };
      return { data } as MessageEvent;
    }),
  );
}
```

每 2 秒推送一次服务器状态数据，包含时间戳字段。

### 2. 类型定义

**位置**: `packages/shared/src/types/serverstate.types.ts`

```typescript
export interface ServerState {
  cpu: CPUStatus;
  memory: MemInfo;
  disks: DiskInfo[];
  sys: SysInfo;
  timestamp?: number; // SSE 时间戳（毫秒）
}
```

### 3. 前端 Hook

**位置**: `apps/web/src/api/serverstate.ts`

```typescript
export function useServerStateStream() {
  const [data, setData] = useState<ServerState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const serverState = JSON.parse(event.data);
      setData(serverState);
      // 提取服务器时间戳或使用本地时间
      setLastUpdateTime(serverState.timestamp || Date.now());
    };

    return () => eventSource.close();
  }, []);

  return { data, error, isConnected, lastUpdateTime };
}
```

### 4. 页面组件

**位置**: `apps/web/src/app/serverstate/page.tsx`

```tsx
function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) return "未连接";
  
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  
  return `${hours}:${minutes}:${seconds}`;
}

export default function ServerStateMonitor() {
  const { data, error, isConnected, lastUpdateTime } = useServerStateStream();
  const formattedTime = useMemo(() => formatTimestamp(lastUpdateTime), [lastUpdateTime]);

  return (
    <Card className={styles.headerCard}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <DesktopOutlined aria-hidden />
          概览与控制
        </h2>
        <div className={styles.updateTime} key={lastUpdateTime}>
          <ClockCircleOutlined className={styles.updateIcon} />
          <span className={styles.updateLabel}>最后更新</span>
          <span className={styles.updateValue}>{formattedTime}</span>
        </div>
      </div>
    </Card>
  );
}
```

**关键点**:
- `key={lastUpdateTime}` - 时间戳变化时触发重新渲染和动画
- `useMemo` - 缓存格式化结果，避免不必要的计算
- 格式化为 `HH:MM:SS` 格式

## Apple 设计规范实现

### 样式特性

**位置**: `apps/web/src/app/serverstate/page.module.scss`

#### 1. Pill Shape (胶囊形状)

```scss
.updateTime {
  border-radius: 980px; /* Apple 标志性的 pill 形状 */
  padding: 8px 16px;
  background: var(--surface-page);
  border: 1px solid var(--stroke-hairline);
}
```

根据 `DESIGN.md` 第 5 节 "Border Radius Scale"，980px radius 是 Apple 的标志性 pill CTA 形状。

#### 2. Typography (排版)

```scss
.updateTime {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.224px; /* Apple 14px 标准字距 */
  line-height: 1.43;
}

.updateLabel {
  font-weight: 500;
  color: var(--text-secondary);
}

.updateValue {
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums; /* 等宽数字 */
}
```

遵循 `DESIGN.md` 第 3 节 "Typography Rules" 表格中的 Link/Caption 规范：
- 14px (0.88rem)
- SF Pro Text
- Line height 1.43
- Letter spacing -0.224px

#### 3. Color & Accent

```scss
.updateIcon {
  color: var(--accent); /* Apple Blue (#0071e3) */
}

.updateLabel {
  color: var(--text-secondary); /* rgba(0, 0, 0, 0.8) on light */
}

.updateValue {
  color: var(--text-primary); /* #1d1d1f on light */
}
```

根据 `DESIGN.md` 第 2 节 "Color Palette & Roles"：
- Apple Blue (`#0071e3`) 仅用于交互元素和图标
- 文本层级使用 primary/secondary/tertiary

#### 4. 刷新动画

```scss
@keyframes updatePulse {
  0% {
    background: color-mix(in srgb, var(--accent) 12%, var(--surface-page));
    transform: scale(1);
  }
  50% {
    background: color-mix(in srgb, var(--accent) 8%, var(--surface-page));
    transform: scale(1.02);
  }
  100% {
    background: var(--surface-page);
    transform: scale(1);
  }
}

.updateTime {
  animation: updatePulse 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**动画特性**:
- **脉冲效果**: 背景从 12% accent 过渡到 8% 再回到正常
- **微缩放**: `scale(1.02)` 提供细微的弹性反馈
- **缓动函数**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard easing)
- **持续时间**: 0.6s 适中的动画时长，既明显又不打扰

#### 5. 时钟图标旋转

```scss
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.updateIcon {
  animation: rotate 2s linear infinite;
}
```

时钟图标持续旋转，提供"实时更新"的视觉反馈。

#### 6. 防抖动设计

```scss
.updateValue {
  font-variant-numeric: tabular-nums; /* 等宽数字 */
  min-width: 72px; /* 固定宽度 */
  text-align: right;
}
```

**关键特性**:
- `tabular-nums`: 数字等宽，避免宽度变化
- `min-width: 72px`: 固定容器宽度，防止布局抖动
- `text-align: right`: 右对齐，时间变化时左侧固定

### 响应式设计

```scss
.updateTime {
  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
}
```

在移动端（<640px），时间戳标签全宽显示并居中，符合 `DESIGN.md` 第 8 节 "Responsive Behavior" 的 Mobile 断点策略。

## 视觉效果

### 更新时的动画序列

1. **SSE 推送新数据** (每 2 秒)
2. **React 重新渲染** (`key={lastUpdateTime}` 变化)
3. **脉冲动画触发**:
   - 0-300ms: 背景从 12% accent 过渡到 8%，scale 1→1.02
   - 300-600ms: 背景回到正常，scale 1.02→1
4. **时间文本更新**: 等宽数字避免布局抖动
5. **时钟图标**: 持续旋转提供"活跃"状态

### 设计原则遵循

| 设计原则                      | 实现方式                                       | 对应规范                         |
| ----------------------------- | ---------------------------------------------- | -------------------------------- |
| Apple Blue 单一 Accent        | 仅图标使用 `#0071e3`                           | DESIGN.md § 2 "Interactive"      |
| Pill Shape                    | 980px border-radius                            | DESIGN.md § 5 "Border Radius"    |
| Negative Letter Spacing       | -0.224px at 14px                               | DESIGN.md § 3 "Principles"       |
| Tight Typography              | line-height 1.43                               | DESIGN.md § 3 "Typography Rules" |
| Subtle Animation              | 0.6s ease, 2% scale                            | Apple 的微妙动效哲学             |
| Tabular Numbers               | `font-variant-numeric: tabular-nums`           | 防止布局抖动（业界最佳实践）     |
| Color Hierarchy               | Primary/Secondary text separation              | DESIGN.md § 2 "Text"             |
| Responsive Collapse           | 全宽 + 居中 on mobile                          | DESIGN.md § 8 "Breakpoints"      |

## 使用场景

### 正常运行

- 时间戳每 2 秒刷新
- 脉冲动画提供视觉反馈
- 时钟图标持续旋转

### 连接断开

- 显示 "未连接"
- 时钟图标停止旋转
- 背景色变为警告色（可选扩展）

### 移动端

- 时间戳标签全宽显示
- 保持相同的动画效果
- 触摸友好的 44px 高度

## 扩展建议

### 1. 连接状态指示器

```tsx
<div className={styles.updateTime} data-connected={isConnected}>
  <span className={styles.statusDot} />
  {/* ... */}
</div>
```

```scss
.statusDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #52c41a; // 绿色
  
  [data-connected="false"] & {
    background: #ff4d4f; // 红色
    animation: blink 1s ease-in-out infinite;
  }
}
```

### 2. 相对时间显示

```typescript
function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "刚刚";
  if (seconds < 60) return `${seconds} 秒前`;
  return formatTimestamp(timestamp);
}
```

### 3. 手动刷新按钮

```tsx
<button className={styles.refreshButton} onClick={forceRefresh}>
  <SyncOutlined spin={isRefreshing} />
</button>
```

## 相关文档

- [SSE 实现指南](./SSE_IMPLEMENTATION.md)
- [服务器状态监控](./SERVER_STATE_MONITOR.md)
- [Apple 设计规范](../../DESIGN.md)

## 最后更新

2026/04/16
