import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenWeatherApiModule } from './open-weather-api/open-weather-api.module';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';

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
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.headers['x-correlation-id'] || uuidv4(),
        autoLogging: false,
        quietReqLogger: true,
      },
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
