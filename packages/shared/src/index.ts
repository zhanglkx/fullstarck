// ===== 常量 =====
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// ===== 类型定义 =====
export * from './types/api.types';
export * from './types/qrcode.types';

// ===== 工具函数 =====

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date - 日期对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 延迟执行（Promise 包装的 setTimeout）
 * @param ms - 延迟毫秒数
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
