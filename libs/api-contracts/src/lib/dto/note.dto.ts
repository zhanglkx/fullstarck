import { IsString, IsOptional, IsBoolean } from 'class-validator'

export class CreateNoteDto {
  @IsString()
  title!: string

  @IsString()
  content!: string

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean
}

export interface NoteDto {
  id: string
  title: string
  content: string
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}
