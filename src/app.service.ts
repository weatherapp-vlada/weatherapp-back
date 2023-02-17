import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenWeatherApiService } from './open-weather-api/open-weather-api.service';
import { Location } from './entities/location.entity';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    readonly openWeatherApiService: OpenWeatherApiService,
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

  async getHello(): Promise<string> {
    this.logger.log('getHello endpoint');
    try {
      const location = await this.locationsRepository.findOneBy({
        name: 'Belgrade',
        countryCode: 'RS',
      });

      this.logger.log(`location: ${JSON.stringify(location)}`);
      const { latitude: lat, longitude: lon } = location;
      const res = await this.openWeatherApiService.fetchForecast({
        lat,
        lon,
      });

      return JSON.stringify(res);
    } catch (err) {
      this.logger.error(`Error: ${err.message}`, err.stack);
      throw err;
    }
  }
}
