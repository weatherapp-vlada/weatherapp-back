import { Between, DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance, Type } from 'class-transformer';

import { TemperatureEntity } from '../entities';
import { DailyTemperatureEntity } from '../entities/daily-temperature.entity';

interface GetAverageTemperatureParams {
  startDate: Date;
  endDate: Date;
  locationIds: number[];
  sort: boolean;
}

class GetAverageTemperatureQueryResult {
  location_id: string;
  location_name: string;
  location_country_code: string;

  @Type(() => Number)
  average_temp: number;
}

interface GetDailyTemperatureParams {
  startDate: Date;
  endDate: Date;
  locationId: number;
}

@Injectable()
export class ForecastRepository extends Repository<TemperatureEntity> {
  private readonly logger = new Logger(ForecastRepository.name);

  constructor(dataSource: DataSource) {
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
      .andWhere('temp.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('location_id, location_name, location_country_code');

    const queryWithSort = !sort
      ? query
      : query.addOrderBy('average_temp', 'DESC');

    const results = await queryWithSort.getRawMany();

    this.logger.log(
      { input: { startDate, endDate }, result: results },
      'Average temperature for time period query executed',
    );

    return results.map((item) =>
      plainToInstance(GetAverageTemperatureQueryResult, item),
    );
  }

  async getDailyTemperatures({
    locationId,
    startDate,
    endDate,
  }: GetDailyTemperatureParams): Promise<DailyTemperatureEntity[]> {
    const results = await this.manager.find(DailyTemperatureEntity, {
      where: {
        location_id: locationId,
        day: Between(startDate, endDate),
      },
      order: {
        day: 'ASC',
      },
    });

    this.logger.log(
      { input: { startDate, endDate }, result: results },
      'Daily temperatures for time period query executed',
    );

    return results.map((item) => plainToInstance(DailyTemperatureEntity, item));
  }
}
