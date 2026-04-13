import { Controller, Get } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';

@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Get('generate')
  generate() {
    return this.qrcodeService.generate();
  }
}
