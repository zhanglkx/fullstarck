# NestJS 模块生成脚本

快速创建 NestJS REST API 模块的脚本工具。

## 功能特性

- ✅ 自动生成完整的 CRUD 模块
- ✅ 自动选择 REST API 和 CRUD 选项
- ✅ 生成 Controller、Service、Module、DTO 和 Entity
- ✅ 自动更新 app.module.ts
- ✅ 支持从项目根目录或 API 目录调用

## 使用方法

### 在项目根目录

```bash
# 完整命令
pnpm generate:api <模块名>

# 简写命令
pnpm g:api <模块名>
```

### 在 apps/api 目录

```bash
# 进入 API 目录
cd apps/api

# 完整命令
pnpm generate <模块名>

# 简写命令
pnpm g <模块名>
```

## 示例

```bash
# 创建 user 模块
pnpm g:api user

# 创建 product 模块
pnpm g:api product

# 创建 order 模块
pnpm g:api order
```

## 生成的文件结构

运行 `pnpm g:api user` 后会生成：

```
src/
└── user/
    ├── user.controller.ts          # REST API 控制器
    ├── user.service.ts              # 业务逻辑服务
    ├── user.module.ts               # 模块定义
    ├── dto/
    │   ├── create-user.dto.ts       # 创建用户 DTO
    │   └── update-user.dto.ts       # 更新用户 DTO
    └── entities/
        └── user.entity.ts           # 用户实体
```

同时会自动更新 `src/app.module.ts`，导入新创建的模块。

## 生成的 API 端点

脚本会自动生成以下 REST API 端点：

- `POST   /user`       - 创建用户
- `GET    /user`       - 获取所有用户
- `GET    /user/:id`   - 获取单个用户
- `PATCH  /user/:id`   - 更新用户
- `DELETE /user/:id`   - 删除用户

## 脚本说明

核心脚本位置：`apps/api/scripts/generate-module.js`

该脚本会：
1. 接收模块名称参数
2. 调用 `nest g resource` 命令
3. 自动选择 REST API 作为传输层
4. 自动选择生成 CRUD 入口点
5. 安装依赖（如需要）

## 注意事项

- 模块名称使用小写和短横线命名（kebab-case），如：user、user-profile
- 生成后请检查代码并根据实际需求修改
- DTO 和 Entity 默认为空，需要手动添加字段
- 记得在生成后运行 `pnpm format` 格式化代码

## 后续步骤

生成模块后，你需要：

1. **定义 DTO 字段**
   ```typescript
   // dto/create-user.dto.ts
   export class CreateUserDto {
     name: string;
     email: string;
   }
   ```

2. **定义 Entity 字段**
   ```typescript
   // entities/user.entity.ts
   export class User {
     id: number;
     name: string;
     email: string;
   }
   ```

3. **实现 Service 业务逻辑**
   ```typescript
   // user.service.ts
   @Injectable()
   export class UserService {
     create(createUserDto: CreateUserDto) {
       // 实现创建逻辑
     }
     // ...
   }
   ```

4. **格式化代码**
   ```bash
   pnpm format
   ```

5. **运行测试**
   ```bash
   pnpm --filter api test
   ```

## 故障排除

### 权限错误

如果遇到权限错误，请确保脚本有执行权限：

```bash
chmod +x apps/api/scripts/generate-module.js
```

### NestJS CLI 未找到

确保已安装依赖：

```bash
pnpm install
```

### 模块已存在

如果模块已存在，NestJS CLI 会报错。请先删除或使用不同的模块名。
