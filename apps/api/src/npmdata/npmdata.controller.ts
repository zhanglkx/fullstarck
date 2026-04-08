import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NpmdataService } from '@/npmdata/npmdata.service';
import { CreateNpmdatumDto } from '@/npmdata/dto/create-npmdatum.dto';
import { UpdateNpmdatumDto } from '@/npmdata/dto/update-npmdatum.dto';

@Controller('npmdata')
export class NpmdataController {
  constructor(private readonly npmdataService: NpmdataService) {}

  @Post()
  create(@Body() createNpmdatumDto: CreateNpmdatumDto) {
    return this.npmdataService.create(createNpmdatumDto);
  }

  @Get()
  findAll() {
    return this.npmdataService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.npmdataService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNpmdatumDto: UpdateNpmdatumDto,
  ) {
    return this.npmdataService.update(+id, updateNpmdatumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.npmdataService.remove(+id);
  }
}
