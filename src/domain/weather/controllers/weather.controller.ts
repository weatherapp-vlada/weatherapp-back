import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EventPattern } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';

import { NotFoundError } from '../../../exceptions';
import { GetWeatherResponseDto, GetWeatherDto } from '../dto';
import { GetWeatherQuery } from '../queries';
import { UpdateWeatherCommand } from '../commands/update-weather.handler';
import { PGBOSS_JOB_NAME } from '../utils/constants';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly orm: MikroORM,
  ) {}

  @Get('/')
  @ApiExtraModels(GetWeatherResponseDto)
  @ApiResponse({
    status: 200,
    type: GetWeatherResponseDto,
  })
  @ApiQuery({
    name: 'locationIds',
    explode: false,
    required: false,
  })
  async getWeather(
    @Query()
    { startDate, endDate, locationIds }: GetWeatherDto,
  ): Promise<GetWeatherResponseDto> {
    try {
      const result = await this.queryBus.execute(
        new GetWeatherQuery(startDate, endDate, locationIds),
      );

      return result;
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw new NotFoundException(null, err.message);
      }

      throw err;
    }
  }

  @EventPattern(PGBOSS_JOB_NAME)
  @UseRequestContext() // required because this is not HTTP context and is not handled by middleware
  async updateWeatherForAllSupportedLocations() {
    await this.commandBus.execute(new UpdateWeatherCommand());
  }
}
