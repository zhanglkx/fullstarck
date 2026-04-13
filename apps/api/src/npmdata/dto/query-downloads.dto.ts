import { IsNotEmpty, IsString } from 'class-validator';

export class QueryDownloadsDto {
  @IsNotEmpty({ message: 'Package name is required' })
  @IsString()
  package!: string;

  @IsNotEmpty({ message: 'Start date is required' })
  start!: string;

  @IsNotEmpty({ message: 'End date is required' })
  end!: string;
}
