import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';

import { LocationEntity } from './entities';
import { LocationController } from './controllers/location.controller';
import { QueriesHandlers } from './queries';

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([LocationEntity])],
  controllers: [LocationController],
  providers: [...QueriesHandlers],
})
export class LocationModule {}
