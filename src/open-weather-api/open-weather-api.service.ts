import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

interface FetchForecastParams {
  lat: number;
  lon: number;
}

interface WeatherResponse {
  timestamp: Date;
  temperatureCelsius: number;
  pressure: number;
  humidity: number;
  windSpeedMetersPerSecond: number;
  windDirection: number;
  rainVolumePast3Hours: number;
  snowVolumePast3Hours: number;
  precipitationProbability: number;
  weatherConditionId: number;
  isNight: boolean;
}

const OPENWEATHERMAPAPI_NIGHT = 'n';

interface OpenWeatherApiForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: [
    {
      dt: number;
      main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        sea_level: number;
        grnd_level: number;
        humidity: number;
        temp_kf: number;
      };
      weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
      }[];
      clouds: {
        all: number;
      };
      wind: {
        speed: number;
        deg: number;
        gust: number;
      };
      visibility: number;
      pop: number;
      rain?: {
        '3h': number;
      };
      snow?: {
        '3h': number;
      };
      sys: {
        pod: 'd' | 'n';
      };
      dt_txt: string;
    },
  ];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

@Injectable()
export class OpenWeatherApiService {
  public static readonly OPENWEATHERMAPAPI_TIMESTAMP_INTERVAL_HOURS = 3;
  public static readonly OPENWEATHERMAPAPI_FORECAST_DAYS = 5;

  private readonly logger = new Logger(OpenWeatherApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchForecast({
    lat,
    lon,
  }: FetchForecastParams): Promise<WeatherResponse[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<OpenWeatherApiForecastResponse>('/forecast', {
        params: {
          lat,
          lon,
          units: 'metric',
        },
      }),
    );

    const { list: weatherResponse } = data;

    return weatherResponse.map(
      ({
        dt: timestamp,
        main: { temp: temperatureCelsius, pressure, humidity },
        wind: { speed: windSpeedMetersPerSecond, deg: windDirection },
        pop: precipitationProbability,
        weather: [{ id: weatherConditionId }],
        rain: { '3h': rainVolumePast3Hours } = { '3h': 0 },
        snow: { '3h': snowVolumePast3Hours } = { '3h': 0 },
        sys: { pod },
      }) => ({
        timestamp: new Date(timestamp * 1000),
        temperatureCelsius,
        pressure,
        humidity,
        windSpeedMetersPerSecond,
        windDirection,
        rainVolumePast3Hours,
        snowVolumePast3Hours,
        precipitationProbability,
        weatherConditionId,
        isNight: pod === OPENWEATHERMAPAPI_NIGHT,
      }),
    );
  }
}
