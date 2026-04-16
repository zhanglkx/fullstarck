# WebSocket 实时服务器监控系统

> 📘 **学习目标**：使用 NestJS WebSocket Gateway + React Hook 实现双向实时通信的服务器监控系统

**最后更新**: 2026-04-16

---

## 📑 目录

1. [技术选型对比](#1-技术选型对比)
2. [新增监控功能](#2-新增监控功能)
3. [架构设计](#3-架构设计)
4. [类型定义](#4-类型定义)
5. [后端实现](#5-后端实现)
6. [前端实现](#6-前端实现)
7. [开发步骤](#7-开发步骤)
8. [测试验证](#8-测试验证)
9. [常见问题](#9-常见问题)

---

## 1. 技术选型对比

### WebSocket vs SSE

| 特性               | **WebSocket**                        | **SSE**                    |
| ------------------ | ------------------------------------ | -------------------------- |
| **通信方向**       | 双向（全双工）                       | 单向（服务端→客户端）      |
| **协议**           | `ws://` 或 `wss://`                  | `HTTP/HTTPS`               |
| **数据格式**       | 文本 + 二进制                        | 仅文本（通常是 JSON）      |
| **重连机制**       | 需手动实现                           | 浏览器自动重连             |
| **浏览器兼容性**   | 现代浏览器全支持                     | 现代浏览器全支持           |
| **适用场景**       | 聊天、游戏、协作编辑、双向实时控制   | 日志推送、股票价格、通知流 |
| **客户端发送数据** | ✅ 支持                              | ❌ 不支持                  |
| **连接开销**       | 低（长连接，握手后保持）             | 低（HTTP 长连接）          |
| **防火墙友好**     | ⚠️ 部分企业网络可能拦截 WebSocket    | ✅ 完全兼容（走 HTTP）     |
| **服务端推送频率** | 无限制                               | 无限制                     |
| **订阅机制**       | 需自行实现（通过消息协议）           | 不支持                     |

### 为什么选择 WebSocket？

1. **双向通信**：客户端可以主动请求特定数据（如"只获取 GPU 信息"）
2. **订阅机制**：可以动态订阅/取消订阅不同的监控模块
3. **灵活性高**：支持复杂的消息协议（如命令、事件、响应）
4. **学习价值**：WebSocket 是现代实时应用的核心技术

---

## 2. 新增监控功能

### 2.1 功能清单

| 模块           | 功能描述                                 | 实现难度 | NPM 包                            |
| -------------- | ---------------------------------------- | -------- | --------------------------------- |
| **GPU 监控**   | NVIDIA/AMD GPU 使用率、显存、温度        | ⭐⭐⭐   | `systeminformation`               |
| **网络流量**   | 实时上传/下载速度、总流量统计            | ⭐⭐     | `systeminformation`               |
| **进程 TOP N** | CPU/内存占用最高的 N 个进程              | ⭐⭐     | `systeminformation`               |
| **系统温度**   | CPU/GPU/主板温度                         | ⭐⭐⭐   | `systeminformation`               |
| **系统负载**   | Load Average（1/5/15 分钟）              | ⭐       | Node.js `os.loadavg()`            |
| **Docker**     | 容器状态、资源占用                       | ⭐⭐⭐   | `dockerode`                       |
| **实时日志**   | 服务器日志流（可选）                     | ⭐⭐⭐⭐ | `tail -f` + WebSocket             |

> **推荐包**: `systeminformation` - 跨平台系统信息库，支持 Windows/macOS/Linux

### 2.2 数据结构设计

```typescript
// packages/shared/src/types/monitor.types.ts

/** GPU 信息 */
export interface GPUInfo {
  model: string;              // GPU 型号
  vendor: string;             // 厂商（NVIDIA/AMD/Intel）
  vram: number;               // 显存总量（MB）
  vramUsed: number;           // 已使用显存（MB）
  utilizationGpu: number;     // GPU 使用率（%）
  temperature: number;        // 温度（℃）
}

/** 网络流量 */
export interface NetworkStats {
  interface: string;          // 网卡名称
  rx_sec: number;             // 下载速度（bytes/s）
  tx_sec: number;             // 上传速度（bytes/s）
  rx_total: number;           // 总下载量（bytes）
  tx_total: number;           // 总上传量（bytes）
}

/** 进程信息 */
export interface ProcessInfo {
  pid: number;                // 进程 ID
  name: string;               // 进程名
  cpu: number;                // CPU 使用率（%）
  mem: number;                // 内存使用（MB）
  user: string;               // 所属用户
}

/** 系统温度 */
export interface TemperatureInfo {
  main: number;               // CPU 温度（℃）
  cores: number[];            // 各核心温度（℃）
  max: number;                // 最高温度（℃）
}

/** 系统负载 */
export interface LoadAverage {
  load1: number;              // 1 分钟负载
  load5: number;              // 5 分钟负载
  load15: number;             // 15 分钟负载
  currentLoad: number;        // 当前 CPU 负载（%）
}

/** Docker 容器 */
export interface DockerContainer {
  id: string;                 // 容器 ID
  name: string;               // 容器名
  status: string;             // 状态（running/stopped）
  cpu: number;                // CPU 使用率（%）
  mem: number;                // 内存使用（MB）
  netIO: { rx: number; tx: number }; // 网络 IO
}

/** WebSocket 完整监控数据 */
export interface RealtimeMonitorData {
  // 基础数据（复用 SSE 的）
  cpu: CPUStatus;
  memory: MemInfo;
  disks: DiskInfo[];
  sys: SysInfo;
  
  // 新增数据
  gpu?: GPUInfo[];            // GPU 列表（可选，无 GPU 时为空）
  network: NetworkStats[];    // 网络接口列表
  topProcesses: ProcessInfo[]; // TOP 10 进程
  temperature?: TemperatureInfo; // 温度（可选）
  loadAverage: LoadAverage;   // 系统负载
  docker?: DockerContainer[]; // Docker 容器（可选）
  
  timestamp: number;          // 时间戳
}
```

---

## 3. 架构设计

### 3.1 通信流程

```
┌─────────────┐                         ┌─────────────┐
│   Browser   │                         │  NestJS API │
│   (React)   │                         │  (Gateway)  │
└──────┬──────┘                         └──────┬──────┘
       │                                       │
       │  1. WebSocket 握手 (ws://.../monitor) │
       ├──────────────────────────────────────>│
       │                                       │
       │  2. 连接成功 (Connection Established)  │
       │<──────────────────────────────────────┤
       │                                       │
       │  3. 订阅消息: { type: 'subscribe', modules: ['gpu', 'network'] }
       ├──────────────────────────────────────>│
       │                                       │ 启动定时推送
       │  4. 数据推送: { type: 'data', payload: {...} }  ⏱️ 每 2 秒
       │<──────────────────────────────────────┤
       │<──────────────────────────────────────┤
       │<──────────────────────────────────────┤
       │                                       │
       │  5. 客户端请求: { type: 'request', module: 'docker' }
       ├──────────────────────────────────────>│
       │                                       │
       │  6. 响应: { type: 'response', module: 'docker', data: [...] }
       │<──────────────────────────────────────┤
       │                                       │
       │  7. 断开连接                           │
       ├──────────────────────────────────────>│
       │                                       │ 清理资源
       │  8. 连接关闭                           │
       │<──────────────────────────────────────┤
       │                                       │
```

### 3.2 消息协议

#### 客户端 → 服务端

```typescript
// 订阅消息
{
  type: 'subscribe',
  modules: ['cpu', 'gpu', 'network', 'processes', 'temperature', 'load', 'docker']
}

// 取消订阅
{
  type: 'unsubscribe',
  modules: ['docker']
}

// 单次请求
{
  type: 'request',
  module: 'gpu'
}

// Ping（心跳）
{
  type: 'ping'
}
```

#### 服务端 → 客户端

```typescript
// 数据推送
{
  type: 'data',
  payload: RealtimeMonitorData
}

// 响应单次请求
{
  type: 'response',
  module: 'gpu',
  data: GPUInfo[]
}

// Pong（心跳响应）
{
  type: 'pong'
}

// 错误
{
  type: 'error',
  message: 'GPU not available'
}
```

---

## 4. 类型定义

### 4.1 创建类型文件

在 `packages/shared/src/types/` 中创建新文件：

```bash
# 在项目根目录执行
touch packages/shared/src/types/monitor.types.ts
touch packages/shared/src/types/websocket.types.ts
```

### 4.2 `monitor.types.ts`（监控数据类型）

```typescript
// packages/shared/src/types/monitor.types.ts

/** GPU 信息 */
export interface GPUInfo {
  model: string;
  vendor: string;
  vram: number;
  vramUsed: number;
  utilizationGpu: number;
  temperature: number;
}

/** 网络流量 */
export interface NetworkStats {
  interface: string;
  rx_sec: number;
  tx_sec: number;
  rx_total: number;
  tx_total: number;
}

/** 进程信息 */
export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  user: string;
}

/** 系统温度 */
export interface TemperatureInfo {
  main: number;
  cores: number[];
  max: number;
}

/** 系统负载 */
export interface LoadAverage {
  load1: number;
  load5: number;
  load15: number;
  currentLoad: number;
}

/** Docker 容器 */
export interface DockerContainer {
  id: string;
  name: string;
  status: string;
  cpu: number;
  mem: number;
  netIO: { rx: number; tx: number };
}

/** 完整监控数据 */
export interface RealtimeMonitorData {
  // 基础数据（复用已有类型）
  cpu: import('./serverstate.types').CPUStatus;
  memory: import('./serverstate.types').MemInfo;
  disks: import('./serverstate.types').DiskInfo[];
  sys: import('./serverstate.types').SysInfo;
  
  // 新增数据
  gpu?: GPUInfo[];
  network: NetworkStats[];
  topProcesses: ProcessInfo[];
  temperature?: TemperatureInfo;
  loadAverage: LoadAverage;
  docker?: DockerContainer[];
  
  timestamp: number;
}
```

### 4.3 `websocket.types.ts`（WebSocket 消息类型）

```typescript
// packages/shared/src/types/websocket.types.ts

export type MonitorModule = 
  | 'cpu' 
  | 'memory' 
  | 'disk' 
  | 'sys' 
  | 'gpu' 
  | 'network' 
  | 'processes' 
  | 'temperature' 
  | 'load' 
  | 'docker';

/** 客户端消息类型 */
export type ClientMessage =
  | { type: 'subscribe'; modules: MonitorModule[] }
  | { type: 'unsubscribe'; modules: MonitorModule[] }
  | { type: 'request'; module: MonitorModule }
  | { type: 'ping' };

/** 服务端消息类型 */
export type ServerMessage =
  | { type: 'data'; payload: import('./monitor.types').RealtimeMonitorData }
  | { type: 'response'; module: MonitorModule; data: unknown }
  | { type: 'pong' }
  | { type: 'error'; message: string };
```

### 4.4 导出类型

```typescript
// packages/shared/src/types/index.ts

// 已有导出...
export * from './serverstate.types';

// 新增导出
export * from './monitor.types';
export * from './websocket.types';
```

---

## 5. 后端实现

### 5.1 安装依赖

```bash
# 在项目根目录执行
pnpm --filter api add @nestjs/websockets @nestjs/platform-socket.io socket.io
pnpm --filter api add systeminformation
```

> **说明**：
> - `@nestjs/websockets` - NestJS WebSocket 模块
> - `@nestjs/platform-socket.io` - Socket.io 适配器
> - `socket.io` - WebSocket 库（支持回退到轮询）
> - `systeminformation` - 系统信息获取库

### 5.2 创建 Monitor Gateway

#### 5.2.1 生成 Gateway 文件

```bash
# 方式 1：手动创建
mkdir -p apps/api/src/monitor
touch apps/api/src/monitor/monitor.gateway.ts
touch apps/api/src/monitor/monitor.service.ts
touch apps/api/src/monitor/monitor.module.ts

# 方式 2：使用 NestJS CLI（如果安装了）
cd apps/api
nest g gateway monitor --no-spec
nest g service monitor --no-spec
nest g module monitor
```

#### 5.2.2 `monitor.service.ts`（数据采集服务）

```typescript
// apps/api/src/monitor/monitor.service.ts

import { Injectable, Logger } from '@nestjs/common';
import * as si from 'systeminformation';
import { loadavg } from 'os';
import { ServerstateService } from '@/serverstate/serverstate.service';
import type {
  RealtimeMonitorData,
  GPUInfo,
  NetworkStats,
  ProcessInfo,
  TemperatureInfo,
  LoadAverage,
  MonitorModule,
} from '@fullstack/shared';

@Injectable()
export class MonitorService {
  private readonly logger = new Logger(MonitorService.name);

  constructor(private readonly serverstateService: ServerstateService) {}

  /**
   * 获取完整监控数据
   */
  async getFullMonitorData(modules: MonitorModule[]): Promise<RealtimeMonitorData> {
    const promises: Record<string, Promise<unknown>> = {};

    // 基础数据（始终返回）
    if (modules.includes('cpu')) {
      promises.cpu = Promise.resolve(this.serverstateService.cpuStatus());
    }
    if (modules.includes('memory')) {
      promises.memory = Promise.resolve(this.serverstateService.getMemInfo());
    }
    if (modules.includes('disk')) {
      promises.disks = Promise.resolve(this.serverstateService.getDiskStatus());
    }
    if (modules.includes('sys')) {
      promises.sys = Promise.resolve(this.serverstateService.getSysInfo());
    }

    // 新增数据
    if (modules.includes('gpu')) {
      promises.gpu = this.getGPUInfo();
    }
    if (modules.includes('network')) {
      promises.network = this.getNetworkStats();
    }
    if (modules.includes('processes')) {
      promises.topProcesses = this.getTopProcesses();
    }
    if (modules.includes('temperature')) {
      promises.temperature = this.getTemperature();
    }
    if (modules.includes('load')) {
      promises.loadAverage = this.getLoadAverage();
    }

    const results = await Promise.allSettled(Object.values(promises));
    const keys = Object.keys(promises);

    const data: Partial<RealtimeMonitorData> = {
      timestamp: Date.now(),
    };

    results.forEach((result, index) => {
      const key = keys[index];
      if (result.status === 'fulfilled') {
        data[key] = result.value;
      } else {
        this.logger.warn(`Failed to get ${key}: ${result.reason}`);
      }
    });

    return data as RealtimeMonitorData;
  }

  /**
   * 获取 GPU 信息
   */
  async getGPUInfo(): Promise<GPUInfo[]> {
    try {
      const graphics = await si.graphics();
      
      return graphics.controllers.map((gpu) => ({
        model: gpu.model || 'Unknown',
        vendor: gpu.vendor || 'Unknown',
        vram: gpu.vram || 0,
        vramUsed: gpu.vramDynamic || 0,
        utilizationGpu: gpu.utilizationGpu || 0,
        temperature: gpu.temperatureGpu || 0,
      }));
    } catch (error) {
      this.logger.error('GPU info error:', error);
      return [];
    }
  }

  /**
   * 获取网络流量统计
   */
  async getNetworkStats(): Promise<NetworkStats[]> {
    try {
      const stats = await si.networkStats();
      
      return stats.map((stat) => ({
        interface: stat.iface,
        rx_sec: stat.rx_sec || 0,
        tx_sec: stat.tx_sec || 0,
        rx_total: stat.rx_bytes || 0,
        tx_total: stat.tx_bytes || 0,
      }));
    } catch (error) {
      this.logger.error('Network stats error:', error);
      return [];
    }
  }

  /**
   * 获取 TOP 10 进程
   */
  async getTopProcesses(): Promise<ProcessInfo[]> {
    try {
      const processes = await si.processes();
      
      return processes.list
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 10)
        .map((proc) => ({
          pid: proc.pid,
          name: proc.name,
          cpu: proc.cpu || 0,
          mem: proc.mem || 0,
          user: proc.user || 'unknown',
        }));
    } catch (error) {
      this.logger.error('Top processes error:', error);
      return [];
    }
  }

  /**
   * 获取系统温度
   */
  async getTemperature(): Promise<TemperatureInfo | undefined> {
    try {
      const temp = await si.cpuTemperature();
      
      if (!temp.main) return undefined;

      return {
        main: temp.main,
        cores: temp.cores || [],
        max: temp.max || temp.main,
      };
    } catch (error) {
      this.logger.warn('Temperature not available:', error);
      return undefined;
    }
  }

  /**
   * 获取系统负载
   */
  async getLoadAverage(): Promise<LoadAverage> {
    try {
      const [load1, load5, load15] = loadavg();
      const currentLoadData = await si.currentLoad();

      return {
        load1,
        load5,
        load15,
        currentLoad: currentLoadData.currentLoad || 0,
      };
    } catch (error) {
      this.logger.error('Load average error:', error);
      const [load1, load5, load15] = loadavg();
      return { load1, load5, load15, currentLoad: 0 };
    }
  }
}
```

#### 5.2.3 `monitor.gateway.ts`（WebSocket Gateway）

```typescript
// apps/api/src/monitor/monitor.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MonitorService } from './monitor.service';
import type { ClientMessage, MonitorModule, ServerMessage } from '@fullstack/shared';

@WebSocketGateway({
  namespace: '/monitor', // WebSocket 命名空间：ws://localhost:3000/monitor
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
})
export class MonitorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MonitorGateway.name);
  private clientSubscriptions = new Map<string, Set<MonitorModule>>();
  private pushIntervals = new Map<string, NodeJS.Timeout>();

  constructor(private readonly monitorService: MonitorService) {}

  // 生命周期：Gateway 初始化
  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  // 生命周期：客户端连接
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientSubscriptions.set(client.id, new Set());
  }

  // 生命周期：客户端断开
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.stopPushing(client.id);
    this.clientSubscriptions.delete(client.id);
  }

  /**
   * 处理订阅消息
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: Extract<ClientMessage, { type: 'subscribe' }>,
    @ConnectedSocket() client: Socket,
  ) {
    const modules = data.modules;
    this.logger.log(`Client ${client.id} subscribed to: ${modules.join(', ')}`);

    const subscriptions = this.clientSubscriptions.get(client.id);
    if (subscriptions) {
      modules.forEach((module) => subscriptions.add(module));
      this.startPushing(client);
    }
  }

  /**
   * 处理取消订阅消息
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: Extract<ClientMessage, { type: 'unsubscribe' }>,
    @ConnectedSocket() client: Socket,
  ) {
    const modules = data.modules;
    this.logger.log(`Client ${client.id} unsubscribed from: ${modules.join(', ')}`);

    const subscriptions = this.clientSubscriptions.get(client.id);
    if (subscriptions) {
      modules.forEach((module) => subscriptions.delete(module));

      // 如果没有订阅了，停止推送
      if (subscriptions.size === 0) {
        this.stopPushing(client.id);
      }
    }
  }

  /**
   * 处理单次请求
   */
  @SubscribeMessage('request')
  async handleRequest(
    @MessageBody() data: Extract<ClientMessage, { type: 'request' }>,
    @ConnectedSocket() client: Socket,
  ) {
    const { module } = data;
    this.logger.log(`Client ${client.id} requested: ${module}`);

    try {
      const fullData = await this.monitorService.getFullMonitorData([module]);
      const responseData = fullData[module];

      const message: ServerMessage = {
        type: 'response',
        module,
        data: responseData,
      };

      client.emit('message', message);
    } catch (error) {
      const errorMessage: ServerMessage = {
        type: 'error',
        message: `Failed to get ${module}: ${error.message}`,
      };
      client.emit('message', errorMessage);
    }
  }

  /**
   * 处理 Ping
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const message: ServerMessage = { type: 'pong' };
    client.emit('message', message);
  }

  /**
   * 启动定时推送
   */
  private startPushing(client: Socket) {
    // 如果已经在推送，先停止
    this.stopPushing(client.id);

    const interval = setInterval(async () => {
      const subscriptions = this.clientSubscriptions.get(client.id);
      if (!subscriptions || subscriptions.size === 0) {
        return;
      }

      try {
        const modules = Array.from(subscriptions);
        const data = await this.monitorService.getFullMonitorData(modules);

        const message: ServerMessage = {
          type: 'data',
          payload: data,
        };

        client.emit('message', message);
      } catch (error) {
        this.logger.error(`Push error for client ${client.id}:`, error);
      }
    }, 2000); // 每 2 秒推送一次

    this.pushIntervals.set(client.id, interval);
  }

  /**
   * 停止定时推送
   */
  private stopPushing(clientId: string) {
    const interval = this.pushIntervals.get(clientId);
    if (interval) {
      clearInterval(interval);
      this.pushIntervals.delete(clientId);
    }
  }
}
```

#### 5.2.4 `monitor.module.ts`（模块注册）

```typescript
// apps/api/src/monitor/monitor.module.ts

import { Module } from '@nestjs/common';
import { MonitorGateway } from './monitor.gateway';
import { MonitorService } from './monitor.service';
import { ServerstateModule } from '@/serverstate/serverstate.module';

@Module({
  imports: [ServerstateModule], // 导入 Serverstate 模块以复用服务
  providers: [MonitorGateway, MonitorService],
  exports: [MonitorService],
})
export class MonitorModule {}
```

#### 5.2.5 注册到 `AppModule`

```typescript
// apps/api/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ServerstateModule } from '@/serverstate/serverstate.module';
import { MonitorModule } from '@/monitor/monitor.module'; // 新增

@Module({
  imports: [ServerstateModule, MonitorModule], // 新增
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### 5.2.6 确保 `ServerstateModule` 导出服务

```typescript
// apps/api/src/serverstate/serverstate.module.ts

import { Module } from '@nestjs/common';
import { ServerstateController } from './serverstate.controller';
import { ServerstateService } from './serverstate.service';

@Module({
  controllers: [ServerstateController],
  providers: [ServerstateService],
  exports: [ServerstateService], // 确保导出，供 MonitorModule 使用
})
export class ServerstateModule {}
```

---

## 6. 前端实现

### 6.1 安装依赖

```bash
# 在项目根目录执行
pnpm --filter web add socket.io-client
```

### 6.2 创建 WebSocket Hook

```typescript
// apps/web/src/hooks/useRealtimeMonitor.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type {
  RealtimeMonitorData,
  MonitorModule,
  ClientMessage,
  ServerMessage,
} from "@fullstack/shared";

interface UseRealtimeMonitorOptions {
  /** 自动订阅的模块 */
  autoSubscribe?: MonitorModule[];
  /** 重连延迟（毫秒） */
  reconnectDelay?: number;
  /** 是否启用心跳检测 */
  enableHeartbeat?: boolean;
}

export function useRealtimeMonitor(options: UseRealtimeMonitorOptions = {}) {
  const {
    autoSubscribe = ["cpu", "memory", "disk", "sys", "gpu", "network", "processes", "load"],
    reconnectDelay = 3000,
    enableHeartbeat = true,
  } = options;

  // 状态
  const [data, setData] = useState<RealtimeMonitorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscribedModules, setSubscribedModules] = useState<Set<MonitorModule>>(new Set());

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 连接 WebSocket
   */
  const connect = useCallback(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const socket = io(`${apiUrl}/monitor`, {
      transports: ["websocket", "polling"], // 优先使用 WebSocket
      reconnectionDelay,
      reconnection: true,
    });

    // 连接成功
    socket.on("connect", () => {
      console.log("✅ WebSocket 连接成功");
      setIsConnected(true);
      setError(null);

      // 自动订阅
      if (autoSubscribe.length > 0) {
        subscribe(autoSubscribe);
      }

      // 启动心跳
      if (enableHeartbeat) {
        startHeartbeat();
      }
    });

    // 接收消息
    socket.on("message", (message: ServerMessage) => {
      console.log("📩 收到消息:", message);

      switch (message.type) {
        case "data":
          setData(message.payload);
          break;

        case "response":
          console.log(`📦 单次请求响应 [${message.module}]:`, message.data);
          break;

        case "pong":
          console.log("💓 Pong");
          break;

        case "error":
          setError(message.message);
          break;
      }
    });

    // 断开连接
    socket.on("disconnect", (reason) => {
      console.warn("❌ WebSocket 断开:", reason);
      setIsConnected(false);
      stopHeartbeat();
    });

    // 连接错误
    socket.on("connect_error", (err) => {
      console.error("❌ WebSocket 连接错误:", err);
      setError(`连接失败: ${err.message}`);
    });

    socketRef.current = socket;
  }, [autoSubscribe, reconnectDelay, enableHeartbeat]);

  /**
   * 断开连接
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      stopHeartbeat();
    }
  }, []);

  /**
   * 订阅模块
   */
  const subscribe = useCallback((modules: MonitorModule[]) => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ 未连接，无法订阅");
      return;
    }

    const message: ClientMessage = {
      type: "subscribe",
      modules,
    };

    socketRef.current.emit("subscribe", message);
    setSubscribedModules((prev) => {
      const newSet = new Set(prev);
      modules.forEach((m) => newSet.add(m));
      return newSet;
    });
  }, []);

  /**
   * 取消订阅
   */
  const unsubscribe = useCallback((modules: MonitorModule[]) => {
    if (!socketRef.current?.connected) return;

    const message: ClientMessage = {
      type: "unsubscribe",
      modules,
    };

    socketRef.current.emit("unsubscribe", message);
    setSubscribedModules((prev) => {
      const newSet = new Set(prev);
      modules.forEach((m) => newSet.delete(m));
      return newSet;
    });
  }, []);

  /**
   * 单次请求数据
   */
  const requestData = useCallback((module: MonitorModule) => {
    if (!socketRef.current?.connected) return;

    const message: ClientMessage = {
      type: "request",
      module,
    };

    socketRef.current.emit("request", message);
  }, []);

  /**
   * 启动心跳
   */
  const startHeartbeat = () => {
    stopHeartbeat(); // 先清理旧的

    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        const message: ClientMessage = { type: "ping" };
        socketRef.current.emit("ping", message);
      }
    }, 30000); // 每 30 秒发送一次心跳
  };

  /**
   * 停止心跳
   */
  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  // 组件挂载时连接，卸载时断开
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    data,
    error,
    isConnected,
    subscribedModules,
    subscribe,
    unsubscribe,
    requestData,
    reconnect: connect,
  };
}
```

### 6.3 创建监控页面

```typescript
// apps/web/src/app/monitor/page.tsx

"use client";

import { useRealtimeMonitor } from "@/hooks/useRealtimeMonitor";
import { Card, Row, Col, Statistic, Badge, Table, Typography } from "antd";
import type { MonitorModule } from "@fullstack/shared";

const { Title, Text } = Typography;

export default function MonitorPage() {
  const {
    data,
    error,
    isConnected,
    subscribedModules,
    subscribe,
    unsubscribe,
  } = useRealtimeMonitor({
    autoSubscribe: ["cpu", "memory", "gpu", "network", "processes", "load"],
  });

  if (!isConnected) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Badge status="error" text="WebSocket 未连接" />
          {error && <Text type="danger">{error}</Text>}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>实时服务器监控 (WebSocket)</Title>
      <Badge status="success" text="已连接" style={{ marginBottom: 16 }} />

      {/* CPU & 内存 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="CPU 使用率"
              value={parseFloat(data?.cpu.used || "0")}
              suffix="%"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="内存使用率"
              value={parseFloat(data?.memory.usage || "0")}
              suffix="%"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="系统负载 (1min)"
              value={data?.loadAverage?.load1 || 0}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前负载"
              value={data?.loadAverage?.currentLoad || 0}
              suffix="%"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* GPU 信息 */}
      {data?.gpu && data.gpu.length > 0 && (
        <Card title="GPU 信息" style={{ marginBottom: 16 }}>
          <Table
            dataSource={data.gpu}
            rowKey="model"
            pagination={false}
            columns={[
              { title: "型号", dataIndex: "model", key: "model" },
              { title: "厂商", dataIndex: "vendor", key: "vendor" },
              {
                title: "使用率",
                dataIndex: "utilizationGpu",
                key: "utilizationGpu",
                render: (val) => `${val}%`,
              },
              {
                title: "显存",
                key: "vram",
                render: (_, record) =>
                  `${record.vramUsed} / ${record.vram} MB`,
              },
              {
                title: "温度",
                dataIndex: "temperature",
                key: "temperature",
                render: (val) => `${val}°C`,
              },
            ]}
          />
        </Card>
      )}

      {/* 网络流量 */}
      {data?.network && (
        <Card title="网络流量" style={{ marginBottom: 16 }}>
          <Table
            dataSource={data.network}
            rowKey="interface"
            pagination={false}
            columns={[
              { title: "网卡", dataIndex: "interface", key: "interface" },
              {
                title: "下载速度",
                dataIndex: "rx_sec",
                key: "rx_sec",
                render: (val) => `${(val / 1024).toFixed(2)} KB/s`,
              },
              {
                title: "上传速度",
                dataIndex: "tx_sec",
                key: "tx_sec",
                render: (val) => `${(val / 1024).toFixed(2)} KB/s`,
              },
            ]}
          />
        </Card>
      )}

      {/* TOP 进程 */}
      {data?.topProcesses && (
        <Card title="TOP 10 进程">
          <Table
            dataSource={data.topProcesses}
            rowKey="pid"
            pagination={false}
            columns={[
              { title: "PID", dataIndex: "pid", key: "pid" },
              { title: "进程名", dataIndex: "name", key: "name" },
              { title: "用户", dataIndex: "user", key: "user" },
              {
                title: "CPU",
                dataIndex: "cpu",
                key: "cpu",
                render: (val) => `${val.toFixed(2)}%`,
              },
              {
                title: "内存",
                dataIndex: "mem",
                key: "mem",
                render: (val) => `${val.toFixed(2)} MB`,
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
```

---

## 7. 开发步骤

### 步骤 1：更新 Shared 包类型

```bash
# 1. 创建类型文件
touch packages/shared/src/types/monitor.types.ts
touch packages/shared/src/types/websocket.types.ts

# 2. 复制上面 4.2 和 4.3 的代码到对应文件

# 3. 更新 types/index.ts 导出

# 4. 重新构建 shared 包
pnpm --filter @fullstack/shared build
```

### 步骤 2：后端实现

```bash
# 1. 安装依赖
pnpm --filter api add @nestjs/websockets @nestjs/platform-socket.io socket.io systeminformation

# 2. 创建文件
mkdir -p apps/api/src/monitor
touch apps/api/src/monitor/monitor.gateway.ts
touch apps/api/src/monitor/monitor.service.ts
touch apps/api/src/monitor/monitor.module.ts

# 3. 复制上面 5.2.2 ~ 5.2.4 的代码

# 4. 修改 ServerstateModule（确保导出 Service）

# 5. 注册 MonitorModule 到 AppModule

# 6. 启动后端测试
pnpm --filter api dev
```

### 步骤 3：前端实现

```bash
# 1. 安装依赖
pnpm --filter web add socket.io-client

# 2. 创建 Hook
mkdir -p apps/web/src/hooks
touch apps/web/src/hooks/useRealtimeMonitor.ts

# 3. 复制上面 6.2 的代码

# 4. 创建页面
mkdir -p apps/web/src/app/monitor
touch apps/web/src/app/monitor/page.tsx

# 5. 复制上面 6.3 的代码

# 6. 启动前端测试
pnpm --filter web dev
```

### 步骤 4：测试完整流程

```bash
# 1. 启动所有服务
pnpm dev

# 2. 访问页面
# http://localhost:3001/monitor

# 3. 检查控制台
# - 浏览器控制台：应该看到 "✅ WebSocket 连接成功"
# - API 控制台：应该看到 "Client connected" 和定时推送日志

# 4. 测试订阅功能（在浏览器控制台）
# 打开开发者工具 → Console → 输入：
# window.monitorHook.subscribe(['gpu']);
# window.monitorHook.unsubscribe(['network']);
```

---

## 8. 测试验证

### 8.1 浏览器测试

1. **连接测试**
   ```
   访问：http://localhost:3001/monitor
   预期：页面显示 "已连接" 绿色徽章
   ```

2. **数据推送测试**
   ```
   打开浏览器开发者工具 → Network → WS
   预期：看到 ws://localhost:3000/monitor 连接
   点击查看 Messages：每 2 秒收到一条 data 消息
   ```

3. **订阅测试**
   ```
   在控制台运行：
   window.monitorHook.subscribe(['gpu', 'docker']);
   预期：API 日志显示 "Client xxx subscribed to: gpu, docker"
   ```

### 8.2 API 日志检查

```bash
# 正常日志示例
[Nest] 12345  - 2026/04/16 15:30:00   LOG [MonitorGateway] WebSocket Gateway initialized
[Nest] 12345  - 2026/04/16 15:30:05   LOG [MonitorGateway] Client abc123 connected
[Nest] 12345  - 2026/04/16 15:30:06   LOG [MonitorGateway] Client abc123 subscribed to: cpu, memory, gpu, network, processes, load
```

### 8.3 压力测试（可选）

```bash
# 使用 wscat 工具测试（需安装：npm i -g wscat）
wscat -c ws://localhost:3000/monitor

# 连接后发送订阅消息
> {"type":"subscribe","modules":["cpu","memory"]}

# 预期：每 2 秒收到一条 data 消息
< {"type":"data","payload":{...}}
```

---

## 9. 常见问题

### 9.1 WebSocket 连接失败

**症状**：浏览器控制台显示 `WebSocket connection failed`

**排查**：
1. 检查 API 是否启动：`curl http://localhost:3000`
2. 检查 CORS 配置：`monitor.gateway.ts` 中的 `cors.origin`
3. 检查防火墙：确保 3000 端口未被拦截
4. 检查浏览器控制台 Network → WS：查看握手请求状态

### 9.2 收不到数据

**症状**：连接成功但 `data` 始终为 null

**排查**：
1. 检查是否订阅：`subscribedModules` 应该有内容
2. 检查 API 日志：是否有 "subscribed to" 日志
3. 检查服务端是否报错：`systeminformation` 可能在某些系统不可用
4. 尝试单次请求：`requestData('cpu')` 看是否有响应

### 9.3 GPU 数据为空

**症状**：`data.gpu` 为空数组

**原因**：
- macOS：集成显卡无法通过 `systeminformation` 获取详细信息
- Linux：需要安装 `nvidia-smi` 或 `amdgpu`
- Windows：通常可正常获取

**解决**：
1. 检查系统是否有独立显卡
2. Linux 安装驱动：`sudo apt install nvidia-utils`
3. 确认 `nvidia-smi` 命令可用

### 9.4 内存占用过高

**症状**：API 内存占用持续增长

**原因**：定时器未正确清理

**排查**：
1. 检查 `MonitorGateway.handleDisconnect` 是否被调用
2. 检查 `pushIntervals` Map 是否正确清理
3. 添加日志：
   ```typescript
   handleDisconnect(client: Socket) {
     console.log(`Cleaning up client ${client.id}`);
     this.stopPushing(client.id);
     console.log(`Active intervals: ${this.pushIntervals.size}`);
   }
   ```

### 9.5 前端报类型错误

**症状**：`Cannot find module '@fullstack/shared'`

**解决**：
```bash
# 重新构建 shared 包
pnpm --filter @fullstack/shared build

# 重启前端
pnpm --filter web dev
```

---

## 10. 进阶功能

### 10.1 添加 Docker 监控

```bash
# 1. 安装依赖
pnpm --filter api add dockerode

# 2. 在 monitor.service.ts 中添加方法
async getDockerContainers(): Promise<DockerContainer[]> {
  const Docker = require('dockerode');
  const docker = new Docker();

  try {
    const containers = await docker.listContainers({ all: true });
    
    return containers.map((container) => ({
      id: container.Id.slice(0, 12),
      name: container.Names[0]?.replace('/', '') || 'unknown',
      status: container.State,
      cpu: 0, // 需要额外调用 stats API
      mem: 0,
      netIO: { rx: 0, tx: 0 },
    }));
  } catch (error) {
    this.logger.warn('Docker not available:', error);
    return [];
  }
}
```

### 10.2 添加订阅控制面板

```typescript
// apps/web/src/app/monitor/page.tsx

const allModules: MonitorModule[] = [
  'cpu', 'memory', 'disk', 'sys', 
  'gpu', 'network', 'processes', 'temperature', 'load', 'docker'
];

// 在页面添加 Checkbox.Group
<Card title="订阅模块" style={{ marginBottom: 16 }}>
  <Checkbox.Group
    options={allModules.map((m) => ({ label: m, value: m }))}
    value={Array.from(subscribedModules)}
    onChange={(checked) => {
      const toAdd = checked.filter((m) => !subscribedModules.has(m as MonitorModule));
      const toRemove = Array.from(subscribedModules).filter((m) => !checked.includes(m));
      
      if (toAdd.length > 0) subscribe(toAdd as MonitorModule[]);
      if (toRemove.length > 0) unsubscribe(toRemove);
    }}
  />
</Card>
```

### 10.3 添加历史图表（使用 Chart.js）

```bash
pnpm --filter web add chart.js react-chartjs-2
```

```typescript
// 保存最近 30 个数据点
const [history, setHistory] = useState<RealtimeMonitorData[]>([]);

useEffect(() => {
  if (data) {
    setHistory((prev) => [...prev.slice(-29), data]);
  }
}, [data]);

// 使用 Line Chart 渲染 CPU 使用率趋势
<Line
  data={{
    labels: history.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'CPU 使用率',
      data: history.map((d) => parseFloat(d.cpu.used)),
    }]
  }}
/>
```

---

## 11. 文档索引

### 相关文档

- [服务器状态监控 (SSE)](./SERVER_STATE_MONITOR.md) - 原有 SSE 实现
- [SSE 实时推送实现](./SSE_IMPLEMENTATION.md) - SSE 详细指南
- [项目架构](../monorepo/index.md) - Monorepo 结构说明
- [API 统一响应](../api/unified-response.md) - 响应格式规范

### 外部资源

- [Socket.io 官方文档](https://socket.io/docs/v4/)
- [NestJS WebSocket 文档](https://docs.nestjs.com/websockets/gateways)
- [systeminformation 文档](https://systeminformation.io/)

---

## 12. 总结

### 技术栈

| 层级         | 技术                             |
| ------------ | -------------------------------- |
| **传输协议** | WebSocket (Socket.io)            |
| **后端框架** | NestJS Gateway                   |
| **前端库**   | React Hook + Socket.io-client    |
| **数据采集** | systeminformation                |
| **类型定义** | TypeScript (Monorepo Shared)     |

### 核心概念

1. **双向通信**：客户端可主动发送订阅/请求消息
2. **订阅机制**：按需订阅不同监控模块
3. **定时推送**：服务端根据订阅列表定时推送数据
4. **类型安全**：完整的 TypeScript 类型定义

### 下一步建议

1. 添加 Docker 监控（如果有容器）
2. 实现历史数据图表（Chart.js）
3. 添加告警功能（CPU > 90% 时弹窗）
4. 实现 WebSocket 消息录制与回放（调试工具）
5. 添加多客户端广播功能（实时协作）

---

**🎉 恭喜！你已掌握 WebSocket 实时监控系统的完整实现！**
