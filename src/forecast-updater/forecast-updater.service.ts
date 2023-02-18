import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as PgBoss from 'pg-boss';
import { TypeormConfiguration } from 'src/config/db.config';
import { LocationEntity } from 'src/entities/location.entity';
import { TemperatureEntity } from 'src/entities/temperature.entity';
import { OpenWeatherApiService } from 'src/open-weather-api/open-weather-api.service';
import { addDays } from 'src/utils/date.utils';
import { Between, Repository } from 'typeorm';

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

    boss.on('error', (error) => this.logger.error(error));

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
    this.logger.log('Updating forecasts...');
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
          `Skipping forecast update for '${name}' because it is already up to date.`,
        );

        return;
      }

      this.logger.log(`Updating forecast for '${name}'...`);
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
      this.logger.log(`Updated forecasts for '${name}'.`);
    } catch (err) {
      this.logger.error(`Failed updating forecasts for '${name}'. ${err}`);
      throw err;
    }
  }

  async shouldUpdateForecast(locationId: number) {
    const now = new Date();
    const dateInFiveDays = addDays(now, 5);

    const count = await this.temperaturesRepository.count({
      where: {
        locationId,
        timestamp: Between(now, dateInFiveDays),
      },
    });

    const expectedCount =
      (OpenWeatherApiService.OPENWEATHERMAPAPI_FORECAST_DAYS * 24) /
      OpenWeatherApiService.OPENWEATHERMAPAPI_TIMESTAMP_INTERVAL_HOURS;

    return count < expectedCount;
  }
}
