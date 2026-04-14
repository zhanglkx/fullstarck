// utils/urlParams.ts
import queryString from "query-string";

type ParamsOptions = {
  /** 指定 URL，默认自动获取当前页面 URL */
  url?: string;
  /** 数组格式处理方式 */
  arrayFormat?: "bracket" | "index" | "comma" | "separator" | "none";
  /** 是否自动转换数字 */
  parseNumbers?: boolean;
  /** 是否自动转换布尔值 */
  parseBooleans?: boolean;
};

/**
 * 获取 URL 参数 - 框架无关
 * 浏览器环境自动读取当前 URL，Node 环境需传入 url
 */
export function getUrlParams<T = Record<string, any>>(options: ParamsOptions = {}): T {
  const { url, arrayFormat = "bracket", parseNumbers = true, parseBooleans = true } = options;

  // 获取 search 字符串
  let search: string;

  if (url) {
    // 从传入的 URL 中提取
    const queryIndex = url.indexOf("?");
    search = queryIndex !== -1 ? url.slice(queryIndex) : "";
  } else if (typeof window !== "undefined") {
    // 浏览器环境：自动读取当前页面
    search = window.location.search;
  } else {
    // 其他环境：返回空对象
    return {} as T;
  }

  return queryString.parse(search, {
    arrayFormat,
    parseNumbers,
    parseBooleans,
    decode: true,
  }) as T;
}
