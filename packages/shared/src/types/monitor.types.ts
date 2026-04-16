import { CPUStatus, DiskInfo, MemInfo, SysInfo } from './serverstate.types';

/** GPU 信息 */
export interface GPUInfo {
  model: string; // GPU 型号
  vendor: string; // 厂商（NVIDIA/AMD/Intel）
  vram: number; // 显存总量（MB）
  vramUsed: number; // 已使用显存（MB）
  utilizationGpu: number; // GPU 使用率（%）
  temperature: number; // 温度（℃）
}

/** 网络流量 */
export interface NetworkStats {
  interface: string; // 网卡名称
  rx_sec: number; // 下载速度（bytes/s）
  tx_sec: number; // 上传速度（bytes/s）
  rx_total: number; // 总下载量（bytes）
  tx_total: number; // 总上传量（bytes）
}

/** 进程信息 */
export interface ProcessInfo {
  pid: number; // 进程 ID
  name: string; // 进程名
  cpu: number; // CPU 使用率（%）
  mem: number; // 内存使用（MB）
  user: string; // 所属用户
}

/** 系统温度 */
export interface TemperatureInfo {
  main: number; // CPU 温度（℃）
  cores: number[]; // 各核心温度（℃）
  max: number; // 最高温度（℃）
}

/** 系统负载 */
export interface LoadAverage {
  load1: number; // 1 分钟负载
  load5: number; // 5 分钟负载
  load15: number; // 15 分钟负载
  currentLoad: number; // 当前 CPU 负载（%）
}

/** Docker 容器 */
export interface DockerContainer {
  id: string; // 容器 ID
  name: string; // 容器名
  status: string; // 状态（running/stopped）
  cpu: number; // CPU 使用率（%）
  mem: number; // 内存使用（MB）
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
  gpu?: GPUInfo[]; // GPU 列表（可选，无 GPU 时为空）
  network: NetworkStats[]; // 网络接口列表
  topProcesses: ProcessInfo[]; // TOP 10 进程
  temperature?: TemperatureInfo; // 温度（可选）
  loadAverage: LoadAverage; // 系统负载
  docker?: DockerContainer[]; // Docker 容器（可选）

  timestamp: number; // 时间戳
}
