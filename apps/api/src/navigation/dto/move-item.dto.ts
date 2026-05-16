import { IsUUID, IsOptional, IsInt } from 'class-validator';

export class MoveItemDto {
  @IsUUID('4', { message: 'targetGroupId must be a valid UUID v4' })
  targetGroupId!: string;

  @IsOptional()
  @IsInt({ message: 'sortOrder must be an integer' })
  sortOrder?: number;
}
