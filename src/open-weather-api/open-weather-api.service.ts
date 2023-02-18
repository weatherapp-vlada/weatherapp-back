import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

interface Forecast {
  timestamp: number;
  temperatureCelsius: number;
}

interface OpenWeatherApiForecastResponse {
  list: {
    dt: number;
    main: {
      temp: number;
    };
  }[];
}

@Injectable()
export class OpenWeatherApiService {
  private readonly logger = new Logger(OpenWeatherApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchForecast({ lat, lon }: any): Promise<Forecast[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<OpenWeatherApiForecastResponse>('/forecast', {
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

    const { list } = data;

    return list.map(
      ({ dt: timestamp, main: { temp: temperatureCelsius } }) => ({
        timestamp,
        temperatureCelsius,
      }),
    );
  }
}
