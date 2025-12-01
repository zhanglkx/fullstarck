# Lint 错误修复总结

## ✅ 已修复的所有错误

### 1. TypeScript 配置错误
- ✅ 修复 `tsconfig.base.json` 缺少 paths 配置
- ✅ 修复 `tsconfig.base.json` 缺少 baseUrl
- ✅ 修复 `tsconfig.app.json` rootDir 导致的导入错误
- ✅ 添加 `gluestack-ui.config.ts` 到 include 列表

### 2. DTO 类错误
- ✅ `LoginDto` - 添加 `!` 断言到所有属性
- ✅ `CreateNoteDto` - 添加 `!` 断言到所有属性

### 3. Gluestack UI Props 错误
- ✅ 移除不支持的 `space` prop（VStack, HStack）
- ✅ 移除不支持的 `size` prop（Button, Text, Heading, Card）
- ✅ 移除不支持的 `variant` prop（Button）
- ✅ 移除不支持的 `color`, `bg`, `p`, `mb` 等样式 props
- ✅ 改用 StyleSheet 和 style prop

### 4. 测试配置清理
- ✅ 移除所有 `tsconfig.spec.json` 引用
- ✅ 更新 `libs/api-contracts/tsconfig.json`
- ✅ 更新 `libs/shared-utils/tsconfig.json`

## 📊 当前状态

运行 `read_lints` 检查结果：
- ✅ 项目代码：**0 个错误**
- ⚠️  node_modules/@gluestack-ui：1 个错误（第三方库，可忽略）

## 🔧 关键修改

### tsconfig.base.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@fullstarck/api-contracts": ["libs/api-contracts/src/index.ts"],
      "@fullstarck/shared-utils": ["libs/shared-utils/src/index.ts"]
    }
  }
}
```

### DTO 类
```typescript
export class LoginDto {
  @IsEmail()
  email!: string  // 添加 ! 断言

  @IsString()
  @MinLength(6)
  password!: string  // 添加 ! 断言
}
```

### Gluestack UI 使用
```typescript
// ❌ 错误写法
<Box p="$6" mb="$4">
  <Text size="lg" color="$text500">Hello</Text>
</Box>

// ✅ 正确写法
<Box style={styles.container}>
  <Text style={styles.text}>Hello</Text>
</Box>

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    color: '#666',
  },
})
```

## ⚠️  剩余警告

`node_modules/.pnpm/@gluestack-ui+themed@...` 的错误是第三方库的配置问题，不影响项目使用，可以安全忽略。

## ✅ 验证命令

```bash
# 检查所有 lint 错误
pnpm nx run-many -t lint --all

# 检查 TypeScript 类型
pnpm nx run-many -t typecheck --all

# 构建所有项目
pnpm nx run-many -t build --all
```

所有项目代码的 lint 错误已全部修复！🎉
