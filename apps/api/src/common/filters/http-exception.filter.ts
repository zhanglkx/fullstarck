import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@/common/interfaces/response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // 获取错误消息
    let message: string | string[] = '请求失败';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      message =
        typeof exceptionResponse.message === 'string' || Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
          : '请求失败';
    }

    const errorResponse: ApiResponse<null> = {
      code: status,
      data: null,
      msg: Array.isArray(message) ? message.join(', ') : message,
    };

    response.status(status).json(errorResponse);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof Error ? exception.message : '服务器内部错误';

    const errorResponse: ApiResponse<null> = {
      code: status,
      data: null,
      msg: message,
    };

    response.status(status).json(errorResponse);
  }
}
