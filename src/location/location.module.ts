import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationEntity } from '../entities';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity])],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
