import { Controller, Get, Query } from '@nestjs/common';
import { NpmdataService } from '@/npmdata/npmdata.service';
import { QueryDownloadsDto } from '@/npmdata/dto/query-downloads.dto';

@Controller('npmdata')
export class NpmdataController {
  constructor(private readonly npmdataService: NpmdataService) {}

  @Get('downloads')
  queryDownloads(@Query() queryDownloadsDto: QueryDownloadsDto) {
    return this.npmdataService.fetchExternalData(queryDownloadsDto);
  }
}
