import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsUppercase, Length } from 'class-validator';

export class GetDailyTemperatureQuery {
  @ApiProperty()
  @IsDateString({ strict: true })
  startTimestamp: string;

  @ApiProperty()
  @IsDateString({ strict: true })
  endTimestamp: string;

  @ApiProperty()
  @IsString()
  locationName: string;

  @ApiProperty()
  @IsString()
  @Length(2, 2, { message: 'countryCode must be 2 characters.' })
  @IsUppercase()
  countryCode: string;
}
