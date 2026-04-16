import { Controller, Get, Sse } from '@nestjs/common';
import { ServerstateService } from './serverstate.service';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('serverstate')
export class ServerstateController {
  constructor(private readonly serverstateService: ServerstateService) {}

  @Get('status')
  status() {
    return this.serverstateService.cpuStatus();
  }

  @Get('index')
  index() {
    return this.serverstateService.cpuIndex();
  }

  @Get('memoryinfo')
  memoryInfo() {
    return this.serverstateService.getMemInfo();
  }

  @Get('memoryindex')
  memoryIndex() {
    return this.serverstateService.getMemIndex();
  }

  @Get('diskstatus')
  diskStatus() {
    return this.serverstateService.getDiskStatus();
  }

  @Get('sysinfo')
  sysInfo() {
    return this.serverstateService.getSysInfo();
  }

  // 2. 在 Controller 类中添加新方法
  @Sse('stream') // 创建 GET /serverstate/stream 端点
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

        console.log('🚀日志===== [ server] == ', data);

        // 返回 MessageEvent 格式
        // NestJS 会自动转换为 SSE 格式
        return { data } as MessageEvent;
      }),
    );
  }
}
