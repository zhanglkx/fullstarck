import { PartialType } from '@nestjs/mapped-types';
import { CreateNpmdatumDto } from '@/npmdata/dto/create-npmdatum.dto';

export class UpdateNpmdatumDto extends PartialType(CreateNpmdatumDto) {}
