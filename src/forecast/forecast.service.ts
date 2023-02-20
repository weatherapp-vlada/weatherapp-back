import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as moment from 'moment';

import { LocationEntity, TemperatureEntity } from '../entities';
import {
  AverageTemperatureResponseDto,
  DailyTemperatureResponseDto,
} from '../dto';
import { InvalidInputError, NotFoundError } from '../exceptions';

export interface GetAverageTemperatureParams {
  startDate: Date;
  endDate: Date;
  cities?: string[];
  sort: boolean;
}

export interface GetAverageTemperatureQueryResult {
  location_id: string;
  location_name: string;
  location_country_code: string;
  average_temp: number;
}

export interface GetDailyTemperatureParams {
  startDate: Date;
  endDate: Date;
  locationName: string;
  countryCode: string;
}

export interface GetDailyTemperatureQueryResult {
  location_id: string;
  location_name: string;
  location_country_code: string;
  day: Date;
  average_temp: number;
}

@Injectable()
export class ForecastService {
  private readonly logger = new Logger(ForecastService.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(TemperatureEntity)
    private readonly temperaturesRepository: Repository<TemperatureEntity>,
  ) {}

  async getAverageTemperature({
    startDate,
    endDate,
    cities,
    sort,
  }: GetAverageTemperatureParams): Promise<AverageTemperatureResponseDto[]> {
    this.logger.log(
      { input: { startDate, endDate, cities, sort } },
      'Retrieving average temperature for time period',
    );

    const whereClause = cities?.length ? { name: In([...cities]) } : undefined;
    const locations = await this.locationsRepository.find({
      where: whereClause,
    });

    this.logger.log(
      { input: { cities }, result: locations },
      'Get locations filtered by name query executed',
    );

    if (!locations?.length) {
      throw new NotFoundError('No supported cities provided.');
    }

    const query = await this.temperaturesRepository
      .createQueryBuilder('temp')
      .leftJoinAndSelect(
        'location',
        'location',
        'location.id = temp.location_id',
      )
      .select([
        'temp.location_id as location_id',
        'ROUND(AVG(temp.temperature_celsius), 2) as average_temp',
        'location.name as location_name',
        'location.country_code as location_country_code',
      ])
      .where('location_id IN (:...ids)', {
        ids: locations.map((location) => location.id),
      })
      .andWhere('temp.timestamp >= :startDate', { startDate })
      .andWhere('temp.timestamp < :endDate', { endDate })
      .groupBy('location_id, location_name, location_country_code');

    const queryWithSort = !sort
      ? query
      : query.addOrderBy('average_temp', 'DESC');

    const results =
      await queryWithSort.getRawMany<GetAverageTemperatureQueryResult>();

    this.logger.log(
      { input: { startDate, endDate }, result: results },
      'Average temperature for time period query executed',
    );

    return results.map(
      ({ location_name, location_country_code, average_temp }) => ({
        location: location_name,
        countryCode: location_country_code,
        averageTemperature: average_temp,
      }),
    );
  }

  async getDailyTemperature({
    startDate,
    endDate,
    locationName: name,
    countryCode,
  }: GetDailyTemperatureParams): Promise<DailyTemperatureResponseDto> {
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

    const results = await this.temperaturesRepository
      .createQueryBuilder('temp')
      .select([
        'temp.location_id as location_id',
        'ROUND(AVG(temp.temperature_celsius), 2) as average_temp',
        `DATE_TRUNC('day', temp.timestamp) as day`,
      ])
      .where('location_id = :locationId', {
        locationId: location.id,
      })
      .andWhere('temp.timestamp >= :startDate', { startDate })
      .andWhere('temp.timestamp < :endDate', { endDate })
      .groupBy('location_id, day')
      .orderBy('day', 'ASC')
      .getRawMany<GetDailyTemperatureQueryResult>();

    this.logger.log(
      { input: { startDate, endDate }, result: results },
      'Daily temperatures for time period query executed',
    );

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
