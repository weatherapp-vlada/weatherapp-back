import { Logger } from '@nestjs/common';
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Query } from '@nestjs-architects/typed-cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository } from '@mikro-orm/core';

import { LocationEntity } from '../entities/location.entity';
import { GetLocationsResponseDto } from '../dto';

export class GetLocationsQuery extends Query<GetLocationsResponseDto> {}

@QueryHandler(GetLocationsQuery)
export class GetLocationsQueryHandler
  implements IInferredQueryHandler<GetLocationsQuery>
{
  private readonly logger = new Logger(GetLocationsQueryHandler.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: EntityRepository<LocationEntity>,
  ) {}

  async execute() {
    const locations = await this.locationsRepository.findAll();

    this.logger.log({ result: locations }, 'Get all locations query executed');

    return {
      count: locations.length,
      locations: locations.map(({ id, name, countryCode }) => ({
        id,
        name,
        countryCode,
      })),
    };
  }
}
