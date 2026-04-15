import { PartialType } from '@nestjs/mapped-types';
import { CreateServerstateDto } from './create-serverstate.dto';

export class UpdateServerstateDto extends PartialType(CreateServerstateDto) {}
