import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';

import { TemperatureEntity } from '../entities';

interface GetAverageTemperatureParams {
  startDate: Date;
  endDate: Date;
  locationIds: number[];
  sort: boolean;
}

interface GetAverageTemperatureQueryResult {
  location_id: string;
  location_name: string;
  location_country_code: string;
  average_temp: number;
}

interface GetDailyTemperatureParams {
  startDate: Date;
  endDate: Date;
  locationId: number;
}

interface GetDailyTemperatureQueryResult {
  location_id: string;
  location_name: string;
  location_country_code: string;
  day: Date;
  average_temp: number;
}

@Injectable()
export class ForecastRepository extends Repository<TemperatureEntity> {
  private readonly logger = new Logger(ForecastRepository.name);

  constructor(private readonly dataSource: DataSource) {
    super(TemperatureEntity, dataSource.createEntityManager());
  }

  async getAverageTemperature({
    locationIds,
    startDate,
    endDate,
    sort,
  }: GetAverageTemperatureParams): Promise<GetAverageTemperatureQueryResult[]> {
    const query = await this.createQueryBuilder('temp')
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
        ids: locationIds,
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

    return results;
  }

  async getDailyTemperatures({
    locationId,
    startDate,
    endDate,
  }: GetDailyTemperatureParams): Promise<GetDailyTemperatureQueryResult[]> {
    const results = await this.createQueryBuilder('temp')
      .select([
        'temp.location_id as location_id',
        'ROUND(AVG(temp.temperature_celsius), 2) as average_temp',
        `DATE_TRUNC('day', temp.timestamp) as day`,
      ])
      .where('location_id = :locationId', {
        locationId,
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

    return results;
  }
}
