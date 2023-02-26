import { Logger } from '@nestjs/common';
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Query } from '@nestjs-architects/typed-cqrs';

import { LocationEntity } from '../../location/entities'; // TODO: fix cross entity reference
import { ForecastRepository } from '../repositories/forecast.repository';
import { InvalidInputError } from '../../../exceptions';
import { DailyTemperatureResponseDto } from '../dto';
import { plainToInstance } from 'class-transformer';

export class GetDailyTemperatureQuery extends Query<DailyTemperatureResponseDto> {
  public constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly locationName: string,
    public readonly countryCode: string,
  ) {
    super();
  }
}

@QueryHandler(GetDailyTemperatureQuery)
export class GetDailyTemperatureQueryHandler
  implements IInferredQueryHandler<GetDailyTemperatureQuery>
{
  private readonly logger = new Logger(GetDailyTemperatureQuery.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(ForecastRepository)
    private readonly forecastRepository: ForecastRepository,
  ) {}

  async execute({
    startDate,
    endDate,
    locationName: name,
    countryCode,
  }: GetDailyTemperatureQuery): Promise<DailyTemperatureResponseDto> {
    this.logger.log(
      { input: { startDate, endDate, name, countryCode } },
      'Retrieving daily temperatures for time period',
    );

    const location = await this.locationsRepository.findOne({
      where: {
        countryCode,
        name,
      },
    });

    this.logger.log(
      { input: { name, countryCode }, result: location },
      'Get location by name and countryCode query executed',
    );

    if (!location) {
      throw new InvalidInputError('Location not supported.');
    }

    const results = await this.forecastRepository.getDailyTemperatures({
      locationId: location.id,
      startDate,
      endDate,
    });

    return plainToInstance(DailyTemperatureResponseDto, {
      location: location.name,
      countryCode: location.countryCode,
      forecast: results.map(({ day, average_temp: averageTemperature }) => ({
        day,
        averageTemperature,
      })),
    });
  }
}
