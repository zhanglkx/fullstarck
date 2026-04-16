import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@fullstack/shared';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();

    // 跳过 SSE 端点，不拦截流式响应
    if (request.url?.includes('/stream')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: T) => ({
        code: HttpStatus.OK,
        data,
        msg: '加载成功',
      })),
    );
  }
}
