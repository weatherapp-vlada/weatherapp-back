import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationEntity, TemperatureEntity } from '../entities';
import { OpenWeatherApiModule } from '../open-weather-api/open-weather-api.module';
import { ForecastUpdaterService } from './forecast-updater.service';

@Module({
  imports: [
    OpenWeatherApiModule,
    ConfigModule,
    TypeOrmModule.forFeature([LocationEntity]),
    TypeOrmModule.forFeature([TemperatureEntity]),
  ],
  providers: [ForecastUpdaterService],
})
export class ForecastUpdaterModule {}
