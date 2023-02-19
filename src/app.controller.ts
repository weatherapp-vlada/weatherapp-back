import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';
import * as moment from 'moment';
import { AppService } from './app.service';
import { AverageTemperatureResponseDto } from './dto/average-temperature-response.dto';
import { DailyTemperatureResponseDto } from './dto/daily-temperature-response.dto';
import { GetAverageTemperatureQuery } from './dto/get-average-temperature-query.dto';
import { GetDailyTemperatureQuery } from './dto/get-daily-temperature-query.dto';
import { LocationDto } from './dto/location.dto';
import InvalidInputError from './exceptions/invalid-input.error';
import NotFoundError from './exceptions/not-found.error';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/locations')
  @ApiExtraModels(LocationDto)
  @ApiResponse({
    status: 200,
    isArray: true,
    type: LocationDto,
  })
  getLocations(): Promise<LocationDto[]> {
    return this.appService.getLocations();
  }

  @Get('/temperature/average')
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
      return await this.appService.getAverageTemperature({
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

  @Get('/temperature/daily')
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
      return await this.appService.getDailyTemperature({
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
