import { Logger } from '@nestjs/common';
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Query } from '@nestjs-architects/typed-cqrs';

import { LocationEntity } from '../../location/entities'; // TODO: fix cross entity reference
import { ForecastRepository } from '../repositories/forecast.repository';
import { NotFoundError } from '../../../exceptions';
import { AverageTemperatureResponseDto } from '../dto';
import { plainToInstance } from 'class-transformer';

export class GetAverageTemperatureQuery extends Query<AverageTemperatureResponseDto> {
  public constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly cities: string[] = undefined,
    public readonly sort: boolean = false,
  ) {
    super();
  }
}

@QueryHandler(GetAverageTemperatureQuery)
export class GetAverageTemperatureQueryHandler
  implements IInferredQueryHandler<GetAverageTemperatureQuery>
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
  }: GetAverageTemperatureQuery): Promise<AverageTemperatureResponseDto> {
    this.logger.log(
      { input: { startDate, endDate, cities, sort } },
      'Retrieving average temperature for time period',
    );

    const locations = await this.locationsRepository.find({
      where: { ...(!cities?.length ? {} : { name: In([...cities]) }) },
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

    return plainToInstance(AverageTemperatureResponseDto, {
      count: results.length,
      locations: results.map((item) => ({
        averageTemperature: item.average_temp,
        countryCode: item.location_country_code,
        location: item.location_name,
      })),
    });
  }
}
