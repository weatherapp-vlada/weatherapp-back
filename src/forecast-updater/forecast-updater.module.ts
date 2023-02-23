import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PgBossModule } from 'src/pgboss/pgboss.module';

import { LocationEntity, TemperatureEntity } from '../entities';
import { OpenWeatherApiModule } from '../open-weather-api/open-weather-api.module';
import { ForecastUpdaterController } from './forecast-updater.controller';
import { ForecastUpdaterService } from './forecast-updater.service';

@Module({
  imports: [
    OpenWeatherApiModule,
    ConfigModule,
    TypeOrmModule.forFeature([LocationEntity, TemperatureEntity]),
    PgBossModule,
  ],
  controllers: [ForecastUpdaterController],
  providers: [ForecastUpdaterService],
})
export class ForecastUpdaterModule {}
