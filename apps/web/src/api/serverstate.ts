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
