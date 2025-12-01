import { Injectable } from '@nestjs/common'
import { CreateNoteDto, NoteDto } from '@fullstarck/api-contracts'

@Injectable()
export class NotesService {
  private notes: NoteDto[] = [
    {
      id: '1',
      title: '第一条手帐',
      content: '今天天气很好，心情不错！',
      isCompleted: false,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: '2',
      title: '购物清单',
      content: '买菜、水果、牛奶',
      isCompleted: true,
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    },
  ]

  findAll(): NoteDto[] {
    return this.notes
  }

  findOne(id: string): NoteDto | undefined {
    return this.notes.find((note) => note.id === id)
  }

  create(createNoteDto: CreateNoteDto): NoteDto {
    const newNote: NoteDto = {
      id: Date.now().toString(),
      ...createNoteDto,
      isCompleted: createNoteDto.isCompleted || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.notes.push(newNote)
    return newNote
  }

  update(id: string, updateNoteDto: Partial<CreateNoteDto>): NoteDto | undefined {
    const note = this.notes.find((n) => n.id === id)
    if (!note) return undefined

    Object.assign(note, updateNoteDto, { updatedAt: new Date() })
    return note
  }

  remove(id: string): boolean {
    const index = this.notes.findIndex((n) => n.id === id)
    if (index === -1) return false

    this.notes.splice(index, 1)
    return true
  }
}
