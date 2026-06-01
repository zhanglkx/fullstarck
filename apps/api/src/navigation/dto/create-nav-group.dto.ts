import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNavGroupDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name cannot be empty' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'icon must be a string' })
  @MaxLength(50, { message: 'icon must be at most 50 characters' })
  icon?: string;

  @IsOptional()
  @IsInt({ message: 'sortOrder must be an integer' })
  sortOrder?: number;
}
