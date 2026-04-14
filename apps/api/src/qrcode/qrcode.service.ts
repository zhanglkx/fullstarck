import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as qrcode from 'qrcode';
import { QRCodeGenerate, QRCodeCheck, QRCodeState } from '@fullstack/shared';

@Injectable()
export class QrcodeService {
  qrCodeStore = new Map<string, QRCodeState>();

  /**
   * 生成二维码
   * @returns 二维码数据（uuid 和 dataUrl）
   */
  async generate(): Promise<QRCodeGenerate> {
    const uuid = randomUUID();

    const dataUrl = await qrcode.toDataURL(uuid);

    this.qrCodeStore.set(uuid, 'pending');

    return {
      uuid,
      dataUrl,
    };
  }

  /**
   * 检查二维码状态
   * @returns 二维码状态
   */
  check(uuid: string): QRCodeCheck {
    const state = this.qrCodeStore.get(uuid);

    if (state) {
      return {
        state,
      };
    }
    throw new Error('二维码不存在');
  }
}
