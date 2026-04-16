import { useState, useEffect } from "react";
import type { ApiResponse } from "@fullstack/shared";
import type { CPUStatus, DiskInfo, MemInfo, ServerState, SysInfo } from "@fullstack/shared";
import { apiGet } from "@/lib/api-client";

export type { CPUStatus, DiskInfo, MemInfo, ServerState, SysInfo };

/**
 * 获取 CPU 状态
 */
export async function getCPUStatus(): Promise<CPUStatus> {
  const response = await apiGet<ApiResponse<CPUStatus>>("/serverstate/status");
  return response.data;
}

/**
 * 获取内存信息
 */
export async function getMemoryInfo(): Promise<MemInfo> {
  const response = await apiGet<ApiResponse<MemInfo>>("/serverstate/memoryinfo");
  return response.data;
}

/**
 * 获取磁盘状态
 */
export async function getDiskStatus(): Promise<DiskInfo[]> {
  const response = await apiGet<ApiResponse<DiskInfo[]>>("/serverstate/diskstatus");
  return response.data;
}

/**
 * 获取系统信息
 */
export async function getSysInfo(): Promise<SysInfo> {
  const response = await apiGet<ApiResponse<SysInfo>>("/serverstate/sysinfo");
  return response.data;
}

/**
 * 获取完整的服务器状态（所有信息）
 */
export async function getServerState(): Promise<ServerState> {
  const [cpu, memory, disks, sys] = await Promise.all([
    getCPUStatus(),
    getMemoryInfo(),
    getDiskStatus(),
    getSysInfo(),
  ]);

  return { cpu, memory, disks, sys };
}

/**
 * SSE Hook: 实时获取服务器状态
 */
export function useServerStateStream() {
  // 状态管理
  const [data, setData] = useState<ServerState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);

  useEffect(() => {
    // 1. 构造 SSE URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const url = `${apiUrl}/serverstate/stream`;

    // 2. 创建 EventSource 连接
    const eventSource = new EventSource(url);

    // 3. 监听连接打开事件
    eventSource.onopen = () => {
      console.log("SSE 连接已建立");
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
          // 提取时间戳（优先使用服务器时间戳，否则使用本地时间）
          setLastUpdateTime(serverState.timestamp || Date.now());
        }
      } catch (err) {
        console.error("解析 SSE 数据失败:", err);
        setError("数据格式错误");
      }
    };

    // 5. 监听错误事件
    eventSource.onerror = (err) => {
      console.error("SSE 连接错误:", err);
      setIsConnected(false);
      setError("连接断开，正在重连...");
      // EventSource 会自动重连，无需手动处理
    };

    // 6. 清理函数：组件卸载时关闭连接
    return () => {
      console.log("关闭 SSE 连接");
      eventSource.close();
    };
  }, []); // 空依赖数组：只在组件挂载时执行一次

  // 返回状态供组件使用
  return { data, error, isConnected, lastUpdateTime };
}
