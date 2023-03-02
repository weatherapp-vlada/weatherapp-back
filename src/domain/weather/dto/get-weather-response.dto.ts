import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class WeatherDto {
  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  temperatureCelsius: number;

  @ApiProperty()
  pressure: number;

  @ApiProperty()
  humidity: number;

  @ApiProperty()
  windSpeedMetersPerSecond: number;

  @ApiProperty()
  windDirection: number;

  @ApiPropertyOptional()
  rainVolumePast3HoursMm?: number;

  @ApiPropertyOptional()
  snowVolumePast3HoursMm?: number;

  @ApiProperty()
  precipitationProbability: number;

  @ApiProperty()
  weatherDescription: string;

  @ApiProperty()
  isNight: boolean;
}

export class LocationWeatherDto {
  @ApiProperty()
  location: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty({
    type: WeatherDto,
    isArray: true,
  })
  @Type(() => WeatherDto)
  weather: WeatherDto[];
}

export class GetWeatherResponseDto {
  @ApiProperty()
  count: number;

  @ApiProperty({
    type: LocationWeatherDto,
    isArray: true,
  })
  locations: LocationWeatherDto[];
}
