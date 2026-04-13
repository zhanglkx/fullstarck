/**
 * 统一响应接口
 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}
