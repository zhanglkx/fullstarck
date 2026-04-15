import { apiGet } from "@/lib/api-client";

export interface CPUStatus {
  cpuNum: number;
  sys: string;
  used: string;
  free: string;
}

export interface MemInfo {
  total: number;
  used: number;
  free: number;
  usage: string;
}

export interface DiskInfo {
  dirName: string;
  typeName: string;
  total: string;
  used: string;
  free: string;
  usage: string;
}

export interface SysInfo {
  computerName: string;
  computerIp: string;
  osName: string;
  osArch: string;
}

export interface ServerState {
  cpu: CPUStatus;
  memory: MemInfo;
  disks: DiskInfo[];
  sys: SysInfo;
}

// API 响应包装类型
interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

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
