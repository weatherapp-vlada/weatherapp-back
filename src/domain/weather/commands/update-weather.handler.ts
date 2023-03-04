import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository } from '@mikro-orm/core';
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
    private readonly locationsRepository: EntityRepository<LocationEntity>,
    @InjectRepository(WeatherEntity)
    private readonly weatherRepository: EntityRepository<WeatherEntity>,
  ) {}

  public async execute(): Promise<void> {
    const locations = await this.locationsRepository.findAll();
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

      const weatherEntities = weather.map(
        ({
          timestamp,
          temperatureCelsius,
          humidity,
          precipitationProbability,
          pressure,
          rainVolumePast3Hours: rainVolume,
          snowVolumePast3Hours: snowVolume,
          weatherConditionId,
          windDirection,
          windSpeedMetersPerSecond: windSpeed,
          isNight,
        }) => ({
          location: id,
          weatherCondition: weatherConditionId,
          timestamp,
          temperatureCelsius,
          humidity,
          precipitationProbability,
          pressure,
          rainVolume,
          snowVolume,
          windDirection,
          windSpeed,
          isNight,
        }),
      );

      await this.weatherRepository.upsertMany(weatherEntities);
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
    const endOfMaxForecastDate = now
      .clone()
      .add(OpenWeatherApiService.OPENWEATHERMAPAPI_FORECAST_DAYS, 'days');

    const count = await this.weatherRepository.count({
      location: {
        id: locationId,
      },
      timestamp: {
        $gte: now.toDate(),
        $lte: endOfMaxForecastDate.toDate(),
      },
    });

    const expectedCount =
      (OpenWeatherApiService.OPENWEATHERMAPAPI_FORECAST_DAYS * 24) /
      OpenWeatherApiService.OPENWEATHERMAPAPI_TIMESTAMP_INTERVAL_HOURS;

    return count < expectedCount;
  }
}
