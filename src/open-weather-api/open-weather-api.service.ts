import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class OpenWeatherApiService {
  private readonly logger = new Logger(OpenWeatherApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchForecast({ lat, lon }: any): Promise<any[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<any[]>('/forecast', {
          params: {
            lat,
            lon,
            units: 'metric',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    this.logger.log(`data: ${JSON.stringify(data)}`);

    return data;
  }
}
