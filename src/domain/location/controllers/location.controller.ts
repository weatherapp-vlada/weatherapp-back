import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LocationDto, GetLocationsResponseDto } from '../dto';
import { GetLocationsQuery } from '../queries/get-locations.query';

@ApiTags('Location')
@Controller('locations')
export class LocationController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiExtraModels(LocationDto)
  @ApiResponse({
    status: 200,
    type: GetLocationsResponseDto,
  })
  getLocations(): Promise<GetLocationsResponseDto> {
    return this.queryBus.execute(new GetLocationsQuery());
  }
}
