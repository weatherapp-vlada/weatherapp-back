import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class AverageTemperatureResponseDto {
  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsString()
  countryCode: string;

  @ApiProperty()
  @IsNumber()
  averageTemperature: number;
}
