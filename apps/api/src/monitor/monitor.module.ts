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
