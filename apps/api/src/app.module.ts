import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { NpmdataModule } from '@/npmdata/npmdata.module';

@Module({
  imports: [NpmdataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
