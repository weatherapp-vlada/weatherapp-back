import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

interface FetchForecastParams {
  lat: number;
  lon: number;
}

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
  public static readonly OPENWEATHERMAPAPI_TIMESTAMP_INTERVAL_HOURS = 3;
  public static readonly OPENWEATHERMAPAPI_FORECAST_DAYS = 5;

  private readonly logger = new Logger(OpenWeatherApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchForecast({ lat, lon }: FetchForecastParams): Promise<Forecast[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<OpenWeatherApiForecastResponse>('/forecast', {
        params: {
          lat,
          lon,
          units: 'metric',
        },
      }),
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
