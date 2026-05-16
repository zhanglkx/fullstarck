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
import { NavigationModule } from './navigation/navigation.module';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    NavigationModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: false, // Use migrations for schema management
      autoLoadEntities: true, // Automatically load entities from modules
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
