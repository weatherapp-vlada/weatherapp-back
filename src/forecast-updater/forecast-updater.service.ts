import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as PgBoss from 'pg-boss';
import { Between, Repository } from 'typeorm';
import * as moment from 'moment';

import { TypeormConfiguration } from '../config/db.config';
import { LocationEntity } from '../entities/location.entity';
import { TemperatureEntity } from '../entities/temperature.entity';
import { OpenWeatherApiService } from '../open-weather-api/open-weather-api.service';

@Injectable()
export class ForecastUpdaterService implements OnApplicationBootstrap {
  static readonly JOB_NAME = 'daily-forecast-update';
  static readonly JOB_CRON_EXPRESSION = '0 0/3 * * *'; // every 3 hours

  private readonly logger = new Logger(ForecastUpdaterService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly openWeatherApiService: OpenWeatherApiService,
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(TemperatureEntity)
    private readonly temperaturesRepository: Repository<TemperatureEntity>,
  ) {}

  async onApplicationBootstrap() {
    const {
      host,
      username: user,
      password,
      database,
      port,
    } = this.configService.get<TypeormConfiguration>('database');
    const boss = new PgBoss({
      host,
      user,
      password,
      database,
      port,
    });

    await boss.start();

    boss.on('error', (error) => this.logger.error({ error }, 'pgBoss error'));

    await boss.send(
      ForecastUpdaterService.JOB_NAME,
      {},
      {
        singletonKey: 'force-update-on-startup',
        singletonMinutes: 1, // if multiple replicas start at the same time
        retryLimit: 2,
      },
    );

    await boss.schedule(
      ForecastUpdaterService.JOB_NAME,
      ForecastUpdaterService.JOB_CRON_EXPRESSION,
    );

    await boss.work(ForecastUpdaterService.JOB_NAME, async () => {
      await this.updateForecastForAllSupportedLocations();
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
    const inFiveDays = now.add(
      OpenWeatherApiService.OPENWEATHERMAPAPI_FORECAST_DAYS,
      'days',
    );

    const count = await this.temperaturesRepository.count({
      where: {
        locationId,
        timestamp: Between(now.toDate(), inFiveDays.toDate()),
      },
    });

    const expectedCount =
      (OpenWeatherApiService.OPENWEATHERMAPAPI_FORECAST_DAYS * 24) /
      OpenWeatherApiService.OPENWEATHERMAPAPI_TIMESTAMP_INTERVAL_HOURS;

    return count < expectedCount;
  }
}
