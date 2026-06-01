import { PartialType } from '@nestjs/mapped-types';
import { CreateNavGroupDto } from './create-nav-group.dto';

export class UpdateNavGroupDto extends PartialType(CreateNavGroupDto) {}
