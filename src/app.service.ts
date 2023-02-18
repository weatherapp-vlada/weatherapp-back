import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LocationEntity } from './entities/location.entity';
import { LocationDto } from './dto/location.dto';
import { TemperatureEntity } from './entities/temperature.entity';
import { AverageTemperatureResponseDto } from './dto/averageTemperatureResponse.dto';
import { DailyTemperatureResponseDto } from './dto/dailyTemperatureResponse.dto';

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
  day: string;
  average_temp: number;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(TemperatureEntity)
    private readonly temperaturesRepository: Repository<TemperatureEntity>,
  ) {}

  async getLocations(): Promise<LocationDto[]> {
    const locations = await this.locationsRepository.find();

    return locations.map((location) => LocationDto.fromEntity(location));
  }

  async getAverageTemperature({
    startDate,
    endDate,
    cities,
    sort,
  }: GetAverageTemperatureParams): Promise<AverageTemperatureResponseDto[]> {
    const locations = await this.locationsRepository.find({
      where: { name: In([...cities]) },
    });

    if (!locations?.length) {
      throw new Error('No supported cities provided.');
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
        'AVG(temp.temperature_celsius) as average_temp',
        'location.name as location_name',
        'location.country_code as location_country_code',
      ])
      .where('location_id IN (:...ids)', {
        ids: locations.map((location) => location.id),
      })
      .andWhere('temp.timestamp >= :timestamp', { timestamp: startDate })
      .andWhere('temp.timestamp <= :timestamp', { timestamp: endDate })
      .groupBy('location_id, location_name, location_country_code');

    const queryWithSort = !sort
      ? query
      : query.addOrderBy('average_temp', 'DESC');

    const results =
      await queryWithSort.getRawMany<GetAverageTemperatureQueryResult>();

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
    const location = await this.locationsRepository.findOne({
      where: {
        countryCode,
        name,
      },
    });

    if (!location) {
      throw new Error('Location not supported.'); // TODO: specific Error that's handled in controller
    }

    const dailyForecast = await this.temperaturesRepository
      .createQueryBuilder('temp')
      .select([
        'temp.location_id as location_id',
        'AVG(temp.temperature_celsius) as average_temp',
        `DATE_TRUNC('day', temp.timestamp) as day`,
      ])
      .where('location_id = :locationId', {
        locationId: location.id,
      })
      .andWhere('temp.timestamp >= :startDate', { startDate })
      .andWhere('temp.timestamp <= :endDate', { endDate })
      .groupBy('location_id, day')
      .orderBy('day', 'ASC')
      .getRawMany<GetDailyTemperatureQueryResult>();

    return {
      location: location.name,
      countryCode: location.countryCode,
      forecast: dailyForecast.map(
        ({ day, average_temp: averageTemperature }) => ({
          day,
          averageTemperature,
        }),
      ),
    };
  }
}
