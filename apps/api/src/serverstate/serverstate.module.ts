import { Module } from '@nestjs/common';
import { ServerstateService } from './serverstate.service';
import { ServerstateController } from './serverstate.controller';

@Module({
  controllers: [ServerstateController],
  providers: [ServerstateService],
  exports: [ServerstateService], // 导出服务供其他模块使用
})
export class ServerstateModule {}
