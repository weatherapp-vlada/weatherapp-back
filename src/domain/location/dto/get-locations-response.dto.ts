import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  countryCode: string;
}

export class GetLocationsResponseDto {
  @ApiProperty()
  count: number;

  @ApiProperty({
    type: LocationDto,
    isArray: true,
  })
  locations: LocationDto[];
}
