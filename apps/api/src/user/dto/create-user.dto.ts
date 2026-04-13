import { IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
// DTO = Data Transfer Object，数据传输对象
// 它的作用就是：定义前端传什么数据、数据格式是什么
// @IsString()、@IsInt() 这些是校验规则
// @Type(() => Number) 是把输入转换成数字
export class CreateUserDto {
  @IsString({ message: 'Username must be a string' })
  @IsString({ message: 'Username cannot be empty' })
  username!: string;

  @Type(() => Number)
  @IsInt({ message: 'Age must be an integer' })
  @Min(0, { message: 'Age must be a non-negative integer' })
  age!: number;
}
