import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';

import { LocationEntity } from '../../location/entities'; // TODO: fix cross entity reference
import { ForecastRepository } from '../repositories/forecast.repository';
import { InvalidInputError } from '../../../exceptions';

export class GetDailyTemperatureQuery {
  public constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly locationName: string,
    public readonly countryCode: string,
  ) {}
}

@QueryHandler(GetDailyTemperatureQuery)
export class GetDailyTemperatureQueryHandler
  implements IQueryHandler<GetDailyTemperatureQuery>
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
  }: GetDailyTemperatureQuery) {
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

    return {
      location: location.name,
      countryCode: location.countryCode,
      forecast: results.map(({ day, average_temp: averageTemperature }) => ({
        day: moment(day).format('YYYY-MM-DD'),
        averageTemperature,
      })),
    };
  }
}
