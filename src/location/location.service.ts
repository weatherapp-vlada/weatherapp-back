import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LocationDto } from '../dto';
import { LocationEntity } from '../entities';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
  ) {}

  async getLocations(): Promise<LocationDto[]> {
    const locations = await this.locationsRepository.find();

    this.logger.log({ result: locations }, 'Get all locations query executed');

    return locations.map(({ name, countryCode }) => ({
      name,
      countryCode,
    }));
  }
}
