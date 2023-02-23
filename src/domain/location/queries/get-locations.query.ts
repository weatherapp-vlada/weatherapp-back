import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LocationEntity } from '../entities/location.entity';

export class GetLocationsQuery {}

@QueryHandler(GetLocationsQuery)
export class GetLocationsQueryHandler
  implements IQueryHandler<GetLocationsQuery>
{
  private readonly logger = new Logger(GetLocationsQueryHandler.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
  ) {}

  async execute() {
    const locations = await this.locationsRepository.find();

    this.logger.log({ result: locations }, 'Get all locations query executed');

    return locations.map(({ name, countryCode }) => ({
      name,
      countryCode,
    }));
  }
}
