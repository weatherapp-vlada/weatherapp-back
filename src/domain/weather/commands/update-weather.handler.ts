import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { utc } from 'moment';

import { LocationEntity } from '../../location/entities'; // TODO: fix cross entity reference
import { OpenWeatherApiService } from '../../../open-weather-api/open-weather-api.service';
import { WeatherEntity } from '../entities';

export class UpdateWeatherCommand {}

@CommandHandler(UpdateWeatherCommand)
export class UpdateWeatherCommandHandler
  implements ICommandHandler<UpdateWeatherCommand>
{
  private readonly logger = new Logger(UpdateWeatherCommandHandler.name);

  public constructor(
    private readonly openWeatherApiService: OpenWeatherApiService,
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(WeatherEntity)
    private readonly weatherRepository: Repository<WeatherEntity>,
  ) {}

  public async execute(): Promise<void> {
    const locations = await this.locationsRepository.find();
    const promises = locations.map(this.updateWeatherForLocation.bind(this));

    await Promise.all(promises);
  }

  private async updateWeatherForLocation({
    latitude: lat,
    longitude: lon,
    id,
    name,
  }: LocationEntity) {
    try {
      const shouldUpdateForecast = await this.shouldUpdateWeather(id);
      if (!shouldUpdateForecast) {
        this.logger.log(
          { input: { lat, lon, id, name } },
          'Up-to-date forecast. Skipping...',
        );

        return;
      }

      this.logger.log({ input: { name } }, 'Updating forecast...');
      const weather = await this.openWeatherApiService.fetchForecast({
        lat,
        lon,
      });

      const weatherEntities = weather.map<Partial<WeatherEntity>>(
        ({
          timestamp,
          temperatureCelsius,
          humidity,
          precipitationProbability,
          pressure,
          rainVolumePast3Hours: rainVolumePast3HoursMm,
          snowVolumePast3Hours: snowVolumePast3HoursMm,
          weatherConditionId,
          windDirection,
          windSpeedMetersPerSecond,
          isNight,
        }) => ({
          locationId: id,
          timestamp,
          temperatureCelsius,
          humidity,
          precipitationProbability,
          pressure,
          rainVolumePast3HoursMm,
          snowVolumePast3HoursMm,
          weatherConditionId,
          windDirection,
          windSpeedMetersPerSecond,
          isNight,
        }),
      );

      await this.weatherRepository.save(weatherEntities);
      this.logger.log({ input: { name } }, 'Forecast updated');
    } catch (err) {
      this.logger.error(
        {
          input: { name },
          error: {
            message: err.message,
          },
        },
        'Failed to update forecasts',
      );

      throw err;
    }
  }

  private async shouldUpdateWeather(locationId: number) {
    const now = utc();
    const endOfMaxForecastDate = now.add(
      OpenWeatherApiService.OPENWEATHERMAPAPI_FORECAST_DAYS,
      'days',
    );

    const count = await this.weatherRepository.count({
      where: {
        locationId,
        timestamp: Between(now.toDate(), endOfMaxForecastDate.toDate()),
      },
    });

    const expectedCount =
      (OpenWeatherApiService.OPENWEATHERMAPAPI_FORECAST_DAYS * 24) /
      OpenWeatherApiService.OPENWEATHERMAPAPI_TIMESTAMP_INTERVAL_HOURS;

    return count < expectedCount;
  }
}
