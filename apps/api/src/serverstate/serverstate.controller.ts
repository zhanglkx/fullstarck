import { Controller, Get } from '@nestjs/common';
import { ServerstateService } from './serverstate.service';

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
}
