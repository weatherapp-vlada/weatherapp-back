import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { TemperatureEntity } from './entities';
import { ForecastController } from './controllers/forecast.controller';
import { ForecastRepository } from './repositories/forecast.repository';
import { ForecastService } from './services/forecast.service';
import { OpenWeatherApiModule } from '../../open-weather-api/open-weather-api.module';
import { PgBossModule } from '../../pgboss/pgboss.module';
import { QueriesHandlers } from './queries';
import { CommandsHandlers } from './commands';
import { LocationEntity } from '../location/entities'; // TODO: fix cross entity reference

@Module({
  imports: [
    OpenWeatherApiModule,
    PgBossModule,
    CqrsModule,
    TypeOrmModule.forFeature([LocationEntity, TemperatureEntity]),
  ],
  controllers: [ForecastController],
  providers: [
    ForecastService,
    ForecastRepository,
    ...QueriesHandlers,
    ...CommandsHandlers,
  ],
})
export class ForecastModule {}
