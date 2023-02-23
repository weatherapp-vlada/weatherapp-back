import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationEntity, TemperatureEntity } from '../entities';
import { ForecastController } from './forecast.controller';
import { ForecastRepository } from './forecast.repository';
import { ForecastService } from './forecast.service';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity, TemperatureEntity])],
  controllers: [ForecastController],
  providers: [ForecastService, ForecastRepository],
})
export class ForecastModule {}
