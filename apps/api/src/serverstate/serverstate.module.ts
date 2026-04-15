import { Module } from '@nestjs/common';
import { ServerstateService } from './serverstate.service';
import { ServerstateController } from './serverstate.controller';

@Module({
  controllers: [ServerstateController],
  providers: [ServerstateService],
})
export class ServerstateModule {}
