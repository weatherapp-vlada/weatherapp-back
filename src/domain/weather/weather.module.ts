import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { WeatherEntity } from './entities';
import { ForecastController } from './controllers/weather.controller';
import { OpenWeatherApiModule } from '../../open-weather-api/open-weather-api.module';
import { PgBossModule } from '../../pgboss/pgboss.module';
import { QueriesHandlers } from './queries';
import { CommandsHandlers } from './commands';
import { LocationEntity } from '../location/entities'; // TODO: fix cross entity reference
import { PgBossClient } from '../../pgboss/pgboss-client';
import { PGBOSS_JOB_CRON_EXPRESSION, PGBOSS_JOB_NAME } from './utils/constants';

@Module({
  imports: [
    OpenWeatherApiModule,
    PgBossModule,
    CqrsModule,
    TypeOrmModule.forFeature([LocationEntity, WeatherEntity]),
  ],
  controllers: [ForecastController],
  providers: [...QueriesHandlers, ...CommandsHandlers],
})
export class WeatherModule {
  constructor(private readonly pgBossClient: PgBossClient) {}

  async onModuleInit() {
    this.pgBossClient.emit(PGBOSS_JOB_NAME, {
      options: {
        singletonKey: 'force-update-on-startup',
        singletonMinutes: 1, // if multiple replicas start at the same time
        retryLimit: 2,
      },
    });

    this.pgBossClient.scheduleEvent({
      pattern: PGBOSS_JOB_NAME,
      cron: PGBOSS_JOB_CRON_EXPRESSION,
    });
  }
}
