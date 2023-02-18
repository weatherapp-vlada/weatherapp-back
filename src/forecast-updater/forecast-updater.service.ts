import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as PgBoss from 'pg-boss';
import { TypeormConfiguration } from 'src/config/db.config';
import { LocationEntity } from 'src/entities/location.entity';
import { TemperatureEntity } from 'src/entities/temperature.entity';
import { OpenWeatherApiService } from 'src/open-weather-api/open-weather-api.service';
import { Repository } from 'typeorm';

@Injectable()
export class ForecastUpdaterService implements OnModuleInit {
  static readonly jobName = 'daily-forecast-update';
  static readonly jobCronExpression = '0 0 * * *'; // at midnight every day

  private readonly logger = new Logger(ForecastUpdaterService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly openWeatherApiService: OpenWeatherApiService,
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(TemperatureEntity)
    private readonly temperaturesRepository: Repository<TemperatureEntity>,
  ) {}

  async onModuleInit() {
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

    if (false) {
      await boss.send(
        ForecastUpdaterService.jobName,
        {},
        { singletonKey: 'out-of-schedule-update', retryLimit: 2 },
      );
    }

    await boss.schedule(
      ForecastUpdaterService.jobName,
      ForecastUpdaterService.jobCronExpression,
    );

    await boss.work(ForecastUpdaterService.jobName, async () => {
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
}
