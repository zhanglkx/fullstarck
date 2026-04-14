import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { toDataURL } from 'qrcode';
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

    const dataUrl = await toDataURL(uuid);

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
        allStates: Object.fromEntries(this.qrCodeStore),
      };
    }
    throw new Error('二维码不存在');
  }

  /**
   * 扫描二维码
   * @returns 扫描结果
   */
  scan(uuid: string): { success: boolean } {
    if (this.qrCodeStore.has(uuid)) {
      this.qrCodeStore.set(uuid, 'scanned');
      return { success: true };
    }
    return { success: false };
  }
  /**
   * 扫描二维码
   * @returns 扫描结果
   */
  confirm(uuid: string): { success: boolean } {
    if (this.qrCodeStore.has(uuid)) {
      this.qrCodeStore.set(uuid, 'success');
      return { success: true };
    }
    return { success: false };
  }
}
