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
        vramUsed: typeof gpu.vramDynamic === 'number' ? gpu.vramDynamic : 0,
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
