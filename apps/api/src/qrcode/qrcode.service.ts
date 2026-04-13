import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as qrcode from 'qrcode';

@Injectable()
export class QrcodeService {
  async generate() {
    const uuid = randomUUID();

    const dataUrl = await qrcode.toDataURL(uuid);

    return {
      uuid,
      dataUrl,
    };
  }
}
