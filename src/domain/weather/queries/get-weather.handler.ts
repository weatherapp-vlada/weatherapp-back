import { Logger } from '@nestjs/common';
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
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
    public readonly cities: string[],
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
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(WeatherEntity)
    private readonly weatherRepository: Repository<WeatherEntity>,
  ) {}

  async execute({
    startDate,
    endDate,
    cities,
  }: GetWeatherQuery): Promise<GetWeatherResponseDto> {
    this.logger.log(
      { input: { startDate, endDate, cities } },
      'Retrieving weather for time period',
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

    const results = await this.weatherRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
        locationId: In(locations.map(({ id }) => id)),
      },
      order: {
        timestamp: 'ASC',
      },
      relations: {
        weatherCondition: true,
      },
    });

    const resultsGroupedByLocationEntries = Object.entries(
      groupBy(results, ({ locationId }) => locationId),
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
                windSpeedMetersPerSecond,
                windDirection,
                rainVolumePast3HoursMm,
                snowVolumePast3HoursMm,
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
