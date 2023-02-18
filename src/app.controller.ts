import { Controller, Get, Query } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AverageTemperatureResponseDto } from './dto/average-temperature-response.dto';
import { DailyTemperatureResponseDto } from './dto/daily-temperature-response.dto';
import { GetAverageTemperatureQuery } from './dto/get-average-temperature-query.dto';
import { GetDailyTemperatureQuery } from './dto/get-daily-temperature-query.dto';
import { LocationDto } from './dto/location.dto';
import { addDays } from './utils/date.utils';

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
  getAverageTemperature(
    @Query()
    { startDate, endDate, cities, sort }: GetAverageTemperatureQuery,
  ): Promise<AverageTemperatureResponseDto[]> {
    return this.appService.getAverageTemperature({
      startDate: new Date(startDate),
      endDate: addDays(new Date(endDate), 1),
      cities,
      sort,
    });
  }

  @Get('/temperature/daily')
  @ApiExtraModels(DailyTemperatureResponseDto)
  @ApiResponse({
    status: 200,
    type: DailyTemperatureResponseDto,
  })
  getDailyTemperature(
    @Query()
    { startDate, endDate, locationName, countryCode }: GetDailyTemperatureQuery,
  ): Promise<DailyTemperatureResponseDto> {
    return this.appService.getDailyTemperature({
      startDate: new Date(startDate),
      endDate: addDays(new Date(endDate), 1),
      locationName,
      countryCode,
    });
  }
}
