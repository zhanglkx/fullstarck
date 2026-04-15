# NestJS 后端改进分步指南

本文档面向 `apps/api`，按优先级说明**现状问题、目标、操作步骤与验收方式**，便于你按阶段落地改造。最后更新：2026-04-15。

---

## 阅读前准备

- 根目录已配置 `pnpm` workspace，后端在 `apps/api`。
- 统一响应与拦截器说明见 [统一响应格式](./unified-response.md)。
- 改动后务必执行：`pnpm --filter api lint`、`pnpm --filter api build`、`pnpm --filter api test`（补充测试后）。

---

## P0：结构化日志（Logger / pino）

### 问题

- 业务代码中缺少 `Logger` 调用，线上难以按请求追踪问题，也无法按级别过滤。

### 目标

- 请求维度可关联（建议 Request ID）。
- 开发环境可读性高，生产环境 JSON 或结构化输出便于采集（如 Loki、CloudWatch）。

### 推荐方案 A：NestJS 内置 Logger（起步最快）

1. 在 `main.ts` 中设置日志级别与缓冲：

   ```ts
   import { Logger } from '@nestjs/common';

   async function bootstrap() {
     const app = await NestFactory.create(AppModule, {
       logger: ['error', 'warn', 'log', 'debug'],
     });
     // ...
   }
   ```

2. 在各 `Service` / `Controller` 中注入：

   ```ts
   import { Injectable, Logger } from '@nestjs/common';

   @Injectable()
   export class ExampleService {
     private readonly logger = new Logger(ExampleService.name);

     doWork() {
       this.logger.log('开始处理');
       try {
         // ...
       } catch (e) {
         this.logger.error('处理失败', e instanceof Error ? e.stack : String(e));
         throw e;
       }
     }
   }
   ```

3. **验收**：调用接口时终端出现带上下文字段的日志；错误栈完整。

### 推荐方案 B：pino（生产结构化，可选后续）

1. 安装：`pnpm --filter api add nestjs-pino pino-http`（包名以当前生态为准）。
2. 在 `AppModule` 中 `LoggerModule.forRoot({ pinoHttp: { level: process.env.LOG_LEVEL ?? 'info' } })`。
3. 用环境变量 `LOG_LEVEL` 控制级别。

### 注意

- 勿记录密码、Token、完整 Authorization 头。
- 异常在**过滤器**中可统一记录一次，避免与 Service 重复刷屏。

---

## P0：认证从 demo-token 迁移到 JWT

### 问题

- `Bearer demo-token` 等硬编码无法支撑多用户与吊销，也不安全。

### 目标

- 签发与校验 JWT（或接入 OAuth2 / OIDC 提供商）。

### 步骤概要（@nestjs/jwt + Passport）

1. 安装：`pnpm --filter api add @nestjs/jwt @nestjs/passport passport passport-jwt`，类型：`pnpm --filter api add -D @types/passport-jwt`。
2. 新建 `AuthModule`：`JwtModule.registerAsync` 从 `ConfigService` 读取 `JWT_SECRET`、`JWT_EXPIRES_IN`。
3. 实现 `JwtStrategy`：从 Header `Authorization: Bearer <token>` 提取并校验，将 `payload` 挂到 `request.user`。
4. 将现有 `SimpleAuthGuard` 改为使用 Passport 的 `AuthGuard('jwt')`，或使用自定义 Guard 内部调用 `JwtService.verify`。
5. `@Public()` 路由保持元数据跳过鉴权。
6. **验收**：无 Token 返回 401；有效 Token 可访问受保护路由；错误 Token 返回 401。

### 配置建议

- `JWT_SECRET`：长度足够的随机串（生产用密钥管理）。
- 短期 Access Token + Refresh Token（如需要）分接口刷新。

---

## P0：持久化数据层（TypeORM / Prisma + PostgreSQL）

### 问题

- `UserService` 内存数组、`QrcodeService` Map，进程重启数据丢失，无法横向扩展。

### 目标

- 单一事实来源在数据库；迁移可重复执行。

### 选型提示

- **Prisma**：迁移与类型体验好，适合快速迭代。
- **TypeORM**：与 Nest 集成示例多，适合熟悉装饰器 Entity 的团队。

### 通用步骤（以 Prisma 为例）

1. `pnpm --filter api add prisma @prisma/client`，初始化 `prisma/schema.prisma`，配置 `DATABASE_URL`。
2. 定义 `User`、`QrcodeSession` 等模型，`prisma migrate dev` 生成迁移。
3. 在 `UserService` 中注入 `PrismaService`，替换数组逻辑。
4. **验收**：重启 API 数据仍在；并发创建无 ID 冲突（用 DB 自增或 UUID）。

### ID 生成

- 禁止使用 `length + 1`；改用数据库自增、`uuid` 字段或 ULID。

---

## P0：测试与 nest-cli 生成 spec

### 问题

- `nest-cli.json` 关闭 `spec` 导致新模块无单测模板；核心业务无回归保障。

### 步骤

1. 打开 `apps/api/nest-cli.json`，将 `generateOptions.spec` 设为 `true`（字段名以你项目实际为准）。
2. 为核心 `Service` 编写 `*.spec.ts`：`Test.createTestingModule` + mock 依赖。
3. **验收**：`pnpm --filter api test` 稳定通过；CI 中同命令可运行。

---

## P1：Service 抛出 NestJS HTTP 异常

### 问题

- `throw new Error('...')` 会变成 500，语义不清。

### 目标

- 未找到 → `NotFoundException`；参数错误 → `BadRequestException`；禁止 → `ForbiddenException`。

### 步骤

1. 在 `user.service.ts`、`qrcode.service.ts` 等文件中替换 `Error` 为对应 HTTP 异常。
2. 确保全局过滤器仍包装为统一 `ApiResponse`（若项目约定如此）。
3. **验收**：接口返回正确 HTTP 状态码与业务 `msg`。

---

## P1：Swagger / OpenAPI

### 步骤

1. `pnpm --filter api add @nestjs/swagger`。
2. `main.ts`：`DocumentBuilder` + `SwaggerModule.setup('api-docs', app, document)`。
3. DTO 上添加 `@ApiProperty`，Controller 上 `@ApiTags`、`@ApiBearerAuth()`（JWT 后）。
4. **验收**：浏览器打开 `/api-docs` 可试调接口。

---

## P1：安全中间件（helmet + 限流）

### 步骤

1. `pnpm --filter api add helmet @nestjs/throttler`。
2. `app.use(helmet())`（注意与 CORS 顺序）。
3. `ThrottlerModule.forRoot({ ttl: 60, limit: 100 })`，关键路由可单独收紧。
4. **验收**：压测触发 429；安全响应头存在（如 `X-Content-Type-Options`）。

---

## P1：环境变量校验

### 步骤

1. 使用 `Joi` 或 `zod` 在 `ConfigModule` 的 `validationSchema` / 自定义工厂中校验 `API_PORT`、`DATABASE_URL`、`JWT_SECRET` 等。
2. 启动时缺失或格式错误应**立即失败**并打印明确信息。
3. **验收**：删掉某个必填 env 时进程退出码非 0 且日志说明原因。

---

## P2：CORS 可配置化

### 步骤

1. 将 `main.ts` 中 `origin` 数组改为读取 `CORS_ORIGINS`（逗号分隔）或 `ConfigService`。
2. 生产环境配置真实前端域名。
3. **验收**：仅允许列表内来源带 Cookie/鉴权头（若使用）。

---

## P2：清理空壳 Entity/DTO、合并重复类型

### 步骤

1. 删除或填充仅占位的 `*.entity.ts`、空 DTO。
2. 将多处重复的接口（如 NPM 下载数据结构）迁到 `packages/shared` 或 `src/common/interfaces` 单处导出。
3. **验收**：`pnpm --filter api build` 无未使用导入告警（以 ESLint 规则为准）。

---

## P2：CreateUserDto 等校验装饰器修正

### 示例

- 第二个 `@IsString()` 若语义为「非空字符串」，应改为 `@IsNotEmpty()` 或与 `@IsString()` 组合使用，避免重复装饰器无意义叠加。

---

## 建议实施顺序（路线图）

| 阶段 | 内容 |
|------|------|
| 1 | Logger + HTTP 异常规范化 + 环境变量校验 |
| 2 | JWT 替换 demo-token + helmet + throttler |
| 3 | 数据库 + 迁移 + Service 改造 |
| 4 | Swagger + 单测覆盖 + CI |

---

## 相关文档

- [统一响应格式](./unified-response.md)
- [模块生成器](./generate-module.md)
- [Monorepo 子包使用](../monorepo/subpackage-use.md)（`@fullstack/shared` 类型共享）
