import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventPattern } from '@nestjs/microservices';
import { utc } from 'moment';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { InvalidInputError, NotFoundError } from '../../../exceptions';
import {
  AverageTemperatureResponseDto,
  DailyTemperatureResponseDto,
  GetAverageTemperatureDto,
  GetDailyTemperatureDto,
} from '../dto';
import {
  GetAverageTemperatureQuery,
  GetDailyTemperatureQuery,
} from '../queries';
import { UpdateAllForecastsCommand } from '../commands/update-all-forecasts.handler';
import { PGBOSS_JOB_NAME } from '../utils/constants';
import { TransformInterceptor } from '../../../interceptors/transform-interceptor';

@ApiTags('Forecast')
@Controller('temperature')
export class ForecastController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/average')
  @ApiExtraModels(AverageTemperatureResponseDto)
  @ApiResponse({
    status: 200,
    isArray: true,
    type: AverageTemperatureResponseDto,
  })
  @UseInterceptors(TransformInterceptor)
  async getAverageTemperature(
    @Query()
    { startDate, endDate, cities, sort }: GetAverageTemperatureDto,
  ): Promise<AverageTemperatureResponseDto> {
    try {
      const result = await this.queryBus.execute(
        new GetAverageTemperatureQuery(
          utc(startDate).startOf('d').toDate(),
          utc(endDate).endOf('d').toDate(),
          cities,
          sort,
        ),
      );

      return result;
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
  @UseInterceptors(TransformInterceptor)
  async getDailyTemperature(
    @Query()
    { startDate, endDate, locationName, countryCode }: GetDailyTemperatureDto,
  ): Promise<DailyTemperatureResponseDto> {
    try {
      const result = await this.queryBus.execute(
        new GetDailyTemperatureQuery(
          utc(startDate).startOf('d').toDate(),
          utc(endDate).endOf('d').toDate(),
          locationName,
          countryCode,
        ),
      );

      return result;
    } catch (err) {
      if (err instanceof InvalidInputError) {
        throw new BadRequestException(null, err.message);
      }

      throw err;
    }
  }

  @EventPattern(PGBOSS_JOB_NAME)
  async updateForecastForAllSupportedLocations() {
    await this.commandBus.execute(new UpdateAllForecastsCommand());
  }
}
