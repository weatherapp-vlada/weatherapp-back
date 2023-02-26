import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { utc } from 'moment';

import { LocationEntity } from '../../location/entities'; // TODO: fix cross entity reference
import { OpenWeatherApiService } from '../../../open-weather-api/open-weather-api.service';
import { TemperatureEntity } from '../entities';

export class UpdateAllForecastsCommand {}

@CommandHandler(UpdateAllForecastsCommand)
export class UpdateAllForecastsCommandHandler
  implements ICommandHandler<UpdateAllForecastsCommand>
{
  private readonly logger = new Logger(UpdateAllForecastsCommandHandler.name);

  public constructor(
    private readonly openWeatherApiService: OpenWeatherApiService,
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(TemperatureEntity)
    private readonly temperaturesRepository: Repository<TemperatureEntity>,
  ) {}

  public async execute(): Promise<void> {
    const locations = await this.locationsRepository.find();
    const promises = locations.map(this.updateForecastForLocation.bind(this));

    await Promise.all(promises);
  }

  async updateForecastForLocation({
    latitude: lat,
    longitude: lon,
    id,
    name,
  }: LocationEntity) {
    try {
      const shouldUpdateForecast = await this.shouldUpdateForecast(id);
      if (!shouldUpdateForecast) {
        this.logger.log(
          { input: { lat, lon, id, name } },
          'Up-to-date forecast. Skipping...',
        );

        return;
      }

      this.logger.log({ input: { name } }, 'Updating forecast...');
      const forecasts = await this.openWeatherApiService.fetchForecast({
        lat,
        lon,
      });

      const entities = forecasts.map(({ timestamp, temperatureCelsius }) => ({
        locationId: id,
        timestamp: new Date(timestamp * 1000),
        temperatureCelsius,
      }));

      await this.temperaturesRepository.save(entities);
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

  async shouldUpdateForecast(locationId: number) {
    const now = utc();
    const endOfMaxForecastDate = now.add(
      OpenWeatherApiService.OPENWEATHERMAPAPI_FORECAST_DAYS,
      'days',
    );

    const count = await this.temperaturesRepository.count({
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
