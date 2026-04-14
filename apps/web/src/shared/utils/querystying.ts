// utils/urlParams.ts
import queryString from "query-string";

type ParamsOptions = {
  /** 指定 URL，默认自动获取当前页面 URL */
  url?: string;
  /** Server Component 传入的 searchParams（Next.js 16 中是 Promise 或普通对象） */
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
  /** 数组格式处理方式 */
  arrayFormat?: "bracket" | "index" | "comma" | "separator" | "none";
  /** 是否自动转换数字 */
  parseNumbers?: boolean;
  /** 是否自动转换布尔值 */
  parseBooleans?: boolean;
};

/**
 * 获取 URL 参数 - 自动适配 Client/Server Components
 *
 * 使用场景：
 * 1. Client Component（浏览器环境）- 自动读取 window.location.search
 * 2. Server Component - 传入 searchParams prop
 * 3. 手动解析任意 URL - 传入 url 参数
 *
 * @example
 * ```tsx
 * // Client Component - 自动读取当前 URL
 * const { uuid } = getUrlParams<{ uuid: string }>();
 *
 * // Server Component - 传入 searchParams
 * export default function Page({ searchParams }: { searchParams: Promise<any> }) {
 *   const { uuid } = getUrlParams<{ uuid: string }>({ searchParams });
 * }
 *
 * // 手动解析 URL
 * const { uuid } = getUrlParams<{ uuid: string }>({ url: 'https://example.com?uuid=123' });
 * ```
 */
export function getUrlParams<T = Record<string, any>>(options: ParamsOptions = {}): T {
  const { url, searchParams, arrayFormat = "bracket", parseNumbers = true, parseBooleans = true } = options;

  // 1. 优先：从传入的 searchParams 中获取（Server Component）
  if (searchParams) {
    // 注意：Next.js 16 中 searchParams 可能是 Promise
    const isPromise = searchParams instanceof Promise;
    if (isPromise) {
      throw new Error(
        "searchParams 是 Promise，请使用 await:\n" +
        "const params = getUrlParams({ searchParams: await searchParams });"
      );
    }

    // 转换 Next.js searchParams 格式
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(searchParams)) {
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

  // 2. 其次：从指定的 URL 中提取
  let search: string;
  if (url) {
    const queryIndex = url.indexOf("?");
    search = queryIndex !== -1 ? url.slice(queryIndex) : "";
  }
  // 3. 最后：浏览器环境自动读取当前页面（Client Component）
  else if (typeof window !== "undefined") {
    search = window.location.search;
  }
  // 4. 都没有：返回空对象
  else {
    return {} as T;
  }

  return queryString.parse(search, {
    arrayFormat,
    parseNumbers,
    parseBooleans,
    decode: true,
  }) as T;
}


