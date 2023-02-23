import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import {
  AverageTemperatureResponseDto,
  DailyTemperatureResponseDto,
} from '../dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAverageTemperatureQuery } from '../queries/get-average-temperature.handler';
import { GetDailyTemperatureQuery } from '../queries/get-daily-temperature.handler';
import { PgBossClient } from 'src/pgboss/pgboss-client';
import { UpdateAllForecastsCommand } from '../commands/update-all-forecasts.handler';

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
export class ForecastService implements OnModuleInit {
  private readonly logger = new Logger(ForecastService.name);
  static readonly JOB_NAME = 'daily-forecast-update';
  static readonly JOB_CRON_EXPRESSION = '0 0/3 * * *'; // every 3 hours

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly pgBossClient: PgBossClient,
  ) {}

  async onModuleInit() {
    await this.pgBossClient.emit(ForecastService.JOB_NAME, {
      options: {
        singletonKey: 'force-update-on-startup',
        singletonMinutes: 1, // if multiple replicas start at the same time
        retryLimit: 2,
      },
    });

    await this.pgBossClient.scheduleEvent({
      pattern: ForecastService.JOB_NAME,
      cron: ForecastService.JOB_CRON_EXPRESSION,
    });
  }

  async getAverageTemperature({
    startDate,
    endDate,
    cities,
    sort,
  }: GetAverageTemperatureParams): Promise<AverageTemperatureResponseDto[]> {
    return this.queryBus.execute(
      new GetAverageTemperatureQuery(startDate, endDate, cities, sort),
    );
  }

  async getDailyTemperature({
    startDate,
    endDate,
    locationName,
    countryCode,
  }: GetDailyTemperatureParams): Promise<DailyTemperatureResponseDto> {
    return this.queryBus.execute(
      new GetDailyTemperatureQuery(
        startDate,
        endDate,
        locationName,
        countryCode,
      ),
    );
  }

  async updateForecastForAllSupportedLocations(): Promise<void> {
    return this.commandBus.execute(new UpdateAllForecastsCommand());
  }
}
