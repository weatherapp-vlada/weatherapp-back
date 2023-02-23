import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { ForecastUpdaterService } from './forecast-updater.service';

@Controller('forecast-updater')
export class ForecastUpdaterController {
  constructor(
    private readonly forecastUpdaterService: ForecastUpdaterService,
  ) {}

  @EventPattern(ForecastUpdaterService.JOB_NAME)
  async updateForecastForAllSupportedLocations() {
    await this.forecastUpdaterService.updateForecastForAllSupportedLocations();
  }
}
