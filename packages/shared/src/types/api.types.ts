/**
 * 统一的 API 响应接口
 * 用于包装所有 API 接口的返回值
 *
 * @template T - 业务数据类型
 */
export interface ApiResponse<T = unknown> {
  /** HTTP 状态码 */
  code: number;
  /** 业务数据 */
  data: T;
  /** 响应消息 */
  msg: string;
}

/**
 * 分页查询参数接口
 */
export interface PaginationParams {
  /** 页码，从 1 开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}

/**
 * 分页响应数据接口
 *
 * @template T - 列表项数据类型
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  list: T[];
  /** 总条数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}
