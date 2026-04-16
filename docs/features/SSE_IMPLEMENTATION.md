# SSE (Server-Sent Events) 实现指南

> 服务器状态实时推送功能实现文档

**最后更新**: 2026-04-16

## 目录

- [前置知识](#前置知识)
- [第一阶段：后端实现（NestJS）](#第一阶段后端实现nestjs)
- [第二阶段：前端实现（Next.js）](#第二阶段前端实现nextjs)
- [第三阶段：测试与调试](#第三阶段测试与调试)
- [第四阶段：优化与完善](#第四阶段优化与完善)
- [常见问题排查](#常见问题排查)
- [学习检查点](#学习检查点)

---

## 前置知识

### 需要掌握的概念

开始实现前，建议先了解以下概念：

1. **SSE 基础**
   - SSE 是基于 HTTP 的单向通信协议
   - Content-Type 为 `text/event-stream`
   - 浏览器原生支持自动重连
   
2. **RxJS 基础**
   - `Observable`: 可观察对象，代表随时间推送的数据流
   - `interval(n)`: 每隔 n 毫秒发射一个递增的数字
   - `map(fn)`: 转换数据流中的每个值
   - `pipe()`: 组合多个操作符
   
3. **React Hooks**
   - `useEffect`: 处理副作用（如创建连接）
   - `useState`: 管理组件状态
   - 清理函数：返回一个函数用于清理资源

### 推荐学习资源

- **RxJS 官方文档**: https://rxjs.dev/guide/overview
  - 重点看：Observable、interval、map 操作符
- **MDN EventSource**: https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource
- **NestJS SSE 文档**: 搜索 "NestJS Server-Sent Events"

---

## 第一阶段：后端实现（NestJS）

### 步骤 1.1：安装必要的依赖

SSE 功能需要 RxJS，NestJS 已经内置，无需额外安装。

**验证 RxJS 是否可用**：

```bash
pnpm --filter api list | grep rxjs
```

如果没有输出，则安装：

```bash
pnpm --filter api add rxjs
```

---

### 步骤 1.2：修改 Controller 添加 SSE 端点

**文件位置**: `apps/api/src/serverstate/serverstate.controller.ts`

**需要做什么**：
1. 导入必要的 NestJS 装饰器和 RxJS 操作符
2. 添加一个新的路由方法，使用 `@Sse()` 装饰器
3. 返回一个 Observable，定期推送服务器状态

**实现要点**：

```typescript
// 1. 在文件顶部添加导入
import { Controller, Get, Sse } from '@nestjs/common';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

// 2. 在 Controller 类中添加新方法
@Sse('stream')  // 创建 GET /serverstate/stream 端点
streamServerStatus(): Observable<MessageEvent> {
  // interval(2000) 表示每 2000 毫秒（2秒）发射一次
  return interval(2000).pipe(
    // map 操作符：转换数据
    map(() => {
      // 构造要发送的数据
      const data = {
        cpu: this.serverstateService.cpuStatus(),
        memory: this.serverstateService.getMemInfo(),
        disks: this.serverstateService.getDiskStatus(),
        sys: this.serverstateService.getSysInfo(),
        timestamp: Date.now(), // 添加时间戳
      };

      // 返回 MessageEvent 格式
      // NestJS 会自动转换为 SSE 格式
      return { data } as MessageEvent;
    }),
  );
}
```

**关键概念解析**：

- `@Sse('stream')`: 告诉 NestJS 这是一个 SSE 端点，自动设置正确的响应头
- `Observable<MessageEvent>`: 返回类型必须是 Observable，泛型参数是 MessageEvent
- `interval(2000)`: 创建一个每 2 秒发射一次的定时器
- `pipe()`: RxJS 的管道，用于链接多个操作符
- `map()`: 转换操作符，将定时器的数字转换为服务器状态数据
- `{ data }`: MessageEvent 的 data 属性，会被序列化为 JSON 发送给客户端

**注意事项**：
- 不要在 map 中执行耗时操作，会阻塞其他请求
- `getDiskStatus()` 使用同步 API，可能影响性能（后续优化）

---

### 步骤 1.3：测试后端 SSE 端点

**启动 API 服务器**：

```bash
pnpm dev:api
```

**使用 curl 测试**：

打开新的终端窗口，运行：

```bash
curl -N http://localhost:3000/serverstate/stream
```

**预期结果**：

你应该看到类似下面的输出，每 2 秒更新一次：

```
data: {"cpu":{"cpuNum":8,"sys":"2.34","used":"15.67","free":"82.01"},"memory":{"total":17179869184,"used":12884901888,"free":4294967296,"usage":"75.00"},"disks":[...],"sys":{...},"timestamp":1713235200000}

data: {"cpu":{"cpuNum":8,"sys":"2.35","used":"15.70","free":"81.95"},"memory":{"total":17179869184,"used":12884901888,"free":4294967296,"usage":"75.00"},"disks":[...],"sys":{...},"timestamp":1713235202000}

...
```

**如果看到以上输出，说明后端实现成功！**

按 `Ctrl+C` 停止 curl 命令。

**调试提示**：
- 如果看到 404 错误：检查路由路径是否正确
- 如果看到编译错误：检查导入语句是否正确
- 如果没有数据输出：检查 service 方法是否正常工作

---

### 步骤 1.4：（可选）添加错误处理

**为什么需要**：防止某个系统信息获取失败导致整个流中断。

**实现要点**：

```typescript
import { Observable, interval } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Sse('stream')
streamServerStatus(): Observable<MessageEvent> {
  return interval(2000).pipe(
    map(() => {
      try {
        const data = {
          cpu: this.serverstateService.cpuStatus(),
          memory: this.serverstateService.getMemInfo(),
          disks: this.serverstateService.getDiskStatus(),
          sys: this.serverstateService.getSysInfo(),
          timestamp: Date.now(),
        };
        return { data } as MessageEvent;
      } catch (error) {
        // 发生错误时发送错误信息
        return {
          data: {
            error: '获取服务器状态失败',
            timestamp: Date.now(),
          },
        } as MessageEvent;
      }
    }),
    // 如果整个流出错，返回错误流
    catchError((error) => {
      return of({
        data: { error: error.message, timestamp: Date.now() },
      } as MessageEvent);
    }),
  );
}
```

**关键概念**：
- `catchError`: RxJS 操作符，捕获流中的错误
- `of()`: 创建一个只发射一次的 Observable
- `try-catch`: 捕获同步错误

---

## 第二阶段：前端实现（Next.js）

### 步骤 2.1：创建 SSE Hook

**文件位置**: `apps/web/src/api/serverstate.ts`

**需要做什么**：
1. 创建一个自定义 Hook `useServerStateStream`
2. 使用浏览器的 `EventSource` API 连接 SSE 端点
3. 管理连接状态、数据和错误

**实现要点**：

在文件末尾添加以下代码：

```typescript
/**
 * SSE Hook: 实时获取服务器状态
 */
export function useServerStateStream() {
  // 状态管理
  const [data, setData] = useState<ServerState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. 构造 SSE URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const url = `${apiUrl}/serverstate/stream`;

    // 2. 创建 EventSource 连接
    const eventSource = new EventSource(url);

    // 3. 监听连接打开事件
    eventSource.onopen = () => {
      console.log('SSE 连接已建立');
      setIsConnected(true);
      setError(null);
    };

    // 4. 监听消息事件（接收数据）
    eventSource.onmessage = (event) => {
      try {
        // 解析 JSON 数据
        const serverState = JSON.parse(event.data);
        
        // 检查是否有错误
        if (serverState.error) {
          setError(serverState.error);
        } else {
          setData(serverState);
          setError(null);
        }
      } catch (err) {
        console.error('解析 SSE 数据失败:', err);
        setError('数据格式错误');
      }
    };

    // 5. 监听错误事件
    eventSource.onerror = (err) => {
      console.error('SSE 连接错误:', err);
      setIsConnected(false);
      setError('连接断开，正在重连...');
      // EventSource 会自动重连，无需手动处理
    };

    // 6. 清理函数：组件卸载时关闭连接
    return () => {
      console.log('关闭 SSE 连接');
      eventSource.close();
    };
  }, []); // 空依赖数组：只在组件挂载时执行一次

  // 返回状态供组件使用
  return { data, error, isConnected };
}
```

**还需要添加的导入**：

在文件顶部添加：

```typescript
import { useState, useEffect } from "react";
```

**关键概念解析**：

1. **useState**:
   - `data`: 存储最新的服务器状态
   - `error`: 存储错误信息
   - `isConnected`: 连接状态标识

2. **useEffect**:
   - 第一个参数：副作用函数（创建 EventSource）
   - 返回值：清理函数（关闭连接）
   - 第二个参数：依赖数组（`[]` 表示只执行一次）

3. **EventSource API**:
   - `new EventSource(url)`: 创建连接
   - `onopen`: 连接成功时触发
   - `onmessage`: 接收到消息时触发
   - `onerror`: 发生错误时触发
   - `close()`: 关闭连接

4. **为什么需要清理函数**：
   - React 组件卸载时，EventSource 连接会保持打开
   - 这会导致内存泄漏和持续的网络请求
   - 清理函数确保组件卸载时关闭连接

---

### 步骤 2.2：在页面中使用 Hook

**文件位置**: `apps/web/src/app/serverstate/page.tsx`

**需要做什么**：
1. 导入刚创建的 Hook
2. 调用 Hook 获取数据
3. 根据不同状态渲染不同 UI

**实现要点**：

```typescript
"use client";

import { useServerStateStream } from "@/api/serverstate";
import styles from "./page.module.scss";

export default function ServerStatePage() {
  // 使用 SSE Hook
  const { data, error, isConnected } = useServerStateStream();

  // 渲染连接状态
  const renderConnectionStatus = () => {
    return (
      <div className={styles.statusBar}>
        <span>连接状态: </span>
        {isConnected ? (
          <span className={styles.connected}>✅ 已连接（实时推送）</span>
        ) : (
          <span className={styles.disconnected}>❌ 断开连接</span>
        )}
      </div>
    );
  };

  // 渲染错误信息
  if (error) {
    return (
      <div className={styles.container}>
        {renderConnectionStatus()}
        <div className={styles.error}>
          <h2>错误</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // 渲染加载状态
  if (!data) {
    return (
      <div className={styles.container}>
        {renderConnectionStatus()}
        <div className={styles.loading}>正在连接服务器...</div>
      </div>
    );
  }

  // 渲染服务器状态数据
  return (
    <div className={styles.container}>
      {renderConnectionStatus()}
      
      <h1>服务器状态监控（SSE 实时推送）</h1>

      {/* CPU 状态 */}
      <section className={styles.section}>
        <h2>CPU 状态</h2>
        <div className={styles.grid}>
          <div>核心数: {data.cpu.cpuNum}</div>
          <div>使用率: {data.cpu.used}%</div>
          <div>系统占用: {data.cpu.sys}%</div>
          <div>空闲率: {data.cpu.free}%</div>
        </div>
      </section>

      {/* 内存状态 */}
      <section className={styles.section}>
        <h2>内存状态</h2>
        <div className={styles.grid}>
          <div>总内存: {(data.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB</div>
          <div>已使用: {(data.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB</div>
          <div>可用: {(data.memory.free / 1024 / 1024 / 1024).toFixed(2)} GB</div>
          <div>使用率: {data.memory.usage}%</div>
        </div>
      </section>

      {/* 磁盘状态 */}
      <section className={styles.section}>
        <h2>磁盘状态</h2>
        {data.disks.map((disk, index) => (
          <div key={index} className={styles.diskItem}>
            <h3>{disk.dirName}</h3>
            <div className={styles.grid}>
              <div>文件系统: {disk.typeName}</div>
              <div>总容量: {disk.total}</div>
              <div>已使用: {disk.used}</div>
              <div>可用: {disk.free}</div>
              <div>使用率: {disk.usage}%</div>
            </div>
          </div>
        ))}
      </section>

      {/* 系统信息 */}
      <section className={styles.section}>
        <h2>系统信息</h2>
        <div className={styles.grid}>
          <div>计算机名: {data.sys.computerName}</div>
          <div>IP 地址: {data.sys.computerIp}</div>
          <div>操作系统: {data.sys.osName}</div>
          <div>架构: {data.sys.osArch}</div>
        </div>
      </section>

      {/* 时间戳（用于验证实时更新） */}
      <div className={styles.timestamp}>
        最后更新: {data.timestamp ? new Date(data.timestamp).toLocaleString('zh-CN') : '未知'}
      </div>
    </div>
  );
}
```

**关键点**：
1. 必须添加 `"use client"` 指令（Next.js 16 App Router）
2. 使用解构赋值获取 Hook 返回的状态
3. 根据不同状态渲染不同 UI（错误、加载、数据）
4. 显示时间戳用于验证数据是否实时更新

---

### 步骤 2.3：添加样式（可选）

**文件位置**: `apps/web/src/app/serverstate/page.module.scss`

可以添加以下样式使页面更美观：

```scss
.statusBar {
  position: fixed;
  top: 0;
  right: 0;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 0 0 0 8px;
  z-index: 1000;

  .connected {
    color: #52c41a;
    font-weight: bold;
  }

  .disconnected {
    color: #ff4d4f;
    font-weight: bold;
  }
}

.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;

  h2 {
    margin-bottom: 15px;
    color: #333;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;

  div {
    padding: 10px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

.diskItem {
  margin-bottom: 20px;

  h3 {
    margin-bottom: 10px;
    color: #555;
  }
}

.timestamp {
  text-align: center;
  margin-top: 30px;
  padding: 15px;
  background: #e6f7ff;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.loading,
.error {
  text-align: center;
  padding: 50px 20px;
  font-size: 18px;
}

.error {
  color: #ff4d4f;

  h2 {
    margin-bottom: 10px;
  }
}
```

---

## 第三阶段：测试与调试

### 步骤 3.1：启动完整应用

**打开终端 1（API）**：

```bash
pnpm dev:api
```

**打开终端 2（Web）**：

```bash
pnpm dev:web
```

---

### 步骤 3.2：访问页面测试

打开浏览器，访问：

```
http://localhost:3001/serverstate
```

**预期效果**：
1. 页面右上角显示"✅ 已连接（实时推送）"
2. 服务器状态数据每 2 秒自动更新
3. 页面底部的时间戳每 2 秒变化一次

---

### 步骤 3.3：测试断线重连

**测试步骤**：
1. 页面正常显示后，在终端 1 按 `Ctrl+C` 停止 API 服务器
2. 观察页面右上角状态变为"❌ 断开连接"
3. 重新启动 API: `pnpm dev:api`
4. 等待几秒，页面应该自动重连并恢复数据推送

**为什么能自动重连**：
- `EventSource` 浏览器 API 内置自动重连机制
- 默认每 3 秒尝试重连一次
- 无需手动编写重连逻辑

---

### 步骤 3.4：使用浏览器开发者工具调试

**打开开发者工具**：
- Chrome/Edge: `F12` 或 `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

**查看网络请求**：
1. 切换到 **Network（网络）** 标签
2. 筛选类型选择 **EventStream** 或 **XHR/fetch**
3. 找到 `stream` 请求
4. 点击该请求，查看 **EventStream** 标签页
5. 应该看到数据每 2 秒推送一次

**查看控制台日志**：
1. 切换到 **Console（控制台）** 标签
2. 应该看到以下日志：
   - "SSE 连接已建立"
   - 如果关闭页面或切换路由："关闭 SSE 连接"

---

### 步骤 3.5：验证数据实时性

**方法 1：观察时间戳**

页面底部的时间戳应该每 2 秒更新一次。

**方法 2：观察 CPU/内存数据**

运行一个耗 CPU 的任务，观察页面数据是否变化：

```bash
# 另开终端，运行一个占用 CPU 的命令
yes > /dev/null
```

页面上的 CPU 使用率应该会上升。按 `Ctrl+C` 停止命令，CPU 使用率应该会下降。

---

## 第四阶段：优化与完善

完成基础实现后，可以进行以下优化（可选）。

### 优化 4.1：不同频率的数据推送

**问题**：磁盘状态变化很慢，没必要每 2 秒查询一次。

**优化方案**：
- CPU/内存：每 2 秒推送一次
- 磁盘状态：每 10 秒推送一次

**实现思路**（在 Controller 中）：

```typescript
import { Observable, interval, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Sse('stream')
streamServerStatus(): Observable<MessageEvent> {
  // 快速变化的数据流：每 2 秒
  const fastStream = interval(2000).pipe(
    map(() => ({
      cpu: this.serverstateService.cpuStatus(),
      memory: this.serverstateService.getMemInfo(),
    })),
  );

  // 慢速变化的数据流：每 10 秒
  const slowStream = interval(10000).pipe(
    startWith(0), // 立即发射第一次
    map(() => ({
      disks: this.serverstateService.getDiskStatus(),
    })),
  );

  // 系统信息（几乎不变）：只获取一次
  const sysInfo = this.serverstateService.getSysInfo();

  // 组合两个流
  return combineLatest([fastStream, slowStream]).pipe(
    map(([fast, slow]) => ({
      data: {
        ...fast,
        ...slow,
        sys: sysInfo,
        timestamp: Date.now(),
      },
    } as MessageEvent)),
  );
}
```

**新概念**：
- `combineLatest`: 组合多个流，当任一流发射时，输出所有流的最新值
- `startWith(0)`: 让流立即发射一个初始值

---

### 优化 4.2：添加心跳机制

**问题**：某些代理服务器会关闭长时间无数据的连接。

**解决方案**：每 30 秒发送一个注释行（心跳）。

**实现方式**（NestJS 暂不直接支持，可以在数据中添加心跳标识）：

```typescript
// 在后端添加一个字段
return interval(2000).pipe(
  map((count) => ({
    data: {
      // ... 其他数据
      heartbeat: count, // 心跳计数
      timestamp: Date.now(),
    },
  } as MessageEvent)),
);
```

前端无需特殊处理，会自动接收。

---

### 优化 4.3：添加手动重连按钮

**为什么需要**：如果网络问题导致无法自动重连，提供手动重连选项。

**实现思路**（在 Hook 中）：

```typescript
export function useServerStateStream() {
  const [data, setData] = useState<ServerState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0); // 新增：重试触发器

  useEffect(() => {
    // ... EventSource 逻辑 ...
  }, [retryTrigger]); // 依赖 retryTrigger

  // 手动重连函数
  const reconnect = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  return { data, error, isConnected, reconnect };
}
```

在页面中添加重连按钮：

```typescript
const { data, error, isConnected, reconnect } = useServerStateStream();

// 在渲染中添加
{!isConnected && (
  <button onClick={reconnect}>手动重连</button>
)}
```

---

### 优化 4.4：数据可视化（图表）

使用 Ant Design Charts 或 ECharts 绘制实时图表。

**示例**：绘制 CPU 使用率折线图

```bash
pnpm --filter web add @ant-design/charts
```

```typescript
import { Line } from '@ant-design/charts';
import { useState, useEffect } from 'react';

// 在组件中
const [cpuHistory, setCpuHistory] = useState<Array<{ time: string; value: number }>>([]);

// 每次收到新数据时更新历史记录
useEffect(() => {
  if (data?.cpu) {
    setCpuHistory((prev) => {
      const newData = [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          value: parseFloat(data.cpu.used),
        },
      ];
      // 只保留最近 20 个数据点
      return newData.slice(-20);
    });
  }
}, [data]);

// 渲染图表
<Line
  data={cpuHistory}
  xField="time"
  yField="value"
  height={300}
/>
```

---

## 常见问题排查

### 问题 1：页面显示"连接断开"

**可能原因**：
- API 服务器未启动
- CORS 配置问题
- URL 配置错误

**排查步骤**：
1. 检查 API 是否运行：访问 `http://localhost:3000`
2. 检查环境变量：确认 `NEXT_PUBLIC_API_URL` 设置正确
3. 检查浏览器控制台是否有 CORS 错误
4. 使用 curl 测试后端 SSE 端点是否正常

---

### 问题 2：页面一直显示"正在连接"

**可能原因**：
- 后端没有发送任何数据
- EventSource 连接失败
- 数据格式错误

**排查步骤**：
1. 打开浏览器开发者工具 → Network 标签
2. 查看 `stream` 请求的状态码（应该是 200）
3. 查看是否有数据返回（EventStream 标签页）
4. 检查浏览器控制台是否有错误日志

---

### 问题 3：数据没有实时更新

**可能原因**：
- 后端 interval 时间设置过长
- 浏览器标签页处于后台（浏览器可能降低更新频率）
- 数据解析失败

**排查步骤**：
1. 检查页面底部时间戳是否更新
2. 切换到前台标签页测试
3. 查看浏览器控制台是否有解析错误
4. 检查后端 interval 参数（应该是 2000）

---

### 问题 4：内存占用持续增长

**可能原因**：
- EventSource 没有正确关闭
- 数据历史记录无限增长

**排查步骤**：
1. 检查 useEffect 是否返回清理函数
2. 测试：切换到其他页面，检查连接是否关闭（控制台应该输出"关闭 SSE 连接"）
3. 如果有图表，限制历史数据数量（如只保留 20 个点）

---

### 问题 5：TypeScript 类型错误

**可能原因**：
- MessageEvent 类型导入错误
- ServerState 类型未定义

**解决方案**：

检查类型定义文件 `packages/shared/src/types/serverstate.types.ts`：

```typescript
export interface ServerState {
  cpu: CPUStatus;
  memory: MemInfo;
  disks: DiskInfo[];
  sys: SysInfo;
  timestamp?: number;
}
```

确保在 Hook 中导入：

```typescript
import type { ServerState } from '@fullstack/shared';
```

---

## 学习检查点

完成实现后，确保你理解以下概念：

### 后端（NestJS + RxJS）

- [ ] 什么是 Observable？它与 Promise 的区别？
- [ ] `interval()` 的作用是什么？
- [ ] `pipe()` 和 `map()` 如何工作？
- [ ] `@Sse()` 装饰器做了什么？
- [ ] MessageEvent 的结构是什么？
- [ ] 如何使用 `catchError` 处理错误？
- [ ] `combineLatest` 如何组合多个流？

### 前端（React + EventSource）

- [ ] `useState` 和 `useEffect` 的作用？
- [ ] 为什么需要清理函数？
- [ ] EventSource 的三个事件处理器是什么？
- [ ] 为什么要在 useEffect 的依赖数组中传入 `[]`？
- [ ] EventSource 如何实现自动重连？
- [ ] 如何手动触发重连？

### SSE 协议

- [ ] SSE 与 WebSocket 的区别？
- [ ] SSE 适合什么场景？
- [ ] Content-Type 是什么？
- [ ] 浏览器对 SSE 连接数有限制吗？

---

## 下一步

完成基础实现后，可以尝试：

1. **添加用户认证**：只允许授权用户查看服务器状态
2. **实现多服务器监控**：监控多台服务器的状态
3. **添加告警功能**：CPU/内存超过阈值时发送通知
4. **持久化数据**：将历史数据保存到数据库
5. **移动端适配**：在 Expo 应用中实现（需要使用 polyfill）

---

## 参考资源

- **NestJS SSE 官方文档**: https://docs.nestjs.com/techniques/server-sent-events
- **MDN EventSource**: https://developer.mozilla.org/en-US/docs/Web/API/EventSource
- **RxJS 官方教程**: https://rxjs.dev/guide/overview
- **React Hooks 官方文档**: https://react.dev/reference/react/hooks

---

**祝你学习顺利！遇到问题随时提问。** 🚀
