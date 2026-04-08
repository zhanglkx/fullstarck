import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { QueryDownloadsDto } from '@/npmdata/dto/query-downloads.dto';

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
      this.configService.get<string>('THIRD_PARTY_API_URL') ||
      'https://api.npmjs.org/downloads';
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
        this.httpService.get(requestUrl, requestConfig),
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '调用第三方接口失败',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          error: (error && error?.response?.data) || (error && error.message),
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
