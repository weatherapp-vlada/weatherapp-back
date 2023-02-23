import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';

import dbConfig from './config/db.config';
import { OpenWeatherApiModule } from './open-weather-api/open-weather-api.module';
import { HealthModule } from './health/health.module';
import { LocationModule } from './domain/location/location.module';
import { ForecastModule } from './domain/forecast/forecast.module';
import { PgBossModule } from './pgboss/pgboss.module';

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
    OpenWeatherApiModule,
    HealthModule,
    LocationModule,
    ForecastModule,
    PgBossModule,
  ],
})
export class AppModule {}
