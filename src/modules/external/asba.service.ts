import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { PredictResponseDto } from './dto/response/Absa.response.dto';
import { AxiosResponse } from 'axios';

@Injectable()
export class AsbaService {
  constructor(
    private readonly httpService: HttpService,
    public configService: ApiConfigService,
  ) {}

  async predict(feedback: string): Promise<PredictResponseDto> {
    const url = this.configService.absaConfig.port;

    const requestBody = { feedback };

    const response: AxiosResponse<PredictResponseDto> = await this.httpService
      .post<PredictResponseDto>(url, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      })
      .toPromise();
    return response.data;
  }
}
