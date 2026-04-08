import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NpmdataService } from '@/npmdata/npmdata.service';
import { NpmdataController } from '@/npmdata/npmdata.controller';

@Module({
  imports: [HttpModule],
  controllers: [NpmdataController],
  providers: [NpmdataService],
})
export class NpmdataModule {}
