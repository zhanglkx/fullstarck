import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImportNavItemDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name cannot be empty' })
  @MaxLength(200, { message: 'name must be at most 200 characters' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'url must be a string' })
  @MaxLength(2048, { message: 'url must be at most 2048 characters' })
  url?: string;

  @IsOptional()
  @IsString({ message: 'src must be a string' })
  @MaxLength(2048, { message: 'src must be at most 2048 characters' })
  src?: string;

  @IsOptional()
  @IsEnum(['icon', 'text', 'component'], { message: 'type must be one of: icon, text, component' })
  type?: 'icon' | 'text' | 'component';

  @IsOptional()
  @IsString({ message: 'backgroundColor must be a string' })
  @MaxLength(20, { message: 'backgroundColor must be at most 20 characters' })
  backgroundColor?: string;

  @IsOptional()
  @IsString({ message: 'iconText must be a string' })
  @MaxLength(50, { message: 'iconText must be at most 50 characters' })
  iconText?: string;

  @IsOptional()
  @IsString({ message: 'size must be a string' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'component must be a string' })
  @MaxLength(100, { message: 'component must be at most 100 characters' })
  component?: string;

  @IsOptional()
  @IsString({ message: 'originalId must be a string' })
  @MaxLength(200, { message: 'originalId must be at most 200 characters' })
  originalId?: string;
}

class ImportNavGroupDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name cannot be empty' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'icon must be a string' })
  @MaxLength(50, { message: 'icon must be at most 50 characters' })
  icon?: string;

  @IsArray({ message: 'items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ImportNavItemDto)
  items!: ImportNavItemDto[];
}

export class ImportNavigationDto {
  @IsArray({ message: 'groups must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ImportNavGroupDto)
  groups!: ImportNavGroupDto[];
}
