import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';
import { ScanQrcodeDto, CheckQrcodeDto } from './dto/scan-qrcode.dto';

@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Get('generate')
  generate() {
    return this.qrcodeService.generate();
  }

  @Get('check')
  check(@Query() checkDto: CheckQrcodeDto) {
    return this.qrcodeService.check(checkDto.uuid);
  }

  @Post('scan')
  scan(@Body() scanQrcodeDto: ScanQrcodeDto) {
    return this.qrcodeService.scan(scanQrcodeDto.uuid);
  }
}
