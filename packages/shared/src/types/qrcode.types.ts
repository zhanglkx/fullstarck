/**
 * QRCode 模块类型定义
 * 用于前后端共享 QRCode 相关的数据类型
 */

/**
 * 二维码状态
 * - pending: 等待扫描
 * - scanned: 已扫描（等待确认）
 * - expired: 已过期
 * - success: 已确认（登录成功）
 */
export type QRCodeState = 'pending' | 'scanned' | 'expired' | 'success';

/**
 * 生成二维码的响应数据
 */
export interface QRCodeGenerate {
  /** 二维码唯一标识 */
  uuid: string;
  /** 二维码 Data URL（可直接用于 img src） */
  dataUrl: string;
}

/**
 * 检查二维码状态的响应数据
 */
export interface QRCodeCheck {
  /** 二维码当前状态 */
  state: QRCodeState;
}

/**
 * 扫描二维码的请求参数（预留，目前未使用）
 */
export interface QRCodeScanParams {
  /** 二维码唯一标识 */
  uuid: string;
}

/**
 * 确认二维码的请求参数（预留，目前未使用）
 */
export interface QRCodeConfirmParams {
  /** 二维码唯一标识 */
  uuid: string;
  /** 用户令牌 */
  token?: string;
}
