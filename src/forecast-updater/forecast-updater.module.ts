import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '../entities/location.entity';
import { TemperatureEntity } from '../entities/temperature.entity';
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
  exports: [],
})
export class ForecastUpdaterModule {}
