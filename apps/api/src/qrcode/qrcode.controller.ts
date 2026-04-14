import { Controller, Get, Query } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';

@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Get('generate')
  generate() {
    return this.qrcodeService.generate();
  }

  @Get('check')
  check(@Query('uuid') uuid: string) {
    return this.qrcodeService.check(uuid);
  }
}
