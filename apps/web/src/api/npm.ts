import { apiGet, apiPost } from "@/lib/api-client";

// API 响应类型示例
export interface NpmDataResponse {
  downloads: number;
  package: string;
  date: string;
}

/**
 * 获取 NPM 数据
 */
export async function getNpmData(pkg: string, period: string = "last-month") {
  return apiGet(`/npmdata/${pkg}?period=${period}`);
}

/**
 * 查询 NPM 下载数据
 */
export async function queryNpmDownloads(query: {
  packages: string[];
  startDate: string;
  endDate: string;
}) {
  return apiPost("/npmdata/query", query);
}
