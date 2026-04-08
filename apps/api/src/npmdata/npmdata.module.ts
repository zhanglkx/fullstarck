import { Module } from '@nestjs/common';
import { NpmdataService } from '@/npmdata/npmdata.service';
import { NpmdataController } from '@/npmdata/npmdata.controller';

@Module({
  controllers: [NpmdataController],
  providers: [NpmdataService],
})
export class NpmdataModule {}
