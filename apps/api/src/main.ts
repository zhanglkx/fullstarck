import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { HttpExceptionFilter, AllExceptionsFilter } from '@/common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动去掉 DTO 中未声明的字段
      forbidNonWhitelisted: true, // 如果传了多余字段，直接报错
      transform: true, // 自动类型转换
    }),
  );

  // 注册全局响应拦截器（统一成功响应格式）
  app.useGlobalInterceptors(new TransformInterceptor());

  // 注册全局异常过滤器（统一错误响应格式）
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
