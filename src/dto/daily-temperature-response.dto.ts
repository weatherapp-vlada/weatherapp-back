import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsString } from 'class-validator';

export class SingleDayTemperatureDto {
  @ApiProperty({
    example: '2023-02-20',
  })
  @IsDateString()
  day: string;

  @ApiProperty()
  @IsNumber()
  averageTemperature: number;
}

export class DailyTemperatureResponseDto {
  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsString()
  countryCode: string;

  @ApiProperty({
    type: SingleDayTemperatureDto,
    isArray: true,
  })
  @IsArray()
  forecast: SingleDayTemperatureDto[];
}
