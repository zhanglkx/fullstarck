/**
 * 服务器状态监控相关类型（与 apps/api serverstate 模块字段对齐）
 */

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
  timestamp?: number; // SSE 时间戳（毫秒）
}
