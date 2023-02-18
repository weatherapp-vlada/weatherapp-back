import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsString,
  IsUppercase,
  Length,
  Matches,
} from 'class-validator';

export class GetDailyTemperatureQuery {
  @ApiProperty()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}\-\d{2}\-\d{2}$/, {
    message: 'endDate must be in YYYY-MM-dd format.',
  })
  startDate: string;

  @ApiProperty()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}\-\d{2}\-\d{2}$/, {
    message: 'endDate must be in YYYY-MM-dd format.',
  })
  endDate: string;

  @ApiProperty()
  @IsString()
  locationName: string;

  @ApiProperty()
  @IsString()
  @Length(2, 2, { message: 'countryCode must be 2 characters.' })
  @IsUppercase()
  countryCode: string;
}
