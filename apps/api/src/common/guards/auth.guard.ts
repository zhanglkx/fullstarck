import { CanActivate, ExecutionContext, UnauthorizedException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SimpleAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 第一步：检查当前路由是否被标记为 @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果是公开路由，直接通过验证
    if (isPublic) {
      return true;
    }

    // 第二步：非公开路由需要进行身份验证
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;

    if (!auth) {
      throw new UnauthorizedException('请先登录');
    }

    if (auth !== 'Bearer demo-token') {
      throw new UnauthorizedException('token 无效');
    }

    request.user = {
      id: 1,
      username: 'demoUser',
      role: 'admin',
    };

    return true;
  }
}
