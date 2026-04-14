import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

// ============ 基础 DTO ============
export class BaseQrcodeDto {
  @IsNotEmpty({ message: 'UUID is required' })
  @IsString()
  uuid!: string;
}

// ============ 扫描 DTO（可扩展字段）============
export class ScanQrcodeDto extends BaseQrcodeDto {
  @IsOptional()
  @IsString()
  deviceInfo?: string; // 设备信息（可选）
}

// ============ 检查 DTO（复用基础）============
export class CheckQrcodeDto extends BaseQrcodeDto {
  // 如果以后需要添加更多字段，可以在这里扩展
}
// ============ 确认 DTO（复用基础）============
export class ConfirmQrcodeDto extends BaseQrcodeDto {
  // 如果以后需要添加更多字段，可以在这里扩展
}

// ============ 生成二维码 DTO（可选场景）============
export class GenerateQrcodeDto {
  @IsOptional()
  @IsEnum(['login', 'payment', 'share'])
  type?: 'login' | 'payment' | 'share'; // 二维码类型

  @IsOptional()
  @IsString()
  extra?: string; // 额外数据
}
