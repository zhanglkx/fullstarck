import { IsArray, IsUUID } from 'class-validator';

export class ReorderItemsDto {
  @IsArray({ message: 'ids must be an array' })
  @IsUUID('4', { each: true, message: 'each id must be a valid UUID v4' })
  ids!: string[];
}
