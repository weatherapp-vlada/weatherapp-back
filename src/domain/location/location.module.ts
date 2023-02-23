import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { LocationEntity } from './entities';
import { LocationController } from './controllers/location.controller';
import { LocationService } from './services/location.service';
import { QueriesHandlers } from './queries';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([LocationEntity])],
  controllers: [LocationController],
  providers: [LocationService, ...QueriesHandlers],
})
export class LocationModule {}
