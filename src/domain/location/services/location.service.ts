import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { LocationDto } from '../dto';
import { GetLocationsQuery } from '../queries/get-locations.query';

@Injectable()
export class LocationService {
  constructor(private readonly queryBus: QueryBus) {}

  async getLocations(): Promise<LocationDto[]> {
    return this.queryBus.execute(new GetLocationsQuery());
  }
}
