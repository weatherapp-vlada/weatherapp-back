import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventPattern } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { NotFoundError } from '../../../exceptions';
import { GetWeatherResponseDto, GetWeatherDto } from '../dto';
import { GetWeatherQuery } from '../queries';
import { UpdateWeatherCommand } from '../commands/update-weather.handler';
import { PGBOSS_JOB_NAME } from '../utils/constants';

@ApiTags('Weather')
@Controller('weather')
export class ForecastController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/')
  @ApiExtraModels(GetWeatherResponseDto)
  @ApiResponse({
    status: 200,
    isArray: true,
    type: GetWeatherResponseDto,
  })
  async getWeather(
    @Query()
    { startDate, endDate, cities }: GetWeatherDto,
  ): Promise<GetWeatherResponseDto> {
    try {
      const result = await this.queryBus.execute(
        new GetWeatherQuery(startDate, endDate, cities),
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
  async updateWeatherForAllSupportedLocations() {
    await this.commandBus.execute(new UpdateWeatherCommand());
  }
}
