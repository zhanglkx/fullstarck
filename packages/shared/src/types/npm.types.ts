/**
 * NPM 下载统计（与后端 npmdata 模块约定对齐）
 */

export interface NpmDownloadDay {
  day: string;
  downloads: number;
}

export interface NpmDownloadsPayload {
  start: string;
  end: string;
  package: string;
  downloads: NpmDownloadDay[];
}

/** 业务层 success 包装 */
export interface NpmDownloadsEnvelope {
  success: boolean;
  data: NpmDownloadsPayload;
}
