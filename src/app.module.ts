import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
// import { AsyncLocalStorage } from 'async_hooks';
// import { EntityManager } from '@mikro-orm/core';

import { OpenWeatherApiModule } from './open-weather-api/open-weather-api.module';
import { HealthModule } from './health/health.module';
import { LocationModule } from './domain/location/location.module';
import { WeatherModule } from './domain/weather/weather.module';
import { PgBossModule } from './pgboss/pgboss.module';
import dbConfig from './config/db.config';

// const storage = new AsyncLocalStorage<EntityManager>();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
    }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        // registerRequestContext: false, // disable automatatic middleware
        // context: () => storage.getStore(), // use our AsyncLocalStorage instance
      }),
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
    WeatherModule,
    PgBossModule,
  ],
})
export class AppModule {}
