# 统一响应格式使用指南

## 概述

API 已配置统一响应格式，所有接口返回的数据都会自动包装成以下结构：

```typescript
{
  "code": number,    // HTTP 状态码
  "data": T,         // 实际数据（成功时）或 null（失败时）
  "msg": string      // 提示消息
}
```

## 成功响应示例

### 返回对象

```typescript
// Controller 中只需返回数据对象
@Get('health')
health() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

// 实际响应
{
  "code": 200,
  "data": {
    "status": "ok",
    "timestamp": "2026-04-13T08:48:37.542Z",
    "uptime": 12.722980209
  },
  "msg": "加载成功"
}
```

### 返回字符串

```typescript
// Controller 中返回字符串
@Get()
getHello(): string {
  return 'Hello World!';
}

// 实际响应
{
  "code": 200,
  "data": "Hello World!",
  "msg": "加载成功"
}
```

## 错误响应示例

### 404 错误

```json
{
  "code": 404,
  "data": null,
  "msg": "Cannot GET /not-exist"
}
```

### 400 参数验证错误

```json
{
  "code": 400,
  "data": null,
  "msg": "Package name is required, Start date is required, End date is required"
}
```

### 自定义错误

```typescript
// Controller 中抛出异常
@Get('error')
throwError() {
  throw new BadRequestException('自定义错误消息');
}

// 实际响应
{
  "code": 400,
  "data": null,
  "msg": "自定义错误消息"
}
```

## 实现原理

### 1. 响应拦截器（TransformInterceptor）

位置：`src/common/interceptors/transform.interceptor.ts`

**作用**：拦截所有成功的响应，自动包装成统一格式。

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T) => ({
        code: HttpStatus.OK,
        data,
        msg: '加载成功',
      })),
    );
  }
}
```

### 2. 异常过滤器（HttpExceptionFilter & AllExceptionsFilter）

位置：`src/common/filters/http-exception.filter.ts`

**作用**：拦截所有异常，统一错误响应格式。

- **HttpExceptionFilter**：处理 NestJS 的 HttpException
- **AllExceptionsFilter**：处理所有未捕获的异常

### 3. 全局注册

位置：`src/main.ts`

```typescript
// 注册全局响应拦截器
app.useGlobalInterceptors(new TransformInterceptor());

// 注册全局异常过滤器
app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
```

## 在 Controller 中使用

### ✅ 推荐做法

直接返回数据，拦截器会自动包装：

```typescript
@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    // 直接返回数据对象
    return {
      id,
      name: 'John Doe',
      email: 'john@example.com',
    };
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // 抛出错误时使用 NestJS 内置异常类
    if (!createUserDto.email) {
      throw new BadRequestException('Email is required');
    }
    return this.usersService.create(createUserDto);
  }
}
```

### ❌ 不推荐做法

不要手动包装响应格式：

```typescript
// ❌ 不要这样做
@Get(':id')
findOne(@Param('id') id: string) {
  return {
    code: 200,
    data: { id, name: 'John' },
    msg: 'Success'
  };
}
// 这会导致双重包装！
```

## 自定义错误消息

使用 NestJS 内置异常类：

```typescript
import { 
  BadRequestException, 
  NotFoundException, 
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

// 400 Bad Request
throw new BadRequestException('Invalid input');

// 404 Not Found
throw new NotFoundException('User not found');

// 401 Unauthorized
throw new UnauthorizedException('Invalid credentials');

// 403 Forbidden
throw new ForbiddenException('Access denied');

// 500 Internal Server Error
throw new InternalServerErrorException('Something went wrong');
```

## TypeScript 类型定义

位置：`src/common/interfaces/response.interface.ts`

```typescript
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}
```

在前端使用时可以导入这个类型：

```typescript
import { ApiResponse } from '@fullstack/shared';

// 或在 API 项目内
import { ApiResponse } from '@/common';

async function fetchUsers(): Promise<ApiResponse<User[]>> {
  const response = await fetch('/users');
  return response.json();
}
```

## 注意事项

1. **不要手动包装响应**：拦截器会自动处理，手动包装会导致双重嵌套
2. **使用标准异常类**：使用 NestJS 内置的异常类（BadRequestException 等）而不是手动构造错误对象
3. **ValidationPipe 自动集成**：参数验证失败会自动返回统一格式的 400 错误
4. **异步操作**：拦截器支持 Promise 和 Observable，无需特殊处理

## 测试验证

```bash
# 成功响应
curl http://localhost:3000/health

# 404 错误
curl http://localhost:3000/not-exist

# 参数验证错误
curl "http://localhost:3000/npmdata/downloads?package="
```

## 相关文件

- 响应接口：[src/common/interfaces/response.interface.ts](src/common/interfaces/response.interface.ts)
- 响应拦截器：[src/common/interceptors/transform.interceptor.ts](src/common/interceptors/transform.interceptor.ts)
- 异常过滤器：[src/common/filters/http-exception.filter.ts](src/common/filters/http-exception.filter.ts)
- 全局配置：[src/main.ts](src/main.ts)
- 导出模块：[src/common/index.ts](src/common/index.ts)
