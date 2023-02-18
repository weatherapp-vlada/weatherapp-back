import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from 'src/entities/location.entity';
import { TemperatureEntity } from 'src/entities/temperature.entity';
import { OpenWeatherApiModule } from 'src/open-weather-api/open-weather-api.module';
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
