import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { NotesController } from './notes.controller'
import { NotesService } from './notes.service'

@Module({
  imports: [],
  controllers: [AppController, NotesController],
  providers: [AppService, NotesService],
})
export class AppModule {}
