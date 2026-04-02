import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('api-info')
  getApiInfo() {
    return {
      name: 'Fullstack Monorepo API',
      version: '1.0.0',
      description: 'NestJS API for fullstack monorepo project',
      endpoints: {
        health: '/health',
        apiInfo: '/api-info',
      },
    };
  }
}
