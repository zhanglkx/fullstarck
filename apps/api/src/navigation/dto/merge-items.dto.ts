import { IsArray, IsUUID, IsString, IsNotEmpty, ArrayMinSize, MaxLength } from 'class-validator';

export class MergeItemsDto {
  @IsArray({ message: 'itemIds must be an array' })
  @ArrayMinSize(2, { message: 'itemIds must contain at least 2 items' })
  @IsUUID('4', { each: true, message: 'each itemId must be a valid UUID v4' })
  itemIds!: string[];

  @IsString({ message: 'folderName must be a string' })
  @IsNotEmpty({ message: 'folderName cannot be empty' })
  @MaxLength(100, { message: 'folderName must be at most 100 characters' })
  folderName!: string;
}
