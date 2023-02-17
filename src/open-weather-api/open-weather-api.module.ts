import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenWeatherApiService } from './open-weather-api.service';

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
  ],
  providers: [OpenWeatherApiService],
  exports: [OpenWeatherApiService],
})
export class OpenWeatherApiModule {}
