import { Controller, Get } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LocationDto } from '../dto';
import { LocationService } from '../services/location.service';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @ApiExtraModels(LocationDto)
  @ApiResponse({
    status: 200,
    isArray: true,
    type: LocationDto,
  })
  getLocations(): Promise<LocationDto[]> {
    return this.locationService.getLocations();
  }
}
