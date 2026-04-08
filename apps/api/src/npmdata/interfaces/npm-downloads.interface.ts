export interface NpmDownloadDay {
  downloads: number;
  day: string;
}

export interface NpmDownloadsResponse {
  start: string;
  end: string;
  package: string;
  downloads: NpmDownloadDay[];
}

export interface DownloadsStatsResponse {
  success: boolean;
  data: {
    package: string;
    start: string;
    end: string;
    totalDownloads: number;
    averagePerDay: number;
    downloads: NpmDownloadDay[];
  };
}
