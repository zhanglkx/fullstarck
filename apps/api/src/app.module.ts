import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { NpmdataModule } from '@/npmdata/npmdata.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { UserModule } from './user/user.module';
import { ServerstateModule } from './serverstate/serverstate.module';
import { MonitorModule } from './monitor/monitor.module';

@Module({
  imports: [
    NpmdataModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    QrcodeModule,
    UserModule,
    ServerstateModule,
    MonitorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
