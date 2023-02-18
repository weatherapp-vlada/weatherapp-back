import { Controller, Get, Query } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AverageTemperatureResponseDto } from './dto/averageTemperatureResponse.dto';
import { DailyTemperatureResponseDto } from './dto/dailyTemperatureResponse.dto';
import { GetAverageTemperatureQuery } from './dto/getAverageTemperatureQuery.dto';
import { GetDailyTemperatureQuery } from './dto/getDailyTemperatureQuery.dto';
import { LocationDto } from './dto/location.dto';

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
    { startTimestamp, endTimestamp, cities, sort }: GetAverageTemperatureQuery,
  ): Promise<AverageTemperatureResponseDto[]> {
    return this.appService.getAverageTemperature({
      startDate: new Date(startTimestamp),
      endDate: new Date(endTimestamp),
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
    {
      startTimestamp,
      endTimestamp,
      locationName,
      countryCode,
    }: GetDailyTemperatureQuery,
  ): Promise<DailyTemperatureResponseDto> {
    return this.appService.getDailyTemperature({
      startDate: new Date(startTimestamp),
      endDate: new Date(endTimestamp),
      locationName,
      countryCode,
    });
  }
}
