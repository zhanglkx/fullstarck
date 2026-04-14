/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Server-side URL parameter utilities
 * 用于 Server Components
 */

type ServerParamsOptions = {
  /** 是否自动转换数字 */
  parseNumbers?: boolean;
  /** 是否自动转换布尔值 */
  parseBooleans?: boolean;
};

/**
 * 获取 URL 参数 - 用于 Server Components
 * 从 Next.js searchParams prop 中解析参数
 *
 * @example
 * ```tsx
 * // Server Component
 * interface PageProps {
 *   searchParams: Promise<Record<string, string | string[]>>;
 * }
 *
 * export default async function Page({ searchParams }: PageProps) {
 *   const params = await getServerUrlParams<{ uuid: string }>(searchParams);
 *   return <div>{params.uuid}</div>;
 * }
 * ```
 */
export async function getServerUrlParams<T = Record<string, any>>(
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>,
  options: ServerParamsOptions = {},
): Promise<T> {
  const { parseNumbers = true, parseBooleans = true } = options;

  // 如果是 Promise，先解析
  const params = searchParams instanceof Promise ? await searchParams : searchParams;

  // 转换为标准格式
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    // 处理数组
    if (Array.isArray(value)) {
      result[key] = value;
      continue;
    }

    // 处理布尔值
    if (parseBooleans && (value === "true" || value === "false")) {
      result[key] = value === "true";
      continue;
    }

    // 处理数字
    if (parseNumbers && !isNaN(Number(value)) && value !== "") {
      result[key] = Number(value);
      continue;
    }

    // 默认字符串
    result[key] = value;
  }

  return result as T;
}
