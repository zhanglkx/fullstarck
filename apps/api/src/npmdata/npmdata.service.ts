import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { QueryDownloadsDto } from '@/npmdata/dto/query-downloads.dto';

export interface NpmDownloadData {
  downloads: Array<{ day: string; downloads: number }>;
  start: string;
  end: string;
  package: string;
}

@Injectable()
export class NpmdataService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  query(_queryDownloadsDto: QueryDownloadsDto) {
    return `This action queries npmdata`;
  }

  async fetchExternalData(queryDto: QueryDownloadsDto) {
    const apiUrl =
      this.configService.get<string>('THIRD_PARTY_API_URL') || 'https://api.npmjs.org/downloads';
    const apiKey = this.configService.get<string>('THIRD_PARTY_API_KEY');

    const requestUrl = `${apiUrl}/range/${queryDto.start}:${queryDto.end}/${encodeURIComponent(
      queryDto.package,
    )}`;
    const requestConfig = apiKey
      ? {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      : undefined;

    try {
      const response = await firstValueFrom(
        this.httpService.get<NpmDownloadData>(requestUrl, requestConfig),
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '调用第三方接口失败';
      const errorData =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { data?: unknown })?.data
          : undefined;

      throw new HttpException(
        {
          success: false,
          message: errorMessage,
          error: errorData,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
