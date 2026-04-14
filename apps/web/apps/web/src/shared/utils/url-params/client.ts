/**
 * Client-side URL parameter utilities
 * 用于 Client Components
 */
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";

type ClientParamsOptions = {
  /** 数组格式处理方式 */
  arrayFormat?: "bracket" | "index" | "comma" | "separator" | "none";
  /** 是否自动转换数字 */
  parseNumbers?: boolean;
  /** 是否自动转换布尔值 */
  parseBooleans?: boolean;
};

/**
 * 获取 URL 参数 - 用于 Client Components
 * 使用 Next.js useSearchParams hook
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * export default function MyComponent() {
 *   const { uuid } = useUrlParams<{ uuid: string }>();
 *   return <div>{uuid}</div>;
 * }
 * ```
 */
export function useUrlParams<T = Record<string, any>>(
  options: ClientParamsOptions = {}
): T {
  const { arrayFormat = "bracket", parseNumbers = true, parseBooleans = true } = options;
  const searchParams = useSearchParams();

  return useMemo(() => {
    const search = searchParams.toString();
    if (!search) return {} as T;

    return queryString.parse(search, {
      arrayFormat,
      parseNumbers,
      parseBooleans,
      decode: true,
    }) as T;
  }, [searchParams, arrayFormat, parseNumbers, parseBooleans]);
}
