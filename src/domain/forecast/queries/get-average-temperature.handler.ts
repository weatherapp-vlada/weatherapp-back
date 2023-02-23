import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { LocationEntity } from '../../location/entities'; // TODO: fix cross entity reference
import { ForecastRepository } from '../repositories/forecast.repository';
import { NotFoundError } from '../../../exceptions';

export class GetAverageTemperatureQuery {
  public constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly cities: string[] = undefined,
    public readonly sort: boolean = false,
  ) {}
}

@QueryHandler(GetAverageTemperatureQuery)
export class GetAverageTemperatureQueryHandler
  implements IQueryHandler<GetAverageTemperatureQuery>
{
  private readonly logger = new Logger(GetAverageTemperatureQuery.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(ForecastRepository)
    private readonly forecastRepository: ForecastRepository,
  ) {}

  async execute({
    startDate,
    endDate,
    cities,
    sort,
  }: GetAverageTemperatureQuery) {
    this.logger.log(
      { input: { startDate, endDate, cities, sort } },
      'Retrieving average temperature for time period',
    );

    const where = cities?.length ? { name: In([...cities]) } : undefined;
    const locations = await this.locationsRepository.find({
      where,
    });

    this.logger.log(
      { input: { cities }, result: locations },
      'Get locations filtered by name query executed',
    );

    if (!locations?.length) {
      throw new NotFoundError('No supported cities provided.');
    }

    const results = await this.forecastRepository.getAverageTemperature({
      startDate,
      endDate,
      locationIds: locations.map((location) => location.id),
      sort,
    });

    return results.map(
      ({ location_name, location_country_code, average_temp }) => ({
        location: location_name,
        countryCode: location_country_code,
        averageTemperature: average_temp,
      }),
    );
  }
}
