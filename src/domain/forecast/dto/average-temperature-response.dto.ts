import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class SingleDayAverageTemperature {
  @ApiProperty()
  location: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty()
  @Transform(({ value }: { value: number }) => Number(value.toFixed(2)), {
    toPlainOnly: true,
  })
  averageTemperature: number;
}

export class AverageTemperatureResponseDto {
  @ApiProperty()
  count: number;

  @ApiProperty({
    type: SingleDayAverageTemperature,
    isArray: true,
  })
  @Type(() => SingleDayAverageTemperature)
  locations: SingleDayAverageTemperature[];
}
