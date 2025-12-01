import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common'
import { NotesService } from './notes.service'
import { CreateNoteDto, NoteDto } from '@fullstarck/api-contracts'

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(): NoteDto[] {
    return this.notesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): NoteDto {
    const note = this.notesService.findOne(id)
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`)
    }
    return note
  }

  @Post()
  create(@Body() createNoteDto: CreateNoteDto): NoteDto {
    return this.notesService.create(createNoteDto)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: Partial<CreateNoteDto>
  ): NoteDto {
    const note = this.notesService.update(id, updateNoteDto)
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`)
    }
    return note
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.notesService.remove(id)
    if (!success) {
      throw new NotFoundException(`Note with ID ${id} not found`)
    }
    return { success }
  }
}
