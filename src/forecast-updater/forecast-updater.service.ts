import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import * as moment from 'moment';

import { LocationEntity, TemperatureEntity } from '../entities';
import { OpenWeatherApiService } from '../open-weather-api/open-weather-api.service';
import { PgBossClient } from '../pgboss/pgboss-client';

@Injectable()
export class ForecastUpdaterService implements OnModuleInit {
  static readonly JOB_NAME = 'daily-forecast-update';
  static readonly JOB_CRON_EXPRESSION = '0 0/3 * * *'; // every 3 hours

  private readonly logger = new Logger(ForecastUpdaterService.name);

  constructor(
    private readonly openWeatherApiService: OpenWeatherApiService,
    private readonly pgBossClient: PgBossClient,
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(TemperatureEntity)
    private readonly temperaturesRepository: Repository<TemperatureEntity>,
  ) {}

  async onModuleInit() {
    await this.pgBossClient.emit(ForecastUpdaterService.JOB_NAME, {
      options: {
        singletonKey: 'force-update-on-startup',
        singletonMinutes: 1, // if multiple replicas start at the same time
        retryLimit: 2,
      },
    });

    await this.pgBossClient.scheduleEvent({
      pattern: ForecastUpdaterService.JOB_NAME,
      cron: ForecastUpdaterService.JOB_CRON_EXPRESSION,
    });
  }

  async updateForecastForAllSupportedLocations() {
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
    const now = moment();
    const currentDate = now.toDate();
    const endOfMaxForecastDate = now
      .add(OpenWeatherApiService.OPENWEATHERMAPAPI_FORECAST_DAYS, 'days')
      .toDate();

    const count = await this.temperaturesRepository.count({
      where: {
        locationId,
        timestamp: Between(currentDate, endOfMaxForecastDate),
      },
    });

    const expectedCount =
      (OpenWeatherApiService.OPENWEATHERMAPAPI_FORECAST_DAYS * 24) /
      OpenWeatherApiService.OPENWEATHERMAPAPI_TIMESTAMP_INTERVAL_HOURS;

    return count < expectedCount;
  }
}
