import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenWeatherApiModule } from './open-weather-api/open-weather-api.module';

import dbConfig from './config/db.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocationEntity } from './entities/location.entity';
import { TemperatureEntity } from './entities/temperature.entity';
import { ForecastUpdaterModule } from './forecast-updater/forecast-updater.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    TypeOrmModule.forFeature([LocationEntity]),
    TypeOrmModule.forFeature([TemperatureEntity]),
    OpenWeatherApiModule,
    ForecastUpdaterModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
