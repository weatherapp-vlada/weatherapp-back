import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { utc } from 'moment';

export class SingleDayTemperatureDto {
  @ApiProperty({
    example: '2023-02-20',
  })
  @Transform(({ value }: { value: Date }) => utc(value).format('YYYY-MM-DD'), {
    toPlainOnly: true,
  })
  day: Date;

  @ApiProperty()
  @Transform(({ value }: { value: number }) => Number(value.toFixed(2)), {
    toPlainOnly: true,
  })
  averageTemperature: number;
}

export class DailyTemperatureResponseDto {
  @ApiProperty()
  location: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty({
    type: SingleDayTemperatureDto,
    isArray: true,
  })
  @Type(() => SingleDayTemperatureDto)
  forecast: SingleDayTemperatureDto[];
}
