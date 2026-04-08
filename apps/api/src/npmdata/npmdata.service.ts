import { Injectable } from '@nestjs/common';
import { CreateNpmdatumDto } from '@/npmdata/dto/create-npmdatum.dto';
import { UpdateNpmdatumDto } from '@/npmdata/dto/update-npmdatum.dto';

@Injectable()
export class NpmdataService {
  create(_createNpmdatumDto: CreateNpmdatumDto) {
    return 'This action adds a new npmdatum';
  }

  findAll() {
    return `This action returns all npmdata`;
  }

  findOne(id: number) {
    return `This action returns a #${id} npmdatum`;
  }

  update(id: number, _updateNpmdatumDto: UpdateNpmdatumDto) {
    return `This action updates a #${id} npmdatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} npmdatum`;
  }
}
