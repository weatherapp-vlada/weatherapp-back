import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as moment from 'moment';

import { ForecastService as ForecastService } from './forecast.service';
import {
  AverageTemperatureResponseDto,
  DailyTemperatureResponseDto,
  GetAverageTemperatureQuery,
  GetDailyTemperatureQuery,
} from '../dto';
import { InvalidInputError, NotFoundError } from '../exceptions';

@ApiTags('Forecast')
@Controller('temperature')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('/average')
  @ApiExtraModels(AverageTemperatureResponseDto)
  @ApiResponse({
    status: 200,
    isArray: true,
    type: AverageTemperatureResponseDto,
  })
  async getAverageTemperature(
    @Query()
    { startDate, endDate, cities, sort }: GetAverageTemperatureQuery,
  ): Promise<AverageTemperatureResponseDto[]> {
    try {
      return await this.forecastService.getAverageTemperature({
        startDate: moment(startDate).toDate(),
        endDate: moment(endDate).add(1, 'days').toDate(),
        cities,
        sort,
      });
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw new NotFoundException(null, err.message);
      }

      throw err;
    }
  }

  @Get('/daily')
  @ApiExtraModels(DailyTemperatureResponseDto)
  @ApiResponse({
    status: 200,
    type: DailyTemperatureResponseDto,
  })
  async getDailyTemperature(
    @Query()
    { startDate, endDate, locationName, countryCode }: GetDailyTemperatureQuery,
  ): Promise<DailyTemperatureResponseDto> {
    try {
      return await this.forecastService.getDailyTemperature({
        startDate: moment(startDate).toDate(),
        endDate: moment(endDate).add(1, 'days').toDate(),
        locationName,
        countryCode,
      });
    } catch (err) {
      if (err instanceof InvalidInputError) {
        throw new BadRequestException(null, err.message);
      }

      throw err;
    }
  }
}
