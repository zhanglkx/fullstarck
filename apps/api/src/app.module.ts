import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { NpmdataModule } from '@/npmdata/npmdata.module';
import { QrcodeModule } from './qrcode/qrcode.module';

@Module({
  imports: [
    NpmdataModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    QrcodeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
