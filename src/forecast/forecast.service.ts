import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as moment from 'moment';

import { LocationEntity } from '../entities';
import {
  AverageTemperatureResponseDto,
  DailyTemperatureResponseDto,
} from '../dto';
import { InvalidInputError, NotFoundError } from '../exceptions';
import { ForecastRepository } from './forecast.repository';

interface GetAverageTemperatureParams {
  startDate: Date;
  endDate: Date;
  cities?: string[];
  sort: boolean;
}

interface GetDailyTemperatureParams {
  startDate: Date;
  endDate: Date;
  locationName: string;
  countryCode: string;
}

@Injectable()
export class ForecastService {
  private readonly logger = new Logger(ForecastService.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
    @InjectRepository(ForecastRepository)
    private readonly forecastRepository: ForecastRepository,
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
