import { Injectable } from '@nestjs/common';
import {
  cpus as nodecpus,
  totalmem,
  freemem,
  hostname,
  networkInterfaces,
  platform,
  arch,
} from 'os';
import * as nodeDiskInfo from 'node-disk-info';

@Injectable()
export class ServerstateService {
  cpuStatus() {
    const cpus = nodecpus();
    const cpuInfo = cpus.reduce(
      (info, cpu) => {
        info.cpuNum += 1;
        info.user += cpu.times.user;
        info.sys += cpu.times.sys;
        info.idle += cpu.times.idle;
        info.total += cpu.times.user + cpu.times.sys + cpu.times.idle;
        return info;
      },
      { user: 0, sys: 0, idle: 0, total: 0, cpuNum: 0 },
    );
    const cpu = {
      cpuNum: cpuInfo.cpuNum,
      sys: ((cpuInfo.sys / cpuInfo.total) * 100).toFixed(2),
      used: ((cpuInfo.user / cpuInfo.total) * 100).toFixed(2),
      free: ((cpuInfo.idle / cpuInfo.total) * 100).toFixed(2),
    };
    return cpu;
  }

  bytesToGB(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2);
  }

  cpuIndex() {
    return nodecpus();
  }

  getMemInfo() {
    const totalMemory = totalmem();
    const freeMemory = freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercentage = (((totalMemory - freeMemory) / totalMemory) * 100).toFixed(2);
    const mem = {
      total: totalMemory,
      used: usedMemory,
      free: freeMemory,
      usage: memoryUsagePercentage,
    };
    return mem;
  }

  getMemIndex() {
    const totalMemory = totalmem();
    const freeMemory = freemem();

    return { totalMemory, freeMemory };
  }

  getDiskStatus() {
    const disks = nodeDiskInfo.getDiskInfoSync();

    const sysFiles = disks.map((disk) => {
      return {
        dirName: disk.mounted,
        typeName: disk.filesystem,
        total: this.bytesToGB(disk.blocks) + 'GB',
        used: this.bytesToGB(disk.used) + 'GB',
        free: this.bytesToGB(disk.available) + 'GB',
        usage: ((disk.used / disk.blocks || 0) * 100).toFixed(2),
      };
    });
    return sysFiles;
  }

  getSysInfo() {
    return {
      computerName: hostname(),
      computerIp: this.getServerIP(),
      osName: platform(),
      osArch: arch(),
    };
  }

  getServerIP(): string {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      if (!nets[name]) continue;

      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return 'localhost';
  }
}
