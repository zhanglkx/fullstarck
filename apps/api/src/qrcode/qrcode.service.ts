import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as qrcode from 'qrcode';
import { QRCodeGenerate, QRCodeCheck } from '@fullstack/shared';

@Injectable()
export class QrcodeService {
  /**
   * 生成二维码
   * @returns 二维码数据（uuid 和 dataUrl）
   */
  async generate(): Promise<QRCodeGenerate> {
    const uuid = randomUUID();

    const dataUrl = await qrcode.toDataURL(uuid);

    return {
      uuid,
      dataUrl,
    };
  }

  /**
   * 检查二维码状态
   * @returns 二维码状态
   */
  check(): QRCodeCheck {
    return {
      state: 'pending',
    };
  }
}
