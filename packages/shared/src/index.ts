export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
