import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUrl,
  IsInt,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateNavItemDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name cannot be empty' })
  @MaxLength(200, { message: 'name must be at most 200 characters' })
  name!: string;

  @IsOptional()
  @IsUrl({}, { message: 'url must be a valid URL' })
  @MaxLength(2048, { message: 'url must be at most 2048 characters' })
  url?: string;

  @IsOptional()
  @IsString({ message: 'src must be a string' })
  @MaxLength(2048, { message: 'src must be at most 2048 characters' })
  src?: string;

  @IsEnum(['icon', 'text', 'component'], { message: 'type must be one of: icon, text, component' })
  type!: 'icon' | 'text' | 'component';

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
  @Matches(/^[12]x[12]$/, { message: 'size must be one of: 1x1, 1x2, 2x1, 2x2' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'component must be a string' })
  @MaxLength(100, { message: 'component must be at most 100 characters' })
  component?: string;

  @IsOptional()
  @IsInt({ message: 'sortOrder must be an integer' })
  sortOrder?: number;
}
