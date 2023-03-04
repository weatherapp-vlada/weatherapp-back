import { Logger } from '@nestjs/common';
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { Query } from '@nestjs-architects/typed-cqrs';
import { groupBy, keyBy } from 'lodash';

import { LocationEntity } from '../../location/entities'; // TODO: fix cross entity reference
import { NotFoundError } from '../../../exceptions';
import { GetWeatherResponseDto } from '../dto';
import { WeatherEntity } from '../entities';

export class GetWeatherQuery extends Query<GetWeatherResponseDto> {
  public constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly locationIds: number[],
  ) {
    super();
  }
}

@QueryHandler(GetWeatherQuery)
export class GetWeatherQueryHandler
  implements IInferredQueryHandler<GetWeatherQuery>
{
  private readonly logger = new Logger(GetWeatherQuery.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: EntityRepository<LocationEntity>,
    @InjectRepository(WeatherEntity)
    private readonly weatherRepository: EntityRepository<WeatherEntity>,
  ) {}

  async execute({
    startDate,
    endDate,
    locationIds,
  }: GetWeatherQuery): Promise<GetWeatherResponseDto> {
    this.logger.log(
      { input: { startDate, endDate, locationIds } },
      'Retrieving weather for time period',
    );

    const locations = await this.locationsRepository.find({
      ...(!locationIds?.length ? {} : { id: locationIds }),
    });

    this.logger.log(
      { input: { locationIds }, result: locations },
      'Get locations filtered by name query executed',
    );

    if (!locations?.length) {
      throw new NotFoundError('No supported cities provided.');
    }

    const results = await this.weatherRepository.find(
      {
        location: {
          id: locations.map(({ id }) => id),
        },
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        orderBy: {
          timestamp: QueryOrder.ASC,
        },
        populate: ['weatherCondition'],
      },
    );

    const resultsGroupedByLocationEntries = Object.entries(
      groupBy(results, ({ location: { id } }) => id),
    );

    const locationLookup = keyBy(locations, ({ id }) => id);

    return {
      count: resultsGroupedByLocationEntries.length,
      locations: resultsGroupedByLocationEntries.map(
        ([locationId, weatherEntities]) => {
          const { countryCode, name } = locationLookup[locationId];
          return {
            location: name,
            countryCode,
            weather: weatherEntities.map(
              ({
                timestamp,
                temperatureCelsius,
                pressure,
                humidity,
                windSpeed: windSpeedMetersPerSecond,
                windDirection,
                rainVolume: rainVolumePast3HoursMm,
                snowVolume: snowVolumePast3HoursMm,
                precipitationProbability,
                weatherCondition: { description: weatherDescription },
                isNight,
              }) => ({
                timestamp,
                temperatureCelsius,
                pressure,
                humidity,
                windSpeedMetersPerSecond,
                windDirection,
                rainVolumePast3HoursMm,
                snowVolumePast3HoursMm,
                precipitationProbability,
                weatherDescription,
                isNight,
              }),
            ),
          };
        },
      ),
    };
  }
}
