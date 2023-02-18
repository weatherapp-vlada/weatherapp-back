import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenWeatherApiService } from './open-weather-api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from 'src/entities/location.entity';
import { TemperatureEntity } from 'src/entities/temperature.entity';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: 5000,
        baseURL: 'https://api.openweathermap.org/data/2.5',
        params: {
          appId: configService.get('OPENWEATHER_APIKEY'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([LocationEntity]),
    TypeOrmModule.forFeature([TemperatureEntity]),
  ],
  providers: [OpenWeatherApiService],
  exports: [OpenWeatherApiService],
})
export class OpenWeatherApiModule {}
